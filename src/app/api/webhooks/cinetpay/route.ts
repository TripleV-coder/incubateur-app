import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity";
import { NextResponse } from "next/server";
import { provisionCourseAccessByTier } from "@/lib/course-access";

export async function POST(req: Request) {
  const webhookToken = process.env.CINETPAY_WEBHOOK_TOKEN;
  if (!webhookToken) {
    return new NextResponse("Webhook token missing in server configuration", {
      status: 500,
    });
  }

  const receivedToken = req.headers.get("x-webhook-token");
  if (receivedToken !== webhookToken) {
    return new NextResponse("Unauthorized webhook", { status: 401 });
  }

  const siteId = process.env.CINETPAY_SITE_ID;
  const formData = await req.formData();
  const receivedSiteId = String(formData.get("cpm_site_id") ?? "");
  if (siteId && receivedSiteId && siteId !== receivedSiteId) {
    return new NextResponse("Invalid site id", { status: 401 });
  }

  const cpm_trans_id = String(formData.get("cpm_trans_id") ?? "");
  const cpm_status = String(formData.get("cpm_status") ?? "");
  if (!cpm_trans_id) {
    return new NextResponse("Missing transaction id", { status: 400 });
  }

  if (cpm_status.toUpperCase() === "ACCEPTED") {
    // 1. Find the payment record
    const payment = await prisma.payment.findUnique({
      where: { reference: cpm_trans_id },
      include: { user: true }
    });

    if (payment && payment.status === "PENDING" && payment.provider === "CINETPAY") {
      const amount = payment.amount.toNumber();
      const amountToTier: Record<number, "INDIVIDUEL" | "COLLECTIF" | "PRIVE"> = {
        12700: "INDIVIDUEL",
        25500: "COLLECTIF",
        55800: "PRIVE",
      };
      const targetTier = amountToTier[amount];
      if (!targetTier) {
        await logActivity({
          userId: payment.userId,
          action: "webhook.cinetpay.unexpected_amount",
          target: cpm_trans_id,
          metadata: { amount },
        });
        return new NextResponse("Unexpected payment amount", { status: 400 });
      }

      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "SUCCESS" },
      });

      await prisma.user.update({
        where: { id: payment.userId },
        data: { tier: targetTier },
      });

      await provisionCourseAccessByTier(payment.userId, targetTier);

      await logActivity({
        userId: payment.userId,
        action: "webhook.cinetpay.payment_success",
        target: cpm_trans_id,
        metadata: { targetTier },
      });
    }
  }

  return new NextResponse(null, { status: 200 });
}

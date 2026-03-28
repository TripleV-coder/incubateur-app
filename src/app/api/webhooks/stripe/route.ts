import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { Tier } from "@prisma/client";
import { logActivity } from "@/lib/activity";
import { provisionCourseAccessByTier } from "@/lib/course-access";

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("Stripe-Signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return new NextResponse("Missing signature or webhook secret", {
      status: 400,
    });
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new NextResponse(`Webhook Error: ${message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const checkoutSession = event.data.object as Stripe.Checkout.Session;
    const metadata = checkoutSession.metadata;
    if (!metadata?.userId || !metadata.tier) {
      return new NextResponse("Missing checkout metadata", { status: 400 });
    }
    const validPaidTiers = [Tier.INDIVIDUEL, Tier.COLLECTIF, Tier.PRIVE] as string[];
    if (!validPaidTiers.includes(metadata.tier)) {
      return new NextResponse("Invalid tier metadata", { status: 400 });
    }

    const userId = metadata.userId;
    const tier = metadata.tier as Tier;

    await prisma.user.updateMany({
      where: { id: userId },
      data: { tier: tier },
    });

    await prisma.payment.updateMany({
      where: { reference: checkoutSession.id },
      data: { status: "SUCCESS" },
    });

    await provisionCourseAccessByTier(userId, tier);

    await logActivity({
      userId,
      action: "webhook.stripe.payment_success",
      target: checkoutSession.id,
      metadata: { tier },
    });
  }

  return new NextResponse(null, { status: 200 });
}

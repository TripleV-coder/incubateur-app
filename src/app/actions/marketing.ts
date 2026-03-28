"use server";

import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity";
import { headers } from "next/headers";
import { consumeRateLimit } from "@/lib/rate-limit";

async function getLeadRequesterIp() {
  const h = await headers();
  const forwardedFor = h.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }
  return h.get("x-real-ip") ?? "unknown-ip";
}

export async function createLeadCaptureAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const name = String(formData.get("name") ?? "").trim();
  const source = String(formData.get("source") ?? "landing").trim();

  if (!email) {
    return { error: "Veuillez renseigner un email valide." };
  }

  const ip = await getLeadRequesterIp();
  const leadRate = consumeRateLimit({
    key: `marketing:lead:${ip}`,
    limit: 5,
    windowMs: 10 * 60 * 1000,
  });
  if (!leadRate.allowed) {
    return { error: "Trop de soumissions. Réessayez dans quelques minutes." };
  }

  await prisma.lead.upsert({
    where: { email },
    update: {
      name: name || null,
      source: source || "landing",
      status: "NEW",
    },
    create: {
      email,
      name: name || null,
      source: source || "landing",
      status: "NEW",
    },
  });

  await logActivity({
    action: "marketing.lead.capture",
    target: email,
    metadata: { source: source || "landing" },
  });

  // TODO: Integrate transactional email provider to send welcome sequence.
  return { success: "Inscription réussie. Vérifiez votre boîte mail." };
}

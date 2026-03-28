"use server";

import crypto from "crypto";
import { auth } from "@/auth";
import { getStripe } from "@/lib/stripe";
import { cinetPay } from "@/lib/cinetpay";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity";
import { getAppBaseUrl } from "@/lib/app-url";
import { redirect } from "next/navigation";
import { PLATFORM_CURRENCY } from "@/lib/currency";

type PaidTier = "INDIVIDUEL" | "COLLECTIF" | "PRIVE";

const TIER_AMOUNTS: Record<PaidTier, number> = {
  INDIVIDUEL: 12700,
  COLLECTIF: 25500,
  PRIVE: 55800,
};

const TIER_LABELS: Record<PaidTier, string> = {
  INDIVIDUEL: "Pack Individuel",
  COLLECTIF: "Pack Collectif",
  PRIVE: "Pack Privé",
};

export async function createStripeSession(tier: PaidTier) {
  const session = await auth();
  if (!session?.user?.id || session.user.isActive === false) throw new Error("Unauthorized");

  const amount = TIER_AMOUNTS[tier];
  const appBaseUrl = await getAppBaseUrl();

  const checkoutSession = await getStripe().checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "xof",
          product_data: {
            name: `Incubateur Elite 4.0 - ${TIER_LABELS[tier]}`,
          },
          unit_amount: amount,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${appBaseUrl}/dashboard?status=success`,
    cancel_url: `${appBaseUrl}/?status=cancel`,
    metadata: {
      userId: session.user.id,
      tier,
    },
  });

  if (!checkoutSession.url) throw new Error("Could not create session");

  await prisma.payment.create({
    data: {
      userId: session.user.id,
      amount,
      currency: PLATFORM_CURRENCY,
      status: "PENDING",
      provider: "STRIPE",
      reference: checkoutSession.id,
    },
  });

  await logActivity({
    userId: session.user.id,
    action: "student.payment.stripe_pending",
    target: checkoutSession.id,
    metadata: { tier },
  });

  redirect(checkoutSession.url);
}

export async function createCinetPaySession(tier: PaidTier) {
  const session = await auth();
  if (!session?.user?.id || session.user.isActive === false) throw new Error("Unauthorized");

  const amount = TIER_AMOUNTS[tier];
  const transactionId = `CP_${tier}_${crypto.randomUUID().replace(/-/g, "")}`;
  const appBaseUrl = await getAppBaseUrl();

  const response = await cinetPay.initPayment(
    amount,
    transactionId,
    `Incubateur Elite 4.0 - ${TIER_LABELS[tier]}`,
    appBaseUrl
  );

  if (response.code === "201") {
    await prisma.payment.create({
      data: {
        userId: session.user.id,
        amount,
        currency: PLATFORM_CURRENCY,
        status: "PENDING",
        provider: "CINETPAY",
        reference: transactionId,
      },
    });

    await logActivity({
      userId: session.user.id,
      action: "student.payment.cinetpay_pending",
      target: transactionId,
      metadata: { tier },
    });

    redirect(response.data.payment_url);
  } else {
    throw new Error(response.message);
  }
}

"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Tier, UserRole } from "@prisma/client";
import { headers } from "next/headers";
import {
  createPasswordResetToken,
  verifyPasswordResetToken,
} from "@/lib/reset-password";
import { getAppBaseUrl } from "@/lib/app-url";
import { consumeRateLimit } from "@/lib/rate-limit";

async function getRequesterIp() {
  const h = await headers();
  const forwardedFor = h.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }
  return h.get("x-real-ip") ?? "unknown-ip";
}

export async function loginAction(formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");
  const ip = await getRequesterIp();
  const callbackUrlRaw = String(formData.get("callbackUrl") ?? "/dashboard");
  const callbackUrl =
    callbackUrlRaw.startsWith("/") && !callbackUrlRaw.startsWith("//")
      ? callbackUrlRaw
      : "/dashboard";

  if (!email || !password) {
    return { error: "Veuillez remplir tous les champs" };
  }

  const loginRate = consumeRateLimit({
    key: `auth:login:${ip}:${String(email).toLowerCase()}`,
    limit: 10,
    windowMs: 15 * 60 * 1000,
  });
  if (!loginRate.allowed) {
    return {
      error:
        "Trop de tentatives de connexion. Réessayez dans quelques minutes.",
    };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: callbackUrl,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Identifiants invalides." };
        default:
          return { error: "Une erreur est survenue lors de la connexion." };
      }
    }
    // Re-throw redirect errors (standard for NextAuth)
    throw error;
  }
}

export async function requestPasswordResetAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const ip = await getRequesterIp();

  if (!email) {
    return { error: "Veuillez renseigner votre email." };
  }

  const resetRate = consumeRateLimit({
    key: `auth:reset:${ip}:${email}`,
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });
  if (!resetRate.allowed) {
    return {
      error:
        "Trop de demandes de réinitialisation. Réessayez dans quelques minutes.",
    };
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { email: true },
  });

  if (user) {
    const token = createPasswordResetToken(user.email);
    const baseUrl = await getAppBaseUrl();
    const resetUrl = `${baseUrl}/auth/reset-password?token=${encodeURIComponent(token)}`;

    // TODO: replace with transactional email provider (Resend/SMTP).
    console.log(`[PASSWORD_RESET] ${resetUrl}`);

    // Developer UX: expose URL in local mode to test flow quickly.
    if (process.env.NODE_ENV !== "production") {
      return {
        success: "Si votre email existe, un lien de réinitialisation a été généré.",
        resetUrl,
      };
    }
  }

  return { success: "Si votre email existe, un lien de réinitialisation a été envoyé." };
}

export async function resetPasswordAction(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!token) return { error: "Lien invalide ou expiré." };
  if (password.length < 8) return { error: "Le mot de passe doit contenir au moins 8 caractères." };
  if (password !== confirmPassword) return { error: "Les mots de passe ne correspondent pas." };

  const payload = verifyPasswordResetToken(token);
  if (!payload) return { error: "Lien invalide ou expiré." };

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { email: payload.email },
    data: { password: hashedPassword },
  });

  return { success: "Votre mot de passe a été réinitialisé avec succès." };
}

export async function registerAdminAction(formData: FormData) {
  const ip = await getRequesterIp();
  const inviteCode = String(formData.get("inviteCode") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  const adminRate = consumeRateLimit({
    key: `auth:admin-register:${ip}`,
    limit: 3,
    windowMs: 60 * 60 * 1000,
  });
  if (!adminRate.allowed) {
    return { error: "Trop de tentatives. Réessayez plus tard." };
  }

  const serverInviteCode = process.env.ADMIN_INVITE_CODE;
  if (!serverInviteCode) {
    return { error: "L'inscription administrateur n'est pas configurée." };
  }
  if (inviteCode !== serverInviteCode) {
    return { error: "Code d'invitation invalide." };
  }

  if (!email || !password || !confirmPassword) {
    return { error: "Veuillez remplir tous les champs requis." };
  }
  if (password.length < 12) {
    return { error: "Le mot de passe admin doit contenir au moins 12 caractères." };
  }
  if (password !== confirmPassword) {
    return { error: "Les mots de passe ne correspondent pas." };
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (existingUser) {
    return { error: "Un compte existe déjà avec cet email." };
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: {
      name: name || null,
      email,
      password: hashedPassword,
      role: UserRole.ADMIN,
      tier: Tier.PRIVE,
      isActive: true,
    },
  });

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard/admin",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Compte admin créé, mais connexion automatique impossible. Connectez-vous manuellement." };
    }
    throw error;
  }
}

export async function registerAction(formData: FormData) {
  const ip = await getRequesterIp();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const callbackUrlRaw = String(formData.get("callbackUrl") ?? "/dashboard");
  const callbackUrl =
    callbackUrlRaw.startsWith("/") && !callbackUrlRaw.startsWith("//")
      ? callbackUrlRaw
      : "/dashboard";

  if (!email || !password || !confirmPassword) {
    return { error: "Veuillez remplir tous les champs requis." };
  }

  const registerRate = consumeRateLimit({
    key: `auth:register:${ip}`,
    limit: 10,
    windowMs: 60 * 60 * 1000,
  });
  if (!registerRate.allowed) {
    return {
      error:
        "Trop d'inscriptions depuis cette adresse. Réessayez plus tard.",
    };
  }
  if (password.length < 8) {
    return { error: "Le mot de passe doit contenir au moins 8 caractères." };
  }
  if (password !== confirmPassword) {
    return { error: "Les mots de passe ne correspondent pas." };
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (existingUser) {
    return { error: "Un compte existe déjà avec cet email." };
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: {
      name: name || null,
      email,
      password: hashedPassword,
      role: UserRole.STUDENT,
      tier: Tier.FREE,
      isActive: true,
    },
  });

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: callbackUrl,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Compte créé, mais connexion automatique impossible." };
    }
    throw error;
  }
}

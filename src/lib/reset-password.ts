import crypto from "crypto";

const TOKEN_TTL_SECONDS = 15 * 60;

type PasswordResetPayload = {
  email: string;
  exp: number;
};

function getSecret() {
  return (
    process.env.RESET_PASSWORD_SECRET ||
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    ""
  );
}

function sign(payloadBase64: string) {
  const secret = getSecret();
  if (!secret) {
    throw new Error("Missing reset password secret");
  }
  return crypto.createHmac("sha256", secret).update(payloadBase64).digest("base64url");
}

export function createPasswordResetToken(email: string) {
  const payload: PasswordResetPayload = {
    email,
    exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
  };
  const payloadBase64 = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const signature = sign(payloadBase64);
  return `${payloadBase64}.${signature}`;
}

export function verifyPasswordResetToken(token: string) {
  try {
    const [payloadBase64, signature] = token.split(".");
    if (!payloadBase64 || !signature) return null;

    const expectedSignature = sign(payloadBase64);
    const expectedBuffer = Buffer.from(expectedSignature, "base64url");
    const receivedBuffer = Buffer.from(signature, "base64url");
    if (expectedBuffer.length !== receivedBuffer.length) return null;
    if (!crypto.timingSafeEqual(expectedBuffer, receivedBuffer)) return null;

    const parsed = JSON.parse(
      Buffer.from(payloadBase64, "base64url").toString("utf8")
    ) as PasswordResetPayload;

    if (!parsed.email || !parsed.exp) return null;
    if (parsed.exp < Math.floor(Date.now() / 1000)) return null;
    return parsed;
  } catch {
    return null;
  }
}

import { headers } from "next/headers";

function normalizeBaseUrl(url: string) {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

export async function getAppBaseUrl() {
  const envBase =
    process.env.APP_BASE_URL ??
    process.env.AUTH_URL ??
    process.env.NEXTAUTH_URL;
  if (envBase) {
    return normalizeBaseUrl(envBase);
  }

  const h = await headers();
  const forwardedHost = h.get("x-forwarded-host");
  const host = forwardedHost ?? h.get("host");
  const forwardedProto = h.get("x-forwarded-proto");

  if (host) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "Missing APP_BASE_URL/AUTH_URL/NEXTAUTH_URL in production"
      );
    }
    const proto =
      forwardedProto ??
      (host.includes("localhost") || host.startsWith("127.0.0.1")
        ? "http"
        : "https");
    return `${proto}://${host}`;
  }

  return "http://localhost:3001";
}

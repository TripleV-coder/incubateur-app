import { PLATFORM_CURRENCY } from "@/lib/currency";

interface CinetPayInitResponse {
  code: string;
  message: string;
  data: {
    payment_token: string;
    payment_url: string;
  };
}

export const cinetPay = {
  async initPayment(
    amount: number,
    transactionId: string,
    description: string,
    baseUrl?: string
  ) {
    const appBaseUrl = baseUrl ?? process.env.NEXTAUTH_URL ?? process.env.AUTH_URL;
    if (!appBaseUrl) {
      throw new Error("Application base URL is not configured");
    }

    const payload = {
      apikey: process.env.CINETPAY_API_KEY,
      site_id: process.env.CINETPAY_SITE_ID,
      transaction_id: transactionId,
      amount: amount,
      currency: PLATFORM_CURRENCY, // Franc CFA (BCEAO) · XOF
      description: description,
      notify_url: `${appBaseUrl}/api/webhooks/cinetpay`,
      return_url: `${appBaseUrl}/dashboard`,
      channels: "ALL",
    };

    const response = await fetch("https://api-checkout.cinetpay.com/payment/v1/init", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data: CinetPayInitResponse = await response.json();
    return data;
  },
};

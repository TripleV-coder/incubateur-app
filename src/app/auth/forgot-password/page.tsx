"use client";

import { useState } from "react";
import Link from "next/link";
import EliteCard from "@/components/ui/EliteCard";
import { requestPasswordResetAction } from "@/app/actions/auth";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [resetUrl, setResetUrl] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    setResetUrl(null);

    const formData = new FormData(event.currentTarget);
    const result = await requestPasswordResetAction(formData);

    if (result.error) {
      setError(result.error);
    } else if (result.success) {
      setSuccess(result.success);
      setResetUrl(result.resetUrl ?? null);
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-elite text-4xl font-bold gold-text-gradient mb-2">
            MOT DE PASSE OUBLIE
          </h1>
          <p className="text-snow/60">Recevez un lien de reinitialisation securise.</p>
        </div>

        <EliteCard>
          <form onSubmit={onSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg text-sm text-center">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-500/10 border border-green-500/50 text-green-500 p-3 rounded-lg text-sm text-center">
                {success}
              </div>
            )}
            {resetUrl && (
              <p className="text-xs text-gold break-all text-center">
                {resetUrl}
              </p>
            )}

            <div>
              <label className="block text-sm font-medium mb-2 text-snow/80">Email</label>
              <input
                name="email"
                type="email"
                required
                className="w-full bg-elite-black/50 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-gold/50 transition-colors"
                placeholder="votre@email.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full gold-gradient text-elite-black font-bold py-3 rounded-lg hover:scale-[1.02] transition-transform disabled:opacity-50"
            >
              {loading ? "Envoi..." : "Envoyer le lien"}
            </button>

            <div className="text-center text-sm">
              <Link href="/auth/login" className="text-gold hover:underline">
                Retour a la connexion
              </Link>
            </div>
          </form>
        </EliteCard>
      </div>
    </main>
  );
}

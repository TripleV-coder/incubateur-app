"use client";

import { useState } from "react";
import Link from "next/link";
import EliteCard from "@/components/ui/EliteCard";
import { resetPasswordAction } from "@/app/actions/auth";

type Props = {
  token: string;
};

export function ResetPasswordForm({ token }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(event.currentTarget);
    formData.set("token", token);

    const result = await resetPasswordAction(formData);
    if (result.error) setError(result.error);
    if (result.success) setSuccess(result.success);
    setLoading(false);
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-elite text-4xl font-bold gold-text-gradient mb-2">
            REINITIALISATION
          </h1>
          <p className="text-snow/60">Definissez un nouveau mot de passe.</p>
        </div>

        <EliteCard>
          {!token ? (
            <div className="text-center space-y-3">
              <p className="text-red-400">Lien invalide ou incomplet.</p>
              <Link href="/auth/forgot-password" className="text-gold hover:underline text-sm">
                Demander un nouveau lien
              </Link>
            </div>
          ) : (
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

              <div>
                <label className="block text-sm font-medium mb-2 text-snow/80">
                  Nouveau mot de passe
                </label>
                <input
                  name="password"
                  type="password"
                  minLength={8}
                  required
                  className="w-full bg-elite-black/50 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-gold/50 transition-colors"
                  placeholder="8 caracteres minimum"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-snow/80">
                  Confirmer le mot de passe
                </label>
                <input
                  name="confirmPassword"
                  type="password"
                  minLength={8}
                  required
                  className="w-full bg-elite-black/50 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-gold/50 transition-colors"
                  placeholder="Repetez le mot de passe"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full gold-gradient text-elite-black font-bold py-3 rounded-lg hover:scale-[1.02] transition-transform disabled:opacity-50"
              >
                {loading ? "Mise a jour..." : "Mettre a jour"}
              </button>

              <div className="text-center text-sm">
                <Link href="/auth/login" className="text-gold hover:underline">
                  Retour a la connexion
                </Link>
              </div>
            </form>
          )}
        </EliteCard>
      </div>
    </main>
  );
}

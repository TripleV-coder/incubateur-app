"use client";

import React, { useState } from "react";
import EliteCard from "@/components/ui/EliteCard";
import { loginAction } from "@/app/actions/auth";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

type LoginFormProps = {
  callbackUrl: string;
};

export default function LoginForm({ callbackUrl }: LoginFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const result = await loginAction(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="absolute top-0 left-0 w-full h-full -z-10 bg-[radial-gradient(circle_at_50%_50%,rgba(212,175,55,0.05),transparent_50%)]" />

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-elite text-4xl font-bold gold-text-gradient mb-2">CONNEXION</h1>
          <p className="text-snow/60">Accédez à votre espace Élite</p>
        </div>

        <EliteCard>
          <form onSubmit={handleSubmit} className="space-y-6">
            <input type="hidden" name="callbackUrl" value={callbackUrl} />
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg text-sm text-center">
                {error}
              </div>
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

            <div>
              <label className="block text-sm font-medium mb-2 text-snow/80">Mot de passe</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full bg-elite-black/50 border border-white/10 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:border-gold/50 transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 px-3 text-snow/50 hover:text-gold transition-colors"
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <div className="mt-2 text-right">
                <Link href="/auth/forgot-password" className="text-xs text-gold hover:underline">
                  Mot de passe oublie ?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full gold-gradient text-elite-black font-bold py-3 rounded-lg hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Connexion..." : "Se Connecter"}
            </button>

            <div className="text-center text-sm">
              <span className="text-snow/40">Pas encore membre ? </span>
              <Link href={`/auth/register?callbackUrl=${encodeURIComponent(callbackUrl)}`} className="text-gold hover:underline">
                Créer un compte
              </Link>
            </div>
          </form>
        </EliteCard>
      </div>
    </main>
  );
}

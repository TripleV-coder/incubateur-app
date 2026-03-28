"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import EliteCard from "@/components/ui/EliteCard";
import { registerAdminAction } from "@/app/actions/auth";

export default function AdminRegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const result = await registerAdminAction(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="absolute top-0 left-0 w-full h-full -z-10 bg-[radial-gradient(circle_at_50%_50%,rgba(212,175,55,0.08),transparent_50%)]" />
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gold/10 text-gold mb-4">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="font-elite text-3xl font-bold gold-text-gradient mb-2">
            ACCÈS ADMINISTRATEUR
          </h1>
          <p className="text-snow/60 text-sm">
            Inscription réservée. Un code d&apos;invitation est requis.
          </p>
        </div>

        <EliteCard>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg text-sm text-center">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2 text-gold">
                Code d&apos;invitation
              </label>
              <input
                name="inviteCode"
                type="password"
                required
                className="w-full bg-elite-black/50 border border-gold/30 rounded-lg px-4 py-3 focus:outline-none focus:border-gold/60 transition-colors text-gold placeholder:text-gold/30"
                placeholder="Entrez le code secret"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-snow/80">
                Nom complet
              </label>
              <input
                name="name"
                required
                className="w-full bg-elite-black/50 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-gold/50 transition-colors"
                placeholder="Votre nom"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-snow/80">
                Email professionnel
              </label>
              <input
                name="email"
                type="email"
                required
                className="w-full bg-elite-black/50 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-gold/50 transition-colors"
                placeholder="admin@votre-domaine.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-snow/80">
                Mot de passe (12 caractères min.)
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={12}
                  className="w-full bg-elite-black/50 border border-white/10 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:border-gold/50 transition-colors"
                  placeholder="12 caractères minimum"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 px-3 text-snow/50 hover:text-gold transition-colors"
                  aria-label={showPassword ? "Masquer" : "Afficher"}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-snow/80">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <input
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  minLength={12}
                  className="w-full bg-elite-black/50 border border-white/10 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:border-gold/50 transition-colors"
                  placeholder="Répétez le mot de passe"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 px-3 text-snow/50 hover:text-gold transition-colors"
                  aria-label={showConfirmPassword ? "Masquer" : "Afficher"}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full gold-gradient text-elite-black font-bold py-3 rounded-lg hover:scale-[1.02] transition-transform disabled:opacity-50"
            >
              {loading ? "Création du compte..." : "Créer le compte administrateur"}
            </button>

            <div className="text-center text-sm">
              <span className="text-snow/40">Déjà admin ? </span>
              <Link href="/auth/login" className="text-gold hover:underline">
                Se connecter
              </Link>
            </div>
          </form>
        </EliteCard>
      </div>
    </main>
  );
}

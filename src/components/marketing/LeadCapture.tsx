"use client";

import React from 'react';
import EliteCard from '@/components/ui/EliteCard';
import { Sparkles, Send } from 'lucide-react';
import { createLeadCaptureAction } from '@/app/actions/marketing';

export const LeadCapture = () => {
  const [email, setEmail] = React.useState("");
  const [name, setName] = React.useState("");
  const [message, setMessage] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage(null);

    const formData = new FormData();
    formData.set("email", email);
    formData.set("name", name);
    formData.set("source", "landing");

    const result = await createLeadCaptureAction(formData);
    if (result.success) {
      setStatus("success");
      setEmail("");
      setName("");
      setMessage(result.success);
      return;
    }

    setStatus("error");
    setMessage(result.error ?? "Une erreur est survenue.");
  };

  return (
    <section id="waitlist" className="section-space pt-12">
      <div className="shell grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
        <div className="space-y-7 text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-gold reveal-on-scroll">
            <Sparkles className="w-4 h-4" /> Accès Exclusif
          </div>

          <h2 className="font-elite text-5xl leading-tight md:text-6xl gold-text-gradient reveal-on-scroll" style={{ "--reveal-delay": "120ms" } as React.CSSProperties}>
            Rejoignez la Liste d&apos;Attente Élite
          </h2>

          <p className="max-w-2xl text-lg leading-relaxed text-snow/60 reveal-on-scroll" style={{ "--reveal-delay": "220ms" } as React.CSSProperties}>
            Soyez le premier informé des nouvelles masterclasses et recevez notre guide{" "}
            <span className="font-bold text-gold">"Empire Blueprint"</span> gratuitement.
          </p>
        </div>

        <EliteCard className="mx-auto w-full max-w-xl reveal-on-scroll" style={{ "--reveal-delay": "260ms" } as React.CSSProperties}>
          {status === "success" ? (
            <div className="animate-in fade-in zoom-in py-8 duration-500">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-400/10 text-green-400">
                <Send className="h-8 w-8" />
              </div>
              <h3 className="mb-2 text-center text-xl font-bold text-snow">Bienvenue dans l'Élite !</h3>
              <p className="text-center text-sm text-snow/40">Vérifiez votre boîte mail pour votre cadeau de bienvenue.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div>
                <label className="mb-2 block px-1 text-xs font-bold uppercase tracking-widest text-snow/40">
                  Prénom (optionnel)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Votre prénom"
                  className="w-full rounded-xl border border-white/10 bg-elite-black/50 px-5 py-4 text-snow transition-all focus:border-gold/50 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block px-1 text-xs font-bold uppercase tracking-widest text-snow/40">
                  Votre Meilleur Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom@exemple.com"
                  className="w-full rounded-xl border border-white/10 bg-elite-black/50 px-5 py-4 text-snow transition-all focus:border-gold/50 focus:outline-none"
                />
              </div>

              {message && (
                <p className={`text-xs ${status === "error" ? "text-red-400" : "text-green-400"}`}>
                  {message}
                </p>
              )}

              <button
                disabled={status === "loading"}
                className="gold-gradient flex w-full items-center justify-center gap-2 rounded-xl py-4 font-bold text-elite-black transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {status === "loading" ? "Inscription..." : "Obtenir mon accès VIP"}
              </button>

              <p className="text-center text-[10px] uppercase tracking-tighter text-snow/20">
                Pas de spam. Juste de la pure valeur. Désinscrivez-vous à tout moment.
              </p>
            </form>
          )}
        </EliteCard>
      </div>
    </section>
  );
};

export default LeadCapture;

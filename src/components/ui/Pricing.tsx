"use client";

import React from 'react';
import EliteCard from './EliteCard';
import { createStripeSession, createCinetPaySession } from '@/app/actions/payments';
import { CreditCard, Smartphone } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { formatXof } from '@/lib/currency';

type PaidTier = "INDIVIDUEL" | "COLLECTIF" | "PRIVE";

export const Pricing = () => {
  const router = useRouter();
  const { status } = useSession();
  const [loading, setLoading] = React.useState<string | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const handleStripe = async (tier: PaidTier) => {
    setErrorMessage(null);
    if (status !== "authenticated") {
      router.push(`/auth/login?callbackUrl=${encodeURIComponent("/#pricing")}`);
      return;
    }

    setLoading(`${tier}_stripe`);
    try {
      await createStripeSession(tier);
    } catch (err) {
      console.error(err);
      setErrorMessage("Veuillez vous connecter pour continuer le paiement.");
      setLoading(null);
    }
  };

  const handleCinetPay = async (tier: PaidTier) => {
    setErrorMessage(null);
    if (status !== "authenticated") {
      router.push(`/auth/login?callbackUrl=${encodeURIComponent("/#pricing")}`);
      return;
    }

    setLoading(`${tier}_cinetpay`);
    try {
      await createCinetPaySession(tier);
    } catch (err) {
      console.error(err);
      setErrorMessage("Veuillez vous connecter pour continuer le paiement.");
      setLoading(null);
    }
  };

  const tiers = [
    {
      name: "PACK INDIVIDUEL",
      amountXof: 12_700,
      features: [
        "3 eBooks complets",
        "Une vidéo d'explication détaillée",
        "Accès à la communauté publique",
      ],
      tier: "INDIVIDUEL" as const,
      dotClass: "bg-snow/40",
    },
    {
      name: "PACK COLLECTIF",
      amountXof: 25_500,
      features: [
        "3 eBooks complets",
        "Vidéos pratiques incluses",
        "4 semaines de coaching collectif avec un coach",
        "Groupe Telegram VIP",
      ],
      tier: "COLLECTIF" as const,
      dotClass: "bg-electric-blue",
    },
    {
      name: "PACK PRIVÉ",
      amountXof: 55_800,
      features: [
        "6 eBooks complets",
        "Accompagnement privé Incubateur Élite 4.0",
        "8 semaines de suivi rigoureux",
        "Accès à vie aux mises à jour",
      ],
      tier: "PRIVE" as const,
      dotClass: "bg-gold",
    },
  ];

  return (
    <section id="pricing" className="section-space">
      <div className="shell">
        <div className="mb-16 grid gap-5 lg:grid-cols-[1fr_1fr] lg:items-end">
          <h2 className="font-elite text-5xl leading-tight md:text-6xl gold-text-gradient reveal-on-scroll">
            Investissez dans votre Empire
          </h2>
          <p className="max-w-xl text-base leading-relaxed text-snow/55 md:text-lg lg:justify-self-end reveal-on-scroll" style={{ "--reveal-delay": "120ms" } as React.CSSProperties}>
            Choisissez le niveau d&apos;accompagnement adapté à vos ambitions et activez immédiatement votre accès stratégique.
          </p>
        </div>
      </div>

      <div className="shell grid grid-cols-1 gap-8 xl:grid-cols-3">
        {tiers.map((t, index) => (
          <EliteCard
            key={t.name}
            className={`relative overflow-hidden reveal-on-scroll ${t.tier === 'PRIVE' ? 'border-gold/40 shadow-[0_35px_95px_rgba(212,175,55,0.15)] xl:-translate-y-3' : ''}`}
            style={{ "--reveal-delay": `${160 + index * 110}ms` } as React.CSSProperties}
          >
            <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-gold/10 blur-3xl" />

            <div className="mb-10">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-[0.24em] text-snow/45">
                  {t.name}
                </h3>
                {t.tier === "PRIVE" && (
                  <span className="shrink-0 rounded-full border border-gold/40 bg-gold/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
                    RECOMMANDÉ
                  </span>
                )}
              </div>
              <div className="font-elite text-6xl leading-none text-snow">
                {formatXof(t.amountXof)}
              </div>
            </div>

            <ul className="mb-12 min-h-[190px] space-y-5">
              {t.features.map((f, i) => (
                <li key={i} className="flex items-start gap-3 text-[15px] text-snow/72">
                  <div className={`mt-2 h-1.5 w-1.5 rounded-full ${t.dotClass}`} />
                  {f}
                </li>
              ))}
            </ul>

            {(
              <div className="space-y-3">
                <button
                  onClick={() => handleStripe(t.tier as PaidTier)}
                  disabled={!!loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-snow py-4 text-sm font-bold uppercase tracking-wider text-elite-black transition-all hover:bg-snow/90 disabled:opacity-50"
                >
                  <CreditCard className="h-5 w-5" />
                  {loading === `${t.tier}_stripe` ? 'Chargement...' : 'Payer par Carte'}
                </button>
                <button
                  onClick={() => handleCinetPay(t.tier as PaidTier)}
                  disabled={!!loading}
                  className="glass flex w-full items-center justify-center gap-2 rounded-xl border-white/10 py-4 text-sm font-bold uppercase tracking-wider transition-all hover:bg-white/5 disabled:opacity-50"
                >
                  <Smartphone className="h-5 w-5" />
                  {loading === `${t.tier}_cinetpay` ? 'Chargement...' : 'Payer par Mobile Money'}
                </button>
              </div>
            )}
          </EliteCard>
        ))}
      </div>
      {errorMessage && (
        <div className="shell mt-6">
          <p className="text-sm text-red-400">{errorMessage}</p>
        </div>
      )}
    </section>
  );
};

export default Pricing;

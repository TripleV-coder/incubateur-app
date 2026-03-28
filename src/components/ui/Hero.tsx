import React from 'react';
import Link from 'next/link';

export const Hero = () => {

  return (
    <section className="relative overflow-hidden pt-20 pb-28 md:pt-28 md:pb-36">
      <div data-parallax-speed="0.06" className="parallax-layer absolute top-10 left-8 h-56 w-56">
        <div className="h-full w-full rounded-full border border-gold/20 float-slow" />
      </div>
      <div data-parallax-speed="0.1" className="parallax-layer absolute bottom-20 right-10 h-72 w-72">
        <div className="h-full w-full rounded-full bg-gold/10 blur-[120px] float-slow" />
      </div>
      <div data-parallax-speed="0.08" className="parallax-layer absolute top-1/3 right-1/4 h-40 w-40">
        <div className="h-full w-full rounded-full bg-electric-blue/10 blur-[110px] float-slow" />
      </div>

      <div className="shell grid items-end gap-14 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-8">
          <div className="flex flex-wrap items-center gap-3 reveal-on-scroll" style={{ "--reveal-delay": "70ms" } as React.CSSProperties}>
            <p className="inline-flex items-center rounded-full border border-gold/30 bg-gold/10 px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-gold">
              Le E-commerce des Produits Digitaux
            </p>
            <p className="inline-flex items-center rounded-full border border-green-500/30 bg-green-500/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-green-400">
              23 000+ accompagnés
            </p>
            <p className="inline-flex items-center rounded-full border border-green-500/30 bg-green-500/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-green-400">
              96% de réussite
            </p>
          </div>

          <h1 className="font-elite text-6xl leading-[0.9] md:text-8xl lg:text-[7.5rem] reveal-on-scroll" style={{ "--reveal-delay": "150ms" } as React.CSSProperties}>
            <span className="block text-snow">INCUBATEUR</span>
            <span className="gold-text-gradient">ELITE 4.0</span>
          </h1>

          <p className="max-w-2xl text-lg leading-relaxed text-snow/68 md:text-2xl reveal-on-scroll" style={{ "--reveal-delay": "240ms" } as React.CSSProperties}>
            L&apos;académie d&apos;élite du e-commerce de produits digitaux. Transformez votre vision en empire rentable avec un système guidé, premium et orienté résultats.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row reveal-on-scroll" style={{ "--reveal-delay": "320ms" } as React.CSSProperties}>
            <Link
              href="/dashboard"
              className="gold-gradient shimmer-line rounded-full px-10 py-4 text-center text-base font-bold uppercase tracking-wide text-elite-black transition-transform hover:scale-[1.03]"
            >
              Accéder à la Formation VIP
            </Link>
            <Link
              href="#pricing"
              className="glass rounded-full px-10 py-4 text-center text-base font-semibold uppercase tracking-wide transition-colors hover:bg-snow/10"
            >
              Voir les Programmes
            </Link>
          </div>
        </div>

        <div className="relative mt-8 lg:mt-0 reveal-on-scroll" style={{ "--reveal-delay": "220ms" } as React.CSSProperties}>
          <div className="glass rotate-[-2deg] rounded-[2rem] border-gold/20 p-9 shadow-[0_25px_80px_rgba(5,5,7,0.7)]">
            <p className="mb-4 text-xs uppercase tracking-[0.22em] text-gold/80">Manifesto Elite</p>
            <p className="font-elite text-3xl leading-tight text-snow md:text-4xl">
              De la stratégie à l&apos;exécution.
              <br />
              Un cadre qui transforme les ambitions en chiffre d&apos;affaires.
            </p>
            <div className="mt-8 flex gap-3 text-xs uppercase tracking-[0.18em] text-snow/45">
              <span>Growth</span>
              <span>•</span>
              <span>Assets</span>
              <span>•</span>
              <span>Authority</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

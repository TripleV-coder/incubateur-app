import React from "react";

export default function CoursesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#050506]">
      <div className="border-b border-white/[0.07] bg-gradient-to-r from-black/80 via-[#0a0a0c] to-black/80">
        <div className="shell flex flex-col gap-1 py-3 text-[11px] uppercase tracking-[0.2em] text-snow/40 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-snow/25">Espace membre</span>
            <span className="text-snow/15">/</span>
            <span className="font-semibold tracking-[0.18em] text-gold/90">
              Catalogue LMS
            </span>
          </div>
          <p className="max-w-xl text-[10px] font-normal normal-case tracking-normal text-snow/35 md:text-right">
            Parcours structurés, accès conditionné par offre — pilotage pédagogique centralisé.
          </p>
        </div>
      </div>
      {children}
    </div>
  );
}

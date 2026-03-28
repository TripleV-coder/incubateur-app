"use client";

import { useEffect } from 'react';
import EliteCard from '@/components/ui/EliteCard';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="absolute top-0 left-0 w-full h-full -z-10 bg-[radial-gradient(circle_at_50%_50%,rgba(220,38,38,0.05),transparent_50%)]" />
      <div className="w-full max-w-lg text-center">
        <EliteCard className="border-red-500/20 shadow-[0_0_30px_rgba(220,38,38,0.1)]">
          <h1 className="font-elite text-5xl font-bold text-red-500 mb-4">Erreur Système</h1>
          <h2 className="text-xl font-bold text-snow mb-4">Une anomalie a été détectée</h2>
          <p className="text-snow/60 mb-8">
            Nos ingénieurs d'élite ont été notifiés. Veuillez réessayer dans quelques instants.
          </p>
          <button
            onClick={() => reset()}
            className="w-full border border-red-500/50 hover:bg-red-500/10 text-red-400 font-bold py-3 px-8 rounded-xl transition-all"
          >
            Tenter une reconnexion
          </button>
        </EliteCard>
      </div>
    </main>
  );
}

"use client";

import { SessionProvider } from "next-auth/react";
import React from "react";
import { ScrollReveal } from "./ScrollReveal";
import { CinematicEffects } from "./CinematicEffects";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ScrollReveal />
      <CinematicEffects />
      {children}
    </SessionProvider>
  );
}

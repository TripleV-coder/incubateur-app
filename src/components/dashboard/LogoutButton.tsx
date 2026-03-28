"use client";

import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';

type LogoutButtonProps = {
  compact?: boolean;
};

export const LogoutButton = ({ compact = false }: LogoutButtonProps) => {
  return (
    <button 
      onClick={() => signOut()}
      className={`w-full flex items-center rounded-xl border border-white/10 bg-white/[0.02] text-snow/55 hover:text-red-400 hover:bg-red-500/5 transition-all ${
        compact ? "justify-center px-2 py-2.5" : "gap-2 px-3 py-2.5 text-xs font-semibold"
      }`}
      title="Déconnexion"
      aria-label="Déconnexion"
    >
      <LogOut className={compact ? "w-[18px] h-[18px]" : "w-4 h-4"} />
      {!compact && "Déconnexion"}
    </button>
  );
};

export default LogoutButton;

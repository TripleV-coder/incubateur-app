"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, Menu, X } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { roleHomePath } from '@/lib/rbac';

export const Navbar = () => {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = React.useState(false);
  const isAuthenticated = status === "authenticated";
  const isLoadingSession = status === "loading";
  const dashboardHref = session?.user?.role
    ? roleHomePath[session.user.role]
    : "/dashboard";

  const role = session?.user?.role;

  const navLinks = [
    ...(status === "unauthenticated"
      ? [{ name: "Accueil", href: "/" as const }]
      : []),
    { name: "Dashboard", href: dashboardHref },
    { name: "Formations", href: "/courses" },
    ...(role === "ADMIN"
      ? [
          { name: "Administration", href: "/dashboard/admin" as const },
          { name: "Coaching", href: "/dashboard/coach" as const },
        ]
      : []),
    ...(role === "COACH"
      ? [{ name: "Espace coach", href: "/dashboard/coach" as const }]
      : []),
  ];

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };

  function linkIsActive(href: string) {
    if (href === "/courses") return pathname.startsWith("/courses");
    if (href === "/dashboard/admin") return pathname.startsWith("/dashboard/admin");
    if (href === "/dashboard/coach") return pathname === "/dashboard/coach";
    return pathname === href;
  }

  return (
    <nav className="sticky top-0 z-50 glass backdrop-blur-xl border-b border-white/5 px-4 py-4 md:py-5">
      <div className="shell flex items-center justify-between">
        <Link
          href={isAuthenticated ? dashboardHref : "/"}
          className="flex items-center gap-2 group"
        >
          <div className="w-8 h-8 rounded bg-gold flex items-center justify-center font-bold text-elite-black group-hover:scale-105 transition-transform">
            E
          </div>
          <span className="font-elite text-xl font-bold tracking-tighter text-snow group-hover:text-gold transition-colors">
            INCUBATEUR <span className="gold-text-gradient">ELITE</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={`${link.name}-${link.href}`}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-gold ${
                linkIsActive(link.href) ? 'text-gold' : 'text-snow/60'
              }`}
            >
              {link.name}
            </Link>
          ))}
          
          {isAuthenticated ? (
            <div className="flex items-center gap-4 pl-4 border-l border-white/10">
              <span className="text-xs text-snow/40 font-medium">{session.user?.name}</span>
              <button 
                onClick={handleLogout}
                className="p-2 rounded-lg bg-white/5 hover:bg-red-500/10 hover:text-red-500 transition-all text-snow/40"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : isLoadingSession ? (
            <div className="h-9 w-36 rounded-lg bg-white/5 animate-pulse" />
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/auth/register"
                className="px-4 py-2 rounded-lg border border-white/15 text-snow font-bold text-sm hover:bg-white/5 transition-all"
              >
                Inscription
              </Link>
              <Link 
                href="/auth/login"
                className="px-6 py-2 rounded-lg bg-gold text-elite-black font-bold text-sm hover:scale-105 transition-all"
              >
                Connexion
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button 
          className="md:hidden text-snow"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full glass border-b border-white/5 p-6 space-y-4 animate-in slide-in-from-top duration-300">
          {navLinks.map((link) => (
            <Link 
              key={`${link.name}-${link.href}-m`}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`block text-lg font-medium ${
                linkIsActive(link.href) ? 'text-gold' : 'text-snow/60'
              }`}
            >
              {link.name}
            </Link>
          ))}
          {!isAuthenticated && !isLoadingSession && (
            <>
              <Link
                href="/auth/register"
                onClick={() => setIsOpen(false)}
                className="block w-full py-3 rounded-lg border border-white/15 text-snow font-bold text-center"
              >
                Inscription
              </Link>
              <Link 
                href="/auth/login"
                onClick={() => setIsOpen(false)}
                className="block w-full py-3 rounded-lg bg-gold text-elite-black font-bold text-center"
              >
                Connexion
              </Link>
            </>
          )}
          {isAuthenticated && (
            <button 
              onClick={handleLogout}
              className="w-full py-3 rounded-lg bg-red-500/10 text-red-500 font-bold"
            >
              Déconnexion
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;

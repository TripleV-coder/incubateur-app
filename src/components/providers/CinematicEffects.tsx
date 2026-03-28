"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function CinematicEffects() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/") return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const layers = Array.from(
      document.querySelectorAll<HTMLElement>("[data-parallax-speed]")
    );
    if (layers.length === 0) return;

    let rafId = 0;

    const update = () => {
      const scrollY = window.scrollY;
      layers.forEach((layer) => {
        const speed = Number(layer.dataset.parallaxSpeed ?? "0");
        const offset = scrollY * speed;
        layer.style.setProperty("--parallax-y", `${offset.toFixed(2)}px`);
      });
      rafId = 0;
    };

    const onScroll = () => {
      if (rafId !== 0) return;
      rafId = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId !== 0) window.cancelAnimationFrame(rafId);
      layers.forEach((layer) => layer.style.removeProperty("--parallax-y"));
    };
  }, [pathname]);

  return null;
}

/**
 * Devise unique de la plateforme : franc CFA (code ISO XOF).
 * Tous les montants en base sont exprimés dans cette unité.
 */
export const PLATFORM_CURRENCY = "XOF" as const;

export function formatXofAmount(value: number | { toNumber(): number }): string {
  const n = typeof value === "number" ? value : value.toNumber();
  return new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 0,
  }).format(n);
}

/** Affichage canonique : « 12 700 XOF » */
export function formatXof(value: number | { toNumber(): number }): string {
  return `${formatXofAmount(value)} ${PLATFORM_CURRENCY}`;
}

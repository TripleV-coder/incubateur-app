import type { Tier } from "@prisma/client";

export const TIER_ORDER: Tier[] = ["FREE", "INDIVIDUEL", "COLLECTIF", "PRIVE"];

export const TIER_LABEL_FR: Record<Tier, string> = {
  FREE: "Accès gratuit",
  INDIVIDUEL: "Pack Individuel",
  COLLECTIF: "Pack Collectif",
  PRIVE: "Pack Privé",
};

/** Indique si le tier utilisateur permet d'accéder à un parcours `minTier`. */
export function tierMeetsMinimum(userTier: Tier, courseMinTier: Tier) {
  return TIER_ORDER.indexOf(userTier) >= TIER_ORDER.indexOf(courseMinTier);
}

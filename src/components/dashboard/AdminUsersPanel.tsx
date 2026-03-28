"use client";

import { useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import type { Tier, UserRole } from "@prisma/client";
import { Search, UserCog } from "lucide-react";
import { updateUserAccessAction } from "@/app/actions/admin";

export type AdminUserRow = {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  tier: Tier;
  isActive: boolean;
  createdAt: Date;
  coachId: string | null;
  coach: { id: string; name: string | null; email: string } | null;
};

export type CoachOption = {
  id: string;
  name: string | null;
  email: string;
};

const ROLE_LABEL: Record<UserRole, string> = {
  ADMIN: "Administrateur",
  COACH: "Coach",
  STUDENT: "Élève",
};

const TIER_LABEL: Record<Tier, string> = {
  FREE: "Gratuit",
  INDIVIDUEL: "Individuel",
  COLLECTIF: "Collectif",
  PRIVE: "Privé",
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-xl bg-gold/15 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-gold ring-1 ring-gold/35 transition hover:bg-gold/25 disabled:opacity-50 sm:w-auto"
    >
      {pending ? "Enregistrement…" : "Enregistrer les modifications"}
    </button>
  );
}

function UserCard({
  user,
  coaches,
  currentUserId,
}: {
  user: AdminUserRow;
  coaches: CoachOption[];
  currentUserId: string;
}) {
  const isSelf = user.id === currentUserId;
  const [roleDraft, setRoleDraft] = useState<UserRole>(user.role);

  const showCoach = roleDraft === "STUDENT";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.25)] transition hover:border-white/15">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold/15 font-elite text-lg font-bold text-gold">
            {(user.name?.[0] ?? user.email[0] ?? "?").toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-snow">
              {user.name?.trim() || "Sans nom"}
            </p>
            <p className="truncate text-xs text-snow/45">{user.email}</p>
            <p className="mt-1 text-[10px] uppercase tracking-widest text-snow/30">
              Inscrit le{" "}
              {new Date(user.createdAt).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <span
            className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
              user.isActive
                ? "bg-emerald-500/15 text-emerald-400"
                : "bg-red-500/15 text-red-400"
            }`}
          >
            {user.isActive ? "Actif" : "Suspendu"}
          </span>
          <span className="inline-flex rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-snow/50">
            {ROLE_LABEL[user.role]}
          </span>
        </div>
      </div>

      <form
        action={updateUserAccessAction}
        className="space-y-4"
        key={`${user.tier}-${user.role}-${user.coachId ?? ""}-${user.isActive}`}
      >
        <input type="hidden" name="userId" value={user.id} />

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-snow/40">
              Rôle
            </span>
            <select
              name="role"
              value={roleDraft}
              onChange={(e) => setRoleDraft(e.target.value as UserRole)}
              className="w-full rounded-xl border border-white/10 bg-elite-black px-3 py-2.5 text-sm text-snow outline-none transition focus:border-gold/40"
            >
              {(Object.keys(ROLE_LABEL) as UserRole[]).map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABEL[r]}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-snow/40">
              Offre (tier)
            </span>
            <select
              name="tier"
              defaultValue={user.tier}
              className="w-full rounded-xl border border-white/10 bg-elite-black px-3 py-2.5 text-sm text-snow outline-none transition focus:border-gold/40"
            >
              {(Object.keys(TIER_LABEL) as Tier[]).map((t) => (
                <option key={t} value={t}>
                  {TIER_LABEL[t]}
                </option>
              ))}
            </select>
          </label>

          {showCoach ? (
            <label className="block space-y-1.5 sm:col-span-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-snow/40">
                Coach assigné
              </span>
              <select
                name="coachId"
                defaultValue={user.coachId ?? ""}
                className="w-full rounded-xl border border-white/10 bg-elite-black px-3 py-2.5 text-sm text-snow outline-none transition focus:border-gold/40"
              >
                <option value="">Aucun coach</option>
                {coaches.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name?.trim() || c.email}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <div className="flex items-start sm:col-span-2">
            {isSelf ? (
              <>
                <input type="hidden" name="isActive" value="on" />
                <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-snow/70">
                  Compte actif (toujours activé pour votre propre compte admin)
                </div>
              </>
            ) : (
              <label className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-elite-black/80 px-3 py-2.5">
                <input
                  type="checkbox"
                  name="isActive"
                  defaultChecked={user.isActive}
                  className="h-4 w-4 shrink-0 rounded border-white/20 accent-gold"
                />
                <span className="text-sm text-snow/80">Compte actif</span>
              </label>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-white/5 pt-4 sm:flex-row sm:items-center sm:justify-end">
          <SubmitButton />
        </div>
      </form>
    </div>
  );
}

type RoleFilter = "ALL" | UserRole;

export function AdminUsersPanel({
  users,
  coaches,
  currentUserId,
}: {
  users: AdminUserRow[];
  coaches: CoachOption[];
  currentUserId: string;
}) {
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("ALL");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      const matchesQuery =
        !q ||
        u.email.toLowerCase().includes(q) ||
        (u.name?.toLowerCase().includes(q) ?? false);
      const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
      return matchesQuery && matchesRole;
    });
  }, [users, query, roleFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-snow/35" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher par nom ou e-mail…"
            className="w-full rounded-xl border border-white/10 bg-elite-black py-2.5 pl-10 pr-4 text-sm text-snow placeholder:text-snow/35 outline-none transition focus:border-gold/35"
            autoComplete="off"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-snow/35">
            Filtrer
          </span>
          {(
            [
              ["ALL", "Tous"],
              ["STUDENT", "Élèves"],
              ["COACH", "Coachs"],
              ["ADMIN", "Admins"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setRoleFilter(value)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                roleFilter === value
                  ? "bg-gold/20 text-gold ring-1 ring-gold/40"
                  : "bg-white/5 text-snow/55 hover:bg-white/10 hover:text-snow"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-snow/45">
        <UserCog className="mr-1 inline h-3.5 w-3.5 -translate-y-px text-gold/80" />
        {filtered.length === users.length
          ? `${users.length} compte${users.length > 1 ? "s" : ""}`
          : `${filtered.length} sur ${users.length} comptes affichés`}
      </p>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 py-16 text-center text-sm text-snow/45">
          Aucun utilisateur ne correspond à votre recherche.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {filtered.map((u) => (
            <UserCard
              key={`${u.id}-${u.role}-${u.tier}-${u.coachId ?? ""}-${String(u.isActive)}`}
              user={u}
              coaches={coaches}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  BookMarked,
  ChevronRight,
  GraduationCap,
  LayoutGrid,
  Shield,
  Table2,
} from "lucide-react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Tier } from "@prisma/client";
import { getCourseCatalogStats } from "@/app/actions/dashboard";
import { TIER_LABEL_FR } from "@/lib/tier-order";

type PageProps = {
  searchParams: Promise<{ tier?: string }>;
};

function parseTierParam(raw: string | undefined): Tier | null {
  if (!raw) return null;
  return Object.values(Tier).includes(raw as Tier) ? (raw as Tier) : null;
}

export default async function CoursesPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user || session.user.isActive === false) redirect("/auth/login");

  const sp = await searchParams;
  const tierFilter = parseTierParam(sp.tier);

  const isStaff = session.user.role === "ADMIN" || session.user.role === "COACH";
  const isAdmin = session.user.role === "ADMIN";
  const userTier = session.user.tier ?? Tier.FREE;
  const [catalogStats, courses] = await Promise.all([
    getCourseCatalogStats(),
    session.user.role === "STUDENT"
      ? prisma.course.findMany({
          where: tierFilter ? { minTier: tierFilter } : undefined,
          include: {
            _count: { select: { modules: true } },
            modules: {
              select: {
                _count: { select: { lessons: true } },
              },
            },
            enrollments: {
              where: { userId: session.user.id },
              select: { id: true },
            },
          },
          orderBy: [{ minTier: "asc" }, { title: "asc" }],
        })
      : prisma.course.findMany({
          where: tierFilter ? { minTier: tierFilter } : undefined,
          include: {
            _count: { select: { modules: true } },
            modules: {
              select: {
                _count: { select: { lessons: true } },
              },
            },
          },
          orderBy: [{ minTier: "asc" }, { title: "asc" }],
        }),
  ]);

  const tierFilters: { value: Tier | null; label: string }[] = [
    { value: null, label: "Tous" },
    { value: Tier.FREE, label: "Gratuit" },
    { value: Tier.INDIVIDUEL, label: "Individuel" },
    { value: Tier.COLLECTIF, label: "Collectif" },
    { value: Tier.PRIVE, label: "Privé" },
  ];

  return (
    <div className="shell py-10 md:py-14">
      {isAdmin && (
        <div className="mb-10 flex flex-col gap-4 rounded-2xl border border-gold/20 bg-gradient-to-br from-gold/[0.06] to-transparent px-5 py-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <Shield className="mt-0.5 h-5 w-5 shrink-0 text-gold" aria-hidden />
            <div>
              <p className="text-sm font-semibold text-snow">Administration du catalogue</p>
              <p className="mt-1 text-xs leading-relaxed text-snow/50">
                Cette page est la vue « lecture » du catalogue. Pour créer ou modifier des modules,
                leçons et ressources, ouvrez le back-office LMS.
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/admin/courses"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gold/15 px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-gold ring-1 ring-gold/35 transition hover:bg-gold/25"
          >
            Back-office LMS
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {!isAdmin && isStaff && (
        <div className="mb-10 rounded-2xl border border-electric-blue/20 bg-electric-blue/[0.04] px-5 py-4 text-sm text-snow/75">
          <span className="font-semibold text-electric-blue">Vue coach / staff —</span> accès
          pédagogique à l’ensemble des parcours publiés. L’attribution des élèves se fait depuis
          l’espace coaching.
        </div>
      )}

      <header className="mb-10 border-b border-white/10 pb-10">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-snow/45">
          <Table2 className="h-3.5 w-3.5 text-gold/80" />
          Référentiel interne
        </div>
        <h1 className="font-elite text-3xl font-bold tracking-tight text-snow md:text-4xl lg:text-5xl">
          Catalogue des <span className="gold-text-gradient">parcours</span>
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-snow/50 md:text-base">
          Sélection officielle des formations Incubateur Élite : structure modulaire, progression
          suivie, accès aligné sur votre offre ({TIER_LABEL_FR[userTier]}).
        </p>

        <dl className="mt-8 grid grid-cols-2 gap-4 border-t border-white/10 pt-8 sm:grid-cols-4">
          <div className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
            <dt className="text-[10px] font-bold uppercase tracking-widest text-snow/35">
              Parcours
            </dt>
            <dd className="mt-1 font-elite text-2xl text-snow">{catalogStats.courseCount}</dd>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
            <dt className="text-[10px] font-bold uppercase tracking-widest text-snow/35">
              Modules
            </dt>
            <dd className="mt-1 font-elite text-2xl text-snow">{catalogStats.moduleCount}</dd>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
            <dt className="text-[10px] font-bold uppercase tracking-widest text-snow/35">
              Leçons
            </dt>
            <dd className="mt-1 font-elite text-2xl text-snow">{catalogStats.lessonCount}</dd>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
            <dt className="text-[10px] font-bold uppercase tracking-widest text-snow/35">
              Filtre actif
            </dt>
            <dd className="mt-1 text-sm font-semibold text-gold/90">
              {tierFilter ? TIER_LABEL_FR[tierFilter] : "Tous les niveaux"}
            </dd>
          </div>
        </dl>
      </header>

      <section className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-snow/45">
          <LayoutGrid className="h-4 w-4 text-gold/70" />
          Filtrer par niveau d&apos;accès
        </div>
        <div className="flex flex-wrap gap-2">
          {tierFilters.map((t) => {
            const active = tierFilter === t.value;
            const href = t.value ? `/courses?tier=${t.value}` : "/courses";
            return (
              <Link
                key={t.label}
                href={href}
                scroll={false}
                className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
                  active
                    ? "bg-gold/20 text-gold ring-1 ring-gold/40"
                    : "bg-white/5 text-snow/55 ring-1 ring-transparent hover:bg-white/10 hover:text-snow"
                }`}
              >
                {t.label}
              </Link>
            );
          })}
        </div>
      </section>

      <div className="hidden overflow-hidden rounded-2xl border border-white/10 bg-black/30 md:block">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.04] text-[10px] font-bold uppercase tracking-[0.2em] text-snow/40">
              <th className="px-5 py-4">Parcours</th>
              <th className="px-5 py-4">Niveau requis</th>
              <th className="px-5 py-4">Structure</th>
              <th className="px-5 py-4">Votre accès</th>
              <th className="px-5 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {courses.map((course) => {
              const moduleCount = course._count.modules;
              const lessonTotal = course.modules.reduce(
                (n, m) => n + m._count.lessons,
                0
              );
              const modulesLabel =
                moduleCount === 0
                  ? "—"
                  : moduleCount === 1
                    ? "1 module"
                    : `${moduleCount} modules`;
              const lessonsLabel =
                lessonTotal === 0
                  ? "0 leçon"
                  : lessonTotal === 1
                    ? "1 leçon"
                    : `${lessonTotal} leçons`;

              const isFree = course.minTier === Tier.FREE;
              const isEnrolled =
                "enrollments" in course &&
                Array.isArray(course.enrollments) &&
                course.enrollments.length > 0;
              const hasAccess = isStaff || isFree || isEnrolled;
              const accessLabel = isStaff
                ? "Staff (lecture)"
                : hasAccess
                  ? "Autorisé"
                  : "À débloquer";

              return (
                <tr key={course.id} className="hover:bg-white/[0.02]">
                  <td className="max-w-md px-5 py-4 align-top">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold/10 text-gold">
                        <BookMarked className="h-4 w-4" />
                      </span>
                      <div>
                        <div className="font-semibold text-snow">{course.title}</div>
                        <p className="mt-1 line-clamp-2 text-xs text-snow/45">
                          {course.description}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 align-top">
                    <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] font-semibold text-gold/90">
                      {TIER_LABEL_FR[course.minTier]}
                    </span>
                  </td>
                  <td className="px-5 py-4 align-top text-xs text-snow/55">
                    <div>{modulesLabel}</div>
                    <div className="text-snow/35">{lessonsLabel}</div>
                  </td>
                  <td className="px-5 py-4 align-top">
                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider ${
                        hasAccess ? "text-emerald-400/90" : "text-amber-400/90"
                      }`}
                    >
                      {accessLabel}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right align-top">
                    {hasAccess ? (
                      <Link
                        href={`/courses/${course.id}`}
                        className="inline-flex items-center gap-1 rounded-lg bg-gold px-4 py-2 text-xs font-bold uppercase tracking-wider text-elite-black transition hover:bg-gold/90"
                      >
                        Ouvrir
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    ) : (
                      <Link
                        href="/#pricing"
                        className="inline-flex rounded-lg border border-white/15 px-4 py-2 text-xs font-bold uppercase tracking-wider text-snow/70 transition hover:bg-white/5"
                      >
                        Mettre à niveau
                      </Link>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="space-y-4 md:hidden">
        {courses.map((course) => {
          const moduleCount = course._count.modules;
          const lessonTotal = course.modules.reduce(
            (n, m) => n + m._count.lessons,
            0
          );
          const isFree = course.minTier === Tier.FREE;
          const isEnrolled =
            "enrollments" in course &&
            Array.isArray(course.enrollments) &&
            course.enrollments.length > 0;
          const hasAccess = isStaff || isFree || isEnrolled;

          return (
            <div
              key={course.id}
              className="rounded-2xl border border-white/10 bg-white/[0.02] p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-snow">{course.title}</h2>
                  <p className="mt-2 line-clamp-3 text-xs text-snow/45">{course.description}</p>
                </div>
                <GraduationCap className="h-8 w-8 shrink-0 text-gold/40" />
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-widest text-snow/40">
                <span className="rounded-full bg-gold/10 px-2 py-1 text-gold/90">
                  {TIER_LABEL_FR[course.minTier]}
                </span>
                <span>
                  {moduleCount} mod. · {lessonTotal} leç.
                </span>
              </div>
              <div className="mt-4">
                {hasAccess ? (
                  <Link
                    href={`/courses/${course.id}`}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gold py-3 text-sm font-bold text-elite-black"
                  >
                    Ouvrir le parcours
                  </Link>
                ) : (
                  <Link
                    href="/#pricing"
                    className="flex w-full items-center justify-center rounded-xl border border-white/15 py-3 text-sm font-bold text-snow/75"
                  >
                    Débloquer
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {courses.length === 0 && (
        <div className="rounded-2xl border border-dashed border-white/15 py-16 text-center text-sm text-snow/45">
          Aucun parcours ne correspond à ce filtre.
        </div>
      )}
    </div>
  );
}

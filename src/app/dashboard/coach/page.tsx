import React from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  getCoachStats,
  getCoachStudentsOverview,
  getCoachingTeamOverview,
  getPublishedAnnouncements,
} from "@/app/actions/dashboard";
import StatCard from "@/components/dashboard/StatCard";
import EliteCard from "@/components/ui/EliteCard";
import {
  Activity,
  AlertTriangle,
  BookOpen,
  ClipboardList,
  Headphones,
  Mail,
  Target,
  UserCheck,
  Users,
} from "lucide-react";
import { canAccessCoach } from "@/lib/rbac";
import { UserRole } from "@prisma/client";

export default async function CoachDashboardPage() {
  const session = await auth();
  if (!session?.user || session.user.isActive === false) redirect("/auth/login");
  if (!canAccessCoach(session.user.role)) {
    redirect("/dashboard");
  }

  const isAdmin = session.user.role === UserRole.ADMIN;

  const [stats, announcements, students, coachingTeam] = await Promise.all([
    getCoachStats(),
    getPublishedAnnouncements(),
    getCoachStudentsOverview(),
    getCoachingTeamOverview(),
  ]);

  const priorityStudents = students.filter(
    (s) => !s.isActive || s.avgProgress < 35 || s.coursesCount === 0
  );

  return (
    <div className="p-6 max-w-7xl mx-auto md:p-8">
      <header className="mb-10 border-b border-white/10 pb-8">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.28em] text-gold/70">
          Accompagnement & suivi
        </p>
        <h1 className="font-elite text-3xl font-bold text-snow md:text-4xl">
          Espace <span className="gold-text-gradient">coaching</span>
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-snow/50">
          Pilotage de la progression, priorisation des relances et alignement avec le catalogue
          pédagogique.{" "}
          {isAdmin
            ? "En tant qu’administrateur, vous voyez l’ensemble du dispositif et l’équipe de coachs."
            : "Vos élèves assignés sont listés ci-dessous ; l’administration gère les attributions."}
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6 mb-10">
        <StatCard
          label={isAdmin ? "Élèves (périmètre)" : "Élèves suivis"}
          value={stats.totalStudents}
          icon={<Users className="w-6 h-6" />}
        />
        <StatCard
          label="Élèves actifs"
          value={stats.activeStudents}
          icon={<UserCheck className="w-6 h-6" />}
        />
        <StatCard
          label="Hors offre gratuite"
          value={stats.vipEliteStudents}
          icon={<Activity className="w-6 h-6" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 mb-10">
        <EliteCard className="lg:col-span-2 border-electric-blue/15">
          <div className="mb-4 flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-electric-blue" />
            <h2 className="text-lg font-bold text-snow">Cadre méthodologique</h2>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {[
              {
                title: "Diagnostic rapide",
                text: "Identifier le niveau de progression et les modules bloquants par élève.",
              },
              {
                title: "Relances ciblées",
                text: "Prioriser les comptes inactifs ou en retard sur le parcours.",
              },
              {
                title: "Alignement catalogue",
                text: "Renvoyer vers les bons parcours selon l’offre (tier) de l’élève.",
              },
              {
                title: "Remontée staff",
                text: "Signaler les besoins contenu / technique à l’administration.",
              },
            ].map((item) => (
              <li
                key={item.title}
                className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
              >
                <p className="text-sm font-semibold text-snow">{item.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-snow/50">{item.text}</p>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-snow transition hover:bg-white/15"
            >
              <BookOpen className="h-4 w-4 text-gold" />
              Catalogue LMS
            </Link>
            {isAdmin && (
              <Link
                href="/dashboard/admin"
                className="inline-flex items-center gap-2 rounded-xl border border-gold/30 bg-gold/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-gold transition hover:bg-gold/20"
              >
                Administration
              </Link>
            )}
          </div>
        </EliteCard>

        <EliteCard>
          <div className="mb-4 flex items-center gap-2">
            <Headphones className="h-5 w-5 text-gold" />
            <h2 className="text-lg font-bold text-snow">Raccourcis</h2>
          </div>
          <ul className="space-y-3 text-sm text-snow/65">
            <li>
              <Link href="/courses" className="text-gold hover:underline">
                Parcours & leçons
              </Link>{" "}
              — vue alignée sur le catalogue publié.
            </li>
            <li>
              Assignations élèves ↔ coach :{" "}
              <Link href="/dashboard/admin" className="text-gold hover:underline">
                Gestion des utilisateurs
              </Link>
              .
            </li>
            <li>Annonces plateforme : voir encadré ci-dessous.</li>
          </ul>
        </EliteCard>
      </div>

      {isAdmin && coachingTeam.length > 0 && (
        <div className="mb-10">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-snow">Équipe coaching</h2>
            <span className="text-xs text-snow/40">{coachingTeam.length} coach(s)</span>
          </div>
          <EliteCard className="p-0 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/10 bg-white/[0.04] text-[10px] font-bold uppercase tracking-widest text-snow/40">
                <tr>
                  <th className="px-5 py-3">Coach</th>
                  <th className="px-5 py-3">Contact</th>
                  <th className="px-5 py-3">Élèves assignés</th>
                  <th className="px-5 py-3">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {coachingTeam.map((c) => (
                  <tr key={c.id} className="hover:bg-white/[0.02]">
                    <td className="px-5 py-4 font-medium text-snow">
                      {c.name?.trim() || "—"}
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 text-xs text-snow/55">
                        <Mail className="h-3.5 w-3.5 shrink-0 opacity-60" />
                        {c.email}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-elite text-lg text-gold/90">
                      {c.assignedStudents}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${
                          c.isActive
                            ? "bg-emerald-500/15 text-emerald-400"
                            : "bg-red-500/15 text-red-400"
                        }`}
                      >
                        {c.isActive ? "Actif" : "Inactif"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </EliteCard>
        </div>
      )}

      {priorityStudents.length > 0 && (
        <div className="mb-10">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-400/90" />
            <h2 className="text-xl font-bold text-snow">Priorités & relances</h2>
          </div>
          <p className="mb-4 text-xs text-snow/45">
            Élèves sans cours, progression moyenne sous 35 %, ou compte inactif — à traiter en
            premier.
          </p>
          <EliteCard className="p-0 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/10 bg-amber-500/[0.06] text-[10px] font-bold uppercase tracking-widest text-snow/45">
                <tr>
                  <th className="px-5 py-3">Élève</th>
                  <th className="px-5 py-3">Tier</th>
                  <th className="px-5 py-3">Progression</th>
                  <th className="px-5 py-3">Motif</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {priorityStudents.slice(0, 12).map((s) => (
                  <tr key={s.id}>
                    <td className="px-5 py-3">
                      <div className="font-medium text-snow">{s.name || "Sans nom"}</div>
                      <div className="text-xs text-snow/40">{s.email}</div>
                    </td>
                    <td className="px-5 py-3 text-xs font-semibold text-snow/70">{s.tier}</td>
                    <td className="px-5 py-3 text-xs text-snow/55">
                      {s.coursesCount} cours · {s.avgProgress}% moy.
                    </td>
                    <td className="px-5 py-3 text-xs text-amber-200/80">
                      {!s.isActive
                        ? "Compte suspendu"
                        : s.coursesCount === 0
                          ? "Aucune inscription"
                          : "Progression basse"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </EliteCard>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-snow/50" />
              <h2 className="text-xl font-bold text-snow">Activité récente (élèves)</h2>
            </div>
            <EliteCard className="p-0 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-snow/40 uppercase tracking-widest border-b border-white/5">
                      Élève
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-snow/40 uppercase tracking-widest border-b border-white/5">
                      Action
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-snow/40 uppercase tracking-widest border-b border-white/5">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {stats.recentStudentActivity.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4">
                        <div className="font-bold text-snow">
                          {item.user?.name || "Utilisateur inconnu"}
                        </div>
                        <div className="text-xs text-snow/40">
                          {item.user?.email || "-"} {item.user?.tier ? `• ${item.user.tier}` : ""}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-snow/70">{item.action}</td>
                      <td className="px-6 py-4 text-xs text-snow/40">
                        {new Date(item.createdAt).toLocaleString("fr-FR")}
                      </td>
                    </tr>
                  ))}
                  {stats.recentStudentActivity.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-snow/40 text-sm">
                        Aucune activité récente.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </EliteCard>
          </div>

          <div>
            <h2 className="mb-4 text-xl font-bold text-snow">Portefeuille élèves</h2>
            <EliteCard className="p-0 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-snow/40 uppercase tracking-widest border-b border-white/5">
                      Élève
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-snow/40 uppercase tracking-widest border-b border-white/5">
                      Tier
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-snow/40 uppercase tracking-widest border-b border-white/5">
                      Cours / Progression
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-snow/40 uppercase tracking-widest border-b border-white/5">
                      Statut
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {students.map((student) => (
                    <tr key={student.id}>
                      <td className="px-6 py-4">
                        <div className="font-bold text-snow">{student.name || "Sans nom"}</div>
                        <div className="text-xs text-snow/40">{student.email}</div>
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-snow/70">{student.tier}</td>
                      <td className="px-6 py-4 text-xs text-snow/60">
                        <div>
                          {student.coursesCount} cours • {student.avgProgress}% moyen
                        </div>
                        <div className="text-snow/40">
                          {student.latestCourse || "Aucun cours actif"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                            student.isActive
                              ? "bg-green-400/10 text-green-400"
                              : "bg-red-400/10 text-red-400"
                          }`}
                        >
                          {student.isActive ? "ACTIF" : "SUSPENDU"}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {students.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-snow/40 text-sm">
                        Aucun élève ne vous est encore assigné. L&apos;administrateur attribue les
                        coachs depuis{" "}
                        <span className="text-snow/60">
                          Panneau d&apos;administration → Gestion des utilisateurs
                        </span>
                        .
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </EliteCard>
          </div>
        </div>

        <div className="space-y-6">
          <EliteCard>
            <h3 className="font-bold text-snow mb-4">Annonces publiées</h3>
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="pb-4 border-b border-white/5 last:border-b-0 last:pb-0"
                >
                  <p className="text-sm font-bold text-snow">{announcement.title}</p>
                  <p className="text-xs text-snow/60 mt-1 leading-relaxed">{announcement.content}</p>
                </div>
              ))}
              {announcements.length === 0 && (
                <p className="text-xs text-snow/40">Aucune annonce disponible.</p>
              )}
            </div>
          </EliteCard>
        </div>
      </div>
    </div>
  );
}

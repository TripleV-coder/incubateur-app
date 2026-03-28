import type { CSSProperties } from "react";
import Hero from "@/components/ui/Hero";
import EliteCard from "@/components/ui/EliteCard";
import Pricing from "@/components/ui/Pricing";
import LeadCapture from "@/components/marketing/LeadCapture";
import { getPublicStudentMetrics } from "@/lib/public-metrics";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { roleHomePath } from "@/lib/rbac";

export default async function Home() {
  const session = await auth();
  if (session?.user?.id) {
    const role = session.user.role;
    redirect(role ? roleHomePath[role] : "/dashboard");
  }

  const metrics = await getPublicStudentMetrics();
  const format = new Intl.NumberFormat("fr-FR");

  const pillars = [
    {
      title: "eBooks & Vidéos Pratiques",
      content:
        "Des contenus concrets et actionnables pour maîtriser le e-commerce de produits digitaux, étape par étape.",
    },
    {
      title: "Coaching & Accompagnement",
      content:
        "Du coaching collectif au suivi privé rigoureux de 8 semaines : un encadrement adapté à votre niveau d'ambition.",
    },
    {
      title: "23 000+ Résultats Palpables",
      content:
        "Rejoignez une communauté de plus de 23 000 personnes accompagnées avec un taux de réussite de 96%.",
    },
  ];

  return (
    <main className="min-h-screen">
      <Hero />

      <section id="credibilite" className="section-space pt-8 md:pt-12">
        <div className="shell">
          <div className="mb-8 md:mb-10">
            <p className="text-[11px] uppercase tracking-[0.2em] text-gold/85">
              Résultats prouvés
            </p>
            <h2 className="mt-2 font-elite text-4xl md:text-5xl gold-text-gradient">
              Plus de 23 000 personnes déjà accompagnées
            </h2>
            <p className="mt-3 max-w-2xl text-sm md:text-base text-snow/65">
              Des résultats palpables avec un taux de réussite de 96%. Nos chiffres parlent d&apos;eux-mêmes.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            <EliteCard className="p-6 md:p-7">
              <p className="text-[11px] uppercase tracking-[0.2em] text-snow/45">
                Personnes accompagnées
              </p>
              <p className="mt-2 font-elite text-4xl md:text-5xl gold-text-gradient">
                23 000+
              </p>
              <p className="mt-2 text-sm text-snow/60">
                Depuis le lancement de l&apos;Incubateur.
              </p>
            </EliteCard>

            <EliteCard className="p-6 md:p-7">
              <p className="text-[11px] uppercase tracking-[0.2em] text-snow/45">
                Taux de réussite
              </p>
              <p className="mt-2 font-elite text-4xl md:text-5xl gold-text-gradient">
                96%
              </p>
              <p className="mt-2 text-sm text-snow/60">
                Résultats palpables confirmés.
              </p>
            </EliteCard>

            <EliteCard className="p-6 md:p-7">
              <p className="text-[11px] uppercase tracking-[0.2em] text-snow/45">
                Inscrits plateforme
              </p>
              <p className="mt-2 font-elite text-4xl md:text-5xl gold-text-gradient">
                {format.format(metrics.studentsRegistered)}
              </p>
              <p className="mt-2 text-sm text-snow/60">
                Nouveaux membres sur la plateforme en ligne.
              </p>
            </EliteCard>

            <EliteCard className="p-6 md:p-7">
              <p className="text-[11px] uppercase tracking-[0.2em] text-snow/45">
                Parcours actifs
              </p>
              <p className="mt-2 font-elite text-4xl md:text-5xl gold-text-gradient">
                {format.format(metrics.activeLearners)}
              </p>
              <p className="mt-2 text-sm text-snow/60">
                Élèves en formation actuellement.
              </p>
            </EliteCard>
          </div>
        </div>
      </section>

      <section id="why-elite" className="section-space">
        <div className="shell">
          <div className="mb-16 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <h2 className="font-elite text-5xl leading-tight md:text-6xl gold-text-gradient reveal-on-scroll">
              Pourquoi rejoindre l&apos;Élite ?
            </h2>
            <p className="max-w-2xl text-base leading-relaxed text-snow/60 md:text-lg lg:justify-self-end reveal-on-scroll" style={{ "--reveal-delay": "130ms" } as CSSProperties}>
              Un environnement d&apos;exécution pensé pour les créateurs d&apos;offres digitales qui veulent passer d&apos;idées fragmentées à une machine rentable, structurée et durable.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {pillars.map((pillar, index) => (
              <EliteCard
                key={pillar.title}
                title={pillar.title}
                className="reveal-on-scroll"
                style={{ "--reveal-delay": `${150 + index * 120}ms` } as CSSProperties}
              >
                {pillar.content}
              </EliteCard>
            ))}
          </div>
        </div>
      </section>

      <Pricing />

      <LeadCapture />
    </main>
  );
}

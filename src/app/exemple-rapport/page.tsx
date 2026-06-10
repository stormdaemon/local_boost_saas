import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Compass, FileText } from "lucide-react";
import { computeScores } from "@/lib/scoring";
import { buildLocalAudit, buildLocalStrategy } from "@/lib/fallback";
import { buildLocalProposal } from "@/lib/fallback-proposal";
import { ScoreBars } from "@/components/score-visuals";

export const metadata: Metadata = {
  title: "Exemple de rapport d'audit digital local",
  description:
    "Découvrez un exemple réel de rapport généré par ProspectPilot Local : scores digitaux, stratégie SEO locale, plan d'action et proposition commerciale chiffrée.",
  alternates: { canonical: "/exemple-rapport" },
};

const DEMO = {
  name: "Boulangerie Martin",
  sector: "Boulangerie / Pâtisserie",
  city: "Angers",
  website: "https://boulangerie-martin.example",
  description: "Boulangerie artisanale de quartier, levain naturel et pâtisseries maison.",
  targetAudience: "familles du quartier et actifs du centre-ville",
  mainGoal: "Attirer plus de clients locaux",
  hasGoogleBusiness: true,
  socialNetworks: ["Instagram", "Facebook"],
  monthlyBudget: 600,
};

export default function ExampleReportPage() {
  const scores = computeScores(DEMO);
  const audit = buildLocalAudit(DEMO, scores);
  const strategy = buildLocalStrategy(DEMO);
  const proposal = buildLocalProposal(DEMO);
  const euro = (n: number) => n.toLocaleString("fr-FR") + " €";

  return (
    <div className="relative min-h-screen overflow-x-clip">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[800px] -translate-x-1/2 rounded-full bg-indigo-600/15 blur-3xl" />

      <header className="relative z-10 mx-auto flex w-full max-w-4xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 p-2">
            <Compass className="h-4 w-4 text-white" />
          </span>
          <span className="font-bold text-white">
            ProspectPilot <span className="gradient-text">Local</span>
          </span>
        </Link>
        <Link href="/signup" className="btn-primary px-4 py-2 text-sm">
          Générer le mien
          <ArrowRight className="h-4 w-4" />
        </Link>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-4xl px-6 pb-20">
        <div className="mb-8 text-center">
          <span className="chip mx-auto mb-4 border-indigo-400/30 bg-indigo-400/10 text-indigo-200">
            <FileText className="h-3.5 w-3.5" />
            Exemple — entreprise de démonstration
          </span>
          <h1 className="text-3xl font-bold text-white">
            À quoi ressemble un rapport ProspectPilot
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-white/55">
            Extraits d&apos;un rapport généré pour une boulangerie fictive à Angers.
            Le rapport complet inclut aussi le calendrier éditorial, le pitch et
            le simulateur de ROI — à vos couleurs.
          </p>
        </div>

        {/* En-tête de rapport */}
        <div className="card mb-6 p-8">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-300">
            Rapport stratégique digital
          </p>
          <h2 className="mt-2 text-2xl font-extrabold text-white">{DEMO.name}</h2>
          <p className="mt-1 text-white/60">
            {DEMO.sector} · {DEMO.city} · Objectif : {DEMO.mainGoal}
          </p>
        </div>

        {/* Scores */}
        <div className="card mb-6 p-8">
          <h3 className="mb-1 text-lg font-bold text-white">État des lieux digital</h3>
          <p className="mb-5 text-sm text-white/55">
            Score global : <span className="font-bold text-white">{scores.global}/100</span>
          </p>
          <ScoreBars scores={scores} />
          <p className="mt-5 text-sm leading-relaxed text-white/65">{audit.summary}</p>
        </div>

        {/* Plan d'action */}
        <div className="card mb-6 p-8">
          <h3 className="mb-4 text-lg font-bold text-white">Actions prioritaires</h3>
          <ol className="grid gap-3">
            {audit.priorities.slice(0, 3).map((p, i) => (
              <li key={i} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <p className="font-semibold text-white">
                  {i + 1}. {p.title}
                </p>
                <p className="mt-1 text-sm text-white/60">{p.description}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* Mots-clés */}
        <div className="card mb-6 p-8">
          <h3 className="mb-4 text-lg font-bold text-white">
            Recherches locales à conquérir
          </h3>
          <div className="flex flex-wrap gap-2">
            {strategy.keywords.slice(0, 8).map((k) => (
              <span key={k.keyword} className="chip">
                {k.keyword}
              </span>
            ))}
          </div>
        </div>

        {/* Proposition */}
        <div className="card mb-10 p-8">
          <h3 className="mb-4 text-lg font-bold text-white">
            Proposition commerciale (extrait)
          </h3>
          <div className="grid gap-4 sm:grid-cols-3">
            {proposal.offers.map((o) => (
              <div
                key={o.name}
                className={`rounded-xl border p-4 ${
                  o.name === proposal.recommendedOffer
                    ? "border-indigo-400/50 bg-indigo-500/10"
                    : "border-white/10 bg-white/[0.03]"
                }`}
              >
                <p className="font-bold text-white">
                  {o.name}
                  {o.name === proposal.recommendedOffer ? " ★" : ""}
                </p>
                <p className="mt-1 text-xl font-extrabold gradient-text">
                  {euro(o.priceMonthly)}
                  <span className="text-xs text-white/40"> /mois</span>
                </p>
                <p className="mt-1 text-xs text-white/50">{o.delay}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="card relative overflow-hidden p-10 text-center">
          <div className="pointer-events-none absolute -top-32 left-1/2 h-72 w-[640px] -translate-x-1/2 rounded-full bg-violet-600/25 blur-3xl" />
          <h2 className="relative text-2xl font-bold text-white">
            Le même rapport, pour vos prospects, à vos couleurs
          </h2>
          <p className="relative mx-auto mt-3 max-w-xl text-white/60">
            Créez votre compte et générez votre premier audit en moins de cinq
            minutes.
          </p>
          <Link href="/signup" className="btn-primary relative mt-6 inline-flex px-7 py-3">
            Créer mon premier audit
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </main>
    </div>
  );
}

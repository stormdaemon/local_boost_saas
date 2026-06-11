import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Compass, Minus } from "lucide-react";
import { PLANS } from "@/lib/plans";

export const metadata: Metadata = {
  title: "Tarifs et comparatif des forfaits",
  description:
    "Comparez les forfaits Solo (29 €), Agence (79 €) et Pro (149 €) de ProspectPilot Local : audits SEO locaux, marque blanche, CRM prospects et rapports illimités.",
  alternates: { canonical: "/tarifs" },
};

type Row = { label: string; values: (string | boolean)[] };

const ROWS: Row[] = [
  { label: "Audits par mois", values: ["20", "100", "Illimités"] },
  { label: "Rapports PDF exportables", values: [true, true, true] },
  { label: "Stratégie SEO locale", values: [true, true, true] },
  { label: "Simulateur de ROI", values: [true, true, true] },
  { label: "Pitch commercial", values: [true, true, true] },
  { label: "Calendrier éditorial 4 semaines", values: [true, true, true] },
  { label: "Proposition commerciale chiffrée", values: [true, true, true] },
  { label: "Mode présentation en rendez-vous", values: [true, true, true] },
  { label: "Marque blanche (logo sur les rapports)", values: [false, true, true] },
  { label: "Marque blanche avancée (couleurs, signature)", values: [false, false, true] },
  { label: "CRM prospects et suivi du pipeline", values: [false, true, true] },
  { label: "Historique complet des analyses", values: [false, true, true] },
  { label: "Modèles d'offres commerciales", values: [false, true, true] },
  { label: "Rapports partageables", values: [false, false, true] },
  { label: "Plusieurs profils commerciaux", values: [false, false, true] },
  { label: "Export avancé", values: [false, false, true] },
  { label: "Accès prioritaire aux nouveaux modules", values: [false, false, true] },
  { label: "Support", values: ["Standard", "Prioritaire", "Prioritaire"] },
];

function Cell({ v }: { v: string | boolean }) {
  if (v === true) return <Check className="mx-auto h-4 w-4 text-emerald-300" />;
  if (v === false) return <Minus className="mx-auto h-4 w-4 text-white/20" />;
  return <span className="text-sm font-medium text-white">{v}</span>;
}

export default function PricingComparisonPage() {
  return (
    <div className="relative min-h-screen overflow-x-clip">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[800px] -translate-x-1/2 rounded-full bg-indigo-600/20 blur-3xl" />

      <header className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 p-2">
            <Compass className="h-4 w-4 text-white" />
          </span>
          <span className="hidden font-bold text-white min-[480px]:inline">
            ProspectPilot <span className="gradient-text">Local</span>
          </span>
        </Link>
        <Link href="/signup" className="btn-primary px-4 py-2 text-sm">
          Commencer
          <ArrowRight className="h-4 w-4" />
        </Link>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-5xl px-6 pb-20">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">
            Comparez les forfaits en détail
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-white/55">
            Tous les forfaits sont mensuels, sans engagement, et incluent les
            mises à jour. Changez de forfait à tout moment.
          </p>
        </div>

        <p className="mb-3 text-center text-xs text-white/40 md:hidden">
          Faites défiler le tableau horizontalement pour comparer les forfaits →
        </p>
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[640px] text-left">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-5 py-5" />
                {PLANS.map((p) => (
                  <th key={p.tier} className="px-5 py-5 text-center">
                    <p className="text-lg font-bold text-white">{p.name}</p>
                    <p className="mt-1 text-2xl font-extrabold gradient-text">
                      {p.priceMonthly} €
                      <span className="text-xs font-medium text-white/40"> /mois</span>
                    </p>
                    <p className="mt-1 text-xs text-white/45">{p.target}</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.label} className="border-b border-white/5 last:border-0">
                  <td className="px-5 py-3 text-sm text-white/65">{row.label}</td>
                  {row.values.map((v, i) => (
                    <td key={i} className="px-5 py-3 text-center">
                      <Cell v={v} />
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <td className="px-5 py-5" />
                {PLANS.map((p) => (
                  <td key={p.tier} className="px-5 py-5 text-center">
                    <Link
                      href="/signup"
                      className={p.tier === "AGENCE" ? "btn-primary w-full" : "btn-ghost w-full"}
                    >
                      Choisir {p.name}
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <p className="mt-8 text-center text-sm text-white/45">
          Une question sur les forfaits ?{" "}
          <Link href="/contact" className="font-medium text-indigo-300 hover:text-indigo-200">
            Contactez-nous
          </Link>
          .
        </p>
      </main>
    </div>
  );
}

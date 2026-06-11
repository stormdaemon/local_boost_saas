"use client";

/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import { useParams } from "next/navigation";
import { FileText, Loader2, Printer, Sparkles } from "lucide-react";
import { useBusiness, type GenKey } from "@/components/use-business";
import { ErrorBanner, PageLoader } from "@/components/asset-shell";
import { ScoreBars } from "@/components/score-visuals";
import { projectRoi } from "@/lib/roi";
import type {
  AuditData,
  CalendarData,
  CompetitorsData,
  PitchData,
  ProposalData,
  StrategyData,
} from "@/lib/types";

const ALL_TYPES: { key: GenKey; asset: string; label: string }[] = [
  { key: "audit", asset: "AUDIT", label: "Audit digital" },
  { key: "strategy", asset: "SEO_STRATEGY", label: "Stratégie SEO" },
  { key: "competitors", asset: "COMPETITORS", label: "Analyse concurrentielle" },
  { key: "calendar", asset: "CALENDAR", label: "Calendrier éditorial" },
  { key: "pitch", asset: "PITCH", label: "Pitch commercial" },
  { key: "proposal", asset: "PROPOSAL", label: "Proposition commerciale" },
];

const euro = (n: number) =>
  n.toLocaleString("fr-FR", { maximumFractionDigits: 0 }) + " €";

function SectionTitle({
  n,
  title,
  color,
}: {
  n: number;
  title: string;
  color?: string | null;
}) {
  return (
    <h2 className="mb-4 flex items-center gap-3 text-xl font-bold text-white print:text-black">
      <span
        className="rounded-lg px-2.5 py-1 text-sm text-white"
        style={{
          background: color ?? "linear-gradient(135deg, #6366f1, #8b5cf6)",
        }}
      >
        {n}
      </span>
      {title}
    </h2>
  );
}

export default function ReportPage() {
  const { id } = useParams<{ id: string }>();
  const { business, loading, error, refresh } = useBusiness(id);
  const [bulkRunning, setBulkRunning] = useState<string | null>(null);

  if (loading) return <PageLoader />;
  if (!business) return <ErrorBanner message={error ?? "Prospect introuvable"} />;

  const audit = business.assets.AUDIT?.data as AuditData | undefined;
  const strategy = business.assets.SEO_STRATEGY?.data as StrategyData | undefined;
  const competitors = business.assets.COMPETITORS?.data as CompetitorsData | undefined;
  const calendar = business.assets.CALENDAR?.data as CalendarData | undefined;
  const pitch = business.assets.PITCH?.data as PitchData | undefined;
  const proposal = business.assets.PROPOSAL?.data as ProposalData | undefined;

  const agency = business.agency;
  const accent = agency?.primaryColor ?? null;
  const roiScenario = business.roiScenarios[0];
  const roi = roiScenario ? projectRoi(roiScenario) : null;

  const missing = ALL_TYPES.filter(
    (t) => !business.assets[t.asset as keyof typeof business.assets],
  );

  async function generateMissing() {
    for (const t of missing) {
      setBulkRunning(t.label);
      await fetch(`/api/businesses/${id}/generate/${t.key}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
    }
    setBulkRunning(null);
    await refresh();
  }

  let sectionNumber = 0;
  const nextN = () => ++sectionNumber;

  return (
    <div className="print-area">
      <ErrorBanner message={error} />

      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Rapport commercial</h1>
          <p className="mt-1 text-sm text-white/55">
            Le document à présenter en rendez-vous, prêt à imprimer ou à exporter
            en PDF.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {missing.length > 0 && (
            <button
              onClick={generateMissing}
              disabled={bulkRunning !== null}
              className="btn-ghost"
            >
              {bulkRunning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {bulkRunning}…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Compléter le rapport ({missing.length})
                </>
              )}
            </button>
          )}
          <button onClick={() => window.print()} className="btn-primary">
            <Printer className="h-4 w-4" />
            Imprimer / Exporter PDF
          </button>
        </div>
      </div>

      {/* En-tête : marque blanche */}
      <div
        className="card mb-6 overflow-hidden p-5 sm:p-8 print:border print:p-6"
        style={accent ? { borderTop: `4px solid ${accent}` } : undefined}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-indigo-300 print:text-indigo-700">
              <FileText className="h-4 w-4" />
              Rapport stratégique digital
            </p>
            <h1 className="mt-2 text-3xl font-extrabold text-white print:text-black">
              {business.name}
            </h1>
            <p className="mt-1 text-white/60 print:text-gray-600">
              {business.sector} · {business.city}
              {business.contactName ? ` · À l'attention de ${business.contactName}` : ""}
            </p>
          </div>
          <div className="text-right">
            {agency?.logoUrl ? (
              <img
                src={agency.logoUrl}
                alt={agency.agencyName ?? "Logo"}
                className="ml-auto mb-2 h-12 w-auto object-contain"
              />
            ) : null}
            {agency?.agencyName ? (
              <p className="font-semibold text-white print:text-black">
                {agency.agencyName}
              </p>
            ) : null}
            <p className="text-sm text-white/45 print:text-gray-500">
              {new Date().toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
        <div className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 print:border-gray-200">
            <p className="text-xs text-white/45 print:text-gray-500">Objectif principal</p>
            <p className="font-medium text-white print:text-black">{business.mainGoal}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 print:border-gray-200">
            <p className="text-xs text-white/45 print:text-gray-500">Budget mensuel</p>
            <p className="font-medium text-white print:text-black">
              {business.monthlyBudget.toLocaleString("fr-FR")} €
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 print:border-gray-200">
            <p className="text-xs text-white/45 print:text-gray-500">Score digital global</p>
            <p className="font-medium text-white print:text-black">
              {audit ? `${audit.scores.global}/100` : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Résumé exécutif */}
      {(proposal?.executiveSummary || audit?.summary) && (
        <section className="card mb-6 p-5 sm:p-8 print:border print:p-6">
          <SectionTitle n={nextN()} title="Résumé exécutif" color={accent} />
          <p className="text-sm leading-relaxed text-white/70 print:text-gray-700">
            {proposal?.executiveSummary ?? audit?.summary}
          </p>
        </section>
      )}

      {/* Audit */}
      {audit && (
        <section className="card mb-6 p-5 sm:p-8 print:border print:p-6">
          <SectionTitle n={nextN()} title="État des lieux digital" color={accent} />
          <ScoreBars scores={audit.scores} />
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-rose-300 print:text-rose-700">
                Problèmes détectés
              </p>
              <ul className="grid gap-1.5 text-sm text-white/70 print:text-gray-700">
                {audit.weaknesses.map((s, i) => (
                  <li key={i}>• {s}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-emerald-300 print:text-emerald-700">
                Opportunités
              </p>
              <ul className="grid gap-1.5 text-sm text-white/70 print:text-gray-700">
                {audit.strengths.map((s, i) => (
                  <li key={i}>• {s}</li>
                ))}
                {competitors?.opportunities.slice(0, 2).map((o, i) => (
                  <li key={`c${i}`}>• {o}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-6">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-white/50 print:text-gray-500">
              Actions prioritaires
            </p>
            <ol className="grid gap-2 text-sm text-white/70 print:text-gray-700">
              {audit.priorities.map((p, i) => (
                <li key={i}>
                  <span className="font-semibold text-white print:text-black">
                    {i + 1}. {p.title}
                  </span>{" "}
                  — {p.description}
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* Stratégie */}
      {strategy && (
        <section className="card print-break mb-6 p-5 sm:p-8 print:border print:p-6">
          <SectionTitle n={nextN()} title="Stratégie de visibilité locale" color={accent} />
          <p className="mb-5 text-sm leading-relaxed text-white/70 print:text-gray-700">
            {strategy.vision}
          </p>
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-white/50 print:text-gray-500">
                Recherches prioritaires à conquérir
              </p>
              <ol className="grid gap-1.5 text-sm text-white/70 print:text-gray-700">
                {[...strategy.keywords]
                  .sort((a, b) => a.priority - b.priority)
                  .slice(0, 10)
                  .map((k) => (
                    <li key={k.keyword}>
                      {k.priority}.{" "}
                      <span className="font-medium text-white print:text-black">
                        {k.keyword}
                      </span>
                    </li>
                  ))}
              </ol>
            </div>
            <div className="grid gap-4">
              {strategy.pillars.map((p, i) => (
                <div key={i}>
                  <p className="text-sm font-semibold text-white print:text-black">
                    {i + 1}. {p.title}
                  </p>
                  <p className="text-sm text-white/60 print:text-gray-600">
                    {p.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ROI */}
      {roi && roiScenario && (
        <section className="card mb-6 p-5 sm:p-8 print:border print:p-6">
          <SectionTitle n={nextN()} title="Retour sur investissement projeté" color={accent} />
          <p className="mb-4 text-sm text-white/60 print:text-gray-600">
            Hypothèses du scénario « {roiScenario.name} » : {euro(roiScenario.monthlyInvestment)}
            /mois investis, {roiScenario.extraVisitors} visiteurs locaux supplémentaires par mois.
          </p>
          <div className="grid gap-3 sm:grid-cols-4">
            {[
              [`${roi.newClientsPerMonth.toLocaleString("fr-FR", { maximumFractionDigits: 1 })}`, "nouveaux clients / mois"],
              [euro(roi.totalRevenue), "CA additionnel sur 12 mois"],
              [`${roi.roi.toFixed(0)} %`, "retour sur investissement"],
              [roi.breakEven ? `Mois ${roi.breakEven}` : "—", "seuil de rentabilité"],
            ].map(([v, label]) => (
              <div
                key={label as string}
                className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 print:border-gray-200"
              >
                <p className="text-xl font-extrabold text-white print:text-black">{v}</p>
                <p className="text-xs text-white/45 print:text-gray-500">{label}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Calendrier */}
      {calendar && (
        <section className="card print-break mb-6 p-5 sm:p-8 print:border print:p-6">
          <SectionTitle n={nextN()} title="Calendrier éditorial — 4 semaines" color={accent} />
          <div className="grid gap-5">
            {calendar.weeks.map((w, wi) => (
              <div key={wi}>
                <p className="mb-2 text-sm font-semibold text-white print:text-black">
                  Semaine {wi + 1} — {w.theme}
                </p>
                <ul className="grid gap-1.5 text-sm text-white/70 print:text-gray-700">
                  {w.posts.map((p, pi) => (
                    <li key={pi}>
                      <span className="text-white/45 print:text-gray-500">
                        {p.day} · {p.channel} —
                      </span>{" "}
                      <span className="font-medium text-white print:text-black">
                        {p.title}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Pitch */}
      {pitch && (
        <section className="card mb-6 p-5 sm:p-8 print:border print:p-6">
          <SectionTitle n={nextN()} title="Discours commercial" color={accent} />
          <p className="text-sm font-medium leading-relaxed text-white print:text-black">
            « {pitch.elevator} »
          </p>
          <p className="mt-3 text-sm text-white/70 print:text-gray-700">
            <span className="font-semibold text-white print:text-black">Conclusion :</span>{" "}
            {pitch.closing}
          </p>
        </section>
      )}

      {/* Proposition */}
      {proposal && (
        <section className="card print-break mb-6 p-5 sm:p-8 print:border print:p-6">
          <SectionTitle n={nextN()} title="Offre recommandée" color={accent} />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-white/40 print:border-gray-200 print:text-gray-500">
                  <th className="px-3 py-2">Offre</th>
                  <th className="px-3 py-2">Mensuel</th>
                  <th className="px-3 py-2">Mise en place</th>
                  <th className="px-3 py-2">Délai</th>
                </tr>
              </thead>
              <tbody className="text-white/70 print:text-gray-700">
                {proposal.offers.map((o) => (
                  <tr
                    key={o.name}
                    className="border-b border-white/5 last:border-0 print:border-gray-100"
                  >
                    <td className="px-3 py-2 font-medium text-white print:text-black">
                      {o.name}
                      {o.name === proposal.recommendedOffer ? " ★" : ""}
                    </td>
                    <td className="px-3 py-2">{euro(o.priceMonthly)}</td>
                    <td className="px-3 py-2">{euro(o.setupFee)}</td>
                    <td className="px-3 py-2">{o.delay}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-white/70 print:text-gray-700">
            {proposal.argumentaire}
          </p>
          <div className="mt-5">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-white/50 print:text-gray-500">
              Prochaines étapes
            </p>
            <ol className="grid gap-1.5 text-sm text-white/70 print:text-gray-700">
              {proposal.nextSteps.map((s, i) => (
                <li key={i}>
                  {i + 1}. {s}
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* Coordonnées agence */}
      <div
        className="card flex flex-wrap items-center justify-between gap-4 p-6 print:border"
        style={accent ? { borderTop: `4px solid ${accent}` } : undefined}
      >
        <div>
          <p className="font-semibold text-white print:text-black">
            {agency?.agencyName ?? "Votre conseiller"}
          </p>
          <p className="text-sm text-white/55 print:text-gray-600">
            {[agency?.contactEmail, agency?.phone, agency?.website]
              .filter(Boolean)
              .join(" · ") || "Coordonnées disponibles sur demande"}
          </p>
          {agency?.signature ? (
            <p className="mt-2 text-sm italic text-white/55 print:text-gray-600">
              {agency.signature}
            </p>
          ) : null}
        </div>
        <p className="text-xs text-white/35 print:text-gray-400">
          Document confidentiel — préparé pour {business.name}
        </p>
      </div>

      {missing.length > 0 && (
        <p className="no-print mt-4 text-sm text-amber-200/80">
          Sections à compléter : {missing.map((m) => m.label).join(", ")}. Utilisez
          le bouton « Compléter le rapport » ci-dessus.
        </p>
      )}
    </div>
  );
}

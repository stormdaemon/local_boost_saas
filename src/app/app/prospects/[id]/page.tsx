"use client";

import { useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { CheckCircle2, Gauge, ListChecks, XCircle } from "lucide-react";
import { useBusiness } from "@/components/use-business";
import {
  AssetHeader,
  ErrorBanner,
  GeneratingCard,
  PageLoader,
} from "@/components/asset-shell";
import { ScoreRadial, ScoresRadar, ScoreBars, scoreLabel } from "@/components/score-visuals";
import type { AuditData } from "@/lib/types";

function ImpactBadge({ value }: { value: string }) {
  const palette: Record<string, string> = {
    Élevé: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
    Moyen: "border-amber-400/30 bg-amber-400/10 text-amber-200",
    Faible: "border-white/15 bg-white/[0.05] text-white/60",
  };
  return <span className={`chip ${palette[value] ?? palette.Faible}`}>{value}</span>;
}

export default function DashboardPage() {
  const { id } = useParams<{ id: string }>();
  const { business, loading, error, generating, generate } = useBusiness(id);
  const autoStarted = useRef(false);

  const audit = business?.assets.AUDIT;
  const data = audit?.data as AuditData | undefined;
  const busy: boolean = generating === "audit";

  // Premier passage : l'audit est généré automatiquement.
  useEffect(() => {
    if (business && !audit && !generating && !autoStarted.current) {
      autoStarted.current = true;
      void generate("audit");
    }
  }, [business, audit, generating, generate]);

  if (loading) return <PageLoader />;
  if (!business) return <ErrorBanner message={error ?? "Entreprise introuvable"} />;
  if (busy || (!data && !error)) {
    return <GeneratingCard label="Audit digital en cours de génération…" />;
  }
  if (!data) return <ErrorBanner message={error} />;

  return (
    <div>
      <ErrorBanner message={error} />
      <AssetHeader
        title={`Audit digital — ${business.name}`}
        subtitle={`${business.sector} · ${business.city} · Objectif : ${business.mainGoal}`}
        modelUsed={audit?.modelUsed ?? null}
        createdAt={audit?.createdAt}
        onRegenerate={() => void generate("audit")}
        regenerating={busy}
      />

      {/* Score global + radar */}
      <div className="grid gap-5 lg:grid-cols-5">
        <div className="card flex flex-col items-center justify-center gap-3 p-8 lg:col-span-2">
          <ScoreRadial score={data.scores.global} />
          <p className="text-sm font-semibold text-white">
            Score digital global · {scoreLabel(data.scores.global)}
          </p>
          <p className="text-center text-xs text-white/45">
            Calculé à partir de la présence digitale déclarée à la création du prospect
          </p>
        </div>
        <div className="card p-6 lg:col-span-3">
          <h3 className="mb-2 flex items-center gap-2 font-semibold text-white">
            <Gauge className="h-4 w-4 text-indigo-300" />
            Répartition par dimension
          </h3>
          <ScoresRadar scores={data.scores} />
        </div>
      </div>

      {/* Barres + synthèse */}
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="card p-6">
          <h3 className="mb-4 font-semibold text-white">Détail des scores</h3>
          <ScoreBars scores={data.scores} />
        </div>
        <div className="card p-6">
          <h3 className="mb-3 font-semibold text-white">Synthèse de l&apos;audit</h3>
          <p className="text-sm leading-relaxed text-white/65">{data.summary}</p>
        </div>
      </div>

      {/* Forces / faiblesses */}
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="card p-6">
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-white">
            <CheckCircle2 className="h-4 w-4 text-emerald-300" />
            Points forts
          </h3>
          <ul className="grid gap-2.5">
            {data.strengths.map((s, i) => (
              <li key={i} className="flex gap-2.5 text-sm text-white/70">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                {s}
              </li>
            ))}
          </ul>
        </div>
        <div className="card p-6">
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-white">
            <XCircle className="h-4 w-4 text-rose-300" />
            Points faibles
          </h3>
          <ul className="grid gap-2.5">
            {data.weaknesses.map((s, i) => (
              <li key={i} className="flex gap-2.5 text-sm text-white/70">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Priorités */}
      <div className="card mt-5 p-6">
        <h3 className="mb-4 flex items-center gap-2 font-semibold text-white">
          <ListChecks className="h-4 w-4 text-indigo-300" />
          Plan d&apos;action prioritaire
        </h3>
        <div className="grid gap-3">
          {data.priorities.map((p, i) => (
            <div
              key={i}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-indigo-400/30"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-white">
                  <span className="mr-2 text-indigo-300">{i + 1}.</span>
                  {p.title}
                </p>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-white/40">Impact</span>
                  <ImpactBadge value={p.impact} />
                  <span className="text-white/40">Effort</span>
                  <ImpactBadge value={p.effort} />
                </div>
              </div>
              <p className="mt-2 text-sm text-white/60">{p.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

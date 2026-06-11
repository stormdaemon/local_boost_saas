"use client";

import { useParams } from "next/navigation";
import { Compass, KeyRound, Lightbulb, MapPin, Search, Target } from "lucide-react";
import { useBusiness } from "@/components/use-business";
import {
  AssetHeader,
  EmptyAssetCard,
  ErrorBanner,
  GeneratingCard,
  PageLoader,
} from "@/components/asset-shell";
import type { StrategyData } from "@/lib/types";

function DifficultyBadge({ value }: { value: string }) {
  const palette: Record<string, string> = {
    Faible: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
    Moyenne: "border-amber-400/30 bg-amber-400/10 text-amber-200",
    Élevée: "border-rose-400/30 bg-rose-400/10 text-rose-200",
  };
  return <span className={`chip ${palette[value] ?? palette.Moyenne}`}>{value}</span>;
}

export default function StrategyPage() {
  const { id } = useParams<{ id: string }>();
  const { business, loading, error, generating, generate } = useBusiness(id);

  if (loading) return <PageLoader />;
  if (!business) return <ErrorBanner message={error ?? "Entreprise introuvable"} />;

  const asset = business.assets.SEO_STRATEGY;
  const data = asset?.data as StrategyData | undefined;
  const busy: boolean = generating === "strategy";

  if (busy) {
    return <GeneratingCard label="Stratégie SEO locale en cours de génération…" />;
  }
  if (!data) {
    return (
      <>
        <ErrorBanner message={error} />
        <EmptyAssetCard
          icon={<Search className="h-8 w-8" />}
          title="Stratégie SEO locale"
          description={`Élaborez en un clic une stratégie complète pour ${business.name} à ${business.city} : mots-clés géolocalisés, piliers d'action, quick wins et indicateurs de suivi.`}
          cta="Générer la stratégie SEO"
          onGenerate={() => void generate("strategy")}
        />
      </>
    );
  }

  return (
    <div>
      <ErrorBanner message={error} />
      <AssetHeader
        title="Stratégie SEO locale"
        subtitle={`Plan de domination locale pour ${business.name} à ${business.city}`}
        modelUsed={asset?.modelUsed ?? null}
        createdAt={asset?.createdAt}
        onRegenerate={() => void generate("strategy")}
        regenerating={busy}
      />

      <div className="card relative overflow-hidden p-6">
        <div className="pointer-events-none absolute -top-20 right-0 h-48 w-72 rounded-full bg-indigo-600/15 blur-3xl" />
        <h3 className="relative mb-2 flex items-center gap-2 font-semibold text-white">
          <Compass className="h-4 w-4 text-indigo-300" />
          Vision stratégique
        </h3>
        <p className="relative text-sm leading-relaxed text-white/70">{data.vision}</p>
      </div>

      <div className="card mt-5 p-6">
        <h3 className="mb-4 flex items-center gap-2 font-semibold text-white">
          <KeyRound className="h-4 w-4 text-indigo-300" />
          Mots-clés locaux prioritaires
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[460px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-white/40">
                <th className="px-3 py-2.5">#</th>
                <th className="px-3 py-2.5">Mot-clé</th>
                <th className="px-3 py-2.5">Intention</th>
                <th className="px-3 py-2.5">Difficulté</th>
              </tr>
            </thead>
            <tbody>
              {[...data.keywords]
                .sort((a, b) => a.priority - b.priority)
                .map((k) => (
                  <tr key={k.keyword} className="border-b border-white/5 last:border-0">
                    <td className="px-3 py-2.5 font-bold text-indigo-300">{k.priority}</td>
                    <td className="px-3 py-2.5 font-medium text-white">{k.keyword}</td>
                    <td className="px-3 py-2.5 capitalize text-white/60">{k.intent}</td>
                    <td className="px-3 py-2.5">
                      <DifficultyBadge value={k.difficulty} />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        {data.pillars.map((p, i) => (
          <div key={i} className="card card-hover p-6">
            <p className="text-xs font-black tracking-widest gradient-text">
              PILIER {i + 1}
            </p>
            <h3 className="mt-2 font-semibold text-white">{p.title}</h3>
            <p className="mt-1.5 text-sm text-white/55">{p.description}</p>
            <ul className="mt-4 grid gap-2">
              {p.actions.map((a, j) => (
                <li key={j} className="flex gap-2.5 text-sm text-white/70">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
                  {a}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <div className="card p-6">
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-white">
            <Lightbulb className="h-4 w-4 text-amber-300" />
            Quick wins
          </h3>
          <ul className="grid gap-2.5">
            {data.quickWins.map((q, i) => (
              <li key={i} className="flex gap-2.5 text-sm text-white/70">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                {q}
              </li>
            ))}
          </ul>
        </div>
        <div className="card p-6">
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-white">
            <MapPin className="h-4 w-4 text-cyan-300" />
            Ancrage local
          </h3>
          <ul className="grid gap-2.5">
            {data.localActions.map((a, i) => (
              <li key={i} className="flex gap-2.5 text-sm text-white/70">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />
                {a}
              </li>
            ))}
          </ul>
        </div>
        <div className="card p-6">
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-white">
            <Target className="h-4 w-4 text-emerald-300" />
            KPIs de suivi
          </h3>
          <ul className="grid gap-2.5">
            {data.kpis.map((k, i) => (
              <li key={i} className="flex gap-2.5 text-sm text-white/70">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                {k}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

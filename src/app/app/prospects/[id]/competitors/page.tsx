"use client";

import { useParams } from "next/navigation";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AlertTriangle, Star, Swords, Trophy } from "lucide-react";
import { useBusiness } from "@/components/use-business";
import {
  AssetHeader,
  EmptyAssetCard,
  ErrorBanner,
  GeneratingCard,
  PageLoader,
} from "@/components/asset-shell";
import type { AuditData, CompetitorsData } from "@/lib/types";

export default function CompetitorsPage() {
  const { id } = useParams<{ id: string }>();
  const { business, loading, error, generating, generate } = useBusiness(id);

  if (loading) return <PageLoader />;
  if (!business) return <ErrorBanner message={error ?? "Entreprise introuvable"} />;

  const asset = business.assets.COMPETITORS;
  const data = asset?.data as CompetitorsData | undefined;
  const audit = business.assets.AUDIT?.data as AuditData | undefined;
  const busy: boolean = generating === "competitors";

  if (busy) {
    return <GeneratingCard label="Matrice concurrentielle en cours de génération…" />;
  }
  if (!data) {
    return (
      <>
        <ErrorBanner message={error} />
        <EmptyAssetCard
          icon={<Swords className="h-8 w-8" />}
          title="Matrice concurrentielle"
          description={`Visualisez un paysage concurrentiel simulé et réaliste autour de ${business.name} à ${business.city} : forces, faiblesses, opportunités et menaces.`}
          cta="Générer la matrice"
          onGenerate={() => void generate("competitors")}
        />
      </>
    );
  }

  const chartData = [
    ...(audit
      ? [
          {
            name: business.name,
            "SEO local": audit.scores.seoLocal,
            "Site web": audit.scores.siteWeb,
            "Réseaux sociaux": audit.scores.reseauxSociaux,
          },
        ]
      : []),
    ...data.competitors.map((c) => ({
      name: c.name,
      "SEO local": c.scores.seoLocal,
      "Site web": c.scores.site,
      "Réseaux sociaux": c.scores.social,
    })),
  ];

  return (
    <div>
      <ErrorBanner message={error} />
      <AssetHeader
        title="Matrice concurrentielle"
        subtitle="Paysage fictif généré à des fins de démonstration et de stratégie"
        modelUsed={asset?.modelUsed ?? null}
        createdAt={asset?.createdAt}
        onRegenerate={() => void generate("competitors")}
        regenerating={busy}
      />

      <div className="card p-6">
        <h3 className="mb-2 font-semibold text-white">Lecture du marché</h3>
        <p className="text-sm leading-relaxed text-white/65">{data.summary}</p>
      </div>

      <div className="card mt-5 p-6">
        <h3 className="mb-4 font-semibold text-white">Comparaison des scores digitaux</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} barGap={3}>
            <CartesianGrid stroke="rgba(255,255,255,0.07)" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              interval={0}
              tickFormatter={(v: string) =>
                v.length > 12 ? `${v.slice(0, 11)}…` : v
              }
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: "#0c1322",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 12,
                color: "#fff",
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }} />
            <Bar dataKey="SEO local" fill="#818cf8" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Site web" fill="#22d3ee" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Réseaux sociaux" fill="#e879f9" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        {!audit && (
          <p className="mt-2 text-xs text-white/40">
            Générez l&apos;audit pour faire apparaître {business.name} dans la comparaison.
          </p>
        )}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        {data.competitors.map((c) => (
          <div key={c.name} className="card card-hover p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-white">{c.name}</h3>
                <p className="text-xs capitalize text-white/45">{c.type}</p>
              </div>
              <span className="chip border-amber-400/30 bg-amber-400/10 text-amber-200">
                <Star className="h-3 w-3 fill-current" />
                {c.scores.avis.toFixed(1)} · {c.scores.reviewCount} avis
              </span>
            </div>
            <p className="mt-3 text-sm italic text-white/60">« {c.positioning} »</p>
            <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-emerald-300/80">
                  Forces
                </p>
                <ul className="grid gap-1.5">
                  {c.strengths.map((s, i) => (
                    <li key={i} className="flex gap-2 text-white/65">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-400" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-rose-300/80">
                  Faiblesses
                </p>
                <ul className="grid gap-1.5">
                  {c.weaknesses.map((s, i) => (
                    <li key={i} className="flex gap-2 text-white/65">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-rose-400" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="card p-6">
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-white">
            <Trophy className="h-4 w-4 text-emerald-300" />
            Opportunités à saisir
          </h3>
          <ul className="grid gap-2.5">
            {data.opportunities.map((o, i) => (
              <li key={i} className="flex gap-2.5 text-sm text-white/70">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                {o}
              </li>
            ))}
          </ul>
        </div>
        <div className="card p-6">
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-white">
            <AlertTriangle className="h-4 w-4 text-amber-300" />
            Menaces à surveiller
          </h3>
          <ul className="grid gap-2.5">
            {data.threats.map((t, i) => (
              <li key={i} className="flex gap-2.5 text-sm text-white/70">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

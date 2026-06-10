"use client";

import { useParams } from "next/navigation";
import { CalendarDays, Megaphone } from "lucide-react";
import { useBusiness } from "@/components/use-business";
import {
  AssetHeader,
  EmptyAssetCard,
  ErrorBanner,
  GeneratingCard,
  PageLoader,
} from "@/components/asset-shell";
import type { CalendarData } from "@/lib/types";

const CHANNEL_COLORS: Record<string, string> = {
  Instagram: "border-fuchsia-400/30 bg-fuchsia-400/10 text-fuchsia-200",
  Facebook: "border-blue-400/30 bg-blue-400/10 text-blue-200",
  TikTok: "border-cyan-400/30 bg-cyan-400/10 text-cyan-200",
  LinkedIn: "border-sky-400/30 bg-sky-400/10 text-sky-200",
  YouTube: "border-rose-400/30 bg-rose-400/10 text-rose-200",
  "Google Business": "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
};

function channelClass(channel: string): string {
  const found = Object.keys(CHANNEL_COLORS).find((k) =>
    channel.toLowerCase().includes(k.toLowerCase().split(" ")[0]),
  );
  return found
    ? CHANNEL_COLORS[found]
    : "border-indigo-400/30 bg-indigo-400/10 text-indigo-200";
}

export default function CalendarPage() {
  const { id } = useParams<{ id: string }>();
  const { business, loading, error, generating, generate } = useBusiness(id);

  if (loading) return <PageLoader />;
  if (!business) return <ErrorBanner message={error ?? "Entreprise introuvable"} />;

  const asset = business.assets.CALENDAR;
  const data = asset?.data as CalendarData | undefined;
  const busy: boolean = generating === "calendar";

  if (busy) {
    return <GeneratingCard label="Calendrier éditorial en cours de génération…" />;
  }
  if (!data) {
    return (
      <>
        <ErrorBanner message={error} />
        <EmptyAssetCard
          icon={<CalendarDays className="h-8 w-8" />}
          title="Calendrier éditorial — 4 semaines"
          description={`Planifiez en un clic un mois de publications pour ${business.name} : thèmes hebdomadaires, canaux, formats et appels à l'action prêts à publier.`}
          cta="Générer le calendrier"
          onGenerate={() => void generate("calendar")}
        />
      </>
    );
  }

  return (
    <div>
      <ErrorBanner message={error} />
      <AssetHeader
        title="Calendrier éditorial — 4 semaines"
        subtitle={`Plan de contenu prêt à publier pour ${business.name}`}
        modelUsed={asset?.modelUsed ?? null}
        createdAt={asset?.createdAt}
        onRegenerate={() => void generate("calendar")}
        regenerating={busy}
      />

      <div className="grid gap-5">
        {data.weeks.map((week, wi) => (
          <div key={wi} className="card p-6">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span className="rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 px-3 py-1.5 text-xs font-bold text-white">
                SEMAINE {wi + 1}
              </span>
              <h3 className="font-semibold text-white">{week.theme}</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {week.posts.map((post, pi) => (
                <div
                  key={pi}
                  className="flex flex-col rounded-xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-indigo-400/30"
                >
                  <div className="mb-2 flex flex-wrap items-center gap-1.5">
                    <span className="chip">{post.day}</span>
                    <span className={`chip ${channelClass(post.channel)}`}>
                      {post.channel}
                    </span>
                    <span className="chip border-white/10 text-white/50">{post.format}</span>
                  </div>
                  <p className="font-semibold leading-snug text-white">{post.title}</p>
                  <p className="mt-1.5 flex-1 text-sm text-white/55">{post.description}</p>
                  <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-indigo-300">
                    <Megaphone className="h-3.5 w-3.5 shrink-0" />
                    {post.cta}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

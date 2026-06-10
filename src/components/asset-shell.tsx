"use client";

import { BadgeCheck, Loader2, RefreshCw, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { publicGenerationLabel } from "@/lib/labels";

export function ModelBadge({ modelUsed }: { modelUsed: string | null }) {
  return (
    <span className="chip border-emerald-400/30 bg-emerald-400/10 text-emerald-200">
      <BadgeCheck className="h-3 w-3" />
      {publicGenerationLabel(modelUsed)}
    </span>
  );
}

export function GeneratingCard({ label }: { label: string }) {
  return (
    <div className="card flex flex-col items-center justify-center gap-4 px-8 py-20 text-center">
      <div className="relative">
        <div className="absolute inset-0 animate-ping rounded-full bg-indigo-500/30" />
        <div className="relative rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 p-4">
          <Loader2 className="h-7 w-7 animate-spin text-white" />
        </div>
      </div>
      <div>
        <p className="text-lg font-semibold text-white">{label}</p>
        <p className="mt-1 text-sm text-white/50">
          Préparation de recommandations personnalisées — généralement moins
          d&apos;une minute.
        </p>
      </div>
    </div>
  );
}

export function EmptyAssetCard({
  title,
  description,
  cta,
  onGenerate,
  icon,
}: {
  title: string;
  description: string;
  cta: string;
  onGenerate: () => void;
  icon: ReactNode;
}) {
  return (
    <div className="card relative overflow-hidden px-8 py-16 text-center">
      <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[480px] -translate-x-1/2 rounded-full bg-indigo-600/20 blur-3xl" />
      <div className="relative mx-auto mb-5 inline-flex rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 p-4 text-indigo-300">
        {icon}
      </div>
      <h3 className="relative text-xl font-bold text-white">{title}</h3>
      <p className="relative mx-auto mt-2 max-w-md text-sm text-white/55">{description}</p>
      <button onClick={onGenerate} className="btn-primary relative mt-6">
        <Sparkles className="h-4 w-4" />
        {cta}
      </button>
    </div>
  );
}

export function AssetHeader({
  title,
  subtitle,
  modelUsed,
  createdAt,
  onRegenerate,
  regenerating,
}: {
  title: string;
  subtitle?: string;
  modelUsed: string | null;
  createdAt?: string;
  onRegenerate: () => void;
  regenerating: boolean;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-white/55">{subtitle}</p> : null}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <ModelBadge modelUsed={modelUsed} />
          {createdAt ? (
            <span className="text-xs text-white/40">
              le {new Date(createdAt).toLocaleString("fr-FR")}
            </span>
          ) : null}
        </div>
      </div>
      <button onClick={onRegenerate} disabled={regenerating} className="btn-ghost no-print">
        {regenerating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCw className="h-4 w-4" />
        )}
        Régénérer
      </button>
    </div>
  );
}

export function ErrorBanner({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="mb-4 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
      {message}
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center py-32">
      <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
    </div>
  );
}

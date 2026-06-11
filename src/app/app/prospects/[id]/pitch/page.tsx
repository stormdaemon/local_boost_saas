"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  Check,
  Copy,
  Handshake,
  Megaphone,
  MessageCircleQuestion,
  Quote,
} from "lucide-react";
import { useBusiness } from "@/components/use-business";
import {
  AssetHeader,
  EmptyAssetCard,
  ErrorBanner,
  GeneratingCard,
  PageLoader,
} from "@/components/asset-shell";
import type { PitchData } from "@/lib/types";

const SECTIONS: { key: keyof PitchData; label: string }[] = [
  { key: "hook", label: "Accroche" },
  { key: "problem", label: "Problème" },
  { key: "solution", label: "Solution" },
  { key: "proof", label: "Preuves" },
  { key: "offer", label: "Offre" },
];

export default function PitchPage() {
  const { id } = useParams<{ id: string }>();
  const { business, loading, error, generating, generate } = useBusiness(id);
  const [copied, setCopied] = useState(false);

  if (loading) return <PageLoader />;
  if (!business) return <ErrorBanner message={error ?? "Entreprise introuvable"} />;

  const asset = business.assets.PITCH;
  const data = asset?.data as PitchData | undefined;
  const busy: boolean = generating === "pitch";

  if (busy) {
    return <GeneratingCard label="Pitch commercial en cours de génération…" />;
  }
  if (!data) {
    return (
      <>
        <ErrorBanner message={error} />
        <EmptyAssetCard
          icon={<Megaphone className="h-8 w-8" />}
          title="Pitch commercial"
          description={`Générez l'argumentaire complet de ${business.name} : elevator pitch, traitement des objections et phrase de closing.`}
          cta="Générer le pitch"
          onGenerate={() => void generate("pitch")}
        />
      </>
    );
  }

  async function copyPitch() {
    if (!data) return;
    const full = [
      `PITCH — ${business?.name}`,
      "",
      `Elevator pitch : ${data.elevator}`,
      "",
      ...SECTIONS.map((s) => `${s.label} : ${String(data[s.key])}`),
      "",
      "Objections :",
      ...data.objections.map((o) => `- ${o.objection}\n  → ${o.response}`),
      "",
      `Closing : ${data.closing}`,
    ].join("\n");
    await navigator.clipboard.writeText(full);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      <ErrorBanner message={error} />
      <AssetHeader
        title="Pitch commercial"
        subtitle={`L'argumentaire de ${business.name} face aux prospects de ${business.city}`}
        modelUsed={asset?.modelUsed ?? null}
        createdAt={asset?.createdAt}
        onRegenerate={() => void generate("pitch")}
        regenerating={busy}
      />

      <div className="card relative overflow-hidden p-6 sm:p-8">
        <div className="pointer-events-none absolute -top-24 right-0 h-56 w-96 rounded-full bg-violet-600/15 blur-3xl" />
        <Quote className="relative mb-3 h-8 w-8 text-indigo-300/60" />
        <p className="relative text-lg font-medium leading-relaxed text-white">
          {data.elevator}
        </p>
        <p className="relative mt-3 text-xs uppercase tracking-widest text-white/40">
          Elevator pitch — 30 secondes
        </p>
        <button onClick={copyPitch} className="btn-ghost no-print relative mt-5">
          {copied ? (
            <Check className="h-4 w-4 text-emerald-300" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          {copied ? "Copié !" : "Copier le pitch complet"}
        </button>
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {SECTIONS.map((s, i) => (
          <div key={s.key} className={`card p-6 ${i === 0 ? "sm:col-span-2 lg:col-span-1" : ""}`}>
            <p className="text-xs font-black tracking-widest gradient-text">
              {String(i + 1).padStart(2, "0")} · {s.label.toUpperCase()}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-white/70">
              {String(data[s.key])}
            </p>
          </div>
        ))}
        <div className="card border-emerald-400/20 bg-emerald-400/[0.04] p-6">
          <p className="flex items-center gap-2 text-xs font-black tracking-widest text-emerald-300">
            <Handshake className="h-4 w-4" />
            CLOSING
          </p>
          <p className="mt-3 text-sm font-medium leading-relaxed text-white">
            {data.closing}
          </p>
        </div>
      </div>

      <div className="card mt-5 p-6">
        <h3 className="mb-4 flex items-center gap-2 font-semibold text-white">
          <MessageCircleQuestion className="h-4 w-4 text-indigo-300" />
          Traitement des objections
        </h3>
        <div className="grid gap-3 lg:grid-cols-2">
          {data.objections.map((o, i) => (
            <div key={i} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-sm font-semibold text-rose-200">« {o.objection} »</p>
              <p className="mt-2 text-sm text-white/65">{o.response}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

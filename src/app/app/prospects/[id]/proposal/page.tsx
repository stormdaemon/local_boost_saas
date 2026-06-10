"use client";

import { useParams } from "next/navigation";
import {
  BadgeEuro,
  CheckCircle2,
  FileSignature,
  ListOrdered,
  MessageCircleQuestion,
  Star,
} from "lucide-react";
import { useBusiness } from "@/components/use-business";
import {
  AssetHeader,
  EmptyAssetCard,
  ErrorBanner,
  GeneratingCard,
  PageLoader,
} from "@/components/asset-shell";
import type { ProposalData } from "@/lib/types";

const euro = (n: number) => n.toLocaleString("fr-FR") + " €";

export default function ProposalPage() {
  const { id } = useParams<{ id: string }>();
  const { business, loading, error, generating, generate } = useBusiness(id);

  if (loading) return <PageLoader />;
  if (!business) return <ErrorBanner message={error ?? "Prospect introuvable"} />;

  const asset = business.assets.PROPOSAL;
  const data = asset?.data as ProposalData | undefined;
  const busy: boolean = generating === "proposal";

  if (busy) {
    return <GeneratingCard label="Proposition commerciale en cours de préparation…" />;
  }
  if (!data) {
    return (
      <>
        <ErrorBanner message={error} />
        <EmptyAssetCard
          icon={<FileSignature className="h-8 w-8" />}
          title="Proposition commerciale"
          description={`Transformez l'audit de ${business.name} en proposition prête à signer : trois niveaux d'offre chiffrés, argumentaire, objections traitées et prochaines étapes.`}
          cta="Générer la proposition"
          onGenerate={() => void generate("proposal")}
        />
      </>
    );
  }

  return (
    <div>
      <ErrorBanner message={error} />
      <AssetHeader
        title="Proposition commerciale"
        subtitle={`Offre d'accompagnement pour ${business.name} · ${business.city}`}
        modelUsed={asset?.modelUsed ?? null}
        createdAt={asset?.createdAt}
        onRegenerate={() => void generate("proposal")}
        regenerating={busy}
      />

      <div className="card relative overflow-hidden p-7">
        <div className="pointer-events-none absolute -top-20 right-0 h-48 w-72 rounded-full bg-violet-600/15 blur-3xl" />
        <h3 className="relative mb-2 font-semibold text-white">Résumé exécutif</h3>
        <p className="relative text-sm leading-relaxed text-white/70">
          {data.executiveSummary}
        </p>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        {data.offers.map((offer) => {
          const recommended = offer.name === data.recommendedOffer;
          return (
            <div
              key={offer.name}
              className={`card relative flex flex-col p-6 ${
                recommended
                  ? "border-indigo-400/50 shadow-[0_0_50px_-18px_rgba(99,102,241,0.65)]"
                  : ""
              }`}
            >
              {recommended && (
                <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-3 py-1 text-xs font-bold text-white">
                  <Star className="h-3 w-3 fill-current" />
                  Recommandée
                </span>
              )}
              <h3 className="text-lg font-bold text-white">{offer.name}</h3>
              <p className="mt-1 text-sm text-white/50">{offer.tagline}</p>
              <p className="mt-4">
                <span className="text-3xl font-extrabold text-white">
                  {euro(offer.priceMonthly)}
                </span>
                <span className="text-sm text-white/45"> /mois</span>
              </p>
              <p className="text-xs text-white/45">
                + {euro(offer.setupFee)} de mise en place · {offer.delay}
              </p>
              <ul className="mt-4 grid flex-1 gap-2">
                {offer.deliverables.map((d, i) => (
                  <li key={i} className="flex gap-2 text-sm text-white/70">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="card mt-5 p-6">
        <h3 className="mb-3 flex items-center gap-2 font-semibold text-white">
          <BadgeEuro className="h-4 w-4 text-indigo-300" />
          Argumentaire de vente
        </h3>
        <p className="text-sm leading-relaxed text-white/70">{data.argumentaire}</p>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="card p-6">
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-white">
            <MessageCircleQuestion className="h-4 w-4 text-amber-300" />
            Objections probables
          </h3>
          <div className="grid gap-3">
            {data.objections.map((o, i) => (
              <div key={i} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-sm font-semibold text-rose-200">« {o.objection} »</p>
                <p className="mt-2 text-sm text-white/65">{o.response}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="card p-6">
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-white">
            <ListOrdered className="h-4 w-4 text-emerald-300" />
            Prochaines étapes
          </h3>
          <ol className="grid gap-3">
            {data.nextSteps.map((s, i) => (
              <li key={i} className="flex gap-3 text-sm text-white/70">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white">
                  {i + 1}
                </span>
                {s}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, MonitorPlay } from "lucide-react";
import { useBusiness } from "@/components/use-business";
import { ErrorBanner, PageLoader } from "@/components/asset-shell";
import { ScoreRadial } from "@/components/score-visuals";
import type { AuditData, ProposalData, StrategyData } from "@/lib/types";

type Slide = { kicker: string; title: string; body: React.ReactNode };

export default function PresentationPage() {
  const { id } = useParams<{ id: string }>();
  const { business, loading, error } = useBusiness(id);
  const [index, setIndex] = useState(0);

  const audit = business?.assets.AUDIT?.data as AuditData | undefined;
  const strategy = business?.assets.SEO_STRATEGY?.data as StrategyData | undefined;
  const proposal = business?.assets.PROPOSAL?.data as ProposalData | undefined;

  const slides = useMemo<Slide[]>(() => {
    if (!business) return [];
    const s: Slide[] = [
      {
        kicker: "Contexte",
        title: business.name,
        body: (
          <div className="grid gap-3 text-lg text-white/75">
            <p>
              {business.sector} · {business.city}
            </p>
            <p>
              Objectif :{" "}
              <span className="font-semibold text-white">{business.mainGoal}</span>
            </p>
            {business.targetAudience && <p>Clientèle cible : {business.targetAudience}</p>}
          </div>
        ),
      },
    ];
    if (audit) {
      s.push(
        {
          kicker: "Le problème",
          title: "Où en est votre visibilité aujourd'hui ?",
          body: (
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-12">
              <ScoreRadial score={audit.scores.global} size={200} />
              <ul className="grid gap-3 text-left text-lg text-white/75">
                {audit.weaknesses.slice(0, 3).map((w, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-rose-400" />
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          ),
        },
        {
          kicker: "L'impact",
          title: "Ce que cela coûte chaque mois",
          body: (
            <div className="grid gap-3 text-lg text-white/75">
              <p>
                Vos futurs clients vous cherchent sur Google — et trouvent vos
                concurrents en premier.
              </p>
              <p>
                Chaque semaine sans plan d&apos;action, ce sont des appels, des
                visites et des devis qui partent ailleurs.
              </p>
            </div>
          ),
        },
        {
          kicker: "L'opportunité",
          title: "Le potentiel est réel et mesurable",
          body: (
            <ul className="grid gap-3 text-left text-lg text-white/75">
              {audit.strengths.slice(0, 3).map((w, i) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
                  {w}
                </li>
              ))}
            </ul>
          ),
        },
      );
    }
    if (strategy) {
      s.push({
        kicker: "La solution",
        title: "Un plan d'action clair",
        body: (
          <ol className="grid gap-3 text-left text-lg text-white/75">
            {strategy.pillars.slice(0, 4).map((p, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white">
                  {i + 1}
                </span>
                <span>
                  <span className="font-semibold text-white">{p.title}</span>
                  {" — "}
                  {p.description}
                </span>
              </li>
            ))}
          </ol>
        ),
      });
    }
    if (proposal) {
      const reco = proposal.offers.find((o) => o.name === proposal.recommendedOffer);
      s.push({
        kicker: "Notre offre",
        title: reco
          ? `Formule ${reco.name} — ${reco.priceMonthly.toLocaleString("fr-FR")} €/mois`
          : "Une offre adaptée à votre budget",
        body: reco ? (
          <ul className="grid gap-3 text-left text-lg text-white/75">
            {reco.deliverables.slice(0, 5).map((d, i) => (
              <li key={i} className="flex gap-3">
                <span className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-indigo-400" />
                {d}
              </li>
            ))}
          </ul>
        ) : null,
      });
      s.push({
        kicker: "Prochaine action",
        title: "On démarre ?",
        body: (
          <ol className="grid gap-3 text-left text-lg text-white/75">
            {proposal.nextSteps.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-sm font-bold text-white">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        ),
      });
    }
    return s;
  }, [business, audit, strategy, proposal]);

  const next = useCallback(
    () => setIndex((i) => Math.min(slides.length - 1, i + 1)),
    [slides.length],
  );
  const prev = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === " ") next();
      if (e.key === "ArrowLeft") prev();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  if (loading) return <PageLoader />;
  if (!business) return <ErrorBanner message={error ?? "Prospect introuvable"} />;

  if (slides.length <= 1) {
    return (
      <div className="card px-8 py-16 text-center">
        <MonitorPlay className="mx-auto mb-4 h-10 w-10 text-indigo-300" />
        <h1 className="text-xl font-bold text-white">Mode présentation</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-white/55">
          Générez d&apos;abord l&apos;audit, la stratégie et la proposition
          commerciale : la présentation se construit automatiquement à partir de
          ces analyses.
        </p>
        <Link href={`/app/prospects/${id}/report`} className="btn-primary mt-6 inline-flex">
          Aller au rapport
        </Link>
      </div>
    );
  }

  const slide = slides[index];

  return (
    <div className="flex min-h-[70vh] flex-col">
      <div className="card relative flex flex-1 flex-col items-center justify-center overflow-hidden px-5 py-12 text-center sm:px-8 sm:py-16">
        <div className="pointer-events-none absolute -top-32 left-1/2 h-72 w-[640px] -translate-x-1/2 rounded-full bg-indigo-600/20 blur-3xl" />
        <p className="relative text-sm font-black uppercase tracking-[0.3em] gradient-text">
          {slide.kicker}
        </p>
        <h1 className="relative mt-4 max-w-3xl text-3xl font-extrabold leading-tight text-white sm:text-4xl">
          {slide.title}
        </h1>
        <div className="relative mt-8 flex max-w-3xl justify-center">{slide.body}</div>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <button
          onClick={prev}
          disabled={index === 0}
          aria-label="Diapositive précédente"
          className="btn-ghost"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Précédent</span>
        </button>
        <div className="flex items-center gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-2 rounded-full transition-all ${
                i === index ? "w-6 bg-indigo-400" : "w-2 bg-white/20 hover:bg-white/40"
              }`}
              aria-label={`Diapositive ${i + 1}`}
            />
          ))}
        </div>
        <button
          onClick={next}
          disabled={index === slides.length - 1}
          aria-label="Diapositive suivante"
          className="btn-primary"
        >
          <span className="hidden sm:inline">Suivant</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
      <p className="mt-3 text-center text-xs text-white/35">
        Astuce : utilisez les flèches du clavier pour naviguer pendant le rendez-vous.
      </p>
    </div>
  );
}

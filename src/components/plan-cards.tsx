"use client";

import { Check, Loader2, Star } from "lucide-react";
import { PLANS, type PlanTierKey } from "@/lib/plans";

export function PlanCards({
  currentTier,
  busyTier,
  onSelect,
  ctaLabel = "Choisir ce forfait",
}: {
  currentTier?: PlanTierKey | null;
  busyTier?: PlanTierKey | null;
  onSelect?: (tier: PlanTierKey) => void;
  ctaLabel?: string;
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {PLANS.map((plan) => {
        const highlighted = plan.tier === "AGENCE";
        const isCurrent = currentTier === plan.tier;
        return (
          <div
            key={plan.tier}
            className={`card relative flex flex-col p-7 ${
              highlighted
                ? "border-indigo-400/50 shadow-[0_0_60px_-20px_rgba(99,102,241,0.6)]"
                : ""
            }`}
          >
            {highlighted && (
              <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-3 py-1 text-xs font-bold text-white">
                <Star className="h-3 w-3 fill-current" />
                Le plus choisi
              </span>
            )}
            <h3 className="text-lg font-bold text-white">{plan.name}</h3>
            <p className="mt-1 text-sm text-white/50">{plan.tagline}</p>
            <p className="mt-4">
              <span className="text-4xl font-extrabold text-white">
                {plan.priceMonthly} €
              </span>
              <span className="text-sm text-white/45"> /mois</span>
            </p>
            <ul className="mt-5 grid flex-1 gap-2.5">
              {plan.bullets.map((b) => (
                <li key={b} className="flex gap-2.5 text-sm text-white/70">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                  {b}
                </li>
              ))}
            </ul>
            {onSelect && (
              <button
                onClick={() => onSelect(plan.tier)}
                disabled={isCurrent || busyTier !== null}
                className={`${highlighted ? "btn-primary" : "btn-ghost"} mt-6 w-full`}
              >
                {busyTier === plan.tier ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                {isCurrent ? "Forfait actuel" : ctaLabel}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { BadgeCheck, Loader2 } from "lucide-react";
import { PlanCards } from "@/components/plan-cards";
import type { PlanTierKey } from "@/lib/plans";

type Me = {
  plan: PlanTierKey | null;
  planStatus: string;
  usedThisMonth: number;
  quota: number | null;
};

export default function BillingPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [busyTier, setBusyTier] = useState<PlanTierKey | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/me", { cache: "no-store" })
      .then((r) => r.json())
      .then(setMe);
  }, []);

  async function subscribe(tier: PlanTierKey) {
    setBusyTier(tier);
    setError(null);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok || !body?.approveUrl) {
        throw new Error(
          body?.error ??
            "Le paiement est momentanément indisponible. Veuillez réessayer plus tard.",
        );
      }
      window.location.href = body.approveUrl;
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Le paiement est momentanément indisponible. Veuillez réessayer plus tard.",
      );
      setBusyTier(null);
    }
  }

  if (!me) {
    return (
      <div className="flex flex-1 items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  const active = me.planStatus === "active";

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
      <h1 className="text-2xl font-bold text-white">Abonnement</h1>
      <p className="mt-1 text-sm text-white/55">
        Paiement sécurisé via PayPal. L&apos;accès est activé automatiquement dès
        confirmation.
      </p>

      {active && (
        <div className="card mt-6 flex flex-wrap items-center justify-between gap-4 border-emerald-400/25 p-6">
          <div className="flex items-center gap-3">
            <BadgeCheck className="h-8 w-8 text-emerald-300" />
            <div>
              <p className="font-semibold text-white">
                Forfait {me.plan === "SOLO" ? "Solo" : me.plan === "AGENCE" ? "Agence" : "Pro"} actif
              </p>
              <p className="text-sm text-white/55">
                {me.usedThisMonth} audit{me.usedThisMonth > 1 ? "s" : ""} utilisé
                {me.usedThisMonth > 1 ? "s" : ""} ce mois-ci
                {me.quota !== null ? ` sur ${me.quota}` : " (illimité)"}.
              </p>
            </div>
          </div>
          <p className="text-xs text-white/40">
            La gestion (changement de moyen de paiement, résiliation) s&apos;effectue
            depuis votre compte PayPal.
          </p>
        </div>
      )}

      {error && (
        <p className="mt-6 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </p>
      )}

      <div className="mt-8">
        <PlanCards
          currentTier={active ? me.plan : null}
          busyTier={busyTier}
          onSelect={subscribe}
          ctaLabel={active ? "Changer de forfait" : "S'abonner avec PayPal"}
        />
      </div>
      <p className="mt-6 text-center text-xs text-white/40">
        Sans engagement · Résiliable à tout moment · Facturation mensuelle en euros
      </p>
    </main>
  );
}

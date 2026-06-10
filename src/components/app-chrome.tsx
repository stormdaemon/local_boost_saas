"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Compass,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Settings,
  ShieldCheck,
  Lock,
} from "lucide-react";
import { PlanCards } from "./plan-cards";
import type { PlanTierKey } from "@/lib/plans";

const PLAN_NAMES: Record<string, string> = {
  SOLO: "Solo",
  AGENCE: "Agence",
  PRO: "Pro",
};

/** Chemins accessibles sans abonnement actif. */
const FREE_PATHS = ["/app/billing", "/app/settings", "/app/nouveau-mot-de-passe"];

export function AppChrome({
  email,
  isAdmin,
  planActive,
  planTier,
  children,
}: {
  email: string;
  isAdmin: boolean;
  planActive: boolean;
  planTier: PlanTierKey | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [busyTier, setBusyTier] = useState<PlanTierKey | null>(null);
  const [payError, setPayError] = useState<string | null>(null);

  const showPaywall =
    !planActive && !FREE_PATHS.some((p) => pathname.startsWith(p));

  async function subscribe(tier: PlanTierKey) {
    setBusyTier(tier);
    setPayError(null);
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
      setPayError(
        e instanceof Error
          ? e.message
          : "Le paiement est momentanément indisponible. Veuillez réessayer plus tard.",
      );
      setBusyTier(null);
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="no-print sticky top-0 z-40 border-b border-white/10 bg-[#060a12]/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-5">
            <Link href="/app" className="flex items-center gap-2.5">
              <span className="rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 p-2">
                <Compass className="h-4 w-4 text-white" />
              </span>
              <span className="hidden font-bold text-white sm:inline">
                ProspectPilot <span className="gradient-text">Local</span>
              </span>
            </Link>
            <nav className="flex items-center gap-1">
              <Link
                href="/app"
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  pathname === "/app"
                    ? "bg-white/10 text-white"
                    : "text-white/55 hover:text-white"
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden md:inline">Prospects</span>
              </Link>
              <Link
                href="/app/billing"
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  pathname.startsWith("/app/billing")
                    ? "bg-white/10 text-white"
                    : "text-white/55 hover:text-white"
                }`}
              >
                <CreditCard className="h-4 w-4" />
                <span className="hidden md:inline">Abonnement</span>
              </Link>
              <Link
                href="/app/settings"
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  pathname.startsWith("/app/settings")
                    ? "bg-white/10 text-white"
                    : "text-white/55 hover:text-white"
                }`}
              >
                <Settings className="h-4 w-4" />
                <span className="hidden md:inline">Mon compte</span>
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-amber-300/80 transition hover:text-amber-200"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span className="hidden md:inline">Admin</span>
                </Link>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`chip hidden sm:inline-flex ${
                planActive
                  ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
                  : "border-amber-400/30 bg-amber-400/10 text-amber-200"
              }`}
            >
              {planActive
                ? `Forfait ${planTier ? PLAN_NAMES[planTier] : "actif"}`
                : "Aucun abonnement actif"}
            </span>
            <span className="hidden max-w-[180px] truncate text-xs text-white/40 lg:inline">
              {email}
            </span>
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="btn-ghost px-3 py-2 text-xs"
                title="Se déconnecter"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </header>

      {showPaywall ? (
        <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
          <div className="mb-10 text-center">
            <span className="chip mx-auto mb-4 border-amber-400/30 bg-amber-400/10 text-amber-200">
              <Lock className="h-3.5 w-3.5" />
              Espace limité
            </span>
            <h1 className="text-3xl font-bold text-white">
              Activez votre abonnement pour générer vos audits
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-white/55">
              Choisissez le forfait adapté à votre activité. L&apos;accès est
              débloqué automatiquement dès la confirmation du paiement.
            </p>
          </div>
          {payError && (
            <p className="mx-auto mb-6 max-w-xl rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-center text-sm text-rose-200">
              {payError}
            </p>
          )}
          <PlanCards onSelect={subscribe} busyTier={busyTier} ctaLabel="S'abonner avec PayPal" />
          <p className="mt-6 text-center text-xs text-white/40">
            Paiement sécurisé via PayPal · Sans engagement, résiliable à tout moment
          </p>
        </main>
      ) : (
        children
      )}
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Loader2, PiggyBank, Save, Trash2, TrendingUp, Users } from "lucide-react";
import { useBusiness } from "@/components/use-business";
import { ErrorBanner, PageLoader } from "@/components/asset-shell";
import type { RoiScenarioDTO } from "@/lib/types";

type Params = {
  monthlyInvestment: number;
  extraVisitors: number;
  conversionRate: number;
  closeRate: number;
  avgTicket: number;
  marginRate: number;
  purchasesPerYear: number;
};

const DEFAULTS: Params = {
  monthlyInvestment: 500,
  extraVisitors: 300,
  conversionRate: 4,
  closeRate: 40,
  avgTicket: 60,
  marginRate: 55,
  purchasesPerYear: 3,
};

const SLIDERS: {
  key: keyof Params;
  label: string;
  min: number;
  max: number;
  step: number;
  unit: string;
}[] = [
  { key: "monthlyInvestment", label: "Investissement marketing mensuel", min: 0, max: 5000, step: 50, unit: "€" },
  { key: "extraVisitors", label: "Visiteurs locaux supplémentaires / mois", min: 0, max: 3000, step: 25, unit: "" },
  { key: "conversionRate", label: "Taux de conversion visiteur → prospect", min: 0.5, max: 20, step: 0.5, unit: "%" },
  { key: "closeRate", label: "Taux de transformation prospect → client", min: 5, max: 90, step: 5, unit: "%" },
  { key: "avgTicket", label: "Panier moyen par achat", min: 5, max: 2000, step: 5, unit: "€" },
  { key: "purchasesPerYear", label: "Achats par client et par an", min: 1, max: 24, step: 1, unit: "" },
  { key: "marginRate", label: "Marge brute", min: 10, max: 90, step: 5, unit: "%" },
];

const euro = (n: number) =>
  n.toLocaleString("fr-FR", { maximumFractionDigits: 0 }) + " €";

function project(p: Params) {
  const newClientsPerMonth =
    p.extraVisitors * (p.conversionRate / 100) * (p.closeRate / 100);
  const monthlyValuePerClient = (p.avgTicket * p.purchasesPerYear) / 12;
  let cumulative = 0;
  let breakEven: number | null = null;
  const months = Array.from({ length: 12 }, (_, i) => {
    const m = i + 1;
    const activeClients = newClientsPerMonth * m;
    const revenue = activeClients * monthlyValuePerClient;
    const margin = revenue * (p.marginRate / 100);
    const profit = margin - p.monthlyInvestment;
    cumulative += profit;
    if (breakEven === null && cumulative >= 0 && p.monthlyInvestment > 0) breakEven = m;
    return { month: `M${m}`, revenue, margin, profit, cumulative };
  });
  const totalInvest = p.monthlyInvestment * 12;
  const totalMargin = months.reduce((s, m) => s + m.margin, 0);
  const totalRevenue = months.reduce((s, m) => s + m.revenue, 0);
  const roi = totalInvest > 0 ? ((totalMargin - totalInvest) / totalInvest) * 100 : 0;
  return { months, newClientsPerMonth, totalInvest, totalMargin, totalRevenue, roi, breakEven };
}

export default function RoiPage() {
  const { id } = useParams<{ id: string }>();
  const { business, loading, error, refresh } = useBusiness(id);
  const [params, setParams] = useState<Params>(DEFAULTS);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const result = useMemo(() => project(params), [params]);

  if (loading) return <PageLoader />;
  if (!business) return <ErrorBanner message={error ?? "Entreprise introuvable"} />;

  async function saveScenario() {
    setSaving(true);
    setLocalError(null);
    try {
      const res = await fetch(`/api/businesses/${id}/roi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name || "Scénario", ...params }),
      });
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      setName("");
      await refresh();
    } catch (e) {
      setLocalError(e instanceof Error ? e.message : "Erreur d'enregistrement");
    } finally {
      setSaving(false);
    }
  }

  async function deleteScenario(scenarioId: string) {
    await fetch(`/api/businesses/${id}/roi?scenarioId=${scenarioId}`, {
      method: "DELETE",
    });
    await refresh();
  }

  function loadScenario(s: RoiScenarioDTO) {
    setParams({
      monthlyInvestment: s.monthlyInvestment,
      extraVisitors: s.extraVisitors,
      conversionRate: s.conversionRate,
      closeRate: s.closeRate,
      avgTicket: s.avgTicket,
      marginRate: s.marginRate,
      purchasesPerYear: s.purchasesPerYear,
    });
  }

  return (
    <div>
      <ErrorBanner message={error ?? localError} />
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Simulateur de ROI</h1>
        <p className="mt-1 text-sm text-white/55">
          Projection sur 12 mois de l&apos;investissement marketing local de{" "}
          {business.name}. Tous les paramètres sont modifiables.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-5">
        {/* Paramètres */}
        <div className="card p-6 lg:col-span-2">
          <h3 className="mb-5 font-semibold text-white">Hypothèses</h3>
          <div className="grid gap-5">
            {SLIDERS.map((s) => (
              <div key={s.key}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="text-white/60">{s.label}</span>
                  <span className="font-bold text-white">
                    {params[s.key].toLocaleString("fr-FR")}
                    {s.unit && ` ${s.unit}`}
                  </span>
                </div>
                <input
                  type="range"
                  min={s.min}
                  max={s.max}
                  step={s.step}
                  value={params[s.key]}
                  onChange={(e) =>
                    setParams((p) => ({ ...p, [s.key]: Number(e.target.value) }))
                  }
                />
              </div>
            ))}
          </div>
          <div className="mt-6 flex gap-2 border-t border-white/10 pt-5">
            <input
              className="input flex-1"
              placeholder="Nom du scénario…"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <button onClick={saveScenario} disabled={saving} className="btn-primary shrink-0">
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Sauver
            </button>
          </div>
        </div>

        {/* Résultats */}
        <div className="flex flex-col gap-5 lg:col-span-3">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="card p-5">
              <Users className="mb-2 h-5 w-5 text-indigo-300" />
              <p className="text-2xl font-extrabold text-white">
                {result.newClientsPerMonth.toLocaleString("fr-FR", {
                  maximumFractionDigits: 1,
                })}
              </p>
              <p className="text-xs text-white/50">nouveaux clients / mois</p>
            </div>
            <div className="card p-5">
              <TrendingUp className="mb-2 h-5 w-5 text-emerald-300" />
              <p
                className={`text-2xl font-extrabold ${
                  result.roi >= 0 ? "text-emerald-300" : "text-rose-300"
                }`}
              >
                {result.roi.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} %
              </p>
              <p className="text-xs text-white/50">ROI sur 12 mois</p>
            </div>
            <div className="card p-5">
              <PiggyBank className="mb-2 h-5 w-5 text-amber-300" />
              <p className="text-2xl font-extrabold text-white">
                {result.breakEven ? `Mois ${result.breakEven}` : "—"}
              </p>
              <p className="text-xs text-white/50">point mort (rentabilité)</p>
            </div>
          </div>

          <div className="card flex-1 p-6">
            <h3 className="mb-2 font-semibold text-white">
              Marge cumulée vs investissement
            </h3>
            <p className="mb-4 text-xs text-white/45">
              CA additionnel 12 mois : {euro(result.totalRevenue)} · Marge :{" "}
              {euro(result.totalMargin)} · Investissement : {euro(result.totalInvest)}
            </p>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={result.months}>
                <defs>
                  <linearGradient id="cumul" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#818cf8" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="#818cf8" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.07)" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `${Math.round(v / 1000)}k€`}
                />
                <Tooltip
                  formatter={(v) => euro(Number(v))}
                  contentStyle={{
                    background: "#0c1322",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: 12,
                    color: "#fff",
                  }}
                />
                <ReferenceLine y={0} stroke="rgba(255,255,255,0.3)" strokeDasharray="4 4" />
                <Area
                  type="monotone"
                  dataKey="cumulative"
                  name="Profit cumulé"
                  stroke="#818cf8"
                  strokeWidth={2.5}
                  fill="url(#cumul)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Scénarios sauvegardés */}
      {business.roiScenarios.length > 0 && (
        <div className="card mt-5 p-6">
          <h3 className="mb-4 font-semibold text-white">Scénarios sauvegardés</h3>
          <div className="grid gap-2">
            {business.roiScenarios.map((s) => {
              const r = project(s);
              return (
                <div
                  key={s.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-white">{s.name}</p>
                    <p className="text-xs text-white/45">
                      {euro(s.monthlyInvestment)}/mois · {s.extraVisitors} visiteurs ·
                      ROI {r.roi.toFixed(0)} %
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => loadScenario(s)} className="btn-ghost px-3 py-1.5 text-xs">
                      Charger
                    </button>
                    <button
                      onClick={() => void deleteScenario(s.id)}
                      className="btn-ghost px-3 py-1.5 text-xs text-rose-300"
                      aria-label="Supprimer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

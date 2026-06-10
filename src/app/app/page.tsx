"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  Briefcase,
  Loader2,
  PlusCircle,
  Trash2,
  Trophy,
} from "lucide-react";
import type { ProspectStatusKey } from "@/lib/types";

type ProspectRow = {
  id: string;
  name: string;
  sector: string;
  city: string;
  contactName: string | null;
  status: ProspectStatusKey;
  potentialValue: number | null;
  followUpDate: string | null;
  createdAt: string;
  hasAudit: boolean;
};

type Me = {
  plan: string | null;
  planStatus: string;
  usedThisMonth: number;
  quota: number | null;
  role: string;
};

const STATUS_LABELS: Record<ProspectStatusKey, string> = {
  NOUVEAU: "Nouveau",
  AUDIT_GENERE: "Audit généré",
  RDV_PREVU: "Rendez-vous prévu",
  PROPOSITION_ENVOYEE: "Proposition envoyée",
  GAGNE: "Gagné",
  PERDU: "Perdu",
};

const STATUS_COLORS: Record<ProspectStatusKey, string> = {
  NOUVEAU: "border-white/20 bg-white/[0.06] text-white/80",
  AUDIT_GENERE: "border-indigo-400/40 bg-indigo-400/10 text-indigo-200",
  RDV_PREVU: "border-cyan-400/40 bg-cyan-400/10 text-cyan-200",
  PROPOSITION_ENVOYEE: "border-amber-400/40 bg-amber-400/10 text-amber-200",
  GAGNE: "border-emerald-400/40 bg-emerald-400/10 text-emerald-200",
  PERDU: "border-rose-400/40 bg-rose-400/10 text-rose-200",
};

const euro = (n: number) => n.toLocaleString("fr-FR") + " €";

export default function CrmDashboardPage() {
  const [prospects, setProspects] = useState<ProspectRow[] | null>(null);
  const [me, setMe] = useState<Me | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const [pRes, meRes] = await Promise.all([
        fetch("/api/businesses", { cache: "no-store" }),
        fetch("/api/me", { cache: "no-store" }),
      ]);
      if (!pRes.ok || !meRes.ok) throw new Error();
      setProspects(await pRes.json());
      setMe(await meRes.json());
    } catch {
      setError("Le chargement a échoué. Veuillez actualiser la page.");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function updateStatus(id: string, status: ProspectStatusKey) {
    setProspects(
      (rows) => rows?.map((r) => (r.id === id ? { ...r, status } : r)) ?? null,
    );
    await fetch(`/api/businesses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  }

  async function remove(id: string) {
    if (!window.confirm("Supprimer définitivement ce prospect et toutes ses analyses ?"))
      return;
    await fetch(`/api/businesses/${id}`, { method: "DELETE" });
    await load();
  }

  if (!prospects || !me) {
    return (
      <div className="flex flex-1 items-center justify-center py-32">
        {error ? (
          <p className="text-sm text-rose-200">{error}</p>
        ) : (
          <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
        )}
      </div>
    );
  }

  const pipeline = prospects
    .filter((p) => p.status !== "GAGNE" && p.status !== "PERDU")
    .reduce((s, p) => s + (p.potentialValue ?? 0), 0);
  const won = prospects.filter((p) => p.status === "GAGNE");
  const wonValue = won.reduce((s, p) => s + (p.potentialValue ?? 0), 0);

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Pipeline prospects</h1>
          <p className="mt-1 text-sm text-white/55">
            Suivez vos prospects de l&apos;audit à la signature.
          </p>
        </div>
        <Link href="/app/prospects/new" className="btn-primary">
          <PlusCircle className="h-4 w-4" />
          Nouveau prospect
        </Link>
      </div>

      {/* KPIs */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-5">
          <Briefcase className="mb-2 h-5 w-5 text-indigo-300" />
          <p className="text-2xl font-extrabold text-white">{prospects.length}</p>
          <p className="text-xs text-white/50">prospects suivis</p>
        </div>
        <div className="card p-5">
          <BarChart3 className="mb-2 h-5 w-5 text-cyan-300" />
          <p className="text-2xl font-extrabold text-white">{euro(pipeline)}</p>
          <p className="text-xs text-white/50">pipeline en cours</p>
        </div>
        <div className="card p-5">
          <Trophy className="mb-2 h-5 w-5 text-emerald-300" />
          <p className="text-2xl font-extrabold text-white">
            {won.length} <span className="text-base font-semibold text-white/50">({euro(wonValue)})</span>
          </p>
          <p className="text-xs text-white/50">affaires gagnées</p>
        </div>
        <div className="card p-5">
          <p className="text-2xl font-extrabold text-white">
            {me.usedThisMonth}
            <span className="text-base font-semibold text-white/50">
              {" "}/ {me.quota === null ? "∞" : me.quota}
            </span>
          </p>
          <p className="text-xs text-white/50">audits générés ce mois-ci</p>
        </div>
      </div>

      {/* Liste */}
      {prospects.length === 0 ? (
        <div className="card px-8 py-20 text-center">
          <h2 className="text-xl font-bold text-white">
            Créez votre premier prospect
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-white/55">
            Renseignez une entreprise locale en deux minutes : vous obtenez
            immédiatement son audit, sa stratégie et une proposition prête à
            présenter.
          </p>
          <Link href="/app/prospects/new" className="btn-primary mt-6 inline-flex">
            <PlusCircle className="h-4 w-4" />
            Créer un prospect
          </Link>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-white/40">
                <th className="px-5 py-3.5">Prospect</th>
                <th className="px-5 py-3.5">Contact</th>
                <th className="px-5 py-3.5">Statut</th>
                <th className="px-5 py-3.5">Potentiel</th>
                <th className="px-5 py-3.5">Relance</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {prospects.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-white/5 transition last:border-0 hover:bg-white/[0.03]"
                >
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/app/prospects/${p.id}`}
                      className="font-semibold text-white hover:text-indigo-300"
                    >
                      {p.name}
                    </Link>
                    <p className="text-xs text-white/45">
                      {p.sector} · {p.city}
                    </p>
                  </td>
                  <td className="px-5 py-3.5 text-white/65">
                    {p.contactName ?? "—"}
                  </td>
                  <td className="px-5 py-3.5">
                    <select
                      value={p.status}
                      onChange={(e) =>
                        void updateStatus(p.id, e.target.value as ProspectStatusKey)
                      }
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium outline-none ${STATUS_COLORS[p.status]}`}
                    >
                      {Object.entries(STATUS_LABELS).map(([k, label]) => (
                        <option key={k} value={k} className="bg-slate-900 text-white">
                          {label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-3.5 text-white/80">
                    {p.potentialValue ? euro(p.potentialValue) : "—"}
                  </td>
                  <td className="px-5 py-3.5 text-white/65">
                    {p.followUpDate
                      ? new Date(p.followUpDate).toLocaleDateString("fr-FR")
                      : "—"}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/app/prospects/${p.id}`}
                        className="btn-ghost px-3 py-1.5 text-xs"
                      >
                        Ouvrir
                      </Link>
                      <button
                        onClick={() => void remove(p.id)}
                        className="btn-ghost px-3 py-1.5 text-xs text-rose-300"
                        aria-label="Supprimer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

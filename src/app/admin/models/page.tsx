"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Cpu,
  Loader2,
  Play,
  ShieldCheck,
  Workflow,
  XCircle,
  Zap,
} from "lucide-react";

type ModelInfo = {
  id: string;
  label: string;
  generation: string;
  tier: "pro" | "flash" | "lite";
  note: string;
};

type TestResult = {
  ok: boolean;
  status: number | null;
  latencyMs: number;
  preview: string | null;
  error: string | null;
};

type CascadeAttempt = { model: string; ok: boolean; latencyMs: number; error?: string };

const TIER_STYLE: Record<string, string> = {
  pro: "border-violet-400/30 bg-violet-400/10 text-violet-200",
  flash: "border-cyan-400/30 bg-cyan-400/10 text-cyan-200",
  lite: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
};

export default function AdminModelsPage() {
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [results, setResults] = useState<Record<string, TestResult | "loading">>({});
  const [cascade, setCascade] = useState<{
    running: boolean;
    attempts: CascadeAttempt[];
    modelUsed: string | null;
    sample: string | null;
    error: string | null;
  }>({ running: false, attempts: [], modelUsed: null, sample: null, error: null });
  const [testingAll, setTestingAll] = useState(false);

  useEffect(() => {
    void fetch("/api/models")
      .then((r) => r.json())
      .then((d) => {
        setModels(d.models ?? []);
        setConfigured(Boolean(d.configured));
      })
      .catch(() => setConfigured(false));
  }, []);

  async function testModel(id: string) {
    setResults((r) => ({ ...r, [id]: "loading" }));
    try {
      const res = await fetch("/api/models/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: id }),
      });
      const body = (await res.json()) as TestResult;
      setResults((r) => ({ ...r, [id]: body }));
    } catch {
      setResults((r) => ({
        ...r,
        [id]: { ok: false, status: null, latencyMs: 0, preview: null, error: "Erreur réseau" },
      }));
    }
  }

  async function testAll() {
    setTestingAll(true);
    for (const m of models) {
      await testModel(m.id);
    }
    setTestingAll(false);
  }

  async function runCascade() {
    setCascade({ running: true, attempts: [], modelUsed: null, sample: null, error: null });
    try {
      const res = await fetch("/api/models/cascade", { method: "POST" });
      const body = await res.json();
      setCascade({
        running: false,
        attempts: body.attempts ?? [],
        modelUsed: body.modelUsed ?? null,
        sample: body.sample ?? null,
        error: body.ok ? null : (body.error ?? "Échec de la cascade"),
      });
    } catch {
      setCascade((c) => ({ ...c, running: false, error: "Erreur réseau" }));
    }
  }

  return (
    <div>
      <h1 className="flex items-center gap-3 text-2xl font-bold text-white">
        <Cpu className="h-7 w-7 text-indigo-300" />
        Moteur d&apos;analyse — diagnostic
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-white/55">
        Réservé aux administrateurs : disponibilité de chaque modèle et
        visualisation de la chaîne de bascule automatique. Tous les appels
        partent du serveur ; la clé ne transite jamais par le navigateur.
      </p>

      <div
        className={`card mt-6 mb-8 flex flex-wrap items-center gap-4 p-5 ${
          configured === false ? "border-amber-400/30" : ""
        }`}
      >
        <ShieldCheck
          className={`h-8 w-8 shrink-0 ${
            configured ? "text-emerald-300" : configured === false ? "text-amber-300" : "text-white/30"
          }`}
        />
        <div className="flex-1">
          <p className="font-semibold text-white">
            {configured === null
              ? "Vérification de la configuration…"
              : configured
                ? "Clé du moteur d'analyse détectée côté serveur"
                : "Clé du moteur d'analyse absente de la configuration serveur"}
          </p>
          <p className="text-sm text-white/50">
            Sans clé valide, les générations basculent sur le moteur local de secours.
          </p>
        </div>
        <button
          onClick={testAll}
          disabled={testingAll || models.length === 0}
          className="btn-primary shrink-0"
        >
          {testingAll ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Zap className="h-4 w-4" />
          )}
          Tester les {models.length || 7} modèles
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {models.map((m, i) => {
          const r = results[m.id];
          return (
            <div key={m.id} className="card card-hover p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">{m.label}</p>
                  <p className="font-mono text-xs text-white/40">{m.id}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="chip border-white/10 text-white/45">#{i + 1}</span>
                  <span className={`chip ${TIER_STYLE[m.tier]}`}>{m.tier}</span>
                </div>
              </div>
              <p className="mt-2 text-sm text-white/50">{m.note}</p>
              <div className="mt-4 flex items-center justify-between gap-3">
                <button
                  onClick={() => void testModel(m.id)}
                  disabled={r === "loading"}
                  className="btn-ghost px-4 py-2 text-xs"
                >
                  {r === "loading" ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Play className="h-3.5 w-3.5" />
                  )}
                  Tester
                </button>
                {r && r !== "loading" && (
                  <span
                    className={`chip ${
                      r.ok
                        ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
                        : "border-rose-400/30 bg-rose-400/10 text-rose-200"
                    }`}
                  >
                    {r.ok ? (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5" />
                    )}
                    {r.ok ? `OK · ${r.latencyMs} ms` : `Échec${r.status ? ` · HTTP ${r.status}` : ""}`}
                  </span>
                )}
              </div>
              {r && r !== "loading" && (r.preview || r.error) && (
                <p
                  className={`mt-3 rounded-lg border px-3 py-2 text-xs leading-relaxed ${
                    r.ok
                      ? "border-white/10 bg-white/[0.03] text-white/60"
                      : "border-rose-400/20 bg-rose-500/5 text-rose-200/80"
                  }`}
                >
                  {r.ok ? r.preview : r.error}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="card mt-8 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
              <Workflow className="h-5 w-5 text-indigo-300" />
              Test de la bascule automatique
            </h2>
            <p className="mt-1 text-sm text-white/50">
              Lance une génération réelle : chaque modèle est essayé dans
              l&apos;ordre jusqu&apos;au premier succès.
            </p>
          </div>
          <button onClick={runCascade} disabled={cascade.running} className="btn-primary">
            {cascade.running ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            Lancer
          </button>
        </div>

        {(cascade.attempts.length > 0 || cascade.error) && (
          <div className="mt-5 grid gap-2">
            {cascade.attempts.map((a, i) => (
              <div
                key={i}
                className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-2.5 text-sm ${
                  a.ok
                    ? "border-emerald-400/25 bg-emerald-400/5"
                    : "border-white/10 bg-white/[0.02]"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  {a.ok ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                  ) : (
                    <XCircle className="h-4 w-4 text-rose-300" />
                  )}
                  <span className="font-mono text-white/80">{a.model}</span>
                </span>
                <span className="text-xs text-white/45">
                  {a.ok ? `Succès · ${a.latencyMs} ms` : (a.error ?? "Échec")}
                </span>
              </div>
            ))}
            {cascade.modelUsed && (
              <p className="mt-2 text-sm text-emerald-200">
                ✓ Réponse servie par <span className="font-mono">{cascade.modelUsed}</span>
                {cascade.sample ? ` — « ${cascade.sample} »` : ""}
              </p>
            )}
            {cascade.error && (
              <p className="mt-2 text-sm text-amber-200">{cascade.error}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

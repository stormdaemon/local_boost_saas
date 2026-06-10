import "server-only";

/**
 * Intégration Gemini — STRICTEMENT côté serveur.
 *
 * La clé GEMINI_API_KEY n'est lue que depuis process.env, jamais renvoyée
 * au client, jamais loggée, jamais persistée. Les messages d'erreur sont
 * passés au filtre `sanitize` par défense en profondeur.
 */

export type GeminiModelInfo = {
  id: string;
  label: string;
  generation: string;
  tier: "pro" | "flash" | "lite";
  note: string;
};

/** Ordre = chaîne de fallback automatique (du plus récent au plus éprouvé). */
export const GEMINI_MODELS: GeminiModelInfo[] = [
  {
    id: "gemini-3.5-flash",
    label: "Gemini 3.5 Flash",
    generation: "3.5",
    tier: "flash",
    note: "Dernière génération, rapide et polyvalent.",
  },
  {
    id: "gemini-3-flash-preview",
    label: "Gemini 3 Flash Preview",
    generation: "3.0",
    tier: "flash",
    note: "Préversion de la génération 3.",
  },
  {
    id: "gemini-3.1-pro-preview",
    label: "Gemini 3.1 Pro Preview",
    generation: "3.1",
    tier: "pro",
    note: "Raisonnement avancé (préversion).",
  },
  {
    id: "gemini-3.1-flash-lite",
    label: "Gemini 3.1 Flash Lite",
    generation: "3.1",
    tier: "lite",
    note: "Très faible latence, coût minimal.",
  },
  {
    id: "gemini-2.5-pro",
    label: "Gemini 2.5 Pro",
    generation: "2.5",
    tier: "pro",
    note: "Génération 2.5 — raisonnement approfondi.",
  },
  {
    id: "gemini-2.5-flash",
    label: "Gemini 2.5 Flash",
    generation: "2.5",
    tier: "flash",
    note: "Génération 2.5 — équilibre vitesse/qualité.",
  },
  {
    id: "gemini-2.5-flash-lite",
    label: "Gemini 2.5 Flash Lite",
    generation: "2.5",
    tier: "lite",
    note: "Génération 2.5 — le plus économique.",
  },
];

const BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

function getKey(): string | null {
  const k = process.env.GEMINI_API_KEY;
  return k && k.trim().length > 0 ? k.trim() : null;
}

/** Seule information autorisée à sortir : la clé existe-t-elle, oui ou non. */
export function isGeminiConfigured(): boolean {
  return getKey() !== null;
}

/** Masque toute occurrence accidentelle de la clé dans un texte d'erreur. */
function sanitize(text: string): string {
  const k = getKey();
  if (!k) return text;
  return text.split(k).join("[CLÉ MASQUÉE]");
}

export type ModelCallResult = {
  ok: boolean;
  model: string;
  latencyMs: number;
  status?: number;
  text?: string;
  error?: string;
};

export async function callGemini(
  model: string,
  prompt: string,
  opts: { json?: boolean; timeoutMs?: number } = {},
): Promise<ModelCallResult> {
  const key = getKey();
  if (!key) {
    return {
      ok: false,
      model,
      latencyMs: 0,
      error: "GEMINI_API_KEY absente du fichier .env",
    };
  }
  const started = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? 60_000);
  try {
    const res = await fetch(`${BASE_URL}/${encodeURIComponent(model)}:generateContent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": key,
      },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.8,
          ...(opts.json ? { responseMimeType: "application/json" } : {}),
        },
      }),
      signal: controller.signal,
      cache: "no-store",
    });
    const latencyMs = Date.now() - started;
    if (!res.ok) {
      let detail = `HTTP ${res.status}`;
      try {
        const body = (await res.json()) as { error?: { message?: string } };
        if (body?.error?.message) detail = body.error.message;
      } catch {
        // corps non JSON : on garde le statut HTTP
      }
      return { ok: false, model, latencyMs, status: res.status, error: sanitize(detail) };
    }
    const body = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text =
      body?.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
    if (!text.trim()) {
      return {
        ok: false,
        model,
        latencyMs,
        status: res.status,
        error: "Réponse vide du modèle",
      };
    }
    return { ok: true, model, latencyMs, status: res.status, text };
  } catch (e) {
    const latencyMs = Date.now() - started;
    const msg =
      e instanceof Error
        ? e.name === "AbortError"
          ? "Délai d'attente dépassé"
          : e.message
        : "Erreur réseau inconnue";
    return { ok: false, model, latencyMs, error: sanitize(msg) };
  } finally {
    clearTimeout(timer);
  }
}

export type FallbackAttempt = {
  model: string;
  ok: boolean;
  latencyMs: number;
  error?: string;
};

export type FallbackOutcome<T> =
  | { ok: true; data: T; modelUsed: string; attempts: FallbackAttempt[] }
  | { ok: false; attempts: FallbackAttempt[] };

/**
 * Essaie chaque modèle de la chaîne jusqu'à obtenir un JSON valide.
 * Retourne { ok: false } si tous les modèles échouent (l'appelant bascule
 * alors sur le générateur local hors-ligne).
 */
export async function generateJsonWithFallback<T>(
  prompt: string,
  opts: { preferredModel?: string } = {},
): Promise<FallbackOutcome<T>> {
  if (!isGeminiConfigured()) {
    return {
      ok: false,
      attempts: [
        {
          model: "(aucun appel)",
          ok: false,
          latencyMs: 0,
          error: "GEMINI_API_KEY non configurée dans .env",
        },
      ],
    };
  }
  const order = GEMINI_MODELS.map((m) => m.id);
  if (opts.preferredModel && order.includes(opts.preferredModel)) {
    order.splice(order.indexOf(opts.preferredModel), 1);
    order.unshift(opts.preferredModel);
  }
  const attempts: FallbackAttempt[] = [];
  for (const model of order) {
    const r = await callGemini(model, prompt, { json: true });
    if (r.ok && r.text) {
      const parsed = tryParseJson<T>(r.text);
      if (parsed !== null) {
        attempts.push({ model, ok: true, latencyMs: r.latencyMs });
        return { ok: true, data: parsed, modelUsed: model, attempts };
      }
      attempts.push({
        model,
        ok: false,
        latencyMs: r.latencyMs,
        error: "JSON invalide dans la réponse",
      });
      continue;
    }
    attempts.push({ model, ok: false, latencyMs: r.latencyMs, error: r.error });
  }
  return { ok: false, attempts };
}

function tryParseJson<T>(text: string): T | null {
  let t = text.trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) t = fence[1].trim();
  try {
    return JSON.parse(t) as T;
  } catch {
    // tentative de récupération : extraire le premier objet JSON complet
  }
  const a = t.indexOf("{");
  const b = t.lastIndexOf("}");
  if (a >= 0 && b > a) {
    try {
      return JSON.parse(t.slice(a, b + 1)) as T;
    } catch {
      return null;
    }
  }
  return null;
}

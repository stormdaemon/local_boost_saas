import { NextRequest, NextResponse } from "next/server";
import { GEMINI_MODELS, callGemini, isGeminiConfigured } from "@/lib/gemini";
import { requireProfileApi } from "@/lib/auth";
import { publicError } from "@/lib/labels";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const TEST_PROMPT =
  'Tu es testé par LocalBoost Command Center. Réponds en une seule phrase courte en français confirmant que tu es opérationnel, en citant ton nom de modèle si tu le connais.';

export async function POST(req: NextRequest) {
  const profile = await requireProfileApi();
  if (!profile || profile.role !== "ADMIN") {
    return NextResponse.json({ error: publicError("forbidden") }, { status: 403 });
  }
  let model = "";
  try {
    const body = await req.json();
    if (typeof body?.model === "string") model = body.model;
  } catch {
    // validé ci-dessous
  }
  if (!GEMINI_MODELS.some((m) => m.id === model)) {
    return NextResponse.json(
      { error: "Modèle inconnu. Utilisez un identifiant de la liste /api/models." },
      { status: 400 },
    );
  }
  if (!isGeminiConfigured()) {
    return NextResponse.json({
      model,
      ok: false,
      latencyMs: 0,
      error: "GEMINI_API_KEY non configurée dans .env",
    });
  }
  const r = await callGemini(model, TEST_PROMPT, { timeoutMs: 45_000 });
  // Réponse volontairement minimale : statut, latence, aperçu du texte.
  // Aucune information liée à la clé API n'est renvoyée.
  return NextResponse.json({
    model,
    ok: r.ok,
    status: r.status ?? null,
    latencyMs: r.latencyMs,
    preview: r.text ? r.text.trim().slice(0, 280) : null,
    error: r.error ?? null,
  });
}

import { NextResponse } from "next/server";
import { generateJsonWithFallback, isGeminiConfigured } from "@/lib/gemini";
import { requireProfileApi } from "@/lib/auth";
import { publicError } from "@/lib/labels";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Démonstration de la chaîne de fallback automatique : on lance une
 * génération JSON et on renvoie la liste des tentatives modèle par modèle.
 */
export async function POST() {
  const profile = await requireProfileApi();
  if (!profile || profile.role !== "ADMIN") {
    return NextResponse.json({ error: publicError("forbidden") }, { status: 403 });
  }
  if (!isGeminiConfigured()) {
    return NextResponse.json({
      ok: false,
      modelUsed: null,
      attempts: [],
      error: "GEMINI_API_KEY non configurée dans .env",
    });
  }
  const result = await generateJsonWithFallback<{ message: string }>(
    'Réponds uniquement avec ce JSON : {"message": "<une phrase courte et enthousiaste en français sur le marketing local>"}',
  );
  if (!result.ok) {
    return NextResponse.json({
      ok: false,
      modelUsed: null,
      attempts: result.attempts,
      error: "Tous les modèles de la chaîne ont échoué.",
    });
  }
  return NextResponse.json({
    ok: true,
    modelUsed: result.modelUsed,
    attempts: result.attempts,
    sample: result.data?.message ?? null,
  });
}

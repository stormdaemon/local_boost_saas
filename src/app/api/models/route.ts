import { NextResponse } from "next/server";
import { GEMINI_MODELS, isGeminiConfigured } from "@/lib/gemini";
import { requireProfileApi } from "@/lib/auth";
import { publicError } from "@/lib/labels";

export const dynamic = "force-dynamic";

export async function GET() {
  const profile = await requireProfileApi();
  if (!profile || profile.role !== "ADMIN") {
    return NextResponse.json({ error: publicError("forbidden") }, { status: 403 });
  }
  return NextResponse.json({
    // Métadonnées publiques uniquement — la clé API ne quitte jamais le serveur.
    configured: isGeminiConfigured(),
    models: GEMINI_MODELS,
  });
}

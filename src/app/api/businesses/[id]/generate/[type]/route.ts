import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateJsonWithFallback } from "@/lib/gemini";
import { computeScores } from "@/lib/scoring";
import { requireProfileApi } from "@/lib/auth";
import { getOwnedBusiness } from "@/lib/ownership";
import { getEntitlements } from "@/lib/entitlements";
import { rateLimit } from "@/lib/rate-limit";
import { publicError } from "@/lib/labels";
import { logError } from "@/lib/errors";
import {
  auditPrompt,
  calendarPrompt,
  competitorsPrompt,
  pitchPrompt,
  proposalPrompt,
  strategyPrompt,
  type PromptBusiness,
} from "@/lib/prompts";
import {
  buildLocalAudit,
  buildLocalCalendar,
  buildLocalCompetitors,
  buildLocalPitch,
  buildLocalStrategy,
} from "@/lib/fallback";
import { buildLocalProposal } from "@/lib/fallback-proposal";
import type { Scores } from "@/lib/types";
import type { AssetType } from "@/generated/prisma/enums";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

type GenSpec = {
  assetType: AssetType;
  prompt: (b: PromptBusiness, scores: Scores) => string;
  local: (b: PromptBusiness, scores: Scores) => unknown;
  validate: (data: unknown) => boolean;
  finalize?: (data: Record<string, unknown>, scores: Scores) => unknown;
};

const isArr = (v: unknown) => Array.isArray(v) && v.length > 0;
const isStr = (v: unknown) => typeof v === "string" && v.trim().length > 0;
const obj = (d: unknown) => d as Record<string, unknown>;

const SPECS: Record<string, GenSpec> = {
  audit: {
    assetType: "AUDIT",
    prompt: auditPrompt,
    local: buildLocalAudit,
    validate: (d) =>
      isStr(obj(d).summary) &&
      isArr(obj(d).strengths) &&
      isArr(obj(d).weaknesses) &&
      isArr(obj(d).priorities),
    // Les scores sont toujours calculés côté serveur.
    finalize: (d, scores) => ({ ...d, scores }),
  },
  strategy: {
    assetType: "SEO_STRATEGY",
    prompt: (b) => strategyPrompt(b),
    local: (b) => buildLocalStrategy(b),
    validate: (d) =>
      isStr(obj(d).vision) && isArr(obj(d).keywords) && isArr(obj(d).pillars),
  },
  calendar: {
    assetType: "CALENDAR",
    prompt: (b) => calendarPrompt(b),
    local: (b) => buildLocalCalendar(b),
    validate: (d) => isArr(obj(d).weeks),
  },
  pitch: {
    assetType: "PITCH",
    prompt: (b) => pitchPrompt(b),
    local: (b) => buildLocalPitch(b),
    validate: (d) =>
      isStr(obj(d).elevator) && isStr(obj(d).hook) && isArr(obj(d).objections),
  },
  competitors: {
    assetType: "COMPETITORS",
    prompt: competitorsPrompt,
    local: buildLocalCompetitors,
    validate: (d) => isArr(obj(d).competitors) && isStr(obj(d).summary),
  },
  proposal: {
    assetType: "PROPOSAL",
    prompt: proposalPrompt,
    local: (b) => buildLocalProposal(b),
    validate: (d) =>
      isStr(obj(d).executiveSummary) &&
      Array.isArray(obj(d).offers) &&
      (obj(d).offers as unknown[]).length === 3 &&
      isArr(obj(d).objections) &&
      isArr(obj(d).nextSteps),
  },
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; type: string }> },
) {
  const profile = await requireProfileApi();
  if (!profile) {
    return NextResponse.json({ error: publicError("auth") }, { status: 401 });
  }

  const { id, type } = await params;
  const spec = SPECS[type];
  if (!spec) {
    return NextResponse.json({ error: publicError("notfound") }, { status: 404 });
  }

  const owned = await getOwnedBusiness(id, profile);
  if (!owned.ok) {
    return NextResponse.json(
      { error: publicError(owned.reason) },
      { status: owned.reason === "notfound" ? 404 : 403 },
    );
  }
  const business = owned.business;

  // Accès réservé aux abonnements actifs (les admins peuvent toujours tester).
  const ent = await getEntitlements(profile.id);
  if (profile.role !== "ADMIN") {
    if (!ent.isActive) {
      return NextResponse.json(
        { error: "Activez votre abonnement pour lancer des analyses." },
        { status: 402 },
      );
    }
    if (spec.assetType === "AUDIT" && !ent.canCreateAudit) {
      return NextResponse.json({ error: publicError("quota") }, { status: 429 });
    }
  }

  if (!rateLimit(`generate:${profile.id}`, 10, 60_000)) {
    return NextResponse.json({ error: publicError("ratelimit") }, { status: 429 });
  }

  try {
    const scores = computeScores(business);
    const prompt = spec.prompt(business, scores);
    const result = await generateJsonWithFallback<Record<string, unknown>>(prompt);

    let data: unknown;
    let modelUsed: string;
    if (result.ok && spec.validate(result.data)) {
      data = spec.finalize ? spec.finalize(result.data, scores) : result.data;
      modelUsed = result.modelUsed;
    } else {
      const local = spec.local(business, scores);
      data = spec.finalize ? spec.finalize(obj(local), scores) : local;
      modelUsed = "local-fallback";
    }

    const [asset] = await prisma.$transaction([
      prisma.generatedAsset.create({
        data: {
          businessId: id,
          type: spec.assetType,
          data: data as object,
          modelUsed,
        },
      }),
      prisma.usageLog.create({
        data: {
          userId: profile.id,
          kind: spec.assetType,
          modelUsed,
          businessId: id,
        },
      }),
      ...(spec.assetType === "AUDIT" && business.status === "NOUVEAU"
        ? [
            prisma.business.update({
              where: { id },
              data: { status: "AUDIT_GENERE" },
            }),
          ]
        : []),
    ]);

    return NextResponse.json({
      id: asset.id,
      type: asset.type,
      data: asset.data,
      modelUsed: asset.modelUsed,
      createdAt: asset.createdAt.toISOString(),
    });
  } catch (e) {
    await logError(`generate.${type}`, e);
    return NextResponse.json({ error: publicError("service") }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { requireProfileApi } from "@/lib/auth";
import { getEntitlements } from "@/lib/entitlements";
import { publicError } from "@/lib/labels";

export const dynamic = "force-dynamic";

export async function GET() {
  const profile = await requireProfileApi();
  if (!profile) {
    return NextResponse.json({ error: publicError("auth") }, { status: 401 });
  }
  const ent = await getEntitlements(profile.id);
  return NextResponse.json({
    email: profile.email,
    role: profile.role,
    plan: ent.tier,
    planStatus: ent.isActive ? "active" : "inactive",
    usedThisMonth: ent.usedThisMonth,
    quota: ent.quota,
    canCreateAudit: ent.canCreateAudit,
    features: ent.features,
    agency: {
      agencyName: profile.agencyName,
      logoUrl: profile.logoUrl,
      primaryColor: profile.primaryColor,
      website: profile.website,
      contactEmail: profile.contactEmail,
      phone: profile.phone,
      signature: profile.signature,
    },
  });
}

import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { getEntitlements } from "@/lib/entitlements";
import { AppChrome } from "@/components/app-chrome";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  const ent = await getEntitlements(profile.id);
  const isAdmin = profile.role === "ADMIN";

  return (
    <AppChrome
      email={profile.email}
      isAdmin={isAdmin}
      planActive={ent.isActive || isAdmin}
      planTier={ent.tier}
    >
      {children}
    </AppChrome>
  );
}

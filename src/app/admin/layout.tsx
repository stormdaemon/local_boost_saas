import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Cpu, LayoutDashboard, ShieldCheck } from "lucide-react";
import { getProfile } from "@/lib/auth";

export const metadata = { robots: { index: false, follow: false } };

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "ADMIN") redirect("/app");

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-amber-400/20 bg-[#0a0904]/90 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span className="shrink-0 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 p-2">
              <ShieldCheck className="h-4 w-4 text-white" />
            </span>
            <span className="hidden font-bold text-white lg:inline">
              Administration <span className="text-amber-300">ProspectPilot</span>
            </span>
          </div>
          <nav className="flex shrink-0 items-center gap-1 text-sm">
            <Link
              href="/admin"
              className="flex items-center gap-2 rounded-lg px-3 py-2 font-medium text-white/65 transition hover:bg-white/[0.06] hover:text-white"
            >
              <LayoutDashboard className="h-4 w-4 shrink-0" />
              <span className="sr-only sm:not-sr-only">Vue d&apos;ensemble</span>
            </Link>
            <Link
              href="/admin/models"
              className="flex items-center gap-2 rounded-lg px-3 py-2 font-medium text-white/65 transition hover:bg-white/[0.06] hover:text-white"
            >
              <Cpu className="h-4 w-4 shrink-0" />
              <span className="sr-only sm:not-sr-only">Moteur d&apos;analyse</span>
            </Link>
            <Link
              href="/app"
              className="btn-ghost ml-2 px-3 py-2 text-xs"
            >
              <ArrowLeft className="h-4 w-4 shrink-0" />
              <span className="sr-only sm:not-sr-only">Espace client</span>
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        {children}
      </main>
    </div>
  );
}

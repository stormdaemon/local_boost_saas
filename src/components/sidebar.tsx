"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Compass,
  FileSignature,
  FileText,
  Gauge,
  Megaphone,
  MonitorPlay,
  Search,
  Swords,
  TrendingUp,
} from "lucide-react";

const NAV = [
  { slug: "", label: "Audit & scores", icon: Gauge },
  { slug: "/strategy", label: "Stratégie SEO", icon: Search },
  { slug: "/roi", label: "Simulateur ROI", icon: TrendingUp },
  { slug: "/competitors", label: "Concurrence", icon: Swords },
  { slug: "/calendar", label: "Calendrier", icon: CalendarDays },
  { slug: "/pitch", label: "Pitch commercial", icon: Megaphone },
  { slug: "/proposal", label: "Proposition", icon: FileSignature },
  { slug: "/presentation", label: "Présentation", icon: MonitorPlay },
  { slug: "/report", label: "Rapport final", icon: FileText },
];

function MobileNav({
  business,
  base,
  pathname,
}: {
  business: { name: string; sector: string; city: string };
  base: string;
  pathname: string;
}) {
  const activeRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [pathname]);

  return (
    <div className="no-print sticky top-14 z-30 border-b border-white/10 bg-[#060a12]/95 backdrop-blur md:hidden">
      <p className="truncate px-4 pt-2.5 text-xs font-semibold text-white">
        {business.name}{" "}
        <span className="font-normal text-white/40">
          · {business.sector} · {business.city}
        </span>
      </p>
      <nav className="scrollbar-none flex items-center gap-1 overflow-x-auto px-3 py-2">
        <Link
          href="/app"
          className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-white/10 px-2.5 py-1.5 text-xs font-medium text-white/55 transition hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Prospects
        </Link>
        {NAV.map((item) => {
          const href = `${base}${item.slug}`;
          const active = pathname === href;
          return (
            <Link
              key={item.slug}
              href={href}
              ref={active ? activeRef : undefined}
              className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                active
                  ? "bg-gradient-to-r from-indigo-500/25 to-violet-500/15 text-white shadow-[inset_0_0_0_1px_rgba(129,140,248,0.35)]"
                  : "text-white/55 hover:bg-white/[0.06] hover:text-white"
              }`}
            >
              <item.icon className="h-3.5 w-3.5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function Sidebar({
  business,
}: {
  business: { id: string; name: string; sector: string; city: string };
}) {
  const pathname = usePathname();
  const base = `/app/prospects/${business.id}`;

  return (
    <>
      <MobileNav business={business} base={base} pathname={pathname} />

      <aside className="no-print sticky top-14 hidden h-[calc(100vh-3.5rem)] w-64 shrink-0 flex-col border-r border-white/10 bg-white/[0.02] px-4 py-6 md:flex">
        <Link href="/app" className="mb-8 flex items-center gap-2.5 px-2">
          <span className="rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 p-2">
            <Compass className="h-4 w-4 text-white" />
          </span>
          <span className="font-bold text-white">ProspectPilot</span>
        </Link>

        <div className="mb-6 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3">
          <p className="truncate font-semibold text-white">{business.name}</p>
          <p className="truncate text-xs text-white/45">
            {business.sector} · {business.city}
          </p>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
          {NAV.map((item) => {
            const href = `${base}${item.slug}`;
            const active = pathname === href;
            return (
              <Link
                key={item.slug}
                href={href}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-gradient-to-r from-indigo-500/25 to-violet-500/15 text-white shadow-[inset_0_0_0_1px_rgba(129,140,248,0.35)]"
                    : "text-white/55 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex flex-col gap-1 border-t border-white/10 pt-4">
          <Link
            href="/app"
            className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-white/55 transition hover:bg-white/[0.06] hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Tous les prospects
          </Link>
        </div>
      </aside>
    </>
  );
}

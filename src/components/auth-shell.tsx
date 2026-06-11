import Link from "next/link";
import { Compass } from "lucide-react";
import type { ReactNode } from "react";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-clip">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[800px] -translate-x-1/2 rounded-full bg-indigo-600/20 blur-3xl" />
      <header className="relative z-10 mx-auto flex w-full max-w-md items-center justify-center px-6 py-8">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 p-2">
            <Compass className="h-5 w-5 text-white" />
          </span>
          <span className="text-lg font-bold text-white">
            ProspectPilot <span className="gradient-text">Local</span>
          </span>
        </Link>
      </header>
      <main className="relative z-10 mx-auto w-full max-w-md flex-1 px-6 pb-16">
        <div className="card p-6 sm:p-8">
          <h1 className="text-xl font-bold text-white">{title}</h1>
          <p className="mt-1 text-sm text-white/55">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
      </main>
    </div>
  );
}

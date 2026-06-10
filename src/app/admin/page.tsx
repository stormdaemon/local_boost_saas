import {
  AlertTriangle,
  BadgeEuro,
  Cpu,
  FileText,
  Users,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { currentMonthRange } from "@/lib/plans";

export const dynamic = "force-dynamic";

const euro = (n: number) =>
  n.toLocaleString("fr-FR", { maximumFractionDigits: 2 }) + " €";

export default async function AdminDashboardPage() {
  const { start, end } = currentMonthRange();

  const [
    userCount,
    activeSubs,
    subsByPlan,
    auditsThisMonth,
    totalAssets,
    payments,
    paymentSum,
    recentErrors,
    usageByModel,
    recentUsers,
    contactMessages,
  ] = await Promise.all([
    prisma.profile.count(),
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
    prisma.subscription.groupBy({
      by: ["plan"],
      where: { status: "ACTIVE" },
      _count: true,
    }),
    prisma.usageLog.count({
      where: { kind: "AUDIT", createdAt: { gte: start, lt: end } },
    }),
    prisma.generatedAsset.count(),
    prisma.payment.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
    prisma.payment.aggregate({ _sum: { amount: true } }),
    prisma.errorLog.findMany({ orderBy: { createdAt: "desc" }, take: 12 }),
    prisma.usageLog.groupBy({ by: ["modelUsed"], _count: true }),
    prisma.profile.findMany({
      orderBy: { createdAt: "desc" },
      take: 12,
      include: { subscription: true, _count: { select: { businesses: true } } },
    }),
    prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  const planCount = (plan: string) =>
    subsByPlan.find((s) => s.plan === plan)?._count ?? 0;

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Vue d&apos;ensemble</h1>
      <p className="mt-1 text-sm text-white/55">
        Statistiques globales de la plateforme.
      </p>

      {/* KPIs */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-5">
          <Users className="mb-2 h-5 w-5 text-indigo-300" />
          <p className="text-2xl font-extrabold text-white">{userCount}</p>
          <p className="text-xs text-white/50">utilisateurs inscrits</p>
        </div>
        <div className="card p-5">
          <BadgeEuro className="mb-2 h-5 w-5 text-emerald-300" />
          <p className="text-2xl font-extrabold text-white">{activeSubs}</p>
          <p className="text-xs text-white/50">
            abonnements actifs · Solo {planCount("SOLO")} / Agence {planCount("AGENCE")} / Pro {planCount("PRO")}
          </p>
        </div>
        <div className="card p-5">
          <FileText className="mb-2 h-5 w-5 text-cyan-300" />
          <p className="text-2xl font-extrabold text-white">
            {auditsThisMonth}
            <span className="text-base font-semibold text-white/50"> ce mois</span>
          </p>
          <p className="text-xs text-white/50">{totalAssets} analyses générées au total</p>
        </div>
        <div className="card p-5">
          <BadgeEuro className="mb-2 h-5 w-5 text-amber-300" />
          <p className="text-2xl font-extrabold text-white">
            {euro(paymentSum._sum.amount ?? 0)}
          </p>
          <p className="text-xs text-white/50">paiements encaissés (PayPal)</p>
        </div>
      </div>

      {/* Utilisateurs */}
      <div className="card mt-6 overflow-x-auto">
        <div className="border-b border-white/10 px-5 py-4">
          <h2 className="flex items-center gap-2 font-semibold text-white">
            <Users className="h-4 w-4 text-indigo-300" />
            Derniers utilisateurs
          </h2>
        </div>
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-white/40">
              <th className="px-5 py-3">Email</th>
              <th className="px-5 py-3">Rôle</th>
              <th className="px-5 py-3">Plan</th>
              <th className="px-5 py-3">Statut</th>
              <th className="px-5 py-3">Prospects</th>
              <th className="px-5 py-3">Inscrit le</th>
            </tr>
          </thead>
          <tbody className="text-white/70">
            {recentUsers.map((u) => (
              <tr key={u.id} className="border-b border-white/5 last:border-0">
                <td className="px-5 py-3 font-medium text-white">{u.email}</td>
                <td className="px-5 py-3">
                  {u.role === "ADMIN" ? (
                    <span className="chip border-amber-400/40 bg-amber-400/10 text-amber-200">
                      Admin
                    </span>
                  ) : (
                    "Client"
                  )}
                </td>
                <td className="px-5 py-3">{u.subscription?.plan ?? "—"}</td>
                <td className="px-5 py-3">{u.subscription?.status ?? "NONE"}</td>
                <td className="px-5 py-3">{u._count.businesses}</td>
                <td className="px-5 py-3">
                  {u.createdAt.toLocaleDateString("fr-FR")}
                </td>
              </tr>
            ))}
            {recentUsers.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-6 text-center text-white/40">
                  Aucun utilisateur pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Paiements */}
        <div className="card overflow-x-auto">
          <div className="border-b border-white/10 px-5 py-4">
            <h2 className="flex items-center gap-2 font-semibold text-white">
              <BadgeEuro className="h-4 w-4 text-emerald-300" />
              Derniers paiements PayPal
            </h2>
          </div>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-white/40">
                <th className="px-5 py-3">Montant</th>
                <th className="px-5 py-3">Statut</th>
                <th className="px-5 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="text-white/70">
              {payments.map((p) => (
                <tr key={p.id} className="border-b border-white/5 last:border-0">
                  <td className="px-5 py-3 font-medium text-white">
                    {euro(p.amount)} {p.currency !== "EUR" ? p.currency : ""}
                  </td>
                  <td className="px-5 py-3">{p.status}</td>
                  <td className="px-5 py-3">
                    {p.createdAt.toLocaleString("fr-FR")}
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-5 py-6 text-center text-white/40">
                    Aucun paiement enregistré.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Consommation IA */}
        <div className="card overflow-x-auto">
          <div className="border-b border-white/10 px-5 py-4">
            <h2 className="flex items-center gap-2 font-semibold text-white">
              <Cpu className="h-4 w-4 text-cyan-300" />
              Consommation du moteur d&apos;analyse
            </h2>
          </div>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-white/40">
                <th className="px-5 py-3">Moteur</th>
                <th className="px-5 py-3">Générations</th>
              </tr>
            </thead>
            <tbody className="text-white/70">
              {usageByModel
                .sort((a, b) => b._count - a._count)
                .map((u) => (
                  <tr
                    key={u.modelUsed ?? "?"}
                    className="border-b border-white/5 last:border-0"
                  >
                    <td className="px-5 py-3 font-mono text-xs text-white">
                      {u.modelUsed ?? "inconnu"}
                    </td>
                    <td className="px-5 py-3">{u._count}</td>
                  </tr>
                ))}
              {usageByModel.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-5 py-6 text-center text-white/40">
                    Aucune génération pour le moment.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Erreurs */}
      <div className="card mt-6 overflow-x-auto">
        <div className="border-b border-white/10 px-5 py-4">
          <h2 className="flex items-center gap-2 font-semibold text-white">
            <AlertTriangle className="h-4 w-4 text-rose-300" />
            Erreurs techniques récentes
          </h2>
        </div>
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-white/40">
              <th className="px-5 py-3">Domaine</th>
              <th className="px-5 py-3">Message</th>
              <th className="px-5 py-3">Date</th>
            </tr>
          </thead>
          <tbody className="text-white/70">
            {recentErrors.map((e) => (
              <tr key={e.id} className="border-b border-white/5 last:border-0">
                <td className="px-5 py-3 font-mono text-xs text-amber-200">{e.scope}</td>
                <td className="max-w-md truncate px-5 py-3" title={e.message}>
                  {e.message}
                </td>
                <td className="whitespace-nowrap px-5 py-3">
                  {e.createdAt.toLocaleString("fr-FR")}
                </td>
              </tr>
            ))}
            {recentErrors.length === 0 && (
              <tr>
                <td colSpan={3} className="px-5 py-6 text-center text-white/40">
                  Aucune erreur enregistrée. Tout roule.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Messages de contact */}
      {contactMessages.length > 0 && (
        <div className="card mt-6 overflow-x-auto">
          <div className="border-b border-white/10 px-5 py-4">
            <h2 className="font-semibold text-white">Messages de contact</h2>
          </div>
          <table className="w-full min-w-[640px] text-left text-sm">
            <tbody className="text-white/70">
              {contactMessages.map((m) => (
                <tr key={m.id} className="border-b border-white/5 last:border-0">
                  <td className="px-5 py-3 font-medium text-white">{m.name}</td>
                  <td className="px-5 py-3">{m.email}</td>
                  <td className="max-w-md truncate px-5 py-3" title={m.message}>
                    {m.message}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3">
                    {m.createdAt.toLocaleDateString("fr-FR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

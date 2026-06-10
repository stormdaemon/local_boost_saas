export type RoiParams = {
  monthlyInvestment: number;
  extraVisitors: number;
  conversionRate: number;
  closeRate: number;
  avgTicket: number;
  marginRate: number;
  purchasesPerYear: number;
};

export type RoiProjection = {
  months: {
    month: string;
    revenue: number;
    margin: number;
    profit: number;
    cumulative: number;
  }[];
  newClientsPerMonth: number;
  totalInvest: number;
  totalMargin: number;
  totalRevenue: number;
  roi: number;
  breakEven: number | null;
};

/** Projection de retour sur investissement sur 12 mois (calcul pur, partagé). */
export function projectRoi(p: RoiParams): RoiProjection {
  const newClientsPerMonth =
    p.extraVisitors * (p.conversionRate / 100) * (p.closeRate / 100);
  const monthlyValuePerClient = (p.avgTicket * p.purchasesPerYear) / 12;
  let cumulative = 0;
  let breakEven: number | null = null;
  const months = Array.from({ length: 12 }, (_, i) => {
    const m = i + 1;
    const activeClients = newClientsPerMonth * m;
    const revenue = activeClients * monthlyValuePerClient;
    const margin = revenue * (p.marginRate / 100);
    const profit = margin - p.monthlyInvestment;
    cumulative += profit;
    if (breakEven === null && cumulative >= 0 && p.monthlyInvestment > 0) breakEven = m;
    return { month: `M${m}`, revenue, margin, profit, cumulative };
  });
  const totalInvest = p.monthlyInvestment * 12;
  const totalMargin = months.reduce((s, m) => s + m.margin, 0);
  const totalRevenue = months.reduce((s, m) => s + m.revenue, 0);
  const roi = totalInvest > 0 ? ((totalMargin - totalInvest) / totalInvest) * 100 : 0;
  return {
    months,
    newClientsPerMonth,
    totalInvest,
    totalMargin,
    totalRevenue,
    roi,
    breakEven,
  };
}

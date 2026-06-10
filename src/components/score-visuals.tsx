"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import type { Scores } from "@/lib/types";

export function scoreColor(score: number): string {
  if (score >= 70) return "#34d399";
  if (score >= 45) return "#fbbf24";
  return "#fb7185";
}

export function scoreLabel(score: number): string {
  if (score >= 70) return "Solide";
  if (score >= 45) return "À renforcer";
  return "Critique";
}

export function ScoreRadial({ score, size = 180 }: { score: number; size?: number }) {
  const r = size / 2 - 14;
  const c = 2 * Math.PI * r;
  const color = scoreColor(score);
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={12}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={12}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - score / 100)}
          style={{ filter: `drop-shadow(0 0 10px ${color}66)`, transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-extrabold text-white">{score}</span>
        <span className="text-xs uppercase tracking-wider text-white/45">/ 100</span>
      </div>
    </div>
  );
}

export const SCORE_LABELS: { key: keyof Scores; label: string }[] = [
  { key: "seoLocal", label: "SEO local" },
  { key: "ficheGoogle", label: "Fiche Google" },
  { key: "siteWeb", label: "Site web" },
  { key: "reputation", label: "Réputation" },
  { key: "reseauxSociaux", label: "Réseaux sociaux" },
];

export function ScoresRadar({ scores }: { scores: Scores }) {
  const data = SCORE_LABELS.map(({ key, label }) => ({
    subject: label,
    value: scores[key],
  }));
  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={data} outerRadius="72%">
        <PolarGrid stroke="rgba(255,255,255,0.12)" />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }}
        />
        <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
        <Radar
          dataKey="value"
          stroke="#818cf8"
          fill="#818cf8"
          fillOpacity={0.35}
          strokeWidth={2}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}

export function ScoreBars({ scores }: { scores: Scores }) {
  return (
    <div className="grid gap-3.5">
      {SCORE_LABELS.map(({ key, label }) => {
        const v = scores[key];
        return (
          <div key={key}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="text-white/65">{label}</span>
              <span className="font-semibold" style={{ color: scoreColor(v) }}>
                {v}/100 · {scoreLabel(v)}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${v}%`, background: scoreColor(v) }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

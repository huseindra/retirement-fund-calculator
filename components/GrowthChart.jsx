"use client";

import { formatCurrency } from "@/lib/format";

const WIDTH = 640;
const HEIGHT = 280;
const PAD = { top: 16, right: 16, bottom: 28, left: 64 };

const SERIES = [
  { key: "principal", label: "Your contributions", color: "#0f172a" },
  { key: "employerMatch", label: "Employer match", color: "#38bdf8" },
  { key: "growth", label: "Investment growth", color: "#22c55e" },
];

function buildBandPath(points, xScale, yScale, lowerKey, upperKey) {
  if (points.length === 0) return "";
  const top = points.map((p) => `${xScale(p.age)},${yScale(p[lowerKey] + p[upperKey])}`);
  const bottom = points
    .slice()
    .reverse()
    .map((p) => `${xScale(p.age)},${yScale(p[lowerKey])}`);
  return `M${top.join(" L")} L${bottom.join(" L")} Z`;
}

export default function GrowthChart({ rows, currentAge, currentSavings }) {
  if (!rows || rows.length === 0) return null;

  const points = [
    { age: currentAge, principal: currentSavings, employerMatch: 0, growth: 0 },
    ...rows.map((r) => ({
      age: r.age,
      principal: r.cumulativePrincipal,
      employerMatch: r.cumulativeEmployerMatch,
      growth: r.cumulativeGrowth,
    })),
  ];

  const minAge = points[0].age;
  const maxAge = points[points.length - 1].age;
  const maxValue = Math.max(
    ...points.map((p) => p.principal + p.employerMatch + p.growth),
    1
  );

  const xScale = (age) =>
    PAD.left + ((age - minAge) / Math.max(1, maxAge - minAge)) * (WIDTH - PAD.left - PAD.right);
  const yScale = (value) =>
    HEIGHT - PAD.bottom - (value / maxValue) * (HEIGHT - PAD.top - PAD.bottom);

  const bands = [
    { ...SERIES[0], path: buildBandPath(points.map((p) => ({ ...p, __zero: 0 })), xScale, yScale, "__zero", "principal") },
    { ...SERIES[1], path: buildBandPath(points, xScale, yScale, "principal", "employerMatch") },
    {
      ...SERIES[2],
      path: buildBandPath(
        points.map((p) => ({ ...p, __base: p.principal + p.employerMatch })),
        xScale,
        yScale,
        "__base",
        "growth"
      ),
    },
  ];

  const yTicks = 4;
  const tickValues = Array.from({ length: yTicks + 1 }, (_, i) => (maxValue / yTicks) * i);

  return (
    <div>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full" role="img" aria-label="Savings growth chart">
        {tickValues.map((v) => (
          <g key={v}>
            <line
              x1={PAD.left}
              x2={WIDTH - PAD.right}
              y1={yScale(v)}
              y2={yScale(v)}
              stroke="#e2e8f0"
              strokeWidth="1"
            />
            <text x={PAD.left - 8} y={yScale(v) + 4} textAnchor="end" fontSize="10" fill="#64748b">
              {formatCurrency(v)}
            </text>
          </g>
        ))}

        {bands.map((band) => (
          <path key={band.key} d={band.path} fill={band.color} fillOpacity="0.85" />
        ))}

        {[minAge, Math.round((minAge + maxAge) / 2), maxAge].map((age) => (
          <text
            key={age}
            x={xScale(age)}
            y={HEIGHT - PAD.bottom + 16}
            textAnchor="middle"
            fontSize="10"
            fill="#64748b"
          >
            Age {age}
          </text>
        ))}
      </svg>

      <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-600">
        {SERIES.map((s) => (
          <span key={s.key} className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: s.color }} />
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}

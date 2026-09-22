"use client";

const WIDTH = 640;
const HEIGHT = 280;
const PAD = { top: 16, right: 16, bottom: 28, left: 64 };
// Desaturated categorical set (distinct scenarios need distinguishable lines;
// kept muted to stay consistent with the warm-monochrome palette).
const COLORS = ["#171412", "#1f3d2b", "#9a4b3f", "#4a6b8a", "#a3812f", "#6b5b7b"];

export default function ComparisonChart({ series }) {
  // series: [{ name, points: [{age, value}] }]
  const allPoints = series.flatMap((s) => s.points);
  if (allPoints.length === 0) return null;

  const minAge = Math.min(...allPoints.map((p) => p.age));
  const maxAge = Math.max(...allPoints.map((p) => p.age));
  const maxValue = Math.max(...allPoints.map((p) => p.value), 1);

  const xScale = (age) =>
    PAD.left + ((age - minAge) / Math.max(1, maxAge - minAge)) * (WIDTH - PAD.left - PAD.right);
  const yScale = (value) =>
    HEIGHT - PAD.bottom - (value / maxValue) * (HEIGHT - PAD.top - PAD.bottom);

  const yTicks = 4;
  const tickValues = Array.from({ length: yTicks + 1 }, (_, i) => (maxValue / yTicks) * i);

  return (
    <div>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full" role="img" aria-label="Scenario comparison chart">
        {tickValues.map((v) => (
          <line
            key={v}
            x1={PAD.left}
            x2={WIDTH - PAD.right}
            y1={yScale(v)}
            y2={yScale(v)}
            stroke="#eaeaea"
            strokeWidth="1"
          />
        ))}

        {series.map((s, i) => {
          const color = COLORS[i % COLORS.length];
          const d = s.points
            .map((p, idx) => `${idx === 0 ? "M" : "L"}${xScale(p.age)},${yScale(p.value)}`)
            .join(" ");
          return <path key={s.name} d={d} fill="none" stroke={color} strokeWidth="2" />;
        })}

        {[minAge, Math.round((minAge + maxAge) / 2), maxAge].map((age) => (
          <text
            key={age}
            x={xScale(age)}
            y={HEIGHT - PAD.bottom + 16}
            textAnchor="middle"
            fontSize="10"
            fill="#787774"
          >
            Age {age}
          </text>
        ))}
      </svg>

      <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted">
        {series.map((s, i) => (
          <span key={s.name} className="flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: COLORS[i % COLORS.length] }}
            />
            {s.name}
          </span>
        ))}
      </div>
    </div>
  );
}

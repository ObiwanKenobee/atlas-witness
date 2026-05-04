import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import type { TrendPoint } from "@/store/sanctumStore";

type MetricKey = "rvs" | "soil" | "moisture" | "income";

const palette: Record<MetricKey, { stroke: string; fillFrom: string; fillTo: string; label: string; suffix: string }> = {
  rvs:      { stroke: "hsl(var(--regen))",      fillFrom: "hsl(var(--regen) / 0.45)",      fillTo: "hsl(var(--regen) / 0)",      label: "RVS",          suffix: "" },
  soil:     { stroke: "hsl(var(--regen-glow))", fillFrom: "hsl(var(--regen-glow) / 0.35)", fillTo: "hsl(var(--regen-glow) / 0)", label: "Soil score",   suffix: "" },
  moisture: { stroke: "hsl(200 80% 60%)",       fillFrom: "hsl(200 80% 60% / 0.35)",       fillTo: "hsl(200 80% 60% / 0)",       label: "Moisture",     suffix: "%" },
  income:   { stroke: "hsl(var(--transition))", fillFrom: "hsl(var(--transition) / 0.35)", fillTo: "hsl(var(--transition) / 0)", label: "Income lift",  suffix: "%" },
};

export const TrendChart = ({
  data,
  metric,
  title,
  subtitle,
  height = 140,
}: {
  data: TrendPoint[];
  metric: MetricKey;
  title?: string;
  subtitle?: string;
  height?: number;
}) => {
  const p = palette[metric];
  const last = data[data.length - 1]?.[metric] ?? 0;
  const first = data[0]?.[metric] ?? 0;
  const delta = +(last - first).toFixed(1);
  const gradId = `g-${metric}-${Math.random().toString(36).slice(2, 7)}`;
  return (
    <div className="rounded-xl border border-hairline bg-surface-2 p-3">
      {(title || subtitle) && (
        <div className="mb-2 flex items-end justify-between">
          <div>
            {title && <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{title}</div>}
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-semibold tabular-nums" style={{ color: p.stroke }}>
                {last}
                {p.suffix}
              </span>
              <span className="text-[11px]" style={{ color: delta >= 0 ? p.stroke : "hsl(var(--risk))" }}>
                {delta >= 0 ? "+" : ""}
                {delta}
                {p.suffix} · 30d
              </span>
            </div>
            {subtitle && <div className="text-[10px] text-muted-foreground">{subtitle}</div>}
          </div>
        </div>
      )}
      <div style={{ width: "100%", height }}>
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 6, right: 6, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={p.fillFrom} />
                <stop offset="100%" stopColor={p.fillTo} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="hsl(var(--hairline))" strokeDasharray="2 4" vertical={false} />
            <XAxis dataKey="day" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} tickLine={false} axisLine={false} width={32} />
            <Tooltip
              contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--hairline))", borderRadius: 8, fontSize: 12 }}
              labelFormatter={(d) => `Day ${d}`}
              formatter={(v: number) => [`${v}${p.suffix}`, p.label]}
            />
            <Area type="monotone" dataKey={metric} stroke={p.stroke} strokeWidth={2} fill={`url(#${gradId})`} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
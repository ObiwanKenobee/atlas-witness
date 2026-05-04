import { Droplets, Leaf, Repeat, Sprout, Coins, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { territoryMetrics, Farm } from "@/data/farms";

const Metric = ({
  icon, label, value, suffix, delta, accent,
}: {
  icon: React.ReactNode; label: string; value: number | string; suffix?: string;
  delta: number; accent: "regen" | "transition" | "risk";
}) => {
  const up = delta >= 0;
  const accentColor = `hsl(var(--${accent}))`;
  return (
    <div className="rounded-xl border border-hairline bg-surface-2 p-4">
      <div className="flex items-center justify-between text-muted-foreground">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider">
          <span className="grid h-6 w-6 place-items-center rounded-md bg-surface-3" style={{ color: accentColor }}>
            {icon}
          </span>
          {label}
        </div>
        <span className={`flex items-center gap-0.5 text-[11px] ${up ? "" : "text-risk"}`} style={up ? { color: accentColor } : undefined}>
          {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {Math.abs(delta)}%
        </span>
      </div>
      <div className="mt-3 flex items-baseline gap-1">
        <span className="text-3xl font-semibold tracking-tight tabular-nums">{value}</span>
        {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
      </div>
    </div>
  );
};

export const SystemState = ({ farms, onSelect }: { farms: Farm[]; onSelect: (id: string) => void }) => {
  const m = territoryMetrics;
  const counts = farms.reduce(
    (acc, f) => ((acc[f.status] += 1), acc),
    { regenerating: 0, transitioning: 0, degraded: 0 } as Record<Farm["status"], number>,
  );
  const total = farms.length;

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="text-sm font-semibold tracking-tight">Live System State</h2>
        <p className="text-[11px] text-muted-foreground">What is changing in reality, right now.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric icon={<Sprout className="h-3.5 w-3.5" />} label="Soil Health Index" value={m.soilHealth} delta={m.soilHealthDelta} accent="regen" />
        <Metric icon={<Droplets className="h-3.5 w-3.5" />} label="Water Retention" value={m.waterRetention} suffix="%" delta={m.waterDelta} accent="regen" />
        <Metric icon={<Coins className="h-3.5 w-3.5" />} label="Farmer Income Signal" value={`+${m.incomeSignal}`} suffix="%" delta={m.incomeDelta} accent="transition" />
        <Metric icon={<Repeat className="h-3.5 w-3.5" />} label="Regen Loop Active" value={m.loopActive} suffix="%" delta={m.loopDelta} accent="regen" />
      </div>

      {/* Status bar across territory */}
      <div className="rounded-xl border border-hairline bg-surface-2 p-4">
        <div className="flex items-center justify-between">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Territory composition</div>
          <div className="text-[11px] text-muted-foreground">{total} farms</div>
        </div>
        <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-surface-3">
          <div style={{ width: `${(counts.regenerating / total) * 100}%`, background: "hsl(var(--regen))" }} />
          <div style={{ width: `${(counts.transitioning / total) * 100}%`, background: "hsl(var(--transition))" }} />
          <div style={{ width: `${(counts.degraded / total) * 100}%`, background: "hsl(var(--risk))" }} />
        </div>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full" style={{ background: "hsl(var(--regen))" }} />Regenerating · {counts.regenerating}</span>
          <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full" style={{ background: "hsl(var(--transition))" }} />Transitioning · {counts.transitioning}</span>
          <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full" style={{ background: "hsl(var(--risk))" }} />Degraded · {counts.degraded}</span>
        </div>
      </div>

      {/* Active interventions */}
      <div className="rounded-xl border border-hairline bg-surface-2 p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">Active Interventions</div>
            <div className="text-[11px] text-muted-foreground">Causes of measurable change</div>
          </div>
          <Leaf className="h-4 w-4 text-regen" style={{ color: "hsl(var(--regen))" }} />
        </div>
        <div className="mt-3 grid grid-cols-3 gap-3">
          {[
            { name: "Compost", count: m.interventions.compost },
            { name: "Mulching", count: m.interventions.mulching },
            { name: "Water optim.", count: m.interventions.water },
          ].map((iv) => (
            <div key={iv.name} className="rounded-lg border border-hairline bg-surface-3 p-3">
              <div className="text-2xl font-semibold tabular-nums">{iv.count}</div>
              <div className="text-[11px] text-muted-foreground">{iv.name} · farms</div>
            </div>
          ))}
        </div>
      </div>

      {/* Top regenerating list */}
      <div className="rounded-xl border border-hairline bg-surface-2">
        <div className="flex items-center justify-between border-b border-hairline px-4 py-3">
          <div className="text-sm font-semibold">Top regenerating farms</div>
          <div className="text-[11px] text-muted-foreground">RVS · last 30 days</div>
        </div>
        <ul className="divide-y divide-[hsl(var(--hairline))]">
          {[...farms].sort((a, b) => b.rvs - a.rvs).slice(0, 5).map((f) => (
            <li key={f.id}>
              <button
                onClick={() => onSelect(f.id)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-surface-3"
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{
                    background:
                      f.status === "regenerating" ? "hsl(var(--regen))" :
                      f.status === "transitioning" ? "hsl(var(--transition))" : "hsl(var(--risk))",
                  }}
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm">{f.farmer}</div>
                  <div className="truncate text-[11px] text-muted-foreground">{f.id} · {f.crop}</div>
                </div>
                <div className="w-32">
                  <div className="h-1.5 overflow-hidden rounded-full bg-surface-3">
                    <div className="h-full bg-gradient-regen" style={{ width: `${f.rvs}%` }} />
                  </div>
                </div>
                <div className="w-10 text-right text-sm tabular-nums">{f.rvs}</div>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
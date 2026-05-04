import { Farm } from "@/data/farms";
import { Maximize2 } from "lucide-react";

interface Props {
  farms: Farm[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const statusStyles: Record<Farm["status"], { dot: string; ring: string; pulse: string; label: string }> = {
  regenerating: { dot: "hsl(var(--regen))", ring: "hsl(var(--regen) / 0.35)", pulse: "pulse-regen", label: "Regenerating" },
  transitioning: { dot: "hsl(var(--transition))", ring: "hsl(var(--transition) / 0.35)", pulse: "pulse-transition", label: "Transitioning" },
  degraded: { dot: "hsl(var(--risk))", ring: "hsl(var(--risk) / 0.35)", pulse: "pulse-risk", label: "Degraded" },
};

export const LivingMap = ({ farms, selectedId, onSelect }: Props) => {
  return (
    <section className="flex h-full flex-col overflow-hidden rounded-xl border border-hairline bg-gradient-card shadow-elev">
      <div className="flex items-center justify-between border-b border-hairline px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold tracking-tight">Territory · Living Map</h2>
          <p className="text-[11px] text-muted-foreground">Nairobi peri-urban cluster · 24 farms</p>
        </div>
        <button className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground" aria-label="Expand map">
          <Maximize2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="relative flex-1 overflow-hidden">
        {/* topographic backdrop */}
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
          <defs>
            <radialGradient id="terrain" cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor="hsl(160 30% 14%)" />
              <stop offset="100%" stopColor="hsl(160 22% 7%)" />
            </radialGradient>
            <pattern id="grid" width="6" height="6" patternUnits="userSpaceOnUse">
              <path d="M 6 0 L 0 0 0 6" fill="none" stroke="hsl(var(--hairline))" strokeWidth="0.15" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#terrain)" />
          <rect width="100" height="100" fill="url(#grid)" opacity="0.55" />
          {/* topographic curves */}
          {[18, 32, 46, 60, 74].map((r, i) => (
            <ellipse key={i} cx="52" cy="50" rx={r} ry={r * 0.62}
              fill="none" stroke="hsl(var(--regen) / 0.07)" strokeWidth="0.2" />
          ))}
          {/* river */}
          <path d="M 0 70 Q 25 55 45 62 T 100 48"
            fill="none" stroke="hsl(200 70% 50% / 0.25)" strokeWidth="0.6" />
        </svg>

        <div className="absolute inset-0 scanline opacity-40" />

        {/* nodes */}
        {farms.map((f) => {
          const s = statusStyles[f.status];
          const isSelected = selectedId === f.id;
          return (
            <button
              key={f.id}
              onClick={() => onSelect(f.id)}
              className="group absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${f.x}%`, top: `${f.y}%` }}
              aria-label={`${f.name} — ${s.label}`}
            >
              <span
                className={`block h-3 w-3 rounded-full ${s.pulse}`}
                style={{ background: s.dot, boxShadow: `0 0 0 6px ${s.ring}` }}
              />
              {isSelected && (
                <span
                  className="absolute left-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border"
                  style={{ borderColor: s.dot }}
                />
              )}
              <span
                className={`pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-md border border-hairline bg-popover px-2 py-1 text-[10px] text-foreground shadow-elev transition-opacity ${
                  isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                }`}
              >
                {f.id} · {f.farmer}
              </span>
            </button>
          );
        })}

        {/* legend */}
        <div className="absolute bottom-3 left-3 flex flex-col gap-1.5 rounded-md border border-hairline bg-surface-1/80 px-3 py-2 text-[10px] backdrop-blur">
          {(["regenerating", "transitioning", "degraded"] as const).map((s) => (
            <div key={s} className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ background: statusStyles[s].dot }} />
              <span className="capitalize text-muted-foreground">{statusStyles[s].label}</span>
            </div>
          ))}
        </div>

        {/* compass */}
        <div className="absolute bottom-3 right-3 rounded-md border border-hairline bg-surface-1/80 px-2.5 py-1.5 text-[10px] uppercase tracking-widest text-muted-foreground backdrop-blur">
          1°17′S · 36°49′E
        </div>
      </div>
    </section>
  );
};
import { Farm } from "@/data/farms";
import { Database, Lightbulb, Hammer, TrendingUp, Coins } from "lucide-react";

const stages = [
  { key: "data",    label: "Data",    icon: Database,   tone: "hsl(var(--muted-foreground))" },
  { key: "insight", label: "Insight", icon: Lightbulb,  tone: "hsl(var(--transition))" },
  { key: "action",  label: "Action",  icon: Hammer,     tone: "hsl(var(--transition))" },
  { key: "outcome", label: "Outcome", icon: TrendingUp, tone: "hsl(var(--regen))" },
  { key: "value",   label: "Value",   icon: Coins,      tone: "hsl(var(--regen-glow))" },
] as const;

export const RegenLoop = ({ farm }: { farm: Farm }) => {
  const content: Record<typeof stages[number]["key"], string> = {
    data: "Soil + farmer inputs",
    insight: farm.status === "degraded" ? "Soil carbon critically low" : "Soil carbon low",
    action: farm.interventions.filter(i => i.applied).map(i => i.label).join(" + ") || "Pending intervention",
    outcome: farm.moistureDelta >= 0 ? `Moisture +${farm.moistureDelta}%` : `Moisture ${farm.moistureDelta}%`,
    value: `+${Math.max(0, farm.rvs - 50)} RVS units`,
  };
  return (
    <div className="rounded-xl border border-hairline bg-surface-2 p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">Regenerative Loop</div>
        <div className="text-[11px] text-muted-foreground">Cause → Effect</div>
      </div>
      <div className="mt-4 grid grid-cols-5 gap-2">
        {stages.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={s.key} className="relative">
              <div className="rounded-lg border border-hairline bg-surface-3 p-3">
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider" style={{ color: s.tone }}>
                  <Icon className="h-3 w-3" />
                  {s.label}
                </div>
                <p className="mt-1.5 text-[11px] leading-snug text-foreground/90">{content[s.key]}</p>
              </div>
              {i < stages.length - 1 && (
                <svg className="absolute -right-1.5 top-1/2 z-10 h-3 w-3 -translate-y-1/2" viewBox="0 0 12 12" aria-hidden>
                  <path d="M0 6 L8 6" stroke="hsl(var(--regen))" strokeWidth="1.2" className="flow-line" />
                  <path d="M6 3 L9 6 L6 9" fill="none" stroke="hsl(var(--regen))" strokeWidth="1.2" />
                </svg>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
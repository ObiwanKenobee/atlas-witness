import { AlertTriangle, ArrowRight, ShieldAlert, Zap } from "lucide-react";
import { useSanctum, selectAlerts } from "@/store/sanctumStore";

const sevMeta = {
  high: { color: "hsl(var(--risk))", icon: <ShieldAlert className="h-3.5 w-3.5" />, label: "Urgent" },
  med:  { color: "hsl(var(--transition))", icon: <AlertTriangle className="h-3.5 w-3.5" />, label: "Watch" },
  low:  { color: "hsl(var(--regen))", icon: <Zap className="h-3.5 w-3.5" />, label: "Nudge" },
};

export const AlertsPanel = ({ onSelect }: { onSelect: (id: string) => void }) => {
  const alerts = useSanctum(selectAlerts);

  if (!alerts.length) {
    return (
      <section className="rounded-xl border border-hairline bg-surface-2 p-4">
        <div className="text-sm font-semibold">All farms within healthy range</div>
        <p className="mt-1 text-[11px] text-muted-foreground">No alerts triggered this cycle.</p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-hairline bg-surface-2">
      <div className="flex items-center justify-between border-b border-hairline px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold">Triggered alerts</h3>
          <p className="text-[11px] text-muted-foreground">Detected risks · actionable recommendations</p>
        </div>
        <span className="text-[11px] text-muted-foreground">{alerts.length} active</span>
      </div>
      <ul className="divide-y divide-[hsl(var(--hairline))]">
        {alerts.map((a) => {
          const m = sevMeta[a.severity];
          return (
            <li key={a.farmId + a.title}>
              <button
                onClick={() => onSelect(a.farmId)}
                className="group flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-surface-3"
              >
                <span
                  className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border"
                  style={{ borderColor: m.color, color: m.color, background: "hsl(var(--surface-1))" }}
                >
                  {m.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                    <span style={{ color: m.color }}>{m.label}</span>
                    <span>·</span>
                    <span>{a.farmId}</span>
                  </div>
                  <div className="mt-0.5 text-sm font-medium">{a.title}</div>
                  <div className="text-[11px] text-muted-foreground">{a.reason}</div>
                  <div className="mt-1.5 flex items-center gap-1 text-[11px]" style={{ color: m.color }}>
                    <ArrowRight className="h-3 w-3" />
                    <span>{a.recommendation}</span>
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
};
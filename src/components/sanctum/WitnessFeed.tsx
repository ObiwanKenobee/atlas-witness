import { witnessFeed } from "@/data/farms";
import { AlertTriangle, CheckCircle2, MessageSquareQuote, Sparkles, TriangleAlert } from "lucide-react";

const kindMeta: Record<typeof witnessFeed[number]["kind"], { color: string; icon: React.ReactNode; label: string }> = {
  action:  { color: "hsl(var(--regen))",      icon: <CheckCircle2 className="h-3.5 w-3.5" />, label: "Action" },
  outcome: { color: "hsl(var(--regen-glow))", icon: <Sparkles className="h-3.5 w-3.5" />,    label: "Outcome" },
  voice:   { color: "hsl(var(--transition))", icon: <MessageSquareQuote className="h-3.5 w-3.5" />, label: "Voice" },
  alert:   { color: "hsl(var(--transition))", icon: <AlertTriangle className="h-3.5 w-3.5" />, label: "Trigger" },
  risk:    { color: "hsl(var(--risk))",       icon: <TriangleAlert className="h-3.5 w-3.5" />, label: "Risk" },
};

export const WitnessFeed = ({ onSelect }: { onSelect: (id: string) => void }) => {
  return (
    <section className="flex h-full flex-col overflow-hidden rounded-xl border border-hairline bg-gradient-card shadow-elev">
      <div className="flex items-center justify-between border-b border-hairline px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold tracking-tight">Witness Stream</h2>
          <p className="text-[11px] text-muted-foreground">Human reality, in real time</p>
        </div>
        <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: "hsl(var(--regen))" }} />
          Live
        </span>
      </div>

      <ol className="flex-1 overflow-y-auto px-2 py-2">
        {witnessFeed.map((item, idx) => {
          const meta = kindMeta[item.kind];
          return (
            <li key={item.id} className="feed-item" style={{ animationDelay: `${idx * 60}ms` }}>
              <button
                onClick={() => onSelect(item.farm)}
                className="group relative flex w-full gap-3 rounded-lg px-2.5 py-2.5 text-left hover:bg-surface-3"
              >
                {/* timeline rail */}
                <div className="relative flex flex-col items-center">
                  <span
                    className="grid h-7 w-7 place-items-center rounded-full border"
                    style={{ borderColor: meta.color, color: meta.color, background: "hsl(var(--surface-2))" }}
                  >
                    {meta.icon}
                  </span>
                  {idx !== witnessFeed.length - 1 && (
                    <span className="mt-1 w-px flex-1 bg-[hsl(var(--hairline))]" />
                  )}
                </div>
                <div className="min-w-0 flex-1 pb-3">
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                    <span style={{ color: meta.color }}>{meta.label}</span>
                    <span>·</span>
                    <span>{item.farm}</span>
                    <span className="ml-auto">{item.time}</span>
                  </div>
                  <p className="mt-0.5 text-sm leading-snug text-foreground/95">{item.text}</p>
                </div>
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
};
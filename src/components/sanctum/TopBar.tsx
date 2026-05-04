import { Activity, Leaf, Search } from "lucide-react";

export const TopBar = () => {
  return (
    <header className="sticky top-0 z-30 border-b border-hairline bg-surface-1/80 backdrop-blur-xl">
      <div className="flex h-14 items-center gap-4 px-6">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-md bg-gradient-regen shadow-regen">
            <Leaf className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-tight">Atlas Sanctum</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Witness Dashboard</div>
          </div>
        </div>

        <nav className="ml-6 hidden items-center gap-1 md:flex">
          {["Living Map", "Loop Engine", "RVS", "Field Agent", "Alerts"].map((label, i) => (
            <button
              key={label}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                i === 0
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-md border border-hairline bg-surface-2 px-3 py-1.5 text-xs text-muted-foreground md:flex">
            <Search className="h-3.5 w-3.5" />
            <span>Search farm, farmer, or location…</span>
          </div>
          <div className="flex items-center gap-2 rounded-md border border-hairline bg-surface-2 px-3 py-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-regen opacity-75" style={{ background: "hsl(var(--regen))" }} />
              <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: "hsl(var(--regen))" }} />
            </span>
            <span className="text-[11px] font-medium text-foreground/90">LIVE</span>
            <span className="text-[11px] text-muted-foreground">Nairobi peri-urban · 24 farms</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-md border border-hairline bg-surface-2 px-3 py-1.5 text-[11px] text-muted-foreground">
            <Activity className="h-3.5 w-3.5 text-regen" style={{ color: "hsl(var(--regen))" }} />
            <span>Loop sync 12s ago</span>
          </div>
        </div>
      </div>
    </header>
  );
};
import { Farm } from "@/data/farms";
import { RegenLoop } from "./RegenLoop";
import { ArrowRight, Check, Download, MapPin, Smartphone, Sprout, Wheat, X } from "lucide-react";
import { useEffect, useState } from "react";
import { ProofCard } from "./ProofCard";
import { TrendChart } from "./TrendChart";
import { FieldAgentCapture } from "./FieldAgentCapture";
import { useSanctum } from "@/store/sanctumStore";

interface Props {
  farm: Farm | null;
  onClose: () => void;
}

const statusTone = (s: Farm["status"]) =>
  s === "regenerating" ? "hsl(var(--regen))" :
  s === "transitioning" ? "hsl(var(--transition))" : "hsl(var(--risk))";

const Stat = ({ label, value, sub, accent }: { label: string; value: React.ReactNode; sub?: string; accent?: string }) => (
  <div className="rounded-lg border border-hairline bg-surface-3 p-3">
    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    <div className="mt-1 text-xl font-semibold tabular-nums" style={accent ? { color: accent } : undefined}>{value}</div>
    {sub && <div className="text-[11px] text-muted-foreground">{sub}</div>}
  </div>
);

export const FarmerDetail = ({ farm, onClose }: Props) => {
  const trends = useSanctum((s) => (farm ? s.trends[farm.id] : undefined));
  const [proofOpen, setProofOpen] = useState(false);
  const [captureOpen, setCaptureOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (farm) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [farm, onClose]);

  if (!farm) return null;
  const tone = statusTone(farm.status);
  const soilDelta = farm.soilNow - farm.soilBefore;

  return (
    <div className="fixed inset-0 z-40">
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-background/70 backdrop-blur-sm"
      />
      <aside
        className="absolute right-0 top-0 flex h-full w-full max-w-2xl flex-col overflow-hidden border-l border-hairline bg-surface-1 shadow-elev"
        role="dialog"
        aria-label={`${farm.name} detail`}
      >
        {/* Header */}
        <header className="flex items-start justify-between gap-4 border-b border-hairline p-5">
          <div>
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: tone }} />
              Ground Truth · {farm.id}
            </div>
            <h2 className="mt-1 text-xl font-semibold tracking-tight">{farm.farmer}</h2>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-muted-foreground">
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{farm.location}</span>
              <span className="flex items-center gap-1"><Wheat className="h-3 w-3" />{farm.crop}</span>
              <span className="flex items-center gap-1"><Sprout className="h-3 w-3" />{farm.sizeHa} ha</span>
              <span>· Day {farm.daysInProgram}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCaptureOpen(true)}
              className="hidden items-center gap-1.5 rounded-md border border-hairline bg-surface-2 px-2.5 py-1.5 text-[11px] hover:bg-surface-3 sm:flex"
            >
              <Smartphone className="h-3.5 w-3.5" style={{ color: "hsl(var(--regen))" }} />
              Capture
            </button>
            <button
              onClick={onClose}
              className="rounded-md border border-hairline p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
              aria-label="Close detail"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>

        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          {/* Before / After */}
          <section>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Before vs After</h3>
              <span className="text-[11px] text-muted-foreground">Visual evidence · field-captured</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <figure className="overflow-hidden rounded-lg border border-hairline">
                <div className="relative">
                  <img src={farm.beforeImage} alt={`${farm.farmer} farm before`} loading="lazy" width={1024} height={768} className="aspect-[4/3] w-full object-cover" />
                  <span className="absolute left-2 top-2 rounded-md bg-background/80 px-2 py-0.5 text-[10px] uppercase tracking-widest backdrop-blur">Before</span>
                </div>
                <figcaption className="space-y-0.5 p-3 text-[11px] text-muted-foreground">
                  <div>Dry, cracked soil</div>
                  <div>Low yield · high input cost</div>
                </figcaption>
              </figure>
              <figure className="overflow-hidden rounded-lg border" style={{ borderColor: farm.status === "degraded" ? "hsl(var(--hairline))" : "hsl(var(--regen) / 0.5)" }}>
                <div className="relative">
                  <img src={farm.afterImage} alt={`${farm.farmer} farm now`} loading="lazy" width={1024} height={768} className="aspect-[4/3] w-full object-cover" />
                  <span className="absolute left-2 top-2 flex items-center gap-1 rounded-md bg-background/80 px-2 py-0.5 text-[10px] uppercase tracking-widest backdrop-blur">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: tone }} />
                    Now · Day {farm.daysInProgram}
                  </span>
                </div>
                <figcaption className="space-y-0.5 p-3 text-[11px] text-muted-foreground">
                  <div>{farm.status === "degraded" ? "Still dry — intervention pending" : "Soil darkening, mulch present"}</div>
                  <div>{farm.status === "degraded" ? "Yield at risk" : `Inputs ${farm.costDelta}% · yield ${farm.yieldSignal.replace("-", " ")}`}</div>
                </figcaption>
              </figure>
            </div>
          </section>

          {/* Metrics */}
          <section>
            <h3 className="mb-2 text-sm font-semibold">Regenerative Metrics</h3>
            <div className="grid grid-cols-4 gap-3">
              <Stat
                label="Soil Score"
                value={<span>{farm.soilBefore} <span className="text-muted-foreground">→</span> <span style={{ color: tone }}>{farm.soilNow}</span></span>}
                sub={`${soilDelta >= 0 ? "+" : ""}${soilDelta} pts`}
              />
              <Stat label="Moisture" value={`${farm.moistureDelta >= 0 ? "+" : ""}${farm.moistureDelta}%`} accent={farm.moistureDelta >= 0 ? "hsl(var(--regen))" : "hsl(var(--risk))"} />
              <Stat label="Input Cost" value={`${farm.costDelta}%`} accent={farm.costDelta <= 0 ? "hsl(var(--regen))" : "hsl(var(--risk))"} />
              <Stat label="Yield Signal" value={<span className="text-base capitalize">{farm.yieldSignal.replace("-", " ")}</span>} />
            </div>
          </section>

          {/* Loop */}
          <RegenLoop farm={farm} />

          {/* 30-day trends */}
          {trends && (
            <section>
              <h3 className="mb-2 text-sm font-semibold">30-day trends</h3>
              <div className="grid grid-cols-2 gap-3">
                <TrendChart data={trends} metric="rvs" title="RVS" />
                <TrendChart data={trends} metric="soil" title="Soil score" />
                <TrendChart data={trends} metric="moisture" title="Moisture" />
                <TrendChart data={trends} metric="income" title="Income lift" />
              </div>
            </section>
          )}

          {/* Interventions + Recommendation */}
          <section className="grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-hairline bg-surface-2 p-4">
              <div className="text-sm font-semibold">Interventions applied</div>
              <ul className="mt-3 space-y-2">
                {farm.interventions.map((iv) => (
                  <li key={iv.label} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span
                        className="grid h-5 w-5 place-items-center rounded-full border"
                        style={{
                          borderColor: iv.applied ? "hsl(var(--regen))" : "hsl(var(--hairline))",
                          background: iv.applied ? "hsl(var(--regen) / 0.15)" : "transparent",
                          color: iv.applied ? "hsl(var(--regen))" : "hsl(var(--muted-foreground))",
                        }}
                      >
                        {iv.applied ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      </span>
                      {iv.label}
                    </span>
                    <span className="text-[11px] text-muted-foreground">{iv.applied ? iv.date : "Pending"}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border p-4" style={{ borderColor: "hsl(var(--regen) / 0.4)", background: "linear-gradient(180deg, hsl(var(--regen) / 0.08), hsl(var(--surface-2)))" }}>
              <div className="text-[10px] uppercase tracking-widest" style={{ color: "hsl(var(--regen))" }}>Next recommendation</div>
              <div className="mt-2 flex items-start gap-2 text-sm leading-snug">
                <ArrowRight className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "hsl(var(--regen))" }} />
                <span>{farm.nextRecommendation}</span>
              </div>
              <button className="mt-4 w-full rounded-md bg-gradient-regen px-3 py-2 text-xs font-semibold text-primary-foreground shadow-regen hover:brightness-110">
                Dispatch field agent
              </button>
            </div>
          </section>

          {/* RVS */}
          <section className="rounded-xl border border-hairline bg-surface-2 p-4">
            <div className="flex items-end justify-between">
              <div>
                <div className="text-sm font-semibold">Regenerative Value Score</div>
                <div className="text-[11px] text-muted-foreground">Composite signal · 0–100</div>
              </div>
              <div className="text-3xl font-semibold tabular-nums" style={{ color: tone }}>{farm.rvs}</div>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-3">
              <div className="h-full bg-gradient-regen" style={{ width: `${farm.rvs}%` }} />
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2 text-[11px]">
              {Object.entries(farm.rvsBreakdown).map(([k, v]) => (
                <div key={k} className="rounded-md border border-hairline bg-surface-3 p-2">
                  <div className="capitalize text-muted-foreground">{k}</div>
                  <div className="mt-0.5 text-sm font-semibold tabular-nums">{v}%</div>
                </div>
              ))}
            </div>
          </section>

          {/* Farmer voice */}
          <section className="rounded-xl border border-hairline bg-surface-2 p-4">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Farmer feedback</div>
            <p className="mt-1 text-base italic">"{farm.feedback}"</p>
          </section>
        </div>

        {/* PROOF BUTTON */}
        <footer className="border-t border-hairline bg-surface-2 p-4">
          <button
            onClick={() => setProofOpen(true)}
            className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-gradient-regen px-4 py-3 text-sm font-semibold text-primary-foreground shadow-regen transition hover:brightness-110"
          >
            <Download className="h-4 w-4" />
            Generate Proof — before/after, data, financial impact
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          </button>
          <div className="mt-2 text-center text-[11px] text-muted-foreground">
            Instantly shareable with investors, NGOs, and governments
          </div>
        </footer>
      </aside>
      <ProofCard farm={farm} open={proofOpen} onOpenChange={setProofOpen} />
      <FieldAgentCapture defaultFarmId={farm.id} open={captureOpen} onOpenChange={setCaptureOpen} />
    </div>
  );
};
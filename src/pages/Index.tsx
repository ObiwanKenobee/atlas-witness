import { useEffect, useState } from "react";
import { TopBar } from "@/components/sanctum/TopBar";
import { LivingMap } from "@/components/sanctum/LivingMap";
import { SystemState } from "@/components/sanctum/SystemState";
import { WitnessFeed } from "@/components/sanctum/WitnessFeed";
import { FarmerDetail } from "@/components/sanctum/FarmerDetail";
import { AlertsPanel } from "@/components/sanctum/AlertsPanel";
import { FieldAgentCapture } from "@/components/sanctum/FieldAgentCapture";
import { useSanctum } from "@/store/sanctumStore";
import { Smartphone } from "lucide-react";

const Index = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const farms = useSanctum((s) => s.farms);

  useEffect(() => {
    document.title = "Atlas Sanctum — Witness Dashboard";
    const desc = "Live proof of regeneration: soil, water, yield, and farmer voice across the Nairobi peri-urban pilot.";
    let m = document.querySelector('meta[name="description"]');
    if (!m) { m = document.createElement("meta"); m.setAttribute("name", "description"); document.head.appendChild(m); }
    m.setAttribute("content", desc);
  }, []);

  const selected = farms.find((f) => f.id === selectedId) ?? null;

  return (
    <div className="min-h-screen">
      <TopBar />
      <main className="mx-auto max-w-[1600px] px-6 py-5">
        <h1 className="sr-only">Atlas Sanctum Witness Dashboard</h1>

        {/* Hero question */}
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">The living question</div>
            <p className="mt-1 max-w-2xl text-2xl font-semibold leading-tight tracking-tight">
              What is changing in <span className="text-regen" style={{ color: "hsl(var(--regen))" }}>reality</span> right now?
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right text-[11px] text-muted-foreground">
              <div>Pilot · Nairobi peri-urban cluster</div>
              <div>Day 14 of 30 · {farms.length} farms · 3 cohorts</div>
            </div>
            <FieldAgentCapture
              trigger={
                <button className="flex items-center gap-2 rounded-lg bg-gradient-regen px-3 py-2 text-xs font-semibold text-primary-foreground shadow-regen hover:brightness-110">
                  <Smartphone className="h-3.5 w-3.5" />
                  Field capture
                </button>
              }
            />
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-12">
          {/* LEFT — Map */}
          <div className="lg:col-span-4">
            <div className="h-[640px]">
              <LivingMap farms={farms} selectedId={selectedId} onSelect={setSelectedId} />
            </div>
          </div>

          {/* CENTER — System state */}
          <div className="lg:col-span-5">
            <SystemState farms={farms} onSelect={setSelectedId} />
          </div>

          {/* RIGHT — Witness feed */}
          <div className="lg:col-span-3">
            <div className="h-[640px]">
              <WitnessFeed onSelect={setSelectedId} />
            </div>
          </div>
        </div>

        {/* Alerts band */}
        <div className="mt-5">
          <AlertsPanel onSelect={setSelectedId} />
        </div>

        <footer className="mt-8 border-t border-hairline pt-4 text-center text-[11px] text-muted-foreground">
          Atlas Sanctum · Truth + Regeneration · "If a farmer cannot understand it in 30 seconds, it's too complex."
        </footer>
      </main>

      <FarmerDetail farm={selected} onClose={() => setSelectedId(null)} />
    </div>
  );
};

export default Index;

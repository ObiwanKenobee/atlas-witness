import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { Farm } from "@/data/farms";
import { useSanctum } from "@/store/sanctumStore";
import { Copy, Download, Link2, Share2, X } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export const ProofCard = ({ farm, open, onOpenChange }: { farm: Farm | null; open: boolean; onOpenChange: (o: boolean) => void }) => {
  const trends = useSanctum((s) => (farm ? s.trends[farm.id] : undefined));
  const cardRef = useRef<HTMLDivElement>(null);
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    if (open && farm) {
      const url = `${window.location.origin}${window.location.pathname}#proof/${farm.id}-${Date.now().toString(36)}`;
      setShareUrl(url);
    }
  }, [open, farm]);

  if (!farm) return null;

  const soilDelta = farm.soilNow - farm.soilBefore;
  const startRvs = trends?.[0]?.rvs ?? farm.rvs;
  const rvsDelta = +(farm.rvs - startRvs).toFixed(1);

  const handleDownloadPdf = async () => {
    if (!cardRef.current) return;
    toast.loading("Generating PDF...", { id: "pdf" });
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#0d1411",
        scale: 2,
        useCORS: true,
      });
      const img = canvas.toDataURL("image/jpeg", 0.92);
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const w = pdf.internal.pageSize.getWidth();
      const h = (canvas.height * w) / canvas.width;
      pdf.addImage(img, "JPEG", 0, 0, w, Math.min(h, pdf.internal.pageSize.getHeight()));
      pdf.save(`atlas-sanctum-proof-${farm.id}.pdf`);
      toast.success("Proof PDF downloaded", { id: "pdf" });
    } catch (e) {
      toast.error("PDF export failed", { id: "pdf", description: String(e) });
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Share link copied");
    } catch {
      toast.error("Copy failed");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Atlas Sanctum proof — ${farm.farmer}`,
          text: `${farm.farmer} (${farm.id}) · RVS ${farm.rvs}, soil +${soilDelta} pts in ${farm.daysInProgram} days`,
          url: shareUrl,
        });
      } catch { /* cancelled */ }
    } else {
      handleCopyLink();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl border-hairline bg-surface-1 p-0">
        <div className="flex items-center justify-between border-b border-hairline px-4 py-3">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Proof of regeneration</div>
            <div className="text-sm font-semibold">{farm.farmer} · {farm.id}</div>
          </div>
          <button onClick={() => onOpenChange(false)} aria-label="Close" className="rounded-md border border-hairline p-1.5 text-muted-foreground hover:bg-secondary">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-4">
          {/* Card to capture */}
          <div
            ref={cardRef}
            className="mx-auto w-full max-w-2xl rounded-2xl border border-hairline bg-surface-2 p-6"
            style={{ background: "linear-gradient(180deg, hsl(160 16% 11%), hsl(160 18% 8%))" }}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Atlas Sanctum · Witness</div>
                <h3 className="mt-1 text-2xl font-semibold leading-tight">{farm.farmer}</h3>
                <p className="text-xs text-muted-foreground">{farm.location} · {farm.crop} · {farm.sizeHa} ha</p>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">RVS · Day {farm.daysInProgram}</div>
                <div className="text-3xl font-semibold tabular-nums" style={{ color: "hsl(var(--regen))" }}>{farm.rvs}</div>
                <div className="text-[11px]" style={{ color: rvsDelta >= 0 ? "hsl(var(--regen))" : "hsl(var(--risk))" }}>
                  {rvsDelta >= 0 ? "+" : ""}{rvsDelta} in 30d
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <figure className="overflow-hidden rounded-lg border border-hairline">
                <img src={farm.beforeImage} alt="Before" crossOrigin="anonymous" className="aspect-[4/3] w-full object-cover" />
                <figcaption className="px-3 py-2 text-[11px] text-muted-foreground">Before · Day 0</figcaption>
              </figure>
              <figure className="overflow-hidden rounded-lg border" style={{ borderColor: "hsl(var(--regen) / 0.5)" }}>
                <img src={farm.afterImage} alt="After" crossOrigin="anonymous" className="aspect-[4/3] w-full object-cover" />
                <figcaption className="px-3 py-2 text-[11px]" style={{ color: "hsl(var(--regen))" }}>Now · Day {farm.daysInProgram}</figcaption>
              </figure>
            </div>

            <div className="mt-4 grid grid-cols-4 gap-2">
              {[
                { l: "Soil", v: `${farm.soilBefore}→${farm.soilNow}`, s: `${soilDelta >= 0 ? "+" : ""}${soilDelta} pts` },
                { l: "Moisture", v: `${farm.moistureDelta >= 0 ? "+" : ""}${farm.moistureDelta}%`, s: "vs baseline" },
                { l: "Input cost", v: `${farm.costDelta}%`, s: "shift" },
                { l: "Yield", v: farm.yieldSignal.replace("-", " "), s: "signal" },
              ].map((m) => (
                <div key={m.l} className="rounded-md border border-hairline bg-surface-3 p-2">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{m.l}</div>
                  <div className="text-sm font-semibold tabular-nums">{m.v}</div>
                  <div className="text-[10px] text-muted-foreground">{m.s}</div>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-lg border p-3" style={{ borderColor: "hsl(var(--regen) / 0.4)", background: "hsl(var(--regen) / 0.06)" }}>
              <div className="text-[10px] uppercase tracking-widest" style={{ color: "hsl(var(--regen))" }}>Financial implication</div>
              <p className="mt-1 text-sm">
                Estimated input savings of <strong>{Math.abs(farm.costDelta)}%</strong> with yield trending{" "}
                <strong>{farm.yieldSignal.replace("-", " ")}</strong>. Eligible for regenerative micro-funding.
              </p>
            </div>

            <div className="mt-4 rounded-lg border border-hairline bg-surface-3 p-3">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Farmer voice</div>
              <p className="mt-1 text-sm italic">"{farm.feedback}"</p>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-hairline pt-3 text-[10px] text-muted-foreground">
              <span>Atlas Sanctum · Truth + Regeneration</span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-hairline p-3">
          <button onClick={handleDownloadPdf} className="flex items-center gap-2 rounded-md bg-gradient-regen px-3 py-2 text-xs font-semibold text-primary-foreground shadow-regen hover:brightness-110">
            <Download className="h-3.5 w-3.5" /> Download PDF
          </button>
          <button onClick={handleShare} className="flex items-center gap-2 rounded-md border border-hairline bg-surface-2 px-3 py-2 text-xs hover:bg-surface-3">
            <Share2 className="h-3.5 w-3.5" /> Share
          </button>
          <div className="ml-auto flex min-w-0 flex-1 items-center gap-2 rounded-md border border-hairline bg-surface-2 px-3 py-2 text-xs text-muted-foreground sm:flex-none sm:min-w-[260px]">
            <Link2 className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{shareUrl}</span>
            <button onClick={handleCopyLink} className="ml-auto rounded p-1 hover:bg-surface-3" aria-label="Copy link">
              <Copy className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
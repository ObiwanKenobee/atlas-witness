import { useState, useRef } from "react";
import { Camera, Upload, X, CheckCircle2, Smartphone } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useSanctum, submitFieldReport, type FieldSubmission } from "@/store/sanctumStore";
import { toast } from "sonner";

const conditions: Array<{ value: FieldSubmission["soilCondition"]; label: string; tone: string }> = [
  { value: "dry", label: "Dry", tone: "hsl(var(--risk))" },
  { value: "cracked", label: "Cracked", tone: "hsl(var(--risk))" },
  { value: "moist", label: "Moist", tone: "hsl(var(--transition))" },
  { value: "saturated", label: "Saturated", tone: "hsl(var(--transition))" },
  { value: "dark-rich", label: "Dark, rich", tone: "hsl(var(--regen))" },
];

const interventions: Array<{ value: NonNullable<FieldSubmission["intervention"]>; label: string }> = [
  { value: "compost", label: "Compost" },
  { value: "mulch", label: "Mulch" },
  { value: "water", label: "Water optim." },
  { value: "none", label: "Observation only" },
];

export const FieldAgentCapture = ({
  trigger,
  defaultFarmId,
  open,
  onOpenChange,
}: {
  trigger?: React.ReactNode;
  defaultFarmId?: string;
  open?: boolean;
  onOpenChange?: (o: boolean) => void;
}) => {
  const farms = useSanctum((s) => s.farms);
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = open ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const [farmId, setFarmId] = useState(defaultFarmId ?? farms[0]?.id ?? "");
  const [photo, setPhoto] = useState<string | undefined>();
  const [condition, setCondition] = useState<FieldSubmission["soilCondition"]>("moist");
  const [moisture, setMoisture] = useState(55);
  const [intervention, setIntervention] = useState<NonNullable<FieldSubmission["intervention"]>>("compost");
  const [notes, setNotes] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!farmId) return toast.error("Select a farm");
    submitFieldReport({
      farmId,
      agent: "Agent · J. Owino",
      photo,
      soilCondition: condition,
      moisturePct: moisture,
      notes: notes.trim(),
      intervention,
    });
    toast.success("Field report synced", {
      description: `${farmId} · ${condition.replace("-", " ")} · moisture ${moisture}%`,
    });
    setOpen(false);
    setPhoto(undefined);
    setNotes("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-md border-hairline bg-surface-1 p-0 sm:max-w-md">
        <div className="flex items-center justify-between border-b border-hairline px-4 py-3">
          <DialogHeader className="flex-1 space-y-0 text-left">
            <DialogTitle className="flex items-center gap-2 text-sm font-semibold">
              <Smartphone className="h-4 w-4" style={{ color: "hsl(var(--regen))" }} />
              Field Agent · Capture
            </DialogTitle>
            <p className="text-[11px] text-muted-foreground">Mobile-first ground truth · syncs instantly</p>
          </DialogHeader>
        </div>

        <div className="max-h-[70vh] space-y-4 overflow-y-auto p-4">
          {/* Farm */}
          <div>
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Farm</label>
            <select
              value={farmId}
              onChange={(e) => setFarmId(e.target.value)}
              className="mt-1 w-full rounded-md border border-hairline bg-surface-2 px-3 py-2 text-sm"
            >
              {farms.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.id} · {f.farmer}
                </option>
              ))}
            </select>
          </div>

          {/* Photo */}
          <div>
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Photo evidence</label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            {photo ? (
              <div className="relative mt-1 overflow-hidden rounded-lg border border-hairline">
                <img src={photo} alt="Field capture" className="aspect-[4/3] w-full object-cover" />
                <button
                  onClick={() => setPhoto(undefined)}
                  className="absolute right-2 top-2 rounded-md bg-background/80 p-1 text-foreground backdrop-blur"
                  aria-label="Remove photo"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="mt-1 grid grid-cols-2 gap-2">
                <button
                  onClick={() => fileRef.current?.click()}
                  className="flex flex-col items-center gap-1 rounded-lg border border-hairline bg-surface-2 px-3 py-4 text-xs hover:bg-surface-3"
                >
                  <Camera className="h-5 w-5" style={{ color: "hsl(var(--regen))" }} />
                  Take photo
                </button>
                <button
                  onClick={() => fileRef.current?.click()}
                  className="flex flex-col items-center gap-1 rounded-lg border border-hairline bg-surface-2 px-3 py-4 text-xs hover:bg-surface-3"
                >
                  <Upload className="h-5 w-5 text-muted-foreground" />
                  Upload
                </button>
              </div>
            )}
          </div>

          {/* Soil condition */}
          <div>
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Soil condition</label>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {conditions.map((c) => {
                const active = condition === c.value;
                return (
                  <button
                    key={c.value}
                    onClick={() => setCondition(c.value)}
                    className="rounded-full border px-3 py-1.5 text-xs transition"
                    style={{
                      borderColor: active ? c.tone : "hsl(var(--hairline))",
                      background: active ? `${c.tone.replace("hsl", "hsla").replace(")", " / 0.15)")}` : "transparent",
                      color: active ? c.tone : undefined,
                    }}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Moisture */}
          <div>
            <div className="flex items-center justify-between">
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Moisture reading</label>
              <span className="text-sm font-semibold tabular-nums">{moisture}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={moisture}
              onChange={(e) => setMoisture(parseInt(e.target.value))}
              className="mt-2 w-full accent-[hsl(var(--regen))]"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Dry</span>
              <span>Optimal</span>
              <span>Saturated</span>
            </div>
          </div>

          {/* Intervention */}
          <div>
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Intervention applied</label>
            <div className="mt-1 grid grid-cols-2 gap-1.5">
              {interventions.map((iv) => {
                const active = intervention === iv.value;
                return (
                  <button
                    key={iv.value}
                    onClick={() => setIntervention(iv.value)}
                    className="flex items-center justify-between rounded-md border px-3 py-2 text-xs"
                    style={{
                      borderColor: active ? "hsl(var(--regen))" : "hsl(var(--hairline))",
                      background: active ? "hsl(var(--regen) / 0.1)" : "hsl(var(--surface-2))",
                    }}
                  >
                    {iv.label}
                    {active && <CheckCircle2 className="h-3.5 w-3.5" style={{ color: "hsl(var(--regen))" }} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Farmer voice / notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={240}
              rows={3}
              placeholder="What did the farmer say? What did you see?"
              className="mt-1 w-full rounded-md border border-hairline bg-surface-2 px-3 py-2 text-sm"
            />
            <div className="text-right text-[10px] text-muted-foreground">{notes.length}/240</div>
          </div>
        </div>

        <div className="border-t border-hairline p-3">
          <button
            onClick={handleSubmit}
            className="w-full rounded-lg bg-gradient-regen px-4 py-3 text-sm font-semibold text-primary-foreground shadow-regen hover:brightness-110"
          >
            Sync to Sanctum
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
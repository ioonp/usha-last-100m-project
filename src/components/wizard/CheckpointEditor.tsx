import { DIRECTIONS, Direction, DirectionalArrow } from "@/components/DirectionalArrow";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { uploadAsset } from "@/lib/upload";
import { useAuth } from "@/lib/auth";
import { ArrowDown, ArrowUp, Trash2, Upload, Plus, ArrowUp as ArrowUpIcon, Circle, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

export type Indicator =
  | { id: string; type: "direction"; x: number; y: number; direction: Direction }
  | { id: string; type: "spot"; x: number; y: number; label: string };

export type Checkpoint = {
  id?: string;
  position: number;
  photo_url: string;
  arrow_direction: Direction; // legacy, kept for backward compat
  note: string | null;
  indicators?: Indicator[];
};

const uid = () => Math.random().toString(36).slice(2, 10);
const nextDir = (d: Direction): Direction => DIRECTIONS[(DIRECTIONS.indexOf(d) + 1) % DIRECTIONS.length];

function PhotoCanvas({
  photoUrl,
  indicators,
  onChange,
}: {
  photoUrl: string;
  indicators: Indicator[];
  onChange: (next: Indicator[]) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ id: string; moved: boolean } | null>(null);

  const update = (id: string, patch: Partial<Indicator>) =>
    onChange(indicators.map((i) => (i.id === id ? ({ ...i, ...patch } as Indicator) : i)));
  const remove = (id: string) => onChange(indicators.filter((i) => i.id !== id));

  const handlePointerDown = (e: React.PointerEvent, id: string) => {
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = { id, moved: false };
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    const ind = indicators.find((i) => i.id === dragRef.current!.id);
    if (!ind) return;
    if (Math.abs(x - ind.x) > 0.005 || Math.abs(y - ind.y) > 0.005) dragRef.current.moved = true;
    update(dragRef.current.id, { x, y } as Partial<Indicator>);
  };
  const handlePointerUp = (e: React.PointerEvent, id: string) => {
    const wasMoved = dragRef.current?.moved;
    dragRef.current = null;
    // tap (no drag) on a direction arrow → cycle direction
    if (!wasMoved) {
      const ind = indicators.find((i) => i.id === id);
      if (ind?.type === "direction") update(id, { direction: nextDir(ind.direction) } as Partial<Indicator>);
    }
  };

  return (
    <div
      ref={ref}
      className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-muted select-none"
      onPointerMove={handlePointerMove}
    >
      <img src={photoUrl} alt="" className="absolute inset-0 w-full h-full object-cover pointer-events-none" draggable={false} />
      {indicators.map((ind) => (
        <div
          key={ind.id}
          className="absolute group"
          style={{ left: `${ind.x * 100}%`, top: `${ind.y * 100}%`, transform: "translate(-50%, -50%)", touchAction: "none" }}
        >
          {ind.type === "direction" ? (
            <div
              className="relative cursor-grab active:cursor-grabbing"
              style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.55))" }}
              onPointerDown={(e) => handlePointerDown(e, ind.id)}
              onPointerUp={(e) => handlePointerUp(e, ind.id)}
              title="Drag to move • Tap to rotate"
            >
              <DirectionalArrow direction={ind.direction} size={80} color="white" />
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); remove(ind.id); }}
                className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-1 -right-1 size-5 rounded-full bg-background border border-border flex items-center justify-center shadow"
                aria-label="Remove arrow"
              >
                <X className="size-3" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center" style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.55))" }}>
              <div
                className="relative cursor-grab active:cursor-grabbing"
                onPointerDown={(e) => handlePointerDown(e, ind.id)}
                onPointerUp={(e) => handlePointerUp(e, ind.id)}
                title="Drag to move"
              >
                <span className="block absolute inset-0 rounded-full bg-white animate-spot-pulse" aria-hidden />
                <span className="relative block size-5 rounded-full bg-white border-2 border-foreground" />
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); remove(ind.id); }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-1 -right-1 size-5 rounded-full bg-background border border-border flex items-center justify-center shadow"
                  aria-label="Remove spot"
                >
                  <X className="size-3" />
                </button>
              </div>
              <input
                type="text"
                maxLength={20}
                value={ind.label}
                onChange={(e) => update(ind.id, { label: e.target.value } as Partial<Indicator>)}
                onPointerDown={(e) => e.stopPropagation()}
                placeholder="Label"
                className="mt-1.5 px-2 py-0.5 text-[11px] font-medium text-foreground bg-white/95 rounded-md border border-border w-[90px] text-center outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function CheckpointEditor({
  checkpoints, onChange,
}: {
  checkpoints: Checkpoint[];
  onChange: (cps: Checkpoint[]) => void;
}) {
  const { user } = useAuth();
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);

  const update = (i: number, patch: Partial<Checkpoint>) => {
    const next = checkpoints.map((c, idx) => (idx === i ? { ...c, ...patch } : c));
    onChange(next);
  };
  const remove = (i: number) =>
    onChange(checkpoints.filter((_, idx) => idx !== i).map((c, idx) => ({ ...c, position: idx })));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= checkpoints.length) return;
    const next = [...checkpoints];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next.map((c, idx) => ({ ...c, position: idx })));
  };
  const add = () =>
    onChange([
      ...checkpoints,
      { position: checkpoints.length, photo_url: "", arrow_direction: "up", note: "", indicators: [] },
    ]);

  const onUpload = async (i: number, file: File) => {
    if (!user) return;
    setUploadingIdx(i);
    try {
      const url = await uploadAsset(file, user.id, "checkpoints");
      update(i, { photo_url: url });
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setUploadingIdx(null);
    }
  };

  const addIndicator = (i: number, type: "direction" | "spot") => {
    const c = checkpoints[i];
    const list = c.indicators ?? [];
    if (list.some((ind) => ind.type === type)) return; // one of each type max
    const base = { id: uid(), x: 0.5, y: 0.5 };
    const next: Indicator =
      type === "direction"
        ? { ...base, type: "direction", direction: "up" }
        : { ...base, type: "spot", label: "" };
    update(i, { indicators: [...list, next] });
  };

  const setIndicators = (i: number, indicators: Indicator[]) => {
    // keep legacy arrow_direction in sync with the direction indicator if present
    const dir = indicators.find((x) => x.type === "direction") as Extract<Indicator, { type: "direction" }> | undefined;
    update(i, { indicators, ...(dir ? { arrow_direction: dir.direction } : {}) });
  };

  return (
    <div className="space-y-4">
      {checkpoints.map((c, i) => {
        const indicators = c.indicators ?? [];
        const dir = indicators.find((x) => x.type === "direction") as Extract<Indicator, { type: "direction" }> | undefined;
        const hasSpot = indicators.some((x) => x.type === "spot");
        return (
          <div key={i} className="bg-card border border-border rounded-2xl p-4 animate-fade-in-up">
            <div className="flex items-center justify-between mb-3">
              <div className="eyebrow text-muted-foreground">Step {i + 1}</div>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" onClick={() => move(i, -1)} disabled={i === 0}><ArrowUp className="size-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => move(i, 1)} disabled={i === checkpoints.length - 1}><ArrowDown className="size-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => remove(i)}><Trash2 className="size-4 text-destructive" /></Button>
              </div>
            </div>

            <div className="space-y-3">
              {c.photo_url ? (
                <PhotoCanvas
                  photoUrl={c.photo_url}
                  indicators={indicators}
                  onChange={(next) => setIndicators(i, next)}
                />
              ) : (
                <label className="block w-full aspect-[4/3] rounded-xl border-2 border-dashed border-border overflow-hidden cursor-pointer relative bg-muted hover:border-accent transition-smooth">
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-xs gap-1">
                    <Upload className="size-5" />
                    {uploadingIdx === i ? "Uploading…" : "Upload photo"}
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onUpload(i, e.target.files[0])} />
                </label>
              )}

              {c.photo_url && (
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => addIndicator(i, "direction")}
                    disabled={!!dir}
                    className={`inline-flex items-center gap-1.5 rounded-full px-4 h-9 text-xs font-medium border transition-smooth ${
                      dir
                        ? "bg-foreground text-background border-foreground"
                        : "border-border text-foreground hover:border-foreground"
                    } disabled:cursor-default`}
                  >
                    <ArrowUpIcon className="size-3.5" /> Direction
                  </button>
                  <button
                    type="button"
                    onClick={() => addIndicator(i, "spot")}
                    disabled={hasSpot}
                    className={`inline-flex items-center gap-1.5 rounded-full px-4 h-9 text-xs font-medium border transition-smooth ${
                      hasSpot
                        ? "bg-foreground text-background border-foreground"
                        : "border-border text-foreground hover:border-foreground"
                    } disabled:cursor-default`}
                  >
                    <Circle className="size-3 fill-current" /> Spot
                  </button>
                  <label className="ml-auto text-xs text-accent hover:underline cursor-pointer">
                    Replace photo
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onUpload(i, e.target.files[0])} />
                  </label>
                </div>
              )}

              {dir && (
                <div>
                  <Label className="text-xs">Arrow direction</Label>
                  <div className="grid grid-cols-8 gap-1 mt-1.5">
                    {DIRECTIONS.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setIndicators(i, indicators.map((ind) => ind.id === dir.id ? { ...ind, direction: d } as Indicator : ind))}
                        className={`aspect-square rounded-lg border flex items-center justify-center transition-smooth ${
                          dir.direction === d ? "bg-accent text-accent-foreground border-accent" : "border-border hover:border-foreground text-muted-foreground"
                        }`}
                      >
                        <DirectionalArrow direction={d} size={20} color="currentColor" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <Label className="text-xs">Note (optional)</Label>
                <Textarea
                  rows={2}
                  value={c.note ?? ""}
                  onChange={(e) => update(i, { note: e.target.value })}
                  placeholder="e.g. Turn right at the blue door"
                  className="mt-1.5 resize-none"
                />
              </div>
            </div>
          </div>
        );
      })}
      <Button variant="outline" onClick={add} className="w-full rounded-2xl h-14 border-dashed">
        <Plus className="size-4 mr-2" /> Add checkpoint
      </Button>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { uploadAsset } from "@/lib/upload";
import { useAuth } from "@/lib/auth";
import { CurvedArrow } from "@/components/CurvedArrow";
import { ArrowDown, ArrowUp, Trash2, Upload, Plus, ArrowUp as ArrowUpIcon, Circle, X, RotateCw } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

// Legacy 8-direction value kept for backward compat with old saved data
export type LegacyDirection =
  | "up" | "up-right" | "right" | "down-right"
  | "down" | "down-left" | "left" | "up-left";
const LEGACY_DIR_TO_ANGLE: Record<LegacyDirection, number> = {
  up: 0, "up-right": 45, right: 90, "down-right": 135,
  down: 180, "down-left": 225, left: 270, "up-left": 315,
};

export type Indicator =
  | { id: string; type: "direction"; x: number; y: number; angle: number; direction?: LegacyDirection }
  | { id: string; type: "spot"; x: number; y: number; label: string };

export type Checkpoint = {
  id?: string;
  position: number;
  photo_url: string;
  arrow_direction: LegacyDirection; // legacy
  note: string | null;
  indicators?: Indicator[];
};

const uid = () => Math.random().toString(36).slice(2, 10);
const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

// Normalize indicators read from DB (may have only legacy `direction` field)
export function normalizeIndicator(ind: any): Indicator {
  if (ind?.type === "direction") {
    const angle =
      typeof ind.angle === "number"
        ? ind.angle
        : LEGACY_DIR_TO_ANGLE[ind.direction as LegacyDirection] ?? 45;
    return { id: ind.id, type: "direction", x: ind.x, y: ind.y, angle };
  }
  return ind as Indicator;
}

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
  const dragRef = useRef<{ id: string; mode: "move" | "rotate"; moved: boolean } | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const update = (id: string, patch: Partial<Indicator>) =>
    onChange(indicators.map((i) => (i.id === id ? ({ ...i, ...patch } as Indicator) : i)));
  const remove = (id: string) => onChange(indicators.filter((i) => i.id !== id));

  const startDrag = (e: React.PointerEvent, id: string, mode: "move" | "rotate") => {
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = { id, mode, moved: false };
    setDraggingId(id);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const ind = indicators.find((i) => i.id === dragRef.current!.id);
    if (!ind) return;
    if (dragRef.current.mode === "move") {
      const x = clamp01((e.clientX - rect.left) / rect.width);
      const y = clamp01((e.clientY - rect.top) / rect.height);
      if (Math.abs(x - ind.x) > 0.005 || Math.abs(y - ind.y) > 0.005) dragRef.current.moved = true;
      update(dragRef.current.id, { x, y } as Partial<Indicator>);
    } else if (ind.type === "direction") {
      const cx = rect.left + ind.x * rect.width;
      const cy = rect.top + ind.y * rect.height;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      // CSS rotate(θ) maps (0,L) → (−L sinθ, L cosθ).
      // Solve for θ given the tail at (dx, dy): θ = atan2(−dx, dy)
      let a = (Math.atan2(-dx, dy) * 180) / Math.PI;
      if (a < 0) a += 360;
      dragRef.current.moved = true;
      update(dragRef.current.id, { angle: a } as Partial<Indicator>);
    }
  };

  const endDrag = () => { dragRef.current = null; setDraggingId(null); };

  const ARROW_SIZE = 120;
  // Tail offset in pixels from indicator center, before rotation: (0, +TAIL_R)
  // Matches CurvedArrow viewBox: tail at y=100, scale = ARROW_SIZE / 200 = 0.6 → 60px
  const TAIL_R = (ARROW_SIZE / 200) * 100;

  return (
    <div
      ref={ref}
      className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-muted select-none"
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <img src={photoUrl} alt="" className="absolute inset-0 w-full h-full object-cover pointer-events-none" draggable={false} />
      {indicators.map((ind) => (
        <div
          key={ind.id}
          className="absolute group"
          style={{ left: `${ind.x * 100}%`, top: `${ind.y * 100}%`, transform: "translate(-50%, -50%)", touchAction: "none" }}
        >
          {ind.type === "direction" ? (
            <div className="relative" style={{ width: ARROW_SIZE, height: ARROW_SIZE, marginLeft: -ARROW_SIZE/2, marginTop: -ARROW_SIZE/2, left: "50%", top: "50%", position: "absolute" }}>
              {/* Arrow body — drag to move (tip stays anchored to indicator center) */}
              <div
                className="absolute inset-0 cursor-grab active:cursor-grabbing"
                onPointerDown={(e) => startDrag(e, ind.id, "move")}
                title="Drag to move"
              >
                <CurvedArrow angle={ind.angle} size={ARROW_SIZE} color="white" animate={draggingId !== ind.id} />
              </div>
              {/* Rotation handle at tail */}
              <button
                type="button"
                onPointerDown={(e) => startDrag(e, ind.id, "rotate")}
                className="absolute size-6 rounded-full bg-white border-2 border-foreground shadow-md flex items-center justify-center cursor-grab active:cursor-grabbing hover:scale-110 transition-transform"
                style={{
                  left: `calc(50% + ${-Math.sin((ind.angle * Math.PI) / 180) * TAIL_R}px)`,
                  top: `calc(50% + ${Math.cos((ind.angle * Math.PI) / 180) * TAIL_R}px)`,
                  transform: "translate(-50%, -50%)",
                  touchAction: "none",
                }}
                title="Drag to rotate"
                aria-label="Rotate arrow"
              >
                <RotateCw className="size-3 text-foreground" />
              </button>
              {/* Remove — anchored to the rotation handle's top-right corner */}
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); remove(ind.id); }}
                className="absolute size-7 rounded-full bg-foreground text-background flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                style={{
                  left: `calc(50% + ${-Math.sin((ind.angle * Math.PI) / 180) * TAIL_R + 36}px)`,
                  top: `calc(50% + ${Math.cos((ind.angle * Math.PI) / 180) * TAIL_R - 64}px)`,
                  touchAction: "none",
                }}
                aria-label="Remove arrow"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center" style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.55))" }}>
              <div
                className="relative cursor-grab active:cursor-grabbing"
                onPointerDown={(e) => startDrag(e, ind.id, "move")}
                title="Drag to move"
              >
                <span className="block absolute inset-0 rounded-full bg-white animate-spot-pulse" aria-hidden />
                <span className="relative block size-5 rounded-full bg-white border-2 border-foreground" />
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
        ? { ...base, type: "direction", angle: 45 } // default upper-right
        : { ...base, type: "spot", label: "" };
    update(i, { indicators: [...list, next] });
  };

  const setIndicators = (i: number, indicators: Indicator[]) => {
    update(i, { indicators });
  };

  return (
    <div className="space-y-4">
      {checkpoints.map((c, i) => {
        const indicators = (c.indicators ?? []).map(normalizeIndicator);
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
                <p className="text-[11px] text-muted-foreground">
                  Drag the arrow to move it. Drag the white handle at the tail to rotate.
                </p>
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

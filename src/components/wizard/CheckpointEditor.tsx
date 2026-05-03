import { DIRECTIONS, Direction, DirectionalArrow } from "@/components/DirectionalArrow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { uploadAsset } from "@/lib/upload";
import { useAuth } from "@/lib/auth";
import { ArrowDown, ArrowUp, Trash2, Upload, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export type Checkpoint = {
  id?: string;
  position: number;
  photo_url: string;
  arrow_direction: Direction;
  note: string | null;
};

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
  const remove = (i: number) => onChange(checkpoints.filter((_, idx) => idx !== i).map((c, idx) => ({ ...c, position: idx })));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= checkpoints.length) return;
    const next = [...checkpoints];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next.map((c, idx) => ({ ...c, position: idx })));
  };
  const add = () =>
    onChange([...checkpoints, { position: checkpoints.length, photo_url: "", arrow_direction: "up", note: "" }]);

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

  return (
    <div className="space-y-4">
      {checkpoints.map((c, i) => (
        <div key={i} className="bg-card border border-border rounded-2xl p-4 animate-fade-in-up">
          <div className="flex items-center justify-between mb-3">
            <div className="eyebrow text-muted-foreground">Step {i + 1}</div>
            <div className="flex gap-1">
              <Button size="icon" variant="ghost" onClick={() => move(i, -1)} disabled={i === 0}><ArrowUp className="size-4" /></Button>
              <Button size="icon" variant="ghost" onClick={() => move(i, 1)} disabled={i === checkpoints.length - 1}><ArrowDown className="size-4" /></Button>
              <Button size="icon" variant="ghost" onClick={() => remove(i)}><Trash2 className="size-4 text-destructive" /></Button>
            </div>
          </div>

          <div className="grid sm:grid-cols-[140px_1fr] gap-4">
            <div>
              <label className="block aspect-square rounded-xl border-2 border-dashed border-border overflow-hidden cursor-pointer relative bg-muted hover:border-accent transition-smooth">
                {c.photo_url ? (
                  <img src={c.photo_url} className="w-full h-full object-cover" alt="" />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-xs gap-1">
                    <Upload className="size-5" />
                    {uploadingIdx === i ? "Uploading…" : "Photo"}
                  </div>
                )}
                {c.photo_url && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <DirectionalArrow direction={c.arrow_direction} size={64} color="white" />
                  </div>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onUpload(i, e.target.files[0])} />
              </label>
            </div>
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Direction</Label>
                <div className="grid grid-cols-8 gap-1 mt-1.5">
                  {DIRECTIONS.map((d) => (
                    <button key={d} type="button" onClick={() => update(i, { arrow_direction: d })}
                      className={`aspect-square rounded-lg border flex items-center justify-center transition-smooth ${
                        c.arrow_direction === d ? "bg-accent text-accent-foreground border-accent" : "border-border hover:border-foreground text-muted-foreground"
                      }`}>
                      <DirectionalArrow direction={d} size={20} color="currentColor" />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-xs">Note (optional)</Label>
                <Textarea rows={2} value={c.note ?? ""} onChange={(e) => update(i, { note: e.target.value })}
                  placeholder="e.g. Turn right at the blue door" className="mt-1.5 resize-none" />
              </div>
            </div>
          </div>
        </div>
      ))}
      <Button variant="outline" onClick={add} className="w-full rounded-2xl h-14 border-dashed">
        <Plus className="size-4 mr-2" /> Add checkpoint
      </Button>
    </div>
  );
}

import { DirectionalArrow } from "@/components/DirectionalArrow";
import type { Checkpoint, Indicator } from "./CheckpointEditor";
import { useState } from "react";

function PreviewIndicators({ indicators, fallbackDir }: { indicators: Indicator[]; fallbackDir: any }) {
  if (!indicators || indicators.length === 0) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <DirectionalArrow direction={fallbackDir} size={120} color="white" pulse />
      </div>
    );
  }
  return (
    <>
      {indicators.map((ind) => (
        <div
          key={ind.id}
          className="absolute"
          style={{ left: `${ind.x * 100}%`, top: `${ind.y * 100}%`, transform: "translate(-50%, -50%)" }}
        >
          {ind.type === "direction" ? (
            <div style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.55))" }}>
              <DirectionalArrow direction={ind.direction} size={80} color="white" />
            </div>
          ) : (
            <div className="flex flex-col items-center" style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.55))" }}>
              <div className="relative">
                <span className="block absolute inset-0 rounded-full bg-white animate-spot-pulse" aria-hidden />
                <span className="relative block size-4 rounded-full bg-white border-2 border-foreground" />
              </div>
              {ind.label && (
                <span className="mt-1 px-1.5 py-0.5 text-[9px] font-medium text-foreground bg-white/95 rounded">
                  {ind.label}
                </span>
              )}
            </div>
          )}
        </div>
      ))}
    </>
  );
}

export function MobilePreview({
  studioName, logoUrl, accent, welcome, checkpoints,
}: {
  studioName: string;
  logoUrl: string | null;
  accent: string;
  welcome: string;
  checkpoints: Checkpoint[];
}) {
  const [step, setStep] = useState(-1); // -1 = welcome, length = arrived
  const total = checkpoints.length;
  const cp = step >= 0 && step < total ? checkpoints[step] : null;

  return (
    <div className="sticky top-24">
      <div className="mx-auto w-[280px]">
        <div className="relative aspect-[9/19.5] rounded-[2.5rem] bg-primary p-2.5 shadow-elegant">
          <div className="h-full w-full rounded-[2rem] overflow-hidden bg-card flex flex-col relative">
            {step === -1 && (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center" style={{ backgroundColor: accent + "10" }}>
                {logoUrl ? (
                  <img src={logoUrl} alt="" className="size-16 rounded-full object-cover mb-3" />
                ) : (
                  <div className="size-16 rounded-full mb-3" style={{ backgroundColor: accent }} />
                )}
                <div className="font-display text-xl mb-2">{studioName || "Your studio"}</div>
                <p className="text-xs text-muted-foreground mb-5">{welcome}</p>
                <button onClick={() => setStep(0)} disabled={total === 0}
                  className="rounded-full px-6 py-2 text-xs font-medium text-white disabled:opacity-50"
                  style={{ backgroundColor: accent }}>
                  Start →
                </button>
              </div>
            )}
            {cp && (
              <>
                <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 text-[10px] eyebrow text-white/90 bg-black/30 backdrop-blur px-2 py-1 rounded-full">
                  {step + 1} of {total}
                </div>
                <div className="flex-1 relative bg-muted">
                  {cp.photo_url ? (
                    <img src={cp.photo_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">No photo</div>
                  )}
                  <PreviewIndicators indicators={cp.indicators ?? []} fallbackDir={cp.arrow_direction} />
                </div>
                <div className="bg-card p-3 border-t border-border">
                  {cp.note && <p className="text-xs mb-2">{cp.note}</p>}
                  <button onClick={() => setStep(step + 1)}
                    className="w-full rounded-full py-2 text-xs font-medium text-white"
                    style={{ backgroundColor: accent }}>
                    I'm here ✓
                  </button>
                </div>
              </>
            )}
            {step === total && total > 0 && (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center" style={{ backgroundColor: accent + "20" }}>
                <div className="text-4xl mb-3">🎉</div>
                <div className="font-display text-xl mb-1">You made it!</div>
                <p className="text-xs text-muted-foreground">Welcome to {studioName}</p>
                <button onClick={() => setStep(-1)} className="mt-4 text-xs text-muted-foreground underline">Restart</button>
              </div>
            )}
          </div>
        </div>
        <div className="text-center mt-3 eyebrow text-muted-foreground">Live preview</div>
      </div>
    </div>
  );
}

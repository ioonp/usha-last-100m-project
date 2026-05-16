import { Link } from "react-router-dom";
import { useState } from "react";
import { DirectionalArrow, Direction } from "@/components/DirectionalArrow";

const DEMO = {
  studio: "Sunlight Studio",
  accent: "#b45309",
  welcome: "Welcome! Follow the photos to find us.",
  steps: [
    { photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900", direction: "up-right" as Direction, note: "Walk past the café and head toward the brick building." },
    { photo: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=900", direction: "right" as Direction, note: "Turn right at the blue door." },
    { photo: "https://images.unsplash.com/photo-1559302504-64aae6ca6b6d?w=900", direction: "up" as Direction, note: "Take the stairs up one flight." },
  ],
};

export default function Demo() {
  const [step, setStep] = useState(-1);
  const total = DEMO.steps.length;
  const cp = step >= 0 && step < total ? DEMO.steps[step] : null;
  const accent = DEMO.accent;

  if (step === -1) return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 text-center" style={{ backgroundColor: accent + "12" }}>
      <div className="max-w-sm">
        <div className="size-20 rounded-full mx-auto mb-5" style={{ backgroundColor: accent }} />
        <h1 className="font-display text-4xl mb-3">{DEMO.studio}</h1>
        <p className="text-muted-foreground mb-8">{DEMO.welcome}</p>
        <button onClick={() => setStep(0)} className="w-full rounded-full py-4 text-white font-medium shadow-elegant" style={{ backgroundColor: accent }}>
          Start the walk →
        </button>
        <Link to="/" className="block mt-6 text-xs text-muted-foreground underline">← Back to Usha</Link>
      </div>
    </div>
  );

  if (step >= total) return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 text-center" style={{ backgroundColor: accent + "20" }}>
      <div className="text-6xl mb-4">🎉</div>
      <h1 className="font-display text-4xl mb-2">You made it!</h1>
      <p className="text-muted-foreground mb-8">That's a demo. Build your own in minutes.</p>
      <Link to="/auth?mode=signup" className="rounded-full py-3 px-7 bg-primary text-primary-foreground">Create an account</Link>
    </div>
  );

  return (
    <div className="min-h-[100dvh] bg-black flex flex-col">
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 text-xs eyebrow text-white/90 bg-black/40 backdrop-blur px-3 py-1.5 rounded-full">
        Step {step + 1} of {total}
      </div>
      <div className="flex-1 relative">
        <img key={cp!.photo} src={cp!.photo} alt="" className="absolute inset-0 w-full h-full object-cover animate-fade-in" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/40" />
        <div className="absolute inset-0 flex items-center justify-center">
          <DirectionalArrow direction={cp!.direction} size={200} color="white" pulse />
        </div>
      </div>
      <div className="bg-card rounded-t-3xl p-5 pb-8">
        <p className="text-base mb-4 text-center">{cp!.note}</p>
        <button onClick={() => setStep(step + 1)} className="w-full rounded-full py-4 text-white font-semibold shadow-elegant" style={{ backgroundColor: accent }}>
          I'm here ✓
        </button>
      </div>
    </div>
  );
}

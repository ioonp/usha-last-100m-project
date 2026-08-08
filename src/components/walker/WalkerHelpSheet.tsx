import { MapPin } from "lucide-react";
import { walkerStrings } from "@/lib/strings";

type WalkerHelpSheetProps = {
  /** Venue name shown in the contact card (loc.studio_name). */
  venueName: string;
  /** Pre-formatted address / coordinates line. */
  addressLine: string;
  /** Optional "look for" hint (loc.start_note). */
  lookFor?: string | null;
  /** Brand accent for the Open-in-Maps action. */
  accent: string;
  /** Whether start coordinates exist — gates the Open-in-Maps button. */
  hasCoords: boolean;
  /** Opens the venue location in the native maps app. */
  onOpenMaps: () => void;
  /** Dismisses the sheet (backdrop, close button). */
  onDismiss: () => void;
};

/**
 * Shared stuck/help + venue-contact fallback sheet, reached from both walker
 * formats — the photo stepper and the video reel. Content is walkerStrings.help;
 * it surfaces the venue details that exist and defers to the caller's map
 * handler. Extracted verbatim from Viewer's inline sheet, so both paths render
 * and behave identically. The parent gates visibility; this only renders the
 * open sheet.
 */
export function WalkerHelpSheet({
  venueName,
  addressLine,
  lookFor,
  accent,
  hasCoords,
  onOpenMaps,
  onDismiss,
}: WalkerHelpSheetProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={walkerStrings.help.title}
    >
      <button
        type="button"
        aria-label={walkerStrings.help.dismiss}
        onClick={onDismiss}
        className="absolute inset-0 bg-black/60"
      />
      <div
        className="relative w-full max-w-md bg-[#111110] text-white rounded-t-3xl px-5 pt-3 shadow-2xl animate-fade-in-up"
        style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/25" />
        <h2 className="font-display text-2xl mb-1.5">{walkerStrings.help.title}</h2>
        <p className="text-white/70 text-sm leading-snug mb-5">{walkerStrings.help.body}</p>

        <div className="rounded-2xl bg-white/[0.06] border border-white/10 p-4 mb-4">
          <div className="text-[11px] font-medium uppercase tracking-wider text-white/50 mb-1">
            {walkerStrings.help.venueLabel}
          </div>
          <div className="text-base font-semibold mb-1">{venueName}</div>
          <div className="text-sm text-white/70 break-words">{addressLine}</div>
          {lookFor && (
            <div className="mt-2 text-sm text-white/60">
              <span className="text-[11px] font-medium uppercase tracking-wider text-white/40 mr-1">
                {walkerStrings.help.lookForLabel}
              </span>
              {lookFor}
            </div>
          )}
        </div>

        {hasCoords && (
          <button
            type="button"
            onClick={onOpenMaps}
            className="w-full rounded-full py-4 mb-2.5 font-semibold text-white text-base inline-flex items-center justify-center gap-2 active:scale-[0.98] transition-smooth"
            style={{ backgroundColor: accent }}
          >
            <MapPin className="size-4" />
            {walkerStrings.help.openMaps}
          </button>
        )}
        <button
          type="button"
          onClick={onDismiss}
          className="w-full rounded-full py-3.5 font-medium text-base border border-white/25 text-white active:scale-[0.98] transition-smooth"
        >
          {walkerStrings.help.dismiss}
        </button>
      </div>
    </div>
  );
}

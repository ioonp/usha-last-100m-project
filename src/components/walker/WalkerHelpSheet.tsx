import { useEffect } from "react";
import { MapPin, Phone, X } from "lucide-react";
import { walkerStrings } from "@/lib/strings";
import { trackEvent, type EventName } from "@/lib/analytics";

type WalkerHelpSheetProps = {
  /** Venue name (loc.studio_name). */
  venueName: string;
  /** Pre-formatted address / coordinates line. */
  addressLine: string;
  /** Street Entrance coordinates — the Maps button is hidden without both. */
  entranceLat?: number | null;
  entranceLng?: number | null;
  /** Optional venue phone; the Call button renders only when present. */
  venuePhone?: string | null;
  /** Restarts the guide from the beginning (the caller's existing mechanism). */
  onStartOver: () => void;
  /** Dismisses the sheet (backdrop, close button). */
  onDismiss: () => void;
  /** Analytics: the surface's help_opened event, guide slug and current step. */
  helpEvent: EventName;
  slug: string;
  stepIndex: number;
};

const PILL =
  "w-full h-[52px] rounded-full inline-flex items-center justify-center gap-2 text-base font-medium no-underline active:scale-[0.98] transition-smooth focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";
const GHOST = `${PILL} border border-[rgba(255,255,255,0.28)] bg-transparent text-white`;

/**
 * Shared stuck/help sheet, reached from both walker formats — the photo
 * stepper and the video reel. Content is walkerStrings.help. The parent gates
 * visibility; this only renders the open sheet.
 */
export function WalkerHelpSheet({
  venueName,
  addressLine,
  entranceLat,
  entranceLng,
  venuePhone,
  onStartOver,
  onDismiss,
  helpEvent,
  slug,
  stepIndex,
}: WalkerHelpSheetProps) {
  // The sheet mounts only while open, so mount == "help opened".
  useEffect(() => {
    trackEvent(helpEvent, { slug, index: stepIndex });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasEntrance = entranceLat != null && entranceLng != null;
  const phone = venuePhone?.trim();

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
        className="relative w-full max-w-md max-h-[92dvh] overflow-y-auto bg-[#111110] text-white rounded-t-3xl px-5 pt-3 shadow-2xl animate-fade-in-up"
        style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/25" />
        <button
          type="button"
          aria-label={walkerStrings.help.dismiss}
          onClick={onDismiss}
          className="absolute right-2 top-2 inline-flex size-11 items-center justify-center rounded-full text-white/70 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
        <h2 className="font-display font-semibold text-2xl mb-1.5 pr-10">{walkerStrings.help.title}</h2>
        <p className="text-white/70 text-sm leading-snug mb-4">{walkerStrings.help.body}</p>
        <p className="text-[14px] leading-snug text-white/55 break-words mb-6">
          {venueName} · {addressLine}
        </p>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => {
              onDismiss();
              onStartOver();
            }}
            className={`${PILL} bg-white text-[#0A0A0A]`}
          >
            {walkerStrings.help.startOver}
          </button>
          {hasEntrance && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${entranceLat},${entranceLng}`}
              target="_blank"
              rel="noopener noreferrer"
              className={GHOST}
            >
              <MapPin className="size-4" aria-hidden="true" />
              {walkerStrings.help.openEntranceMaps}
            </a>
          )}
          {phone && (
            <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className={GHOST}>
              <Phone className="size-4" aria-hidden="true" />
              {walkerStrings.help.callVenue(venueName)}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

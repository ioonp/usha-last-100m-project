import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import { RequestForm } from "@/components/RequestForm";
import { VideoRequestContext } from "./videoRequestContext";

// The one and only video-guide request modal on the landing page. Every
// "get a video guide" CTA (navbar, hero, options card, closing section) opens
// this same instance via useVideoRequest().
export function VideoRequestProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  // The CTA that opened the modal — RequestForm returns focus here on close.
  const triggerRef = useRef<HTMLElement | null>(null);

  const openVideoRequest = useCallback((trigger?: HTMLElement | null) => {
    triggerRef.current = trigger ?? null;
    setOpen(true);
  }, []);

  const value = useMemo(() => ({ openVideoRequest }), [openVideoRequest]);

  return (
    <VideoRequestContext.Provider value={value}>
      {children}
      <RequestForm
        formType="video_guide"
        open={open}
        onClose={() => setOpen(false)}
        triggerRef={triggerRef}
      />
    </VideoRequestContext.Provider>
  );
}

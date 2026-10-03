import { createContext, useContext } from "react";

type VideoRequestContextValue = {
  /** Opens the video-guide request modal. Pass the clicked element so focus
   *  returns to it when the modal closes. */
  openVideoRequest: (trigger?: HTMLElement | null) => void;
};

export const VideoRequestContext = createContext<VideoRequestContextValue | null>(null);

export function useVideoRequest() {
  const ctx = useContext(VideoRequestContext);
  if (!ctx) throw new Error("useVideoRequest must be used inside VideoRequestProvider");
  return ctx;
}

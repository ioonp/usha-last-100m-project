import { landingStrings } from "@/lib/strings";

// Landing CTA destinations. Sign in and "create a free guide" reuse the exact
// routes the rest of the app already uses for auth; the video CTAs open a
// mailto built from the address + subject constant in landingStrings.
export const SIGN_IN_ROUTE = "/auth";
export const CREATE_GUIDE_ROUTE = "/auth?mode=signup";

export function videoMailtoHref() {
  const { to, subject } = landingStrings.videoRequestEmail;
  return `mailto:${to}?subject=${encodeURIComponent(subject)}`;
}

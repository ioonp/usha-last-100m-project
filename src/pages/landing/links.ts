// Landing CTA destinations. Sign in and "create a free guide" reuse the exact
// routes the rest of the app already uses for auth. The video CTAs open the
// shared request modal (see VideoRequestProvider), not a mailto.
export const SIGN_IN_ROUTE = "/auth";
export const CREATE_GUIDE_ROUTE = "/auth?mode=signup";

// Deep link that opens the video-guide request modal on load, e.g. from the
// Walker completion screen ("/?request=video&from=guide-end"). The parameter
// is removed from the URL once the modal opens.
export const VIDEO_REQUEST_PARAM = "request";
export const VIDEO_REQUEST_PARAM_VALUE = "video";

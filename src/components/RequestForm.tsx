import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { supabase } from "@/integrations/supabase/client";
import { landingStrings } from "@/lib/strings";

const t = landingStrings.requestForm;

type FieldKey = "name" | "email" | "venue" | "address";
type Status = "idle" | "sending" | "success" | "error";

type RequestFormProps = {
  /** Which form this is — future forms reuse the component with a different type. */
  formType: string;
  open: boolean;
  onClose: () => void;
  /** Focus returns here on close (the button that opened the form). */
  triggerRef?: React.RefObject<HTMLElement>;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMPTY = { name: "", email: "", venue: "", address: "", note: "" };

export function RequestForm({ formType, open, onClose, triggerRef }: RequestFormProps) {
  const [values, setValues] = useState({ ...EMPTY });
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [honeypot, setHoneypot] = useState("");

  const panelRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const headingId = useMemo(() => `request-form-${Math.random().toString(36).slice(2, 8)}`, []);

  const reset = useCallback(() => {
    setValues({ ...EMPTY });
    setErrors({});
    setStatus("idle");
    setHoneypot("");
  }, []);

  const close = useCallback(() => {
    onClose();
    triggerRef?.current?.focus();
    // Reset after the closing transition so the next open starts fresh.
    setTimeout(reset, 250);
  }, [onClose, triggerRef, reset]);

  // Escape to close, focus the first field on open, lock body scroll, trap Tab.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key === "Tab" && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => firstFieldRef.current?.focus(), 60);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
      window.clearTimeout(focusTimer);
    };
  }, [open, close]);

  if (!open) return null;

  const setField = (key: keyof typeof EMPTY, v: string) => {
    setValues((s) => ({ ...s, [key]: v }));
    if (key !== "note" && errors[key as FieldKey]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = () => {
    const next: Partial<Record<FieldKey, string>> = {};
    if (!values.name.trim()) next.name = t.errors.name;
    if (!EMAIL_RE.test(values.email.trim())) next.email = t.errors.email;
    if (!values.venue.trim()) next.venue = t.errors.venue;
    if (!values.address.trim()) next.address = t.errors.address;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "sending") return;
    if (!validate()) return;
    setStatus("sending");
    try {
      const { data, error } = await supabase.functions.invoke("send-request-email", {
        body: {
          formType,
          name: values.name.trim(),
          email: values.email.trim(),
          venue_name: values.venue.trim(),
          address: values.address.trim(),
          note: values.note.trim(),
          honeypot,
        },
      });
      if (error || (data && (data as { error?: string }).error)) throw new Error("request failed");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  const sending = status === "sending";

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center md:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={headingId}
    >
      {/* Dimmed backdrop — tap to close. */}
      <button
        type="button"
        aria-label={t.close}
        onClick={close}
        className="absolute inset-0 bg-black/40 animate-fade-in"
      />

      {/* Panel: bottom sheet on mobile, centered card on desktop. */}
      <div
        ref={panelRef}
        className="relative w-full md:w-[520px] md:max-w-[calc(100vw-2rem)] max-h-[92vh] md:max-h-[90vh] overflow-y-auto bg-background text-foreground rounded-t-3xl md:rounded-3xl shadow-2xl px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 md:p-8 animate-fade-in-up"
      >
        {/* Mobile drag handle. */}
        <div className="md:hidden mx-auto mb-3 h-1.5 w-10 rounded-full bg-foreground/15" aria-hidden="true" />

        {/* Close button. */}
        <button
          type="button"
          aria-label={t.close}
          onClick={close}
          className="absolute right-4 top-4 md:right-5 md:top-5 inline-flex items-center justify-center size-9 rounded-full text-foreground/60 hover:text-foreground hover:bg-foreground/5 transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" /></svg>
        </button>

        {status === "success" ? (
          <div className="flex flex-col items-center text-center gap-3 py-8 md:py-10">
            <span className="inline-flex items-center justify-center size-14 rounded-full text-white" style={{ backgroundColor: "#2F7D5B" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
            </span>
            <h2 id={headingId} className="font-display text-2xl md:text-[26px] font-medium">{t.success.title}</h2>
            <p className="text-[15px] text-muted-foreground max-w-[36ch]">{t.success.body(values.email.trim())}</p>
            <button
              type="button"
              onClick={close}
              className="mt-3 inline-flex items-center justify-center h-12 px-8 rounded-full bg-primary text-primary-foreground text-base font-semibold"
            >
              {t.success.done}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 pt-2 md:pt-0">
            <div className="flex flex-col gap-1.5 pr-8">
              <h2 id={headingId} className="font-display text-[26px] md:text-3xl font-medium -tracking-[0.01em]">{t.heading}</h2>
              <p className="text-[15px] text-muted-foreground">{t.subline}</p>
            </div>

            {/* Honeypot — hidden from users, catches bots. */}
            <div aria-hidden="true" className="absolute -left-[9999px] top-0 h-0 w-0 overflow-hidden">
              <label>
                Company
                <input
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field
                ref={firstFieldRef}
                label={t.fields.name.label}
                placeholder={t.fields.name.placeholder}
                autoComplete="name"
                value={values.name}
                onChange={(v) => setField("name", v)}
                error={errors.name}
              />
              <Field
                type="email"
                label={t.fields.email.label}
                placeholder={t.fields.email.placeholder}
                autoComplete="email"
                inputMode="email"
                value={values.email}
                onChange={(v) => setField("email", v)}
                error={errors.email}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field
                label={t.fields.venue.label}
                placeholder={t.fields.venue.placeholder}
                autoComplete="organization"
                value={values.venue}
                onChange={(v) => setField("venue", v)}
                error={errors.venue}
              />
              <Field
                label={t.fields.address.label}
                placeholder={t.fields.address.placeholder}
                autoComplete="street-address"
                value={values.address}
                onChange={(v) => setField("address", v)}
                error={errors.address}
              />
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">{t.fields.note.label}</span>
              <textarea
                rows={3}
                placeholder={t.fields.note.placeholder}
                value={values.note}
                onChange={(e) => setField("note", e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-base leading-snug outline-none focus:border-foreground/40"
              />
            </label>

            {status === "error" && (
              <p className="text-[13px]" style={{ color: "#A8241B" }}>{t.errors.submit}</p>
            )}

            <button
              type="submit"
              disabled={sending}
              className="mt-1 inline-flex items-center justify-center h-12 rounded-full bg-primary text-primary-foreground text-base font-semibold disabled:opacity-60"
            >
              {sending ? t.sending : t.submit}
            </button>
            <p className="text-center text-[13px] text-muted-foreground">{t.footnote}</p>
          </form>
        )}
      </div>
    </div>,
    document.body,
  );
}

type FieldProps = {
  label: string;
  placeholder?: string;
  type?: string;
  autoComplete?: string;
  inputMode?: "email" | "text";
  value: string;
  onChange: (v: string) => void;
  error?: string;
};

const Field = forwardRef<HTMLInputElement, FieldProps>(function Field(
  { label, placeholder, type = "text", autoComplete, inputMode, value, onChange, error },
  ref,
) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      <input
        ref={ref}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        // 48px tall, 16px text so iOS doesn't zoom on focus.
        className={`h-12 w-full rounded-xl border bg-card px-3.5 text-base outline-none focus:border-foreground/40 ${error ? "border-[#A8241B]" : "border-border"}`}
      />
      {error && <span className="text-[13px]" style={{ color: "#A8241B" }}>{error}</span>}
    </label>
  );
});

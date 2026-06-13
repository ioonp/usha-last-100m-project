import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MapPinPicker } from "@/components/wizard/MapPinPicker";
import {
  PhotoCanvas,
  normalizeIndicator,
  uid,
  type Checkpoint,
  type Indicator,
} from "@/components/wizard/CheckpointEditor";
import { uploadAsset } from "@/lib/upload";
import { makeSlug } from "@/lib/slug";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  Copy,
  DoorOpen,
  Download,
  Hand,
  Loader2,
  MapPin,
  MapPinOff,
  Pencil,
  Plus,
  Trash2,
  ArrowUp as ArrowUpIcon,
  Circle,
} from "lucide-react";
import QRCode from "qrcode";

type Step = 0 | 1 | 2 | 3;
const STEPS = ["Street Entrance", "Checkpoints", "Branding", "Publish"];

type LocalCheckpoint = Checkpoint & { id?: string };

// Visual "handoff" explainer — the hero of the Street Entrance step. Three
// connected beats (Google Maps → you → Usha) with the high-contrast "I'll take
// it from here" pill sitting on the line at the handoff point between stage 1
// and stage 2. Sits open on the page; mobile-first, theme tokens only.
function HandoffStrip() {
  const stages = [
    {
      icon: MapPin,
      title: "Google Maps",
      body: "Brings visitors to the street.",
      sub: "It's reliable up to the address — then it drops them and stops.",
      highlight: false,
    },
    {
      icon: Hand,
      title: "You mark this spot",
      body: "Stand where Maps drops people off. Usha starts guiding from here.",
      sub: null,
      highlight: true,
    },
    {
      icon: DoorOpen,
      title: "Usha",
      body: "Walks them through the courtyard to the door.",
      sub: "Photo by photo, arrow by arrow — the part Maps can't show.",
      highlight: false,
    },
  ];

  return (
    <ol className="relative">
      {stages.map((s, i) => {
        const Icon = s.icon;
        const last = i === stages.length - 1;
        const isHandoff = i === 0; // the connector below stage 1 is the handoff
        return (
          <li
            key={i}
            className={`relative flex gap-4 ${last ? "pb-0" : isHandoff ? "pb-10" : "pb-7"}`}
            aria-current={s.highlight ? "step" : undefined}
          >
            {/* connecting line from this node down to the next */}
            {!last && (
              <span
                aria-hidden
                className="absolute left-[1.375rem] top-11 bottom-0 w-px -translate-x-1/2 bg-border"
              />
            )}
            <span
              aria-hidden
              className={`relative z-10 flex size-11 shrink-0 items-center justify-center rounded-full border ${
                s.highlight
                  ? "border-transparent bg-primary text-primary-foreground shadow-soft"
                  : "border-border bg-muted text-muted-foreground"
              }`}
            >
              <Icon className="size-5" />
            </span>
            <div className="min-w-0 pt-1.5">
              <p
                className={`text-sm font-semibold ${
                  s.highlight ? "text-foreground" : "text-foreground/90"
                }`}
              >
                {s.title}
              </p>
              <p className="mt-1 text-sm leading-snug text-foreground/70">{s.body}</p>
              {s.sub && (
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{s.sub}</p>
              )}
            </div>
            {/* handoff pill — high-contrast ink, threaded onto the line */}
            {isHandoff && (
              <span className="absolute bottom-3 left-3 z-20 inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-primary-foreground shadow-soft">
                <Hand className="size-3" aria-hidden /> I'll take it from here
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

export default function Capture() {
  const { id } = useParams();
  const isNew = id === "new";
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>(0);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [locationId, setLocationId] = useState<string | null>(isNew ? null : id ?? null);

  // location fields
  const [studioName, setStudioName] = useState("My Studio");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [accent, setAccent] = useState("#b45309");
  const [welcome, setWelcome] = useState("Welcome! Follow the photos to find us.");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [entranceNote, setEntranceNote] = useState("");
  const [startAddress, setStartAddress] = useState<string | null>(null);
  const [slug, setSlug] = useState("");
  const [published, setPublished] = useState(false);

  const [checkpoints, setCheckpoints] = useState<LocalCheckpoint[]>([]);
  const [editingIdx, setEditingIdx] = useState<number | null>(null); // index within checkpoints currently being captured/edited
  const [qrDataUrl, setQrDataUrl] = useState("");
  // idle  = default/neutral — button visible, no message (regardless of permissions.query)
  // loading = waiting on getCurrentPosition (native dialog may be open)
  // ok     = coords captured
  // denied = a getCurrentPosition tap returned code 1 PERMISSION_DENIED (site blocked) —
  //          the ONLY proof of a site block; shows the browser-settings message
  // error  = getCurrentPosition code 2 POSITION_UNAVAILABLE / 3 TIMEOUT (device GPS off/unavailable)
  // manual = user opted to set it on the map instead
  const [geoState, setGeoState] =
    useState<"idle" | "loading" | "ok" | "denied" | "error" | "manual">("idle");

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  // Load existing draft
  useEffect(() => {
    if (isNew || !user) return;
    (async () => {
      const { data: loc } = await supabase.from("locations").select("*").eq("id", id!).single();
      if (loc) {
        setStudioName(loc.studio_name);
        setLogoUrl(loc.logo_url);
        setAccent(loc.accent_color);
        setWelcome(loc.welcome_message);
        setLat(loc.start_lat);
        setLng(loc.start_lng);
        setEntranceNote(loc.start_note ?? "");
        setStartAddress((loc as any).start_address ?? null);
        setSlug(loc.slug);
        setPublished(loc.published);
        setLocationId(loc.id);
        if (loc.start_lat != null && loc.start_lng != null) setGeoState("ok");
      }
      const { data: cps } = await supabase
        .from("checkpoints")
        .select("*")
        .eq("location_id", id!)
        .order("position");
      if (cps) setCheckpoints(cps as any);
      // If user already has a Street Entrance, jump them into the checkpoint step.
      if (loc?.start_lat != null) setStep(loc.published ? 3 : 1);
      setLoading(false);
    })();
  }, [id, isNew, user]);

  // NOTE: we deliberately do NOT use navigator.permissions.query to drive the
  // button or the "blocked" message. On Android, when device (OS-level) GPS is
  // off, permissions.query reports "denied" even though the SITE isn't blocked —
  // which previously hid the button up-front and showed a false "blocked in
  // browser" message, never reaching the getCurrentPosition error-code branch.
  // Button visibility and any blocked/off message are decided ONLY by the actual
  // getCurrentPosition() error code after a tap (see requestGeo). The button
  // stays visible, so the user can fix the OS/browser setting and just tap again.

  const shareUrl = useMemo(() => (slug ? `${window.location.origin}/find/${slug}` : ""), [slug]);

  useEffect(() => {
    if (step === 3 && shareUrl) {
      QRCode.toDataURL(shareUrl, {
        width: 512,
        margin: 2,
        color: { dark: "#1a1410", light: "#faf6f0" },
      }).then(setQrDataUrl);
    }
  }, [step, shareUrl]);

  // ----- Persistence helpers -----

  const ensureLocation = async (): Promise<string | null> => {
    if (!user) return null;
    if (locationId) return locationId;
    const payload: any = {
      owner_id: user.id,
      studio_name: studioName,
      logo_url: logoUrl,
      accent_color: accent,
      welcome_message: welcome,
      start_lat: lat,
      start_lng: lng,
      start_note: entranceNote || null,
      start_address: startAddress || null,
      slug: makeSlug(studioName),
    };
    const { data, error } = await supabase.from("locations").insert(payload).select().single();
    if (error) {
      toast.error(error.message);
      return null;
    }
    setLocationId(data.id);
    setSlug(data.slug);
    return data.id;
  };

  const saveLocationMeta = async (extra: Record<string, any> = {}) => {
    if (!locationId) return;
    const { error } = await supabase
      .from("locations")
      .update({
        studio_name: studioName,
        logo_url: logoUrl,
        accent_color: accent,
        welcome_message: welcome,
        start_lat: lat,
        start_lng: lng,
        start_note: entranceNote || null,
        start_address: startAddress || null,
        ...extra,
      })
      .eq("id", locationId);
    if (error) toast.error(error.message);
  };

  // Insert or update a single checkpoint row, returning the id.
  const persistCheckpoint = async (cp: LocalCheckpoint, locId: string): Promise<string | null> => {
    const row: any = {
      location_id: locId,
      position: cp.position,
      photo_url: cp.photo_url,
      arrow_direction: cp.arrow_direction,
      note: cp.note || null,
      indicators: cp.indicators ?? [],
    };
    if (cp.id) {
      const { error } = await supabase.from("checkpoints").update(row).eq("id", cp.id);
      if (error) {
        toast.error(error.message);
        return null;
      }
      return cp.id;
    }
    const { data, error } = await supabase.from("checkpoints").insert(row).select("id").single();
    if (error) {
      toast.error(error.message);
      return null;
    }
    return data.id as string;
  };

  const deleteCheckpoint = async (idx: number) => {
    const cp = checkpoints[idx];
    if (cp.id) {
      await supabase.from("checkpoints").delete().eq("id", cp.id);
    }
    const next = checkpoints
      .filter((_, i) => i !== idx)
      .map((c, i) => ({ ...c, position: i }));
    setCheckpoints(next);
    // re-persist positions
    if (locationId) {
      for (const c of next) {
        if (c.id) await supabase.from("checkpoints").update({ position: c.position }).eq("id", c.id);
      }
    }
  };

  // ----- Step 1: GPS -----

  const requestGeo = () => {
    if (!navigator.geolocation) {
      setGeoState("manual");
      toast.error("Geolocation isn't available on this device. Pick on the map instead.");
      return;
    }
    setGeoState("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setStartAddress(null);
        setGeoState("ok");
      },
      (err) => {
        // PERMISSION_DENIED (1) -> the site is blocked; fix is browser settings.
        // POSITION_UNAVAILABLE (2) / TIMEOUT (3) -> device GPS is off/unavailable;
        // fix is the phone's location toggle, then tap the button again.
        setGeoState(err.code === err.PERMISSION_DENIED ? "denied" : "error");
      },
      // ~10s timeout so a missing GPS signal surfaces as TIMEOUT, not a hang
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  const confirmStreetEntrance = async () => {
    if (lat == null || lng == null) {
      toast.error("Mark your Street Entrance first");
      return;
    }
    setSaving(true);
    const lid = await ensureLocation();
    if (lid) await saveLocationMeta();
    setSaving(false);
    if (lid) setStep(1);
  };

  // ----- Step 2: Checkpoint capture -----

  const startNewCheckpoint = () => {
    const cp: LocalCheckpoint = {
      position: checkpoints.length,
      photo_url: "",
      arrow_direction: "up",
      note: "",
      indicators: [],
    };
    setCheckpoints((cs) => [...cs, cp]);
    setEditingIdx(checkpoints.length);
  };

  // ----- Step 4: Publish -----

  const publish = async () => {
    if (!locationId) return;
    if (checkpoints.filter((c) => c.photo_url).length === 0) {
      toast.error("Add at least one checkpoint first");
      setStep(1);
      return;
    }
    setSaving(true);
    await saveLocationMeta({ published: true });
    setSaving(false);
    setPublished(true);
    toast.success("Published!");
  };

  const downloadQR = () => {
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `${slug}-qr.png`;
    a.click();
  };

  if (loading)
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">
        Loading…
      </div>
    );

  // If user is editing a single checkpoint, render the full-screen capture view
  if (step === 1 && editingIdx != null) {
    const cp = checkpoints[editingIdx];
    if (!cp) {
      setEditingIdx(null);
      return null;
    }
    return (
      <CheckpointCaptureView
        index={editingIdx}
        total={checkpoints.length}
        checkpoint={cp}
        userId={user!.id}
        onChange={(patch) =>
          setCheckpoints((cs) => cs.map((c, i) => (i === editingIdx ? { ...c, ...patch } : c)))
        }
        onCancel={async () => {
          // If no photo, drop the empty draft from local state
          if (!cp.photo_url && !cp.id) {
            setCheckpoints((cs) => cs.filter((_, i) => i !== editingIdx));
          }
          setEditingIdx(null);
        }}
        onSave={async () => {
          if (!cp.photo_url) {
            toast.error("Take a photo first");
            return;
          }
          if (!locationId) return;
          const saved = await persistCheckpoint(cp, locationId);
          if (saved) {
            setCheckpoints((cs) =>
              cs.map((c, i) => (i === editingIdx ? { ...c, id: saved } : c)),
            );
            setEditingIdx(null);
          }
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-20">
        <div className="container mx-auto flex items-center justify-between gap-3 px-4 py-3">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-smooth shrink-0"
          >
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
          <div className="flex items-center gap-1.5 sm:gap-3">
            {STEPS.map((label, i) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  className={`size-6 sm:size-7 rounded-full text-xs flex items-center justify-center font-medium transition-smooth ${
                    i < step
                      ? "bg-accent text-accent-foreground"
                      : i === step
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {i < step ? <Check className="size-3.5" /> : i + 1}
                </div>
                <span
                  className={`text-xs hidden md:inline ${
                    i === step ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="eyebrow text-muted-foreground mb-2">Step {step + 1} of 4</div>
        <h1 className="font-display text-2xl sm:text-4xl mb-6">
          {step === 0 ? "Where Usha takes over" : STEPS[step]}
        </h1>

        {step === 0 && (
          <div className="space-y-6">
            <HandoffStrip />

            {/* Button stays visible in every pre-positioned state. Any message is
                driven ONLY by the actual getCurrentPosition error code after a tap
                (denied = site blocked; error = device GPS off/unavailable) — never
                by permissions.query, so an OS-level GPS-off isn't misread as a
                site block. The user fixes the setting and taps the same button. */}
            {(geoState === "idle" ||
              geoState === "loading" ||
              geoState === "denied" ||
              geoState === "error") && (
              <div className="space-y-2.5">
                {geoState === "denied" && (
                  <p className="flex items-start gap-2 text-xs text-muted-foreground">
                    <MapPinOff
                      className="size-3.5 shrink-0 mt-0.5 text-destructive/70"
                      aria-hidden
                    />
                    <span>
                      Location is blocked for this site. Enable it in your browser settings, then
                      tap again.
                    </span>
                  </p>
                )}
                {geoState === "error" && (
                  <p className="flex items-start gap-2 text-xs text-muted-foreground">
                    <MapPinOff
                      className="size-3.5 shrink-0 mt-0.5 text-destructive/70"
                      aria-hidden
                    />
                    <span>
                      Location is turned off on your phone. Turn it on in your device settings, then
                      tap “Use my location” again.
                    </span>
                  </p>
                )}

                <Button
                  onClick={requestGeo}
                  disabled={geoState === "loading"}
                  size="lg"
                  variant="outline"
                  className="w-full h-12 rounded-full text-base"
                >
                  {geoState === "loading" ? (
                    <>
                      <Loader2 className="size-5 mr-2 animate-spin motion-reduce:animate-none" />{" "}
                      Getting your location…
                    </>
                  ) : (
                    <>
                      <MapPin className="size-5 mr-2" /> Use my location
                    </>
                  )}
                </Button>

                {/* helper line only on the neutral/happy path */}
                {(geoState === "idle" || geoState === "loading") && (
                  <p className="text-xs text-muted-foreground">
                    Your exact spot here fixes Google's directions for every visitor.
                  </p>
                )}
              </div>
            )}

            {(geoState === "ok" || geoState === "manual" || (lat != null && lng != null)) && (
              <>
                <MapPinPicker
                  lat={lat}
                  lng={lng}
                  address={startAddress}
                  onChange={(la, ln, addr) => {
                    setLat(la);
                    setLng(ln);
                    setStartAddress(addr);
                  }}
                />
                <div>
                  <Label>Entrance note (optional)</Label>
                  <Textarea
                    rows={2}
                    value={entranceNote}
                    onChange={(e) => setEntranceNote(e.target.value)}
                    placeholder="e.g. Exit the metro and face north"
                    className="mt-1.5"
                  />
                </div>
              </>
            )}

            {geoState !== "ok" && geoState !== "manual" && (
              <button
                onClick={() => setGeoState("manual")}
                className="text-sm text-accent hover:underline w-full text-center rounded-md py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Set on the map instead
              </button>
            )}

            {lat != null && lng != null && (
              <Button
                onClick={confirmStreetEntrance}
                disabled={saving}
                size="lg"
                className="w-full rounded-full bg-primary text-primary-foreground h-12"
              >
                {saving ? "Saving…" : "This is the spot"} <ArrowRight className="size-4 ml-1" />
              </Button>
            )}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Walk the route. At each turn or landmark, snap a photo and place an arrow showing
              where to go next.
            </p>

            {checkpoints.length === 0 ? (
              <div className="border border-dashed border-border rounded-2xl p-8 text-center">
                <Camera className="size-8 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground mb-4">No checkpoints yet</p>
                <Button
                  onClick={startNewCheckpoint}
                  size="lg"
                  className="rounded-full bg-primary text-primary-foreground h-12 px-6"
                >
                  <Camera className="size-4 mr-2" /> Capture first checkpoint
                </Button>
              </div>
            ) : (
              <>
                <ul className="space-y-2">
                  {checkpoints.map((c, i) => (
                    <li
                      key={c.id ?? i}
                      className="flex items-center gap-3 bg-card border border-border rounded-2xl p-3"
                    >
                      <div className="size-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium shrink-0">
                        {i + 1}
                      </div>
                      {c.photo_url ? (
                        <img
                          src={c.photo_url}
                          alt=""
                          className="size-14 rounded-xl object-cover shrink-0"
                        />
                      ) : (
                        <div className="size-14 rounded-xl bg-muted shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="text-sm truncate">
                          {c.note || (i === 0 ? "Entrance" : `Step ${i + 1}`)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {(c.indicators?.length ?? 0) > 0 ? "Arrow placed" : "No arrow"}
                        </div>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setEditingIdx(i)}
                        title="Edit"
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteCheckpoint(i)}
                        title="Delete"
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={startNewCheckpoint}
                  variant="outline"
                  className="w-full rounded-2xl h-14 border-dashed"
                >
                  <Plus className="size-4 mr-2" /> Add next checkpoint
                </Button>
              </>
            )}

            <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3 pt-4">
              <Button variant="ghost" onClick={() => setStep(0)}>
                <ArrowLeft className="size-4 mr-1" /> Back
              </Button>
              <Button
                onClick={() => setStep(2)}
                disabled={checkpoints.filter((c) => c.photo_url).length === 0}
                className="rounded-full bg-primary text-primary-foreground px-6"
              >
                Finish route <ArrowRight className="size-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <p className="text-muted-foreground">
              A few finishing touches. You can skip this and edit later.
            </p>
            <div>
              <Label>Studio name</Label>
              <Input
                value={studioName}
                onChange={(e) => setStudioName(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Logo</Label>
              <div className="mt-1.5 flex items-center gap-4">
                {logoUrl ? (
                  <img src={logoUrl} className="size-16 rounded-full object-cover" alt="" />
                ) : (
                  <div className="size-16 rounded-full bg-muted" />
                )}
                <label className="cursor-pointer">
                  <span className="text-sm text-accent hover:underline">
                    {logoUrl ? "Replace" : "Upload"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f || !user) return;
                      try {
                        const url = await uploadAsset(f, user.id, "logos");
                        setLogoUrl(url);
                      } catch (err: any) {
                        toast.error(err.message);
                      }
                    }}
                  />
                </label>
              </div>
            </div>
            <div>
              <Label>Accent color</Label>
              <div className="mt-1.5 flex items-center gap-3 flex-wrap">
                <input
                  type="color"
                  value={accent}
                  onChange={(e) => setAccent(e.target.value)}
                  className="size-12 rounded-xl border border-border cursor-pointer"
                />
                <Input
                  value={accent}
                  onChange={(e) => setAccent(e.target.value)}
                  className="font-mono w-32"
                />
              </div>
            </div>
            <div>
              <Label>Welcome message</Label>
              <Textarea
                rows={3}
                value={welcome}
                onChange={(e) => setWelcome(e.target.value)}
                className="mt-1.5"
              />
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3 pt-4">
              <Button variant="ghost" onClick={() => setStep(1)}>
                <ArrowLeft className="size-4 mr-1" /> Back
              </Button>
              <Button
                onClick={async () => {
                  setSaving(true);
                  await saveLocationMeta();
                  setSaving(false);
                  setStep(3);
                }}
                disabled={saving}
                className="rounded-full bg-primary text-primary-foreground px-6"
              >
                {saving ? "Saving…" : "Continue"} <ArrowRight className="size-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            {!published ? (
              <>
                <p className="text-muted-foreground">
                  Ready to share? Publishing makes the page live at the URL below.
                </p>
                <Button
                  size="lg"
                  onClick={publish}
                  disabled={saving}
                  className="rounded-full bg-accent text-accent-foreground h-12 px-8 w-full sm:w-auto"
                >
                  {saving ? "Publishing…" : "Publish location"}
                </Button>
              </>
            ) : (
              <>
                <div className="bg-accent-soft border border-accent/20 rounded-2xl p-5 overflow-hidden">
                  <div className="eyebrow text-accent mb-1">Live</div>
                  <p className="font-display text-xl mb-3">Your wayfinding page is published.</p>
                  <div className="flex items-center gap-2 bg-card border border-border rounded-full p-1 pl-4 overflow-hidden">
                    <div className="text-sm font-mono flex-1 min-w-0 overflow-hidden whitespace-nowrap text-ellipsis">
                      {shareUrl}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="rounded-full"
                      onClick={() => {
                        navigator.clipboard.writeText(shareUrl);
                        toast.success("Copied");
                      }}
                    >
                      <Copy className="size-3.5" />
                    </Button>
                  </div>
                </div>
                {qrDataUrl && (
                  <div className="flex flex-col items-center bg-card border border-border rounded-2xl p-6">
                    <img src={qrDataUrl} alt="QR code" className="w-40 h-40" />
                    <Button onClick={downloadQR} variant="outline" className="rounded-full mt-4">
                      <Download className="size-4 mr-2" /> Download PNG
                    </Button>
                  </div>
                )}
                <div className="flex flex-col sm:flex-row gap-3">
                  <a href={shareUrl} target="_blank" rel="noreferrer" className="flex-1">
                    <Button variant="outline" className="w-full rounded-full">
                      Preview live page
                    </Button>
                  </a>
                  <Link to="/dashboard" className="flex-1">
                    <Button className="w-full rounded-full bg-primary text-primary-foreground">
                      Done
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

// ----- Full-screen single-checkpoint capture view -----

function CheckpointCaptureView({
  index,
  total,
  checkpoint,
  userId,
  onChange,
  onCancel,
  onSave,
}: {
  index: number;
  total: number;
  checkpoint: LocalCheckpoint;
  userId: string;
  onChange: (patch: Partial<LocalCheckpoint>) => void;
  onCancel: () => void;
  onSave: () => Promise<void>;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const isStart = index === 0;
  const indicators = (checkpoint.indicators ?? []).map(normalizeIndicator);
  const hasArrow = indicators.some((i) => i.type === "direction");
  const hasSpot = indicators.some((i) => i.type === "spot");

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const url = await uploadAsset(file, userId, "checkpoints");
      onChange({ photo_url: url });
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setUploading(false);
    }
  };

  const toggleIndicator = (type: "direction" | "spot") => {
    if (indicators.some((i) => i.type === type)) {
      onChange({ indicators: indicators.filter((i) => i.type !== type) });
      return;
    }
    const base = { id: uid(), x: 0.5, y: 0.5 };
    const next: Indicator =
      type === "direction"
        ? { ...base, type: "direction", angle: 45 }
        : { ...base, type: "spot", label: "" };
    onChange({ indicators: [...indicators, next] });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-20">
        <div className="container mx-auto flex items-center justify-between px-4 py-3 max-w-2xl">
          <button
            onClick={onCancel}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" /> Back
          </button>
          <div className="text-xs text-muted-foreground">
            {isStart ? "Starting point" : `Step ${index + 1}`} of {total}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-5 max-w-2xl space-y-4">
        {isStart && (
          <p className="text-xs text-muted-foreground">
            Photograph the building entrance from the spot where visitors arrive. This is the first
            frame of the route.
          </p>
        )}

        {!checkpoint.photo_url ? (
          <label className="block w-full aspect-square rounded-2xl border-2 border-dashed border-border overflow-hidden cursor-pointer relative bg-muted hover:border-accent transition-smooth">
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
              {uploading ? (
                <>
                  <Loader2 className="size-8 animate-spin" />
                  <span className="text-sm">Uploading…</span>
                </>
              ) : (
                <>
                  <Camera className="size-10" />
                  <span className="text-sm font-medium">Take photo</span>
                  <span className="text-xs">Tap to open camera</span>
                </>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
          </label>
        ) : (
          <>
            <PhotoCanvas
              photoUrl={checkpoint.photo_url}
              indicators={indicators}
              onChange={(next) => onChange({ indicators: next })}
            />
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => toggleIndicator("direction")}
                aria-pressed={hasArrow}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 h-9 text-xs font-medium border transition-smooth ${
                  hasArrow
                    ? "bg-foreground text-background border-foreground"
                    : "border-border text-foreground hover:border-foreground"
                }`}
              >
                <ArrowUpIcon className="size-3.5" /> Direction arrow
              </button>
              <button
                type="button"
                onClick={() => toggleIndicator("spot")}
                aria-pressed={hasSpot}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 h-9 text-xs font-medium border transition-smooth ${
                  hasSpot
                    ? "bg-foreground text-background border-foreground"
                    : "border-border text-foreground hover:border-foreground"
                }`}
              >
                <Circle className="size-3 fill-current" /> Spot
              </button>
              <label className="ml-auto text-xs text-accent hover:underline cursor-pointer">
                Retake photo
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
              </label>
            </div>
            {hasArrow && (
              <p className="text-[11px] text-muted-foreground">
                Drag the arrow to move it. Drag the white handle at the tail to rotate.
              </p>
            )}
          </>
        )}

        <div>
          <Label className="text-xs">
            {isStart ? "Landmark hint (shown to walkers)" : "Note (optional)"}
          </Label>
          <Textarea
            rows={2}
            value={checkpoint.note ?? ""}
            onChange={(e) => onChange({ note: e.target.value })}
            placeholder={
              isStart
                ? "e.g. Dark green gate between the pharmacy and the bakery."
                : "e.g. Turn right at the blue door"
            }
            className="mt-1.5 resize-none"
          />
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3 pt-2 pb-8">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={async () => {
              setSaving(true);
              await onSave();
              setSaving(false);
            }}
            disabled={!checkpoint.photo_url || saving}
            className="rounded-full bg-primary text-primary-foreground px-6"
          >
            {saving ? "Saving…" : "Save checkpoint"} <Check className="size-4 ml-1" />
          </Button>
        </div>
      </main>
    </div>
  );
}
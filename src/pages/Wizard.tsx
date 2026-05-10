import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MapPinPicker } from "@/components/wizard/MapPinPicker";
import { CheckpointEditor, type Checkpoint } from "@/components/wizard/CheckpointEditor";
import { MobilePreview } from "@/components/wizard/MobilePreview";
import { uploadAsset } from "@/lib/upload";
import { makeSlug } from "@/lib/slug";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Check, Copy, Download } from "lucide-react";
import QRCode from "qrcode";

const STEPS = ["Start point", "Checkpoints", "Branding", "Publish"];

export default function Wizard() {
  const { id } = useParams();
  const isNew = id === "new";
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [locationId, setLocationId] = useState<string | null>(isNew ? null : id ?? null);

  const [studioName, setStudioName] = useState("My Studio");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [accent, setAccent] = useState("#b45309");
  const [welcome, setWelcome] = useState("Welcome! Follow the photos to find us.");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [startNote, setStartNote] = useState("");
  const [slug, setSlug] = useState<string>("");
  const [published, setPublished] = useState(false);
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

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
        setStartNote(loc.start_note ?? "");
        setSlug(loc.slug);
        setPublished(loc.published);
        setLocationId(loc.id);
      }
      const { data: cps } = await supabase.from("checkpoints").select("*").eq("location_id", id!).order("position");
      if (cps) setCheckpoints(cps as any);
      setLoading(false);
    })();
  }, [id, isNew, user]);

  const shareUrl = useMemo(() => (slug ? `${window.location.origin}/find/${slug}` : ""), [slug]);

  useEffect(() => {
    if (step === 3 && shareUrl) {
      QRCode.toDataURL(shareUrl, { width: 512, margin: 2, color: { dark: "#1a1410", light: "#faf6f0" } }).then(setQrDataUrl);
    }
  }, [step, shareUrl]);

  const persist = async (extra: Partial<{ published: boolean }> = {}) => {
    if (!user) return null;
    setSaving(true);
    try {
      let lid = locationId;
      const payload: any = {
        owner_id: user.id,
        studio_name: studioName,
        logo_url: logoUrl,
        accent_color: accent,
        welcome_message: welcome,
        start_lat: lat,
        start_lng: lng,
        start_note: startNote || null,
        ...extra,
      };
      if (!lid) {
        payload.slug = makeSlug(studioName);
        const { data, error } = await supabase.from("locations").insert(payload).select().single();
        if (error) throw error;
        lid = data.id;
        setLocationId(lid);
        setSlug(data.slug);
      } else {
        const { error } = await supabase.from("locations").update(payload).eq("id", lid);
        if (error) throw error;
      }
      // sync checkpoints: delete then re-insert (simple)
      await supabase.from("checkpoints").delete().eq("location_id", lid);
      if (checkpoints.length) {
        const rows = checkpoints
          .filter((c) => c.photo_url)
          .map((c, i) => ({
            location_id: lid,
            position: i,
            photo_url: c.photo_url,
            arrow_direction: c.arrow_direction,
            note: c.note || null,
            indicators: c.indicators ?? [],
          }));
        if (rows.length) {
          const { error } = await supabase.from("checkpoints").insert(rows);
          if (error) throw error;
        }
      }
      if (extra.published !== undefined) setPublished(extra.published);
      return lid;
    } catch (e: any) {
      toast.error(e.message);
      return null;
    } finally {
      setSaving(false);
    }
  };

  const next = async () => {
    if (step === 0 && (lat == null || lng == null)) return toast.error("Set a starting point first");
    if (step === 1 && checkpoints.filter((c) => c.photo_url).length === 0) return toast.error("Add at least one checkpoint with a photo");
    if (step === 2) {
      const ok = await persist();
      if (!ok) return;
    }
    setStep((s) => Math.min(s + 1, 3));
  };

  const publish = async () => {
    const ok = await persist({ published: true });
    if (ok) toast.success("Published! Share away.");
  };

  const onLogoUpload = async (file: File) => {
    if (!user) return;
    try {
      const url = await uploadAsset(file, user.id, "logos");
      setLogoUrl(url);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const downloadQR = () => {
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `${slug}-qr.png`;
    a.click();
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Loading…</div>;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-20">
        <div className="container mx-auto flex items-center justify-between gap-3 px-4 py-3 sm:py-4">
          <Link to="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-smooth shrink-0">
            <ArrowLeft className="size-4" /> <span className="hidden sm:inline">Dashboard</span>
          </Link>
          <div className="flex items-center gap-1.5 sm:gap-3">
            {STEPS.map((label, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`size-6 sm:size-7 rounded-full text-xs flex items-center justify-center font-medium transition-smooth ${
                  i < step ? "bg-accent text-accent-foreground" : i === step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}>{i < step ? <Check className="size-3.5" /> : i + 1}</div>
                <span className={`text-xs hidden md:inline ${i === step ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 sm:py-10 grid lg:grid-cols-[1fr_320px] gap-8 lg:gap-12">
        <div>
          <div className="eyebrow text-muted-foreground mb-2">Step {step + 1} of 4</div>
          <h1 className="font-display text-2xl sm:text-4xl mb-6 sm:mb-8">{STEPS[step]}</h1>

          {step === 0 && (
            <div className="space-y-5">
              <p className="text-muted-foreground">Drop a pin where the visitor's journey starts — usually a nearby landmark, transit stop, or street corner.</p>
              <MapPinPicker lat={lat} lng={lng} onChange={(la, ln) => { setLat(la); setLng(ln); }} />
              <div>
                <Label>Starting note (optional)</Label>
                <Textarea rows={2} value={startNote} onChange={(e) => setStartNote(e.target.value)}
                  placeholder="e.g. Exit the metro and face north" className="mt-1.5" />
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <p className="text-muted-foreground mb-5">Add a photo for each turn or landmark. Drag a directional arrow on top to guide visitors.</p>
              <CheckpointEditor checkpoints={checkpoints} onChange={setCheckpoints} />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5 max-w-lg">
              <div>
                <Label>Studio name</Label>
                <Input value={studioName} onChange={(e) => setStudioName(e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label>Logo</Label>
                <div className="mt-1.5 flex items-center gap-4">
                  {logoUrl ? <img src={logoUrl} className="size-16 rounded-full object-cover" alt="" /> : <div className="size-16 rounded-full bg-muted" />}
                  <label className="cursor-pointer">
                    <span className="text-sm text-accent hover:underline">{logoUrl ? "Replace" : "Upload"}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onLogoUpload(e.target.files[0])} />
                  </label>
                </div>
              </div>
              <div>
                <Label>Accent color</Label>
                <div className="mt-1.5 flex items-center gap-3 flex-wrap">
                  <input type="color" value={accent} onChange={(e) => setAccent(e.target.value)}
                    className="size-12 rounded-xl border border-border cursor-pointer" />
                  <Input value={accent} onChange={(e) => setAccent(e.target.value)} className="font-mono w-32" />
                </div>
              </div>
              <div>
                <Label>Welcome message</Label>
                <Textarea rows={3} value={welcome} onChange={(e) => setWelcome(e.target.value)} className="mt-1.5" />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 max-w-lg w-full max-w-full min-w-0 mx-auto">
              {!published ? (
                <>
                  <p className="text-muted-foreground">Ready to share? Publishing makes the page live and accessible at the URL below.</p>
                  <Button size="lg" onClick={publish} disabled={saving} className="rounded-full bg-accent text-accent-foreground h-12 px-8 w-full sm:w-auto">
                    {saving ? "Publishing…" : "Publish location"}
                  </Button>
                </>
              ) : (
                <>
                  <div className="bg-accent-soft border border-accent/20 rounded-2xl p-5 w-full max-w-full min-w-0 overflow-hidden">
                    <div className="eyebrow text-accent mb-1">Live</div>
                    <p className="font-display text-xl mb-3">Your wayfinding page is published.</p>
                    <div className="flex items-center gap-2 bg-card border border-border rounded-full p-1 pl-4 w-full max-w-full min-w-0 overflow-hidden" style={{ width: "100%", overflow: "hidden" }}>
                      <div className="text-sm font-mono flex-1 min-w-0 overflow-hidden whitespace-nowrap text-ellipsis max-w-full" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%" }}>{shareUrl}</div>
                      <Button size="sm" variant="ghost" className="rounded-full" onClick={() => { navigator.clipboard.writeText(shareUrl); toast.success("Copied"); }}>
                        <Copy className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                  {qrDataUrl && (
                    <div className="flex flex-col items-center bg-card border border-border rounded-2xl p-6 w-full">
                      <img src={qrDataUrl} alt="QR code" className="w-40 h-40 sm:w-48 sm:h-48" />
                      <Button onClick={downloadQR} variant="outline" className="rounded-full mt-4">
                        <Download className="size-4 mr-2" /> Download PNG
                      </Button>
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <a href={shareUrl} target="_blank" rel="noreferrer" className="flex-1 w-full">
                      <Button variant="outline" className="w-full rounded-full">Preview live page</Button>
                    </a>
                    <Link to="/dashboard" className="flex-1 w-full">
                      <Button className="w-full rounded-full bg-primary text-primary-foreground">Done</Button>
                    </Link>
                  </div>
                </>
              )}
            </div>
          )}

          {step < 3 && (
            <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3 mt-8 sm:mt-10">
              <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} className="w-full sm:w-auto">
                <ArrowLeft className="size-4 mr-1" /> Back
              </Button>
              <Button onClick={next} disabled={saving} className="rounded-full bg-primary text-primary-foreground px-6 w-full sm:w-auto">
                {saving ? "Saving…" : "Continue"} <ArrowRight className="size-4 ml-1" />
              </Button>
            </div>
          )}
        </div>

        <aside className="hidden lg:block">
          <MobilePreview studioName={studioName} logoUrl={logoUrl} accent={accent} welcome={welcome} checkpoints={checkpoints.filter(c => c.photo_url)} />
        </aside>
      </main>
    </div>
  );
}

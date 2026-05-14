import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Plus, Eye, Pencil, Archive, ExternalLink, LogOut, ArchiveRestore, Copy, Download } from "lucide-react";
import { toast } from "sonner";
import QRCode from "qrcode";

type Loc = {
  id: string; slug: string; studio_name: string; logo_url: string | null;
  accent_color: string; view_count: number; archived: boolean; published: boolean; updated_at: string;
};

export default function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [locations, setLocations] = useState<Loc[]>([]);
  const [filter, setFilter] = useState<"active" | "archived">("active");

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase.from("locations").select("*").eq("owner_id", user.id).order("updated_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) toast.error(error.message);
        else setLocations((data as Loc[]) || []);
      });
  }, [user]);

  const setArchived = async (id: string, archived: boolean) => {
    const { error } = await supabase.from("locations").update({ archived }).eq("id", id);
    if (error) return toast.error(error.message);
    setLocations((ls) => ls.map((l) => (l.id === id ? { ...l, archived } : l)));
    toast.success(archived ? "Archived" : "Restored");
  };

  const visible = locations.filter((l) => (filter === "archived" ? l.archived : !l.archived));

  const copyLink = async (slug: string) => {
    const url = `${window.location.origin}/find/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch {
      toast.error("Couldn't copy link");
    }
  };

  const downloadQR = async (slug: string) => {
    const url = `${window.location.origin}/find/${slug}`;
    try {
      const dataUrl = await QRCode.toDataURL(url, { width: 512, margin: 2, color: { dark: "#1a1410", light: "#faf6f0" } });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `${slug}-qr.png`;
      a.click();
    } catch {
      toast.error("Couldn't generate QR code");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto flex items-center justify-between py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="size-8 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-display font-bold">L</div>
            <span className="font-display text-lg">Last 100m</span>
          </Link>
          <Button variant="ghost" size="sm" onClick={() => supabase.auth.signOut()}>
            <LogOut className="size-4 mr-1" /> Sign out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10">
        <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
          <div>
            <div className="eyebrow text-muted-foreground mb-2">Your locations</div>
            <h1 className="font-display text-4xl md:text-5xl">Wayfinding pages</h1>
          </div>
          <Link to="/wizard/new">
            <Button size="lg" className="rounded-full bg-primary text-primary-foreground h-12 px-6">
              <Plus className="size-4 mr-1" /> New location
            </Button>
          </Link>
        </div>

        <div className="flex gap-2 mb-6">
          {(["active", "archived"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`text-sm px-4 py-1.5 rounded-full border transition-smooth ${
                filter === f ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-foreground"
              }`}>
              {f === "active" ? "Active" : "Archived"}
            </button>
          ))}
        </div>

        {visible.length === 0 ? (
          <div className="border border-dashed border-border rounded-3xl p-16 text-center">
            <p className="font-display text-2xl mb-2">No locations yet</p>
            <p className="text-muted-foreground mb-6">Create your first photo path.</p>
            <Link to="/wizard/new"><Button className="rounded-full">Get started</Button></Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {visible.map((l) => (
              <div key={l.id} className="bg-card border border-border rounded-2xl p-6 shadow-soft hover:shadow-elegant transition-smooth animate-fade-in-up">
                <div className="flex items-center gap-3 mb-4">
                  {l.logo_url ? (
                    <img src={l.logo_url} alt="" className="size-10 rounded-full object-cover" />
                  ) : (
                    <div className="size-10 rounded-full" style={{ backgroundColor: l.accent_color }} />
                  )}
                  <div className="min-w-0">
                    <div className="font-display text-lg truncate">{l.studio_name}</div>
                    <div className="text-xs text-muted-foreground truncate">/{l.slug}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-5">
                  <span className="flex items-center gap-1"><Eye className="size-3.5" /> {l.view_count}</span>
                  <span className={`text-xs eyebrow ${l.published ? "text-accent" : "text-muted-foreground"}`}>
                    {l.published ? "Live" : "Draft"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Link to={`/wizard/${l.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full rounded-full"><Pencil className="size-3.5 mr-1" /> Edit</Button>
                  </Link>
                  {l.published && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full"
                        onClick={() => copyLink(l.slug)}
                        title="Copy link"
                      >
                        <Copy className="size-3.5" />
                      </Button>
                      <a href={`/find/${l.slug}`} target="_blank" rel="noreferrer">
                        <Button variant="outline" size="sm" className="rounded-full" title="Open">
                          <ExternalLink className="size-3.5" />
                        </Button>
                      </a>
                    </>
                  )}
                  <Button variant="ghost" size="sm" className="rounded-full" onClick={() => setArchived(l.id, !l.archived)}>
                    {l.archived ? <ArchiveRestore className="size-3.5" /> : <Archive className="size-3.5" />}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

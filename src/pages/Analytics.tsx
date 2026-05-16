import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { BarChart3, ChevronRight, LogOut } from "lucide-react";
import { toast } from "sonner";

type Loc = {
  id: string;
  slug: string;
  studio_name: string;
  logo_url: string | null;
  accent_color: string;
  archived: boolean;
  published: boolean;
};

export default function Analytics() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [locations, setLocations] = useState<Loc[]>([]);

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("locations")
      .select("id, slug, studio_name, logo_url, accent_color, archived, published")
      .eq("owner_id", user.id)
      .eq("archived", false)
      .order("updated_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) toast.error(error.message);
        else setLocations((data as Loc[]) || []);
      });
  }, [user]);

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto flex items-center justify-between py-4">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="size-8 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-display font-bold">
              L
            </div>
            <span className="font-display text-lg">Usha</span>
          </Link>
          <Button variant="ghost" size="sm" onClick={() => supabase.auth.signOut()}>
            <LogOut className="size-4 mr-1" /> Sign out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 max-w-2xl">
        <div className="mb-8">
          <div className="eyebrow text-muted-foreground mb-2 flex items-center gap-2">
            <BarChart3 className="size-3.5" /> Analytics
          </div>
          <h1 className="font-display text-4xl">How your pages are doing</h1>
          <p className="text-muted-foreground mt-2">Pick a location to see opens, walks, and where people drop off.</p>
        </div>

        {locations.length === 0 ? (
          <div className="border border-dashed border-border rounded-3xl p-12 text-center">
            <p className="font-display text-2xl mb-2">No locations yet</p>
            <p className="text-muted-foreground mb-6">Create a location to start tracking.</p>
            <Link to="/wizard/new">
              <Button className="rounded-full">Get started</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {locations.map((l) => (
              <Link
                key={l.id}
                to={`/analytics/${l.id}`}
                className="flex items-center gap-4 bg-card border border-border rounded-2xl p-4 shadow-soft hover:shadow-elegant transition-smooth"
              >
                {l.logo_url ? (
                  <img src={l.logo_url} alt="" className="size-12 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="size-12 rounded-full shrink-0" style={{ backgroundColor: l.accent_color }} />
                )}
                <div className="min-w-0 flex-1">
                  <div className="font-display text-lg truncate">{l.studio_name}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    /{l.slug} · {l.published ? "Live" : "Draft"}
                  </div>
                </div>
                <ChevronRight className="size-5 text-muted-foreground shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </main>

      <CreatorBottomNav active="analytics" />
    </div>
  );
}

export function CreatorBottomNav({ active }: { active: "locations" | "analytics" }) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-card/95 backdrop-blur"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="container mx-auto max-w-2xl grid grid-cols-2">
        <Link
          to="/dashboard"
          className={`flex flex-col items-center gap-1 py-3 text-xs font-medium ${
            active === "locations" ? "text-foreground" : "text-muted-foreground"
          }`}
        >
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" />
          </svg>
          Locations
        </Link>
        <Link
          to="/analytics"
          className={`flex flex-col items-center gap-1 py-3 text-xs font-medium ${
            active === "analytics" ? "text-foreground" : "text-muted-foreground"
          }`}
        >
          <BarChart3 className="size-5" />
          Analytics
        </Link>
      </div>
    </nav>
  );
}
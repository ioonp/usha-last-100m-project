import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Copy, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { CreatorBottomNav } from "./Analytics";

type Range = "7d" | "30d" | "all";

type Loc = {
  id: string;
  slug: string;
  studio_name: string;
};

type CP = { id: string; position: number; note: string | null };

type Ev = {
  event_type: "page_opened" | "arrival_confirmed" | "checkpoint_viewed" | "completed";
  checkpoint_index: number | null;
  created_at: string;
};

const ACCENT = "#c45a22";

function rangeWindow(range: Range): { start: Date | null; prevStart: Date | null; prevEnd: Date | null } {
  const now = new Date();
  if (range === "all") return { start: null, prevStart: null, prevEnd: null };
  const days = range === "7d" ? 7 : 30;
  const start = new Date(now.getTime() - days * 86400_000);
  const prevEnd = start;
  const prevStart = new Date(start.getTime() - days * 86400_000);
  return { start, prevStart, prevEnd };
}

function countBy(events: Ev[], type: Ev["event_type"], start: Date | null, end?: Date | null) {
  return events.filter((e) => {
    if (e.event_type !== type) return false;
    const t = new Date(e.created_at).getTime();
    if (start && t < start.getTime()) return false;
    if (end && t >= end.getTime()) return false;
    return true;
  }).length;
}

function pctChange(curr: number, prev: number): { label: string; tone: "up" | "down" | "flat" } {
  if (prev === 0 && curr === 0) return { label: "no change vs. last period", tone: "flat" };
  if (prev === 0) return { label: "new this period", tone: "up" };
  const diff = ((curr - prev) / prev) * 100;
  const rounded = Math.round(diff);
  if (rounded === 0) return { label: "0% vs. last period", tone: "flat" };
  return {
    label: `${rounded > 0 ? "+" : ""}${rounded}% vs. last period`,
    tone: rounded > 0 ? "up" : "down",
  };
}

function StatCard({
  label,
  value,
  compare,
  accent,
}: {
  label: string;
  value: string;
  compare?: { label: string; tone: "up" | "down" | "flat" } | null;
  accent?: boolean;
}) {
  const toneClass =
    compare?.tone === "up" ? "text-emerald-600" : compare?.tone === "down" ? "text-red-600" : "text-muted-foreground";
  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">{label}</div>
      <div
        className="font-display text-3xl"
        style={accent ? { color: ACCENT } : undefined}
      >
        {value}
      </div>
      {compare && <div className={`text-xs mt-1 ${toneClass}`}>{compare.label}</div>}
    </div>
  );
}

export default function AnalyticsLocation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [loc, setLoc] = useState<Loc | null>(null);
  const [cps, setCps] = useState<CP[]>([]);
  const [events, setEvents] = useState<Ev[]>([]);
  const [range, setRange] = useState<Range>("7d");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!id || !user) return;
    (async () => {
      setLoading(true);
      const [{ data: l }, { data: c }, { data: e }] = await Promise.all([
        supabase.from("locations").select("id, slug, studio_name").eq("id", id).maybeSingle(),
        supabase.from("checkpoints").select("id, position, note").eq("location_id", id).order("position"),
        supabase
          .from("page_events")
          .select("event_type, checkpoint_index, created_at")
          .eq("location_id", id)
          .order("created_at", { ascending: false })
          .limit(10000),
      ]);
      setLoc((l as Loc) || null);
      setCps((c as CP[]) || []);
      setEvents((e as Ev[]) || []);
      setLoading(false);
    })();
  }, [id, user]);

  const { start, prevStart, prevEnd } = useMemo(() => rangeWindow(range), [range]);

  const opens = countBy(events, "page_opened", start);
  const starts = countBy(events, "arrival_confirmed", start);
  const completes = countBy(events, "completed", start);
  const completionRate = starts > 0 ? (completes / starts) * 100 : 0;

  const opensPrev = countBy(events, "page_opened", prevStart, prevEnd);
  const startsPrev = countBy(events, "arrival_confirmed", prevStart, prevEnd);
  const completesPrev = countBy(events, "completed", prevStart, prevEnd);
  const ratePrev = startsPrev > 0 ? (completesPrev / startsPrev) * 100 : 0;

  const showCompare = range !== "all";

  // Funnel: % of those who confirmed arrival that reached each checkpoint
  const reachedPerCp = cps.map((cp) =>
    events.filter(
      (e) =>
        e.event_type === "checkpoint_viewed" &&
        e.checkpoint_index === cp.position &&
        (!start || new Date(e.created_at) >= start),
    ).length,
  );

  // Hour-of-day histogram (last 7 days regardless of toggle, per spec)
  const hourStart = new Date(Date.now() - 7 * 86400_000);
  const byHour = new Array(24).fill(0) as number[];
  events.forEach((e) => {
    const d = new Date(e.created_at);
    if (d >= hourStart) byHour[d.getHours()]++;
  });
  const maxHour = Math.max(1, ...byHour);
  const peakHour = byHour.indexOf(Math.max(...byHour));
  const fmtHour = (h: number) => {
    const am = h < 12;
    const h12 = h % 12 || 12;
    return `${h12}${am ? "am" : "pm"}`;
  };

  const copyLink = async () => {
    if (!loc) return;
    const url = `${window.location.origin}/find/${loc.slug}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch {
      toast.error("Couldn't copy link");
    }
  };

  const hasAnyEvents = events.length > 0;

  return (
    <div className="min-h-screen bg-background pb-28">
      <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto max-w-2xl flex items-center gap-2 py-3 px-4">
          <Link
            to="/analytics"
            className="size-9 -ml-2 rounded-full flex items-center justify-center hover:bg-muted transition-smooth"
            aria-label="Back"
          >
            <ChevronLeft className="size-5" />
          </Link>
          <div className="font-display text-lg truncate flex-1">
            {loc?.studio_name ?? "Analytics"}
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-2xl px-4 py-6">
        {loading ? (
          <div className="text-muted-foreground text-sm">Loading…</div>
        ) : !loc ? (
          <div className="text-muted-foreground text-sm">Location not found.</div>
        ) : (
          <>
            {/* Range toggle */}
            <div className="inline-flex rounded-full border border-border bg-card p-1 mb-6">
              {([
                ["7d", "Last 7 days"],
                ["30d", "Last 30 days"],
                ["all", "All time"],
              ] as const).map(([k, label]) => (
                <button
                  key={k}
                  onClick={() => setRange(k)}
                  className={`text-xs px-3 py-1.5 rounded-full transition-smooth ${
                    range === k ? "bg-foreground text-background" : "text-muted-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {!hasAnyEvents ? (
              <div className="border border-dashed border-border rounded-2xl p-8 text-center bg-card/50">
                <p className="font-display text-xl mb-1">No data yet</p>
                <p className="text-muted-foreground text-sm mb-5">
                  Share your link to see how walkers are doing!
                </p>
                <Button onClick={copyLink} className="rounded-full">
                  <Copy className="size-4 mr-1" /> Copy link
                </Button>
              </div>
            ) : (
              <>
                {/* Stat cards */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <StatCard
                    label="Page opens"
                    value={opens.toString()}
                    compare={showCompare ? pctChange(opens, opensPrev) : null}
                  />
                  <StatCard
                    label="Walks started"
                    value={starts.toString()}
                    compare={showCompare ? pctChange(starts, startsPrev) : null}
                  />
                  <StatCard
                    label="Walks completed"
                    value={completes.toString()}
                    compare={showCompare ? pctChange(completes, completesPrev) : null}
                  />
                  <StatCard
                    label="Completion rate"
                    value={`${completionRate.toFixed(1)}%`}
                    compare={
                      showCompare
                        ? pctChange(Math.round(completionRate * 10), Math.round(ratePrev * 10))
                        : null
                    }
                    accent
                  />
                </div>

                {completes > 0 && completes < 5 && (
                  <div className="text-xs text-muted-foreground italic mb-6">
                    Data is still gathering — these numbers will get more reliable with more walkers.
                  </div>
                )}

                {/* Funnel */}
                <section className="mb-8">
                  <h2 className="font-display text-xl mb-3">Checkpoint funnel</h2>
                  <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
                    {cps.length === 0 ? (
                      <div className="text-sm text-muted-foreground">No checkpoints yet.</div>
                    ) : (
                      cps.map((cp, idx) => {
                        const reached = reachedPerCp[idx];
                        const pct = starts > 0 ? (reached / starts) * 100 : 0;
                        const prevReached = idx > 0 ? reachedPerCp[idx - 1] : starts;
                        const dropPct =
                          prevReached > 0 ? ((prevReached - reached) / prevReached) * 100 : 0;
                        const highDrop = idx > 0 && dropPct > 20 && prevReached >= 5;
                        return (
                          <div key={cp.id}>
                            <div className="flex items-baseline justify-between gap-2 mb-1">
                              <div className="text-sm font-medium truncate min-w-0 flex-1">
                                <span className="text-muted-foreground mr-1">{idx + 1}.</span>
                                {cp.note || "Checkpoint"}
                              </div>
                              <div className="text-xs text-muted-foreground shrink-0">
                                {reached} of {starts}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{
                                    width: `${Math.min(100, pct)}%`,
                                    backgroundColor: ACCENT,
                                  }}
                                />
                              </div>
                              {highDrop && (
                                <div
                                  className="shrink-0 text-amber-600"
                                  title={`${Math.round(dropPct)}% of walkers stop here — consider updating this photo`}
                                >
                                  <AlertTriangle className="size-4" />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </section>

                {/* Hour of day */}
                <section>
                  <h2 className="font-display text-xl mb-3">Time of day</h2>
                  <div className="bg-card border border-border rounded-2xl p-4">
                    <div className="flex items-end gap-[2px] h-12">
                      {byHour.map((v, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-sm"
                          style={{
                            height: `${(v / maxHour) * 100}%`,
                            minHeight: 2,
                            backgroundColor: v > 0 ? ACCENT : "hsl(var(--muted))",
                          }}
                          title={`${fmtHour(i)}: ${v}`}
                        />
                      ))}
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      {byHour[peakHour] > 0
                        ? `Most active: ${fmtHour(peakHour)}–${fmtHour((peakHour + 2) % 24)}`
                        : "Not enough activity yet"}
                    </div>
                  </div>
                </section>
              </>
            )}
          </>
        )}
      </main>

      <CreatorBottomNav active="analytics" />
    </div>
  );
}
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Camera, Share2 } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="container mx-auto flex items-center justify-between py-6">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-display font-bold">L</div>
          <span className="font-display text-lg">Last 100m</span>
        </div>
        <nav className="flex items-center gap-2">
          <Link to="/auth"><Button variant="ghost" size="sm">Sign in</Button></Link>
          <Link to="/auth?mode=signup"><Button size="sm" className="rounded-full">Get started</Button></Link>
        </nav>
      </header>

      <main className="container mx-auto px-4 pb-24 pt-12 md:pt-20">
        <section className="grid md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-7 animate-fade-in-up">
            <div className="eyebrow text-muted-foreground mb-5">Wayfinding · for studios</div>
            <h1 className="font-display text-5xl md:text-7xl text-balance leading-[1.02] mb-6">
              Find your way<br />
              <em className="text-accent not-italic font-normal italic">to the studio.</em>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mb-8 text-balance">
              Photo-led directions for the last hundred meters. Replace confusing maps and "I'm out front" texts with a simple, visual walk-through.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/auth?mode=signup">
                <Button size="lg" className="rounded-full px-7 h-12 bg-primary text-primary-foreground">
                  Build a path <ArrowRight className="ml-1 size-4" />
                </Button>
              </Link>
              <Link to="/demo">
                <Button size="lg" variant="outline" className="rounded-full px-7 h-12">See a demo</Button>
              </Link>
            </div>
          </div>

          <div className="md:col-span-5 animate-scale-in">
            <div className="relative mx-auto max-w-[280px]">
              <div className="absolute -inset-8 bg-gradient-accent opacity-20 blur-3xl rounded-full" />
              <div className="relative aspect-[9/19] rounded-[2.5rem] bg-primary p-3 shadow-elegant">
                <div className="h-full w-full rounded-[2rem] bg-card overflow-hidden flex flex-col">
                  <div className="flex-1 bg-gradient-to-br from-accent-soft to-accent/20 flex items-center justify-center relative">
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 text-xs eyebrow text-muted-foreground">Step 2 of 4</div>
                    <div className="text-7xl rotate-45">→</div>
                  </div>
                  <div className="bg-card p-4 border-t border-border">
                    <div className="text-xs eyebrow text-muted-foreground mb-1">Note</div>
                    <div className="text-sm">Turn right at the blue door.</div>
                    <Button className="w-full mt-3 rounded-full bg-accent text-accent-foreground" size="sm">I'm here ✓</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-32 grid md:grid-cols-3 gap-6">
          {[
            { icon: MapPin, title: "Drop a starting pin", desc: "Set where the journey begins on a map." },
            { icon: Camera, title: "Add photo checkpoints", desc: "Upload photos with directional arrows." },
            { icon: Share2, title: "Share a QR code", desc: "Print it, stick it, send it. Done." },
          ].map((f, i) => (
            <div key={i} className="p-8 rounded-2xl bg-card border border-border shadow-soft">
              <f.icon className="size-7 text-accent mb-4" />
              <h3 className="font-display text-2xl mb-2">{f.title}</h3>
              <p className="text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        Last 100m · Photo wayfinding
      </footer>
    </div>
  );
};

export default Index;

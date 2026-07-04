import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { landingStrings } from "@/lib/strings";

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b transition-colors",
        scrolled ? "border-border" : "border-transparent",
      )}
    >
      <div className="container mx-auto flex items-center justify-between h-[68px] px-4">
        <div className="flex items-center gap-2.5">
          <div className="size-[34px] rounded-full bg-accent flex items-center justify-center text-accent-foreground font-display font-semibold text-lg">
            U
          </div>
          <span className="font-display font-semibold text-xl -tracking-[0.01em]">Usha</span>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/auth">
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              {landingStrings.nav.signIn}
            </Button>
          </Link>
          <Link to="/auth?mode=signup">
            <Button size="sm" className="rounded-full">
              {landingStrings.nav.buildOne}
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}

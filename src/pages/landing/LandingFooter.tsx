import { landingStrings } from "@/lib/strings";

export function LandingFooter() {
  return (
    <footer className="border-t border-border py-9">
      <div className="container mx-auto px-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="size-[34px] rounded-full bg-accent flex items-center justify-center text-accent-foreground font-display font-semibold text-lg">
            U
          </div>
          <span className="font-display font-semibold text-base">Usha</span>
        </div>
        <div className="text-[13.5px] text-muted-foreground">{landingStrings.footer.tagline}</div>
      </div>
    </footer>
  );
}

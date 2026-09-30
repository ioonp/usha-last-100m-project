import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/pages/landing/LandingNav";

// Shared chrome header for logged-in Creator screens that only ever show
// the brand mark + sign out (Dashboard, Analytics) — matches the landing
// page's header treatment. Screens with their own functional header (the
// Wizard/Capture step flow, Analytics' back-to-list sub-page) keep their
// existing back-link/progress markup untouched.
export function CreatorHeader() {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-10">
      <div className="container mx-auto flex items-center justify-between py-4">
        <Logo to="/dashboard" />
        <button
          type="button"
          onClick={() => supabase.auth.signOut()}
          className="text-sm font-medium text-foreground"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}

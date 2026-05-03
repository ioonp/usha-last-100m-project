import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";

export default function AuthPage() {
  const [params] = useSearchParams();
  const [mode, setMode] = useState<"signin" | "signup">(params.get("mode") === "signup" ? "signup" : "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin + "/dashboard", data: { display_name: name } },
        });
        if (error) throw error;
        toast.success("Welcome aboard!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md animate-fade-in-up">
        <Link to="/" className="eyebrow text-muted-foreground mb-6 inline-block">← Last 100m</Link>
        <div className="bg-card border border-border rounded-3xl p-8 shadow-soft">
          <h1 className="font-display text-4xl mb-1">{mode === "signup" ? "Create account" : "Welcome back"}</h1>
          <p className="text-muted-foreground mb-6 text-sm">
            {mode === "signup" ? "Start guiding visitors in minutes." : "Sign in to your dashboard."}
          </p>
          <form onSubmit={submit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label>Studio name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Sunlight Studio" required />
              </div>
            )}
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Password</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
            </div>
            <Button type="submit" disabled={loading} className="w-full rounded-full h-11 bg-primary text-primary-foreground">
              {loading ? "..." : mode === "signup" ? "Create account" : "Sign in"}
            </Button>
          </form>
          <button onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
            className="mt-5 text-sm text-muted-foreground hover:text-foreground transition-smooth w-full text-center">
            {mode === "signup" ? "Already have an account? Sign in" : "No account? Create one"}
          </button>
        </div>
      </div>
    </div>
  );
}

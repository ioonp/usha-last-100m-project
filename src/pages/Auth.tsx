import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { locationStrings } from "@/lib/strings";
import { Eye, EyeOff } from "lucide-react";

export default function AuthPage() {
  const [params] = useSearchParams();
  const [mode, setMode] = useState<"signin" | "signup">(params.get("mode") === "signup" ? "signup" : "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
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
        if (password !== confirmPassword) {
          toast.error("Passwords do not match");
          setLoading(false);
          return;
        }
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

  const sendReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: window.location.origin + "/reset-password",
      });
      if (error) throw error;
      toast.success("Check your email for the reset link.");
      setForgotOpen(false);
      setForgotEmail("");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md animate-fade-in-up">
        <Link to="/" className="eyebrow text-muted-foreground mb-6 inline-block">← Usha</Link>
        <div className="bg-card border border-border rounded-3xl p-8 shadow-soft">
          <h1 className="font-display text-4xl mb-1">{mode === "signup" ? "Create account" : "Welcome back"}</h1>
          <p className="text-muted-foreground mb-6 text-sm">
            {mode === "signup" ? "Start guiding visitors in minutes." : "Sign in to your dashboard."}
          </p>
          <form onSubmit={submit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label>{locationStrings.nameLabel}</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={locationStrings.namePlaceholder} required />
              </div>
            )}
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground transition-smooth"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label>Confirm password</Label>
                <div className="relative">
                  <Input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground transition-smooth"
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-destructive">Passwords do not match</p>
                )}
              </div>
            )}
            {mode === "signin" && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => { setForgotEmail(email); setForgotOpen(true); }}
                  className="text-sm text-muted-foreground hover:text-foreground transition-smooth"
                >
                  Forgot password?
                </button>
              </div>
            )}
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
      {forgotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-6" onClick={() => setForgotOpen(false)}>
          <div className="w-full max-w-md bg-card border border-border rounded-3xl p-8 shadow-soft animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-display text-2xl mb-1">Reset password</h2>
            <p className="text-muted-foreground mb-5 text-sm">Enter your email and we'll send you a reset link.</p>
            <form onSubmit={sendReset} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} required autoFocus />
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1 rounded-full h-11" onClick={() => setForgotOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={forgotLoading} className="flex-1 rounded-full h-11 bg-primary text-primary-foreground">
                  {forgotLoading ? "..." : "Send link"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppFooter } from "@/components/AppFooter";
import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Moon, Sun } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — SicklePredict" },
      {
        name: "description",
        content: "Log in or create your SicklePredict account to check genotype compatibility.",
      },
      { property: "og:title", content: "Sign in — SicklePredict" },
      { property: "og:description", content: "Log in or create your free SicklePredict account." },
    ],
  }),
  component: AuthPage,
});

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.6 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.8 6.1C12.3 13.2 17.6 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.9 7.2l7.6 5.9c4.4-4.1 7.1-10.1 7.1-17.6z"
      />
      <path
        fill="#FBBC05"
        d="M10.4 28.7c-.5-1.4-.8-2.9-.8-4.7s.3-3.3.8-4.7l-7.8-6.1C.9 16.4 0 20.1 0 24s.9 7.6 2.6 10.8l7.8-6.1z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.2 0 11.5-2 15.3-5.4l-7.6-5.9c-2.1 1.4-4.8 2.3-7.7 2.3-6.4 0-11.7-3.7-13.6-9.3l-7.8 6.1C6.5 42.6 14.6 48 24 48z"
      />
    </svg>
  );
}

function AuthPage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { theme, toggle } = useTheme();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [remember, setRemember] = useState(true);

  useEffect(() => {
    if (session) navigate({ to: "/" });
  }, [session, navigate]);

  useEffect(() => {
    const saved = window.localStorage.getItem("sicklepredict:email");
    if (saved) setEmail(saved);
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        if (password !== confirmPassword) {
          toast.error("Passwords do not match");
          return;
        }
        if (!username.trim()) {
          toast.error("Username is required");
          return;
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName, username: username.trim() },
          },
        });
        if (error) throw error;
        toast.success("Account created. You're all set!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
      }
      if (remember) window.localStorage.setItem("sicklepredict:email", email);
      else window.localStorage.removeItem("sicklepredict:email");
      navigate({ to: "/" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: `${window.location.origin}/oauth-callback`,
        extraParams: { prompt: "select_account" },
      });

      if (result.error) {
        toast.error(result.error.message || "Google sign-in failed. Please try again.");
        return;
      }
      // Full-page redirect in progress — /oauth-callback finishes the sign-in.
      if (result.redirected) return;

      toast.success("Signed in with Google");
      navigate({ to: "/" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    if (!email) {
      toast.error("Enter your email first");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    if (error) toast.error(error.message);
    else toast.success("Password reset link sent to your email");
  }

  return (
    <div className="min-h-screen bg-background px-5 py-8">
      <div className="mx-auto w-full max-w-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              SicklePredict
            </p>
            <h1 className="mt-2 text-3xl font-semibold">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">Know today, protect tomorrow.</p>
          </div>
          <button
            type="button"
            onClick={toggle}
            aria-label="Toggle dark mode"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-card shadow-soft"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-2 rounded-2xl bg-muted p-1">
          {(["login", "signup"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`rounded-xl py-2 text-sm font-semibold transition-colors ${
                mode === m ? "bg-card text-foreground shadow-soft" : "text-muted-foreground"
              }`}
            >
              {m === "login" ? "Log In" : "Sign Up"}
            </button>
          ))}
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-4 rounded-3xl bg-card p-5 shadow-card"
        >
          {mode === "signup" ? (
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Lauretta Obi"
                required
              />
            </div>
          ) : null}

          {mode === "signup" ? (
            <div className="space-y-2">
              <Label htmlFor="username">Nickname</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="johnsmith"
                required
              />
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {mode === "signup" ? (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <Checkbox
                  checked={remember}
                  onCheckedChange={(v) => setRemember(v === true)}
                  aria-label="Remember me"
                />
                Remember Me
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm font-medium text-primary hover:underline"
              >
                Forgot Password?
              </button>
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full rounded-2xl py-6 text-base">
            {mode === "login" ? "Log In" : "Sign Up"}
          </Button>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
          </div>

          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={handleGoogle}
            className="w-full gap-3 rounded-2xl bg-card py-6 text-base"
          >
            <GoogleIcon />
            {mode === "login" ? "Sign in with Google" : "Sign up with Google"}
          </Button>
        </form>

        <AppFooter />
      </div>
    </div>
  );
}

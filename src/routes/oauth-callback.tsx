import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/oauth-callback")({
  head: () => ({
    meta: [
      { title: "Signing you in — SicklePredict" },
      { name: "description", content: "Completing your SicklePredict sign-in securely." },
      { property: "og:title", content: "Signing you in — SicklePredict" },
      { property: "og:description", content: "Completing your SicklePredict sign-in securely." },
    ],
  }),
  component: OAuthCallbackPage,
});

function readTokens() {
  if (typeof window === "undefined") return null;
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const query = new URLSearchParams(window.location.search);
  const access_token = hash.get("access_token") ?? query.get("access_token");
  const refresh_token = hash.get("refresh_token") ?? query.get("refresh_token");
  const error =
    hash.get("error_description") ?? query.get("error_description") ?? query.get("error");
  if (error) return { error };
  if (access_token && refresh_token) return { access_token, refresh_token };
  return null;
}

function OAuthCallbackPage() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("Signing you in…");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const result = readTokens();

      if (result && "error" in result) {
        toast.error(result.error);
        navigate({ to: "/auth" });
        return;
      }

      if (result) {
        const { error } = await supabase.auth.setSession({
          access_token: result.access_token,
          refresh_token: result.refresh_token,
        });
        window.history.replaceState({}, "", "/oauth-callback");
        if (error) {
          toast.error(error.message);
          navigate({ to: "/auth" });
          return;
        }

        const { data: userData } = await supabase.auth.getUser();
        const userId = userData.user?.id;

        if (userId) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("username")
            .eq("id", userId)
            .maybeSingle();

          if (!profile?.username?.trim()) {
            toast.error("Please set a nickname before continuing.");
            navigate({ to: "/profile/settings?requireUsername=1" });
            return;
          }
        }

        toast.success("Signed in with Google");
        navigate({ to: "/" });
        return;
      }

      // No tokens in the URL — the client may already have restored a session.
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      if (data.session) {
        navigate({ to: "/" });
      } else {
        setMessage("We couldn't complete sign-in.");
        navigate({ to: "/auth" });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Bell, ChevronRight, History, Info, LifeBuoy, LogOut, Settings, Star } from "lucide-react";
import { AppFooter } from "@/components/AppFooter";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/profile/")({
  head: () => ({
    meta: [
      { title: "Your profile — SicklePredict" },
      {
        name: "description",
        content: "Manage your results history, notifications, profile details and app settings.",
      },
      { property: "og:title", content: "Your profile — SicklePredict" },
      { property: "og:description", content: "Results history, notifications and settings." },
    ],
  }),
  component: ProfilePage,
});

const LINKS = [
  { to: "/profile/history", label: "My Results History", icon: History },
  { to: "/profile/notifications", label: "Notification Settings", icon: Bell },
  { to: "/profile/settings", label: "Settings", icon: Settings },
  { to: "/profile/help", label: "Help & Support", icon: LifeBuoy },
  { to: "/profile/about", label: "About SicklePredict", icon: Info },
  { to: "/profile/rate", label: "Rate Us", icon: Star },
] as const;

function ProfilePage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, username, genotype")
        .eq("id", user!.id)
        .maybeSingle();
      return data;
    },
  });

  const name = profile?.full_name || user?.email?.split("@")[0] || "Friend";
  const username = profile?.username ? `@${profile.username}` : "";

  return (
    <div className="app-shell">
      <AppHeader title="Profile" />

      <section className="flex items-center gap-4 rounded-3xl bg-card p-5 shadow-card">
        <Avatar className="h-16 w-16">
          <AvatarFallback className="bg-primary text-xl text-primary-foreground">
            {name.slice(0, 1).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <h2 className="truncate text-xl font-semibold">{name}</h2>
          {username ? <p className="text-sm text-muted-foreground">{username}</p> : null}
          <p className="text-sm text-muted-foreground">Stay informed, stay protected.</p>
          {profile?.genotype ? (
            <p className="mt-1 text-xs font-semibold text-primary">Genotype: {profile.genotype}</p>
          ) : null}
        </div>
      </section>

      <nav className="mt-5 space-y-2">
        {LINKS.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-soft transition-colors hover:bg-muted"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft text-primary">
              <Icon className="h-4 w-4" />
            </span>
            <span className="flex-1 text-sm font-medium">{label}</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        ))}
      </nav>

      <Button
        variant="outline"
        className="mt-6 w-full gap-2 rounded-2xl py-6 text-destructive"
        onClick={async () => {
          await signOut();
          navigate({ to: "/auth" });
        }}
      >
        <LogOut className="h-4 w-4" /> Log out
      </Button>

      <BottomNav />
      <AppFooter />
    </div>
  );
}

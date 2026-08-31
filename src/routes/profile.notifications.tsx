import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AppFooter } from "@/components/AppFooter";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/profile/notifications")({
  head: () => ({
    meta: [
      { title: "Notification settings — SicklePredict" },
      {
        name: "description",
        content: "Choose which SicklePredict alerts, summaries and reminders you receive.",
      },
      { property: "og:title", content: "Notification settings — SicklePredict" },
      {
        property: "og:description",
        content: "Control push alerts, summaries, tips and reminders.",
      },
    ],
  }),
  component: NotificationsPage,
});

const FIELDS = [
  { key: "push_notifications", label: "Push Notifications", hint: "General app alerts" },
  { key: "result_summary", label: "Result Summary", hint: "Recap after each prediction" },
  { key: "tip_of_the_day", label: "Tip of the Day", hint: "Daily sickle cell awareness tip" },
  { key: "newsletter", label: "Newsletter", hint: "Monthly research digest" },
  { key: "check_reminders", label: "Check Reminders", hint: "Nudge to re-check your results" },
] as const;

function NotificationsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["notification-settings", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("notification_settings")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data;
    },
  });

  async function update(key: (typeof FIELDS)[number]["key"], value: boolean) {
    if (!user) return;
    const { error } = await supabase
      .from("notification_settings")
      .upsert({ user_id: user.id, updated_at: new Date().toISOString(), [key]: value } as never);
    if (error) {
      toast.error("Could not save that setting");
      return;
    }
    queryClient.setQueryData(["notification-settings", user.id], (old: typeof data) =>
      old ? { ...old, [key]: value } : old,
    );
    toast.success("Preference saved");
  }

  return (
    <div className="app-shell">
      <AppHeader title="Notification Settings" backTo="/profile" />

      {isLoading ? (
        <Skeleton className="h-72 rounded-3xl" />
      ) : (
        <ul className="space-y-2">
          {FIELDS.map((field) => (
            <li
              key={field.key}
              className="flex items-center justify-between gap-4 rounded-2xl bg-card p-4 shadow-soft"
            >
              <div>
                <p className="text-sm font-medium">{field.label}</p>
                <p className="text-xs text-muted-foreground">{field.hint}</p>
              </div>
              <Switch
                checked={Boolean(data?.[field.key])}
                onCheckedChange={(v) => update(field.key, v)}
                aria-label={field.label}
              />
            </li>
          ))}
        </ul>
      )}

      <BottomNav />
      <AppFooter />
    </div>
  );
}

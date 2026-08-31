import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { AppFooter } from "@/components/AppFooter";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/profile/rate")({
  head: () => ({
    meta: [
      { title: "Rate SicklePredict" },
      {
        name: "description",
        content: "Rate the SicklePredict app and share feedback with the team.",
      },
      { property: "og:title", content: "Rate SicklePredict" },
      { property: "og:description", content: "Tell us how SicklePredict is working for you." },
    ],
  }),
  component: RatePage,
});

function RatePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (!user || rating === 0) {
      toast.error("Pick a star rating first");
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("app_feedback")
      .insert({ user_id: user.id, rating, comment: comment || null });
    setSaving(false);
    if (error) {
      toast.error("Could not send feedback");
      return;
    }
    toast.success("Thank you for your feedback!");
    navigate({ to: "/profile" });
  }

  return (
    <div className="app-shell">
      <AppHeader title="Rate Us" backTo="/profile" />

      <section className="rounded-3xl bg-card p-6 text-center shadow-card">
        <h2 className="text-xl font-semibold">How are we doing?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Your rating helps more families stay informed.
        </p>
        <div className="mt-5 flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              aria-label={`${star} star`}
              onClick={() => setRating(star)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={cn(
                  "h-9 w-9",
                  star <= rating ? "fill-moderate text-moderate" : "text-muted-foreground",
                )}
              />
            </button>
          ))}
        </div>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Tell us more (optional)"
          className="mt-5 min-h-28 rounded-2xl"
        />
        <Button className="mt-4 w-full rounded-2xl py-6" onClick={submit} disabled={saving}>
          Submit Feedback
        </Button>
      </section>

      <BottomNav />
      <AppFooter />
    </div>
  );
}

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { AppFooter } from "@/components/AppFooter";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { GenotypePills } from "@/components/GenotypePills";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { Genotype } from "@/lib/genetics";

export const Route = createFileRoute("/profile/settings")({
  head: () => ({
    meta: [
      { title: "Edit profile — SicklePredict" },
      {
        name: "description",
        content: "Update your name, email, gender, genotype and partner details.",
      },
      { property: "og:title", content: "Edit profile — SicklePredict" },
      {
        property: "og:description",
        content: "Keep your SicklePredict profile details up to date.",
      },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("female");
  const [partnerGender, setPartnerGender] = useState("male");
  const [genotype, setGenotype] = useState<Genotype>("AA");
  const [saving, setSaving] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      return data;
    },
  });

  useEffect(() => {
    if (!profile) return;
    setFullName(profile.full_name ?? "");
    setUsername(profile.username ?? "");
    setEmail(profile.email || user?.email || "");
    setGender(profile.gender ?? "female");
    setPartnerGender(profile.partner_gender ?? "male");
    setGenotype((profile.genotype as Genotype) ?? "AA");
  }, [profile, user]);

  async function save() {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        username: username.trim() || null,
        email,
        gender,
        partner_gender: partnerGender,
        genotype,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);
    setSaving(false);
    if (error) toast.error("Could not save changes");
    else toast.success("Changes saved");
  }

  async function deleteAccount() {
    if (!user) return;
    await supabase.from("predictions").delete().eq("user_id", user.id);
    await supabase.from("notification_settings").delete().eq("user_id", user.id);
    const { error } = await supabase.from("profiles").delete().eq("id", user.id);
    if (error) {
      toast.error("Could not delete your data");
      return;
    }
    toast.success("Your data has been deleted");
    await signOut();
    navigate({ to: "/auth" });
  }

  return (
    <div className="app-shell">
      <AppHeader title="Settings" subtitle="Edit profile" backTo="/profile" />

      <div className="space-y-5 rounded-3xl bg-card p-5 shadow-soft">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="settings-email">Email</Label>
          <Input
            id="settings-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Gender</Label>
          <RadioGroup value={gender} onValueChange={setGender} className="flex gap-6">
            {["male", "female"].map((g) => (
              <label key={g} className="flex items-center gap-2 text-sm capitalize">
                <RadioGroupItem value={g} id={`gender-${g}`} /> {g}
              </label>
            ))}
          </RadioGroup>
        </div>

        <GenotypePills label="Your Genotype" value={genotype} onChange={setGenotype} />

        <div className="space-y-2">
          <Label>Partner's Gender</Label>
          <RadioGroup value={partnerGender} onValueChange={setPartnerGender} className="flex gap-6">
            {["male", "female"].map((g) => (
              <label key={g} className="flex items-center gap-2 text-sm capitalize">
                <RadioGroupItem value={g} id={`partner-${g}`} /> {g}
              </label>
            ))}
          </RadioGroup>
        </div>

        <Button className="w-full rounded-2xl py-6" onClick={save} disabled={saving}>
          Save Changes
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="w-full rounded-2xl py-6 text-destructive">
              Delete Account
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete your account data?</AlertDialogTitle>
              <AlertDialogDescription>
                This permanently removes your profile, saved preferences and every prediction in
                your history. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={deleteAccount}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <BottomNav />
      <AppFooter />
    </div>
  );
}

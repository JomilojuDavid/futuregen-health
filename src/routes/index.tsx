import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ShieldCheck, Sparkles, Dna } from "lucide-react";
import { AppFooter } from "@/components/AppFooter";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { GenotypePills } from "@/components/GenotypePills";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { predict, type Genotype } from "@/lib/genetics";
import { savePair, readPair } from "@/lib/prediction-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SicklePredict — Know Today, Protect Tomorrow" },
      {
        name: "description",
        content:
          "Pick your genotype and your partner's to predict the possible genotypes of your future children.",
      },
      { property: "og:title", content: "SicklePredict — Know Today, Protect Tomorrow" },
      {
        property: "og:description",
        content:
          "Genotype compatibility checker with Punnett square odds and sickle cell risk levels.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [userGenotype, setUserGenotype] = useState<Genotype>("AS");
  const [partnerGenotype, setPartnerGenotype] = useState<Genotype>("AS");

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, genotype, partner_genotype")
        .eq("id", user!.id)
        .maybeSingle();
      return data;
    },
  });

  useEffect(() => {
    const stored = readPair();
    if (stored) {
      setUserGenotype(stored.user);
      setPartnerGenotype(stored.partner);
    } else if (profile?.genotype) {
      setUserGenotype(profile.genotype as Genotype);
      if (profile.partner_genotype) setPartnerGenotype(profile.partner_genotype as Genotype);
    }
  }, [profile]);

  if (loading) {
    return (
      <div className="app-shell flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-r-transparent mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Public landing page when not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
          <div className="w-full max-w-md space-y-8 text-center">
            {/* Logo/Icon */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl"></div>
                <div className="relative bg-primary/10 rounded-full p-4">
                  <Dna className="h-12 w-12 text-primary" />
                </div>
              </div>
            </div>

            {/* Hero Content */}
            <div className="space-y-3">
              <h1 className="text-4xl font-bold tracking-tight text-foreground">SicklePredict</h1>
              <p className="text-xl font-medium text-primary">Know Today, Protect Tomorrow</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Understand genotype compatibility and predict possible health outcomes for future
                children.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-2 pt-4">
              <div className="flex items-start gap-3 text-sm">
                <div className="flex-shrink-0 mt-1">
                  <div className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/20">
                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                  </div>
                </div>
                <p className="text-muted-foreground">Punnett square genetics predictions</p>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <div className="flex-shrink-0 mt-1">
                  <div className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/20">
                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                  </div>
                </div>
                <p className="text-muted-foreground">Sickle cell risk assessment</p>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <div className="flex-shrink-0 mt-1">
                  <div className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/20">
                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                  </div>
                </div>
                <p className="text-muted-foreground">Medical education and resources</p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="pt-4 space-y-3">
              <Link to="/auth" className="block">
                <Button size="lg" className="w-full h-12 rounded-2xl text-base font-semibold">
                  Get Started
                </Button>
              </Link>
              <p className="text-xs text-muted-foreground">
                Already have an account?{" "}
                <Link to="/auth" className="font-semibold text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>

        <AppFooter />
      </div>
    );
  }

  // Authenticated home page
  const firstName = (profile?.full_name || user?.email?.split("@")[0] || "there").split(" ")[0];

  return (
    <div className="app-shell">
      <AppHeader title={`Hi, ${firstName}`} subtitle="Welcome back to SicklePredict" />

      <section className="relative overflow-hidden rounded-3xl bg-primary p-6 text-primary-foreground shadow-card">
        <Sparkles className="absolute -right-4 -top-4 h-28 w-28 opacity-15" />
        <p className="text-xs font-semibold uppercase tracking-widest opacity-80">Featured</p>
        <h2 className="mt-2 text-2xl font-semibold">Genotype Compatibility Checker</h2>
        <p className="mt-2 text-sm opacity-90">Predict possible genotypes of future children.</p>
        <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-semibold">
          <ShieldCheck className="h-4 w-4" /> Know Today, Protect Tomorrow
        </p>
      </section>

      <section className="mt-6 space-y-5 rounded-3xl bg-card p-5 shadow-soft">
        <GenotypePills label="Your Genotype" value={userGenotype} onChange={setUserGenotype} />
        <GenotypePills
          label="Partner's Genotype"
          value={partnerGenotype}
          onChange={setPartnerGenotype}
        />
        <Button
          size="lg"
          className="h-13 w-full rounded-2xl py-6 text-base font-semibold"
          onClick={async () => {
            savePair({ user: userGenotype, partner: partnerGenotype });
            const outcome = predict(userGenotype, partnerGenotype);
            if (user) {
              try {
                console.log("Saving prediction for user:", user.id);
                console.log("Prediction data:", {
                  user_genotype: outcome.user,
                  partner_genotype: outcome.partner,
                  aa_percent: outcome.percentages.AA,
                  as_percent: outcome.percentages.AS,
                  ss_percent: outcome.percentages.SS,
                  risk_level: outcome.risk,
                });
                const { data, error } = await supabase
                  .from("predictions")
                  .insert({
                    user_id: user.id,
                    user_genotype: outcome.user,
                    partner_genotype: outcome.partner,
                    aa_percent: Number(outcome.percentages.AA),
                    as_percent: Number(outcome.percentages.AS),
                    ss_percent: Number(outcome.percentages.SS),
                    risk_level: outcome.risk,
                  })
                  .select();
                if (error) {
                  console.error("Failed to save prediction:", error);
                  alert(`Error saving prediction: ${error.message}`);
                } else {
                  console.log("Prediction saved successfully:", data);
                }
              } catch (err) {
                console.error("Error saving prediction:", err);
                alert(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
              }
            }
            navigate({ to: "/predictor" });
          }}
        >
          Predict Future Babies
        </Button>
      </section>

      <section className="mt-6 grid grid-cols-2 gap-3">
        <Link
          to="/learn"
          className="rounded-3xl bg-card p-4 shadow-soft transition-transform hover:-translate-y-0.5"
        >
          <p className="text-sm font-semibold">Learn</p>
          <p className="mt-1 text-xs text-muted-foreground">Up-to-date medical explainers</p>
        </Link>
        <Link
          to="/profile/history"
          className="rounded-3xl bg-card p-4 shadow-soft transition-transform hover:-translate-y-0.5"
        >
          <p className="text-sm font-semibold">My Results</p>
          <p className="mt-1 text-xs text-muted-foreground">Review past genotype checks</p>
        </Link>
      </section>

      <BottomNav />
      <AppFooter />
    </div>
  );
}

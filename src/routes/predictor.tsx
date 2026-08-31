import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { AppFooter } from "@/components/AppFooter";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { PunnettSquare } from "@/components/PunnettSquare";
import { RequireAuth } from "@/components/RequireAuth";
import { RiskBadge } from "@/components/RiskBadge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { predict, type Genotype } from "@/lib/genetics";
import { useLastPair } from "@/lib/prediction-store";

export const Route = createFileRoute("/predictor")({
  head: () => ({
    meta: [
      { title: "Your Future Babies — SicklePredict Predictor" },
      {
        name: "description",
        content:
          "Punnett square results, AA/AS/SS probability breakdown and sickle cell risk level for your genotype pairing.",
      },
      { property: "og:title", content: "Your Future Babies — SicklePredict Predictor" },
      {
        property: "og:description",
        content: "See the genetic cross, probabilities and risk level for your combination.",
      },
    ],
  }),
  component: () => (
    <RequireAuth>
      <PredictorPage />
    </RequireAuth>
  ),
});

const BAR_TONE: Record<Genotype, string> = {
  AA: "bg-safe",
  AS: "bg-moderate",
  SS: "bg-danger",
};

function PredictorPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { pair } = useLastPair();

  const result = useMemo(
    () => predict(pair?.user ?? "AS", pair?.partner ?? "AS"),
    [pair?.user, pair?.partner],
  );

  // Saving happens on the Home screen when a prediction is requested.

  void user;
  void supabase;

  return (
    <div className="app-shell">
      <AppHeader title="Predictor" subtitle="Your Future Babies" backTo="/" />

      <div className="mb-5 flex items-center justify-between rounded-3xl bg-card p-4 shadow-soft">
        <div>
          <p className="text-xs text-muted-foreground">You</p>
          <p className="text-xl font-semibold">{result.user}</p>
        </div>
        <span className="text-sm text-muted-foreground">+</span>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Partner</p>
          <p className="text-xl font-semibold">{result.partner}</p>
        </div>
      </div>

      <PunnettSquare result={result} />

      <section className="mt-5 space-y-4 rounded-3xl bg-card p-5 shadow-soft">
        <p className="text-sm font-medium text-muted-foreground">Probability breakdown</p>
        {(["AA", "AS", "SS"] as Genotype[]).map((g) => (
          <div key={g}>
            <div className="mb-1 flex items-center justify-between text-sm font-semibold">
              <span>{g}</span>
              <span>{result.percentages[g]}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full transition-all duration-500 ${BAR_TONE[g]}`}
                style={{ width: `${result.percentages[g]}%` }}
              />
            </div>
          </div>
        ))}
      </section>

      <section className="mt-5 rounded-3xl bg-card p-5 shadow-soft">
        <RiskBadge risk={result.risk} />
        <p className="mt-3 text-sm text-muted-foreground">{result.description}</p>
      </section>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          className="rounded-2xl py-6"
          onClick={() => navigate({ to: "/" })}
        >
          Predict Again
        </Button>
        <Button className="rounded-2xl py-6" onClick={() => navigate({ to: "/share" })}>
          Share Results
        </Button>
      </div>

      <BottomNav />
      <AppFooter />
    </div>
  );
}

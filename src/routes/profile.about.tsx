import { createFileRoute } from "@tanstack/react-router";
import { AppFooter } from "@/components/AppFooter";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";

export const Route = createFileRoute("/profile/about")({
  head: () => ({
    meta: [
      { title: "About SicklePredict" },
      {
        name: "description",
        content: "Our mission, how the genotype predictor works, and the medical disclaimer.",
      },
      { property: "og:title", content: "About SicklePredict" },
      { property: "og:description", content: "Mission, how it works and medical disclaimer." },
    ],
  }),
  component: AboutPage,
});

const SECTIONS = [
  {
    title: "Mission",
    body: "SicklePredict makes hemoglobin genotype compatibility easy to understand so couples can make informed decisions before starting a family. Know today, protect tomorrow.",
  },
  {
    title: "How it works",
    body: "You select your genotype and your partner's. We build the Mendelian genetic cross (Punnett square) from the A and S alleles, calculate the probability of AA, AS and SS children per pregnancy, and translate that into a plain-language risk level.",
  },
  {
    title: "Medical Disclaimer",
    body: "SicklePredict is an educational tool and is not a medical diagnosis. Genotypes must be confirmed through laboratory testing such as hemoglobin electrophoresis. Always consult a qualified genetic counselor or clinician before making reproductive decisions.",
  },
];

function AboutPage() {
  return (
    <div className="app-shell">
      <AppHeader title="About SicklePredict" backTo="/profile" />

      <div className="rounded-3xl bg-primary p-5 text-primary-foreground shadow-card">
        <h2 className="text-2xl font-semibold">SicklePredict</h2>
        <p className="mt-1 text-sm opacity-90">Version 1.0.0</p>
      </div>

      <div className="mt-4 space-y-3">
        {SECTIONS.map((section) => (
          <section key={section.title} className="rounded-3xl bg-card p-5 shadow-soft">
            <h3 className="text-base font-semibold">{section.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{section.body}</p>
          </section>
        ))}
      </div>

      <BottomNav />
      <AppFooter />
    </div>
  );
}

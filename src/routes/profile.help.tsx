import { createFileRoute } from "@tanstack/react-router";
import { AppFooter } from "@/components/AppFooter";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/profile/help")({
  head: () => ({
    meta: [
      { title: "Help & support — SicklePredict" },
      {
        name: "description",
        content: "Answers to common SicklePredict questions and how to reach support.",
      },
      { property: "og:title", content: "Help & support — SicklePredict" },
      {
        property: "og:description",
        content: "Common questions about sickle cell and the predictor.",
      },
    ],
  }),
  component: HelpPage,
});

const FAQS = [
  {
    q: "What is sickle cell disease?",
    a: "Sickle cell disease is an inherited blood disorder in which haemoglobin forms rigid, sickle-shaped red blood cells. Those cells block small vessels, causing pain crises, anaemia and organ damage. A child develops it only when they inherit an S allele from both parents (SS).",
  },
  {
    q: "How accurate is the predictor?",
    a: "The probabilities follow standard Mendelian inheritance and are exact for each pregnancy, assuming both genotypes were confirmed by a laboratory haemoglobin electrophoresis test. Percentages describe the chance per pregnancy, not a guaranteed split across your children.",
  },
  {
    q: "Should I still see a doctor?",
    a: "Yes. SicklePredict is educational. Confirm genotypes with laboratory testing and speak to a genetic counsellor or clinician before making family-planning decisions.",
  },
  {
    q: "Contact Support",
    a: "Email support@sicklepredict.app and we usually respond within 48 hours. Include your account email and a description of the issue.",
  },
];

function HelpPage() {
  return (
    <div className="app-shell">
      <AppHeader title="Help & Support" backTo="/profile" />

      <Accordion type="single" collapsible className="space-y-3">
        {FAQS.map((faq) => (
          <AccordionItem
            key={faq.q}
            value={faq.q}
            className="rounded-3xl border-none bg-card px-5 shadow-soft"
          >
            <AccordionTrigger className="text-left text-sm font-semibold hover:no-underline">
              {faq.q}
            </AccordionTrigger>
            <AccordionContent className="pb-5 text-sm leading-relaxed text-muted-foreground">
              {faq.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <BottomNav />
      <AppFooter />
    </div>
  );
}

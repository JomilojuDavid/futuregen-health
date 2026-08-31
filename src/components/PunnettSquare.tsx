import { cn } from "@/lib/utils";
import type { PredictionResult } from "@/lib/genetics";

const cellTone = (g: string) =>
  g === "SS"
    ? "bg-danger text-danger-foreground"
    : g === "AS"
      ? "bg-moderate text-moderate-foreground"
      : "bg-safe text-safe-foreground";

export function PunnettSquare({ result }: { result: PredictionResult }) {
  return (
    <div className="rounded-3xl bg-card p-5 shadow-card">
      <p className="mb-4 text-sm font-medium text-muted-foreground">
        Genetic cross (Punnett square)
      </p>
      <div className="grid grid-cols-[auto_1fr_1fr] gap-2">
        <div />
        {result.userAlleles.map((a, i) => (
          <div key={`u-${i}`} className="text-center text-sm font-semibold text-primary">
            {a}
          </div>
        ))}
        {result.partnerAlleles.map((p, row) => (
          <div key={`row-${row}`} className="contents">
            <div className="flex w-8 items-center justify-center text-sm font-semibold text-accent-foreground">
              {p}
            </div>
            {result.userAlleles.map((_, col) => {
              const cell = result.square[row * 2 + col] ?? "AA";
              return (
                <div
                  key={`c-${row}-${col}`}
                  className={cn(
                    "flex aspect-square items-center justify-center rounded-2xl text-lg font-bold",
                    cellTone(cell),
                  )}
                >
                  {cell}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-between text-xs text-muted-foreground">
        <span>Columns: your genes ({result.user})</span>
        <span>Rows: partner ({result.partner})</span>
      </div>
    </div>
  );
}

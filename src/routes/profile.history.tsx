import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { ChevronDown, Download, TrendingUp } from "lucide-react";
import { AppFooter } from "@/components/AppFooter";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { RiskBadge } from "@/components/RiskBadge";
import { RequireAuth } from "@/components/RequireAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { RiskLevel } from "@/lib/genetics";

export const Route = createFileRoute("/profile/history")({
  head: () => ({
    meta: [
      { title: "My results history — SicklePredict" },
      { name: "description", content: "Complete chronological log of all your past genotype compatibility checks and results." },
      { property: "og:title", content: "My results history — SicklePredict" },
      { property: "og:description", content: "Every genotype check you have run, with detailed results, risk assessments and predictions." },
    ],
  }),
  component: () => (
    <RequireAuth>
      <HistoryPage />
    </RequireAuth>
  ),
});

type SortBy = "date-newest" | "date-oldest" | "risk-highest" | "risk-lowest";
type FilterBy = "all" | "high" | "moderate" | "low";

function HistoryPage() {
  const { user } = useAuth();
  const [sortBy, setSortBy] = useState<SortBy>("date-newest");
  const [filterBy, setFilterBy] = useState<FilterBy>("all");
  const [itemsPerPage] = useState(10);
  const [page, setPage] = useState(1);

  const { data: allPredictions, isLoading, error: queryError } = useQuery({
    queryKey: ["predictions", user?.id],
    enabled: !!user,
    queryFn: async () => {
      if (!user?.id) {
        console.log("No user ID available");
        return [];
      }
      console.log("Fetching predictions for user:", user.id);
      const { data, error } = await supabase
        .from("predictions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) {
        console.error("Query error:", error);
        throw error;
      }
      console.log("Predictions fetched:", data);
      return data || [];
    },
  });

  // Filter predictions
  const filtered = useMemo(() => {
    if (!allPredictions) return [];
    if (filterBy === "all") return allPredictions;
    return allPredictions.filter((p) => p.risk_level === filterBy);
  }, [allPredictions, filterBy]);

  // Sort predictions
  const sorted = useMemo(() => {
    const arr = [...filtered];
    switch (sortBy) {
      case "date-newest":
        return arr.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      case "date-oldest":
        return arr.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      case "risk-highest":
        return arr.sort((a, b) => {
          const riskOrder = { high: 3, moderate: 2, low: 1 };
          return (riskOrder[b.risk_level as any] || 0) - (riskOrder[a.risk_level as any] || 0);
        });
      case "risk-lowest":
        return arr.sort((a, b) => {
          const riskOrder = { high: 3, moderate: 2, low: 1 };
          return (riskOrder[a.risk_level as any] || 0) - (riskOrder[b.risk_level as any] || 0);
        });
      default:
        return arr;
    }
  }, [filtered, sortBy]);

  // Paginate
  const totalPages = Math.ceil(sorted.length / itemsPerPage);
  const paginatedData = sorted.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  // Calculate stats
  const stats = useMemo(() => {
    if (!allPredictions || allPredictions.length === 0) return null;
    const riskCounts = { high: 0, moderate: 0, low: 0 };
    let totalSsRisk = 0;

    allPredictions.forEach((p) => {
      riskCounts[p.risk_level as any]++;
      totalSsRisk += Number(p.ss_percent);
    });

    return {
      total: allPredictions.length,
      riskCounts,
      avgSsRisk: (totalSsRisk / allPredictions.length).toFixed(1),
      highestRiskPrediction: allPredictions.find((p) => p.risk_level === "high"),
    };
  }, [allPredictions]);

  const handleExport = () => {
    if (!allPredictions) return;
    const csv = [
      ["Date", "Your Genotype", "Partner Genotype", "AA %", "AS %", "SS %", "Risk Level"].join(","),
      ...allPredictions.map((p) =>
        [
          new Date(p.created_at).toLocaleDateString(),
          p.user_genotype,
          p.partner_genotype,
          p.aa_percent,
          p.as_percent,
          p.ss_percent,
          p.risk_level,
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sicklepredict-history-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="app-shell">
      <AppHeader title="My Results History" subtitle="Complete prediction report" backTo="/profile" />

      {/* Stats Section */}
      {!isLoading && stats && (
        <section className="mb-6 space-y-3 rounded-3xl bg-card p-5 shadow-soft">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Your Prediction Summary</h3>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="rounded-2xl bg-muted/50 p-3">
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground mt-1">Total Predictions</p>
            </div>
            <div className="rounded-2xl bg-muted/50 p-3">
              <p className="text-2xl font-bold">{stats.avgSsRisk}%</p>
              <p className="text-xs text-muted-foreground mt-1">Avg SS Risk</p>
            </div>
            <div className="rounded-2xl bg-danger/10 p-3">
              <p className="text-lg font-semibold text-danger">{stats.riskCounts.high}</p>
              <p className="text-xs text-muted-foreground mt-1">High Risk</p>
            </div>
            <div className="rounded-2xl bg-moderate/10 p-3">
              <p className="text-lg font-semibold text-moderate">{stats.riskCounts.moderate}</p>
              <p className="text-xs text-muted-foreground mt-1">Moderate Risk</p>
            </div>
          </div>
        </section>
      )}

      {/* Controls */}
      {!isLoading && allPredictions && allPredictions.length > 0 && (
        <section className="mb-4 space-y-3">
          <div className="flex gap-2">
            <Select value={filterBy} onValueChange={(v) => { setFilterBy(v as FilterBy); setPage(1); }}>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Results</SelectItem>
                <SelectItem value="high">High Risk</SelectItem>
                <SelectItem value="moderate">Moderate Risk</SelectItem>
                <SelectItem value="low">Low Risk</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(v) => { setSortBy(v as SortBy); setPage(1); }}>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-newest">Newest First</SelectItem>
                <SelectItem value="date-oldest">Oldest First</SelectItem>
                <SelectItem value="risk-highest">Highest Risk</SelectItem>
                <SelectItem value="risk-lowest">Lowest Risk</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={handleExport}
          >
            <Download className="h-4 w-4 mr-2" />
            Export to CSV
          </Button>
        </section>
      )}

      {/* Error State */}
      {queryError && (
        <div className="rounded-3xl bg-danger/10 p-6 text-center">
          <p className="text-sm font-semibold text-danger">Failed to load predictions</p>
          <p className="mt-1 text-xs text-danger/80">{queryError instanceof Error ? queryError.message : "Unknown error"}</p>
        </div>
      )}

      {/* Predictions List */}
      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-24 rounded-3xl" />
          ))}
        </div>
      ) : paginatedData.length ? (
        <>
          <ul className="space-y-3 mb-4">
            {paginatedData.map((row) => (
              <li key={row.id} className="rounded-3xl bg-card p-4 shadow-soft">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">
                      {new Date(row.created_at).toLocaleDateString(undefined, {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <p className="mt-1 text-lg font-semibold">
                      {row.user_genotype} + {row.partner_genotype}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground font-medium">
                      Possible Offspring
                    </p>
                    <div className="mt-1 flex gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-safe/10 px-2 py-1 text-xs font-semibold text-safe">
                        AA {row.aa_percent}%
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-moderate/10 px-2 py-1 text-xs font-semibold text-moderate">
                        AS {row.as_percent}%
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-danger/10 px-2 py-1 text-xs font-semibold text-danger">
                        SS {row.ss_percent}%
                      </span>
                    </div>
                  </div>
                  <RiskBadge risk={row.risk_level as RiskLevel} />
                </div>
              </li>
            ))}
          </ul>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between rounded-3xl bg-card p-4 shadow-soft">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      ) : (
        <p className="rounded-3xl bg-card p-6 text-center text-sm text-muted-foreground shadow-soft">
          No {filterBy !== "all" ? filterBy + " risk" : ""} predictions found. Run your first prediction from the Home screen.
        </p>
      )}

      <BottomNav />
      <AppFooter />
    </div>
  );
}

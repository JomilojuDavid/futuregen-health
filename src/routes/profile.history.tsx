import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { ChevronDown, Download, TrendingUp, Eye, Trash2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { RiskLevel } from "@/lib/genetics";

export const Route = createFileRoute("/profile/history")({
  head: () => ({
    meta: [
      { title: "My results history — SicklePredict" },
      {
        name: "description",
        content:
          "Complete chronological log of all your past genotype compatibility checks and results.",
      },
      { property: "og:title", content: "My results history — SicklePredict" },
      {
        property: "og:description",
        content:
          "Every genotype check you have run, with detailed results, risk assessments and predictions.",
      },
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

type Prediction = {
  id: string;
  user_id: string;
  user_genotype: string;
  partner_genotype: string;
  aa_percent: number | string;
  as_percent: number | string;
  ss_percent: number | string;
  risk_level: string;
  created_at: string;
};

function HistoryPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [sortBy, setSortBy] = useState<SortBy>("date-newest");
  const [filterBy, setFilterBy] = useState<FilterBy>("all");
  const [itemsPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [selectedResult, setSelectedResult] = useState<Prediction | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    data: allPredictions,
    isLoading,
    error: queryError,
  } = useQuery({
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
        return arr.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
      case "date-oldest":
        return arr.sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
        );
      case "risk-highest":
        return arr.sort((a, b) => {
          const riskOrder: Record<string, number> = { high: 3, moderate: 2, low: 1 };
          return (riskOrder[b.risk_level] || 0) - (riskOrder[a.risk_level] || 0);
        });
      case "risk-lowest":
        return arr.sort((a, b) => {
          const riskOrder: Record<string, number> = { high: 3, moderate: 2, low: 1 };
          return (riskOrder[a.risk_level] || 0) - (riskOrder[b.risk_level] || 0);
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
    const riskCounts: Record<string, number> = { high: 0, moderate: 0, low: 0 };
    let totalSsRisk = 0;

    allPredictions.forEach((p) => {
      riskCounts[p.risk_level]++;
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

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("predictions")
        .delete()
        .eq("id", id)
        .eq("user_id", user?.id);

      if (error) throw error;

      // Invalidate and refetch predictions
      queryClient.invalidateQueries({ queryKey: ["predictions", user?.id] });
      setDeleteConfirmId(null);
      toast.success("Prediction deleted successfully");
    } catch (error) {
      console.error("Error deleting prediction:", error);
      toast.error("Failed to delete prediction. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="app-shell">
      <AppHeader
        title="My Results History"
        subtitle="Complete prediction report"
        backTo="/profile"
      />

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
            <Select
              value={filterBy}
              onValueChange={(v) => {
                setFilterBy(v as FilterBy);
                setPage(1);
              }}
            >
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
            <Select
              value={sortBy}
              onValueChange={(v) => {
                setSortBy(v as SortBy);
                setPage(1);
              }}
            >
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
          <Button variant="outline" size="sm" className="w-full" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export to CSV
          </Button>
        </section>
      )}

      {/* Error State */}
      {queryError && (
        <div className="rounded-3xl bg-danger/10 p-6 text-center">
          <p className="text-sm font-semibold text-danger">Failed to load predictions</p>
          <p className="mt-1 text-xs text-danger/80">
            {queryError instanceof Error ? queryError.message : "Unknown error"}
          </p>
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
                    {/* Action Buttons */}
                    <div className="mt-3 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => setSelectedResult(row)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-danger hover:text-danger hover:bg-danger/10"
                        onClick={() => setDeleteConfirmId(row.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
        <div className="rounded-3xl bg-card p-6 text-center shadow-soft space-y-3">
          <p className="text-sm font-semibold text-foreground">
            No {filterBy !== "all" ? filterBy + " risk" : ""} predictions found
          </p>
          <p className="text-xs text-muted-foreground">
            {allPredictions?.length === 0
              ? "You haven't run any predictions yet. Start by using the Predictor to analyze genetic compatibility."
              : `No results match your current filter. Try adjusting your filter settings or create a new prediction.`}
          </p>
        </div>
      )}

      {/* Details Dialog */}
      <Dialog
        open={selectedResult !== null}
        onOpenChange={(open) => !open && setSelectedResult(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Prediction Details</DialogTitle>
            <DialogDescription>
              Complete information about this genetic prediction
            </DialogDescription>
          </DialogHeader>

          {selectedResult && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-muted/50 p-4 space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-1">Date & Time</p>
                  <p className="text-sm font-semibold">
                    {new Date(selectedResult.created_at).toLocaleDateString(undefined, {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium mb-1">Your Genotype</p>
                    <p className="text-lg font-bold">{selectedResult.user_genotype}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium mb-1">
                      Partner Genotype
                    </p>
                    <p className="text-lg font-bold">{selectedResult.partner_genotype}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold">Possible Offspring Genotypes</p>
                <div className="space-y-2">
                  <div className="rounded-2xl bg-safe/10 p-3">
                    <p className="text-xs text-muted-foreground font-medium mb-1">AA (Normal)</p>
                    <p className="text-2xl font-bold text-safe">{selectedResult.aa_percent}%</p>
                  </div>
                  <div className="rounded-2xl bg-moderate/10 p-3">
                    <p className="text-xs text-muted-foreground font-medium mb-1">AS (Carrier)</p>
                    <p className="text-2xl font-bold text-moderate">{selectedResult.as_percent}%</p>
                  </div>
                  <div className="rounded-2xl bg-danger/10 p-3">
                    <p className="text-xs text-muted-foreground font-medium mb-1">SS (Affected)</p>
                    <p className="text-2xl font-bold text-danger">{selectedResult.ss_percent}%</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-card border border-border p-3">
                <p className="text-xs text-muted-foreground font-medium mb-1">Risk Assessment</p>
                <div className="flex items-center gap-2">
                  <RiskBadge risk={selectedResult.risk_level as RiskLevel} />
                  <span className="text-xs text-muted-foreground">
                    {selectedResult.risk_level === "high" && "High risk of SCD in offspring"}
                    {selectedResult.risk_level === "moderate" &&
                      "Moderate risk of SCD in offspring"}
                    {selectedResult.risk_level === "low" && "Low risk of SCD in offspring"}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setSelectedResult(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteConfirmId !== null}
        onOpenChange={(open) => !open && setDeleteConfirmId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-danger" />
              Delete Prediction
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this prediction? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4 rounded-2xl bg-muted/50 p-3">
            {allPredictions?.find((p) => p.id === deleteConfirmId) && (
              <p className="text-sm font-medium">
                {allPredictions.find((p) => p.id === deleteConfirmId)?.user_genotype} +{" "}
                {allPredictions.find((p) => p.id === deleteConfirmId)?.partner_genotype}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
              disabled={isDeleting}
              className="bg-danger hover:bg-danger/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <BottomNav />
      <AppFooter />
    </div>
  );
}

import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, Circle, Target } from "lucide-react";
import {
  formatDuration,
  getSessionTypeLabel,
  getSessionTypeColor,
} from "@/lib/utils-format";
import type { TrainingPlan } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function PlanPage() {
  const { data: plan, isLoading } = useQuery<TrainingPlan[]>({
    queryKey: ["/api/plan"],
  });
  const { toast } = useToast();

  const toggleMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: number; completed: boolean }) => {
      await apiRequest("PATCH", `/api/plan/${id}`, { completed });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/plan"] });
    },
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-64 rounded-lg" />
        ))}
      </div>
    );
  }

  // Group by week
  const weeks = new Map<number, TrainingPlan[]>();
  plan?.forEach(s => {
    const w = weeks.get(s.weekNumber) || [];
    w.push(s);
    weeks.set(s.weekNumber, w);
  });

  const weekLabels = ["Semaine 1 — Construction", "Semaine 2 — Pic", "Semaine 3 — Affûtage + Course"];
  const todayStr = "2026-03-19";

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Plan d'entraînement</h2>
          <p className="text-sm text-muted-foreground">
            Objectif : 10km du Bois de Boulogne — 5 avril 2026
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10">
          <Target className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-medium">58:00</span>
        </div>
      </div>

      {Array.from(weeks.entries()).map(([weekNum, sessions]) => {
        const completedCount = sessions.filter(s => s.completed).length;
        const totalRunningSessions = sessions.filter(s => s.sessionType !== "rest").length;

        return (
          <Card key={weekNum} data-testid={`plan-week-${weekNum}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">
                  {weekLabels[weekNum - 1] || `Semaine ${weekNum}`}
                </CardTitle>
                <span className="text-xs text-muted-foreground">
                  {completedCount}/{totalRunningSessions} séances
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              {sessions.map(session => {
                const isToday = session.date === todayStr;
                const isPast = session.date < todayStr;
                const isRace = session.sessionType === "race";

                return (
                  <div
                    key={session.id}
                    className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                      isToday
                        ? "bg-primary/5 ring-1 ring-primary/20"
                        : isRace
                          ? "bg-purple-500/5 ring-1 ring-purple-500/20"
                          : "hover:bg-accent/50"
                    }`}
                    data-testid={`plan-session-${session.id}`}
                  >
                    {/* Day */}
                    <div className="text-center shrink-0 w-12">
                      <p className="text-xs text-muted-foreground">
                        {new Date(session.date + "T00:00:00").toLocaleDateString("fr-FR", {
                          weekday: "short",
                        })}
                      </p>
                      <p className="text-sm font-semibold">
                        {new Date(session.date + "T00:00:00").getDate()}
                      </p>
                    </div>

                    {/* Checkbox */}
                    <div className="pt-0.5 shrink-0">
                      {session.sessionType === "rest" ? (
                        <Circle className="w-4 h-4 text-muted-foreground/30" />
                      ) : (
                        <Checkbox
                          checked={session.completed || false}
                          onCheckedChange={(checked) => {
                            toggleMutation.mutate({ id: session.id, completed: !!checked });
                            if (checked) {
                              toast({ title: "Séance validée", description: session.description });
                            }
                          }}
                          data-testid={`checkbox-session-${session.id}`}
                        />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          className={`${getSessionTypeColor(session.sessionType)} border-0 text-xs`}
                        >
                          {getSessionTypeLabel(session.sessionType)}
                        </Badge>
                        {isToday && (
                          <Badge variant="outline" className="text-xs border-primary text-primary">
                            Aujourd'hui
                          </Badge>
                        )}
                        {session.completed && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        )}
                      </div>
                      <p className={`text-sm mt-1 ${isPast && !session.completed ? "text-muted-foreground" : ""}`}>
                        {session.description}
                      </p>
                      <div className="flex gap-4 mt-1.5 text-xs text-muted-foreground">
                        {session.targetDistanceKm && (
                          <span>{session.targetDistanceKm} km</span>
                        )}
                        {session.targetPaceMinKm && (
                          <span>Allure: {session.targetPaceMinKm}/km</span>
                        )}
                        {session.targetDurationMinutes && (
                          <span>{formatDuration(session.targetDurationMinutes)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

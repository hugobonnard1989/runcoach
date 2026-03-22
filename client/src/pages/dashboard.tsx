import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Flame,
  Clock,
  Heart,
  AlertTriangle,
  Info,
  Zap,
  Calendar,
} from "lucide-react";
import { formatPace, formatDuration, formatDate, getSessionTypeLabel, getSessionTypeColor } from "@/lib/utils-format";
import type { Activity, CoachingAdvice, TrainingPlan } from "@shared/schema";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/stats"],
    queryFn: () => apiRequest("GET", "/api/stats").then(r => r.json()),
  });

  const { data: activities } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
  });

  const { data: advice } = useQuery<CoachingAdvice[]>({
    queryKey: ["/api/coaching"],
  });

  const { data: plan } = useQuery<TrainingPlan[]>({
    queryKey: ["/api/plan"],
  });

  const todayStr = "2026-03-19";
  const todaySession = plan?.find(s => s.date === todayStr);
  const upcomingSessions = plan?.filter(s => s.date > todayStr && !s.completed)?.slice(0, 3);
  const recentActivities = activities?.slice(0, 4);

  // Chart data: weekly km over last 4 weeks
  const weeklyData = activities
    ? getWeeklyData(activities)
    : [];

  if (statsLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header with race countdown */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold" data-testid="text-dashboard-title">
            Bonjour Hugo
          </h2>
          <p className="text-sm text-muted-foreground">
            {todaySession
              ? `Aujourd'hui : ${getSessionTypeLabel(todaySession.sessionType)}`
              : "Jour de repos"}
          </p>
        </div>
        {stats?.daysToRace != null && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10">
            <Target className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">
              J-{stats.daysToRace} — {stats?.daysToRace > 0 ? "10km Bois de Boulogne" : "Jour de course"}
            </span>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard
          title="Cette semaine"
          value={`${stats?.thisWeek?.km || 0} km`}
          subtitle={`${stats?.thisWeek?.runs || 0} séances`}
          trend={stats?.weeklyChange}
          icon={<Flame className="w-4 h-4" />}
          testId="kpi-weekly-km"
        />
        <KpiCard
          title="Allure moy."
          value={formatPace(stats?.thisWeek?.avgPace)}
          subtitle="/km cette semaine"
          icon={<Clock className="w-4 h-4" />}
          testId="kpi-avg-pace"
        />
        <KpiCard
          title="Forme"
          value={`${stats?.fitnessScore || 0}`}
          subtitle="/100"
          icon={<Zap className="w-4 h-4" />}
          testId="kpi-fitness"
          progress={stats?.fitnessScore}
        />
        <KpiCard
          title="Poids"
          value={`${stats?.weight?.current || "--"} kg`}
          subtitle={stats?.weight?.change ? `${stats.weight.change > 0 ? "+" : ""}${stats.weight.change} kg` : ""}
          trend={stats?.weight?.change ? (stats.weight.change < 0 ? 1 : -1) : undefined}
          icon={<Heart className="w-4 h-4" />}
          testId="kpi-weight"
        />
      </div>

      <div className="grid md:grid-cols-5 gap-4">
        {/* Left: Chart + Today's session */}
        <div className="md:col-span-3 space-y-4">
          {/* Volume chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Volume hebdomadaire</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyData}>
                    <defs>
                      <linearGradient id="kmGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(152, 72%, 40%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(152, 72%, 40%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="week"
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                      stroke="hsl(var(--muted-foreground))"
                      unit=" km"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "13px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="km"
                      stroke="hsl(152, 72%, 40%)"
                      strokeWidth={2}
                      fill="url(#kmGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Today's session */}
          {todaySession && (
            <Card data-testid="card-today-session">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <CardTitle className="text-sm font-medium">Séance du jour</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-3">
                  <Badge className={`${getSessionTypeColor(todaySession.sessionType)} border-0 shrink-0`}>
                    {getSessionTypeLabel(todaySession.sessionType)}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{todaySession.description}</p>
                    <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                      {todaySession.targetDistanceKm && (
                        <span>{todaySession.targetDistanceKm} km</span>
                      )}
                      {todaySession.targetPaceMinKm && (
                        <span>Allure: {todaySession.targetPaceMinKm}/km</span>
                      )}
                      {todaySession.targetDurationMinutes && (
                        <span>{formatDuration(todaySession.targetDurationMinutes)}</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent activities */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Dernières activités</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {recentActivities?.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center gap-3 p-2 rounded-md hover:bg-accent/50 transition-colors"
                  data-testid={`activity-row-${a.id}`}
                >
                  <Badge className={`${getSessionTypeColor(a.type)} border-0 text-xs shrink-0`}>
                    {getSessionTypeLabel(a.type)}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{a.name}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(a.date)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-medium">{a.distanceKm} km</p>
                    <p className="text-xs text-muted-foreground">{formatPace(a.avgPaceMinKm)}/km</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right: Coaching + Upcoming */}
        <div className="md:col-span-2 space-y-4">
          {/* Coach's advice */}
          <Card data-testid="card-coaching">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Conseils du coach</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {advice?.slice(0, 4).map((a) => (
                <div
                  key={a.id}
                  className="flex gap-2.5"
                  data-testid={`advice-${a.id}`}
                >
                  <div className="shrink-0 mt-0.5">
                    {a.priority === "warning" ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    ) : a.priority === "alert" ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                    ) : (
                      <Info className="w-3.5 h-3.5 text-primary" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{a.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{a.content}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Upcoming sessions */}
          <Card data-testid="card-upcoming">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Prochaines séances</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {upcomingSessions?.map((s) => (
                <div key={s.id} className="flex items-center gap-3 p-2 rounded-md bg-accent/30">
                  <div className="text-center shrink-0 w-10">
                    <p className="text-xs text-muted-foreground">
                      {new Date(s.date + "T00:00:00").toLocaleDateString("fr-FR", { weekday: "short" })}
                    </p>
                    <p className="text-sm font-semibold">
                      {new Date(s.date + "T00:00:00").getDate()}
                    </p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <Badge className={`${getSessionTypeColor(s.sessionType)} border-0 text-xs`}>
                      {getSessionTypeLabel(s.sessionType)}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1 truncate">{s.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  title,
  value,
  subtitle,
  trend,
  icon,
  testId,
  progress,
}: {
  title: string;
  value: string;
  subtitle: string;
  trend?: number | null;
  icon: React.ReactNode;
  testId: string;
  progress?: number;
}) {
  return (
    <Card data-testid={testId}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground">{title}</span>
          <span className="text-muted-foreground">{icon}</span>
        </div>
        <p className="text-xl font-semibold tracking-tight">{value}</p>
        <div className="flex items-center gap-1.5 mt-1">
          {trend != null && trend !== 0 && (
            trend > 0 ? (
              <TrendingUp className="w-3 h-3 text-emerald-500" />
            ) : (
              <TrendingDown className="w-3 h-3 text-red-500" />
            )
          )}
          <span className="text-xs text-muted-foreground">{subtitle}</span>
        </div>
        {progress != null && (
          <Progress value={progress} className="mt-2 h-1.5" />
        )}
      </CardContent>
    </Card>
  );
}

function getWeeklyData(activities: Activity[]): { week: string; km: number }[] {
  const weeks: { week: string; km: number }[] = [];
  const now = new Date("2026-03-19");

  for (let i = 3; i >= 0; i--) {
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() - i * 7);
    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekStart.getDate() - 7);

    const weekKm = activities
      .filter(a => {
        const d = new Date(a.date);
        return d >= weekStart && d <= weekEnd;
      })
      .reduce((sum, a) => sum + a.distanceKm, 0);

    const label = weekStart.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
    weeks.push({ week: label, km: Math.round(weekKm * 10) / 10 });
  }

  return weeks;
}

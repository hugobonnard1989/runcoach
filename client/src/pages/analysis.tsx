import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  Heart,
  Zap,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { formatPace } from "@/lib/utils-format";
import type { Activity } from "@shared/schema";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function AnalysisPage() {
  const { data: activities, isLoading } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
    queryFn: () => apiRequest("GET", "/api/stats").then(r => r.json()),
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid md:grid-cols-2 gap-4">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  const sortedActivities = [...(activities || [])].sort((a, b) => a.date.localeCompare(b.date));

  // Pace evolution chart data
  const paceData = sortedActivities
    .filter(a => a.avgPaceMinKm)
    .map(a => ({
      date: new Date(a.date + "T00:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "short" }),
      pace: a.avgPaceMinKm,
      paceFormatted: formatPace(a.avgPaceMinKm),
      type: a.type,
    }));

  // HR data
  const hrData = sortedActivities
    .filter(a => a.avgHr)
    .map(a => ({
      date: new Date(a.date + "T00:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "short" }),
      avgHr: a.avgHr,
      maxHr: a.maxHr,
    }));

  // Distance by type
  const distByType = new Map<string, number>();
  activities?.forEach(a => {
    distByType.set(a.type, (distByType.get(a.type) || 0) + a.distanceKm);
  });
  const typeLabels: Record<string, string> = {
    easy_run: "Footing",
    tempo: "Tempo",
    intervals: "Fractionné",
    long_run: "Longue",
    recovery: "Récup",
    race: "Course",
  };
  const distByTypeData = Array.from(distByType.entries()).map(([type, km]) => ({
    type: typeLabels[type] || type,
    km: Math.round(km * 10) / 10,
  }));

  // Fitness metrics
  const fitnessScore = stats?.fitnessScore || 0;
  const totalKm = stats?.overall?.totalKm || 0;
  const avgPace = stats?.overall?.avgPace;

  // Training load analysis
  const thisWeekKm = stats?.thisWeek?.km || 0;
  const lastWeekKm = stats?.lastWeek?.km || 0;
  const loadRatio = lastWeekKm > 0 ? thisWeekKm / lastWeekKm : 1;
  const loadStatus =
    loadRatio < 0.8 ? { label: "Sous-charge", color: "text-amber-500", icon: ArrowDownRight }
    : loadRatio > 1.3 ? { label: "Surcharge", color: "text-red-500", icon: ArrowUpRight }
    : { label: "Optimal", color: "text-emerald-500", icon: CheckCircle2 };

  // Feeling trend
  const avgFeeling = activities && activities.length > 0
    ? activities.reduce((s, a) => s + (a.feeling || 3), 0) / activities.length
    : 3;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-lg font-semibold">Analyse de forme</h2>
        <p className="text-sm text-muted-foreground">Suivi de performance et charge d'entraînement</p>
      </div>

      {/* Fitness overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-muted-foreground">Score forme</span>
            <p className="text-xl font-semibold mt-1">{fitnessScore}/100</p>
            <Progress value={fitnessScore} className="mt-2 h-1.5" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-muted-foreground">Charge</span>
            <div className="flex items-center gap-1.5 mt-1">
              <loadStatus.icon className={`w-4 h-4 ${loadStatus.color}`} />
              <p className="text-xl font-semibold">{loadStatus.label}</p>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Ratio: {Math.round(loadRatio * 100)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-muted-foreground">Allure globale</span>
            <p className="text-xl font-semibold mt-1">{formatPace(avgPace)}/km</p>
            <p className="text-xs text-muted-foreground mt-1">{totalKm} km total</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-muted-foreground">Ressenti moy.</span>
            <p className="text-xl font-semibold mt-1">{avgFeeling.toFixed(1)}/5</p>
            <div className="flex gap-0.5 mt-2">
              {[1, 2, 3, 4, 5].map(i => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full ${
                    i <= Math.round(avgFeeling) ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pace">
        <TabsList>
          <TabsTrigger value="pace" data-testid="tab-pace">Allure</TabsTrigger>
          <TabsTrigger value="hr" data-testid="tab-hr">Fréquence cardiaque</TabsTrigger>
          <TabsTrigger value="volume" data-testid="tab-volume">Volume</TabsTrigger>
        </TabsList>

        <TabsContent value="pace">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Évolution de l'allure moyenne
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={paceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis
                      reversed
                      domain={["auto", "auto"]}
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      stroke="hsl(var(--muted-foreground))"
                      tickFormatter={(v: number) => formatPace(v)}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "13px",
                      }}
                      formatter={(value: number) => [formatPace(value) + "/km", "Allure"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="pace"
                      stroke="hsl(152, 72%, 40%)"
                      strokeWidth={2}
                      dot={{ fill: "hsl(152, 72%, 40%)", r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hr">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Fréquence cardiaque par séance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={hrData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis
                      domain={["auto", "auto"]}
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      stroke="hsl(var(--muted-foreground))"
                      unit=" bpm"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "13px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="avgHr"
                      name="FC moy."
                      stroke="hsl(200, 65%, 50%)"
                      strokeWidth={2}
                      dot={{ fill: "hsl(200, 65%, 50%)", r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="maxHr"
                      name="FC max"
                      stroke="hsl(0, 72%, 51%)"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ fill: "hsl(0, 72%, 51%)", r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="volume">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Répartition des kilomètres par type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={distByTypeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="type"
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
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
                    <Bar
                      dataKey="km"
                      name="Distance"
                      fill="hsl(152, 72%, 40%)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Training recommendations */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Recommandations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Recommendation
            icon={<Zap className="w-4 h-4 text-primary" />}
            title="Progression de l'allure"
            content={`Ton allure moyenne s'améliore progressivement. Tu es passé de ~7:00/km à ~6:30/km en 3 semaines. Continue à inclure 1 séance d'intensité par semaine.`}
          />
          <Recommendation
            icon={<Heart className="w-4 h-4 text-blue-500" />}
            title="Fréquence cardiaque"
            content="Ta FC moyenne en footing (138-142 bpm) est dans la bonne zone. Les séances d'intensité montent correctement à 156-160 bpm. Bon ratio effort/récupération."
          />
          <Recommendation
            icon={<AlertTriangle className="w-4 h-4 text-amber-500" />}
            title="Attention TFL"
            content="La douleur TFL apparaît encore après 6km. Prévoir des pauses marche sur les sorties longues au-delà de 7km. Continuer le renforcement 2x/semaine."
          />
        </CardContent>
      </Card>
    </div>
  );
}

function Recommendation({
  icon,
  title,
  content,
}: {
  icon: React.ReactNode;
  title: string;
  content: string;
}) {
  return (
    <div className="flex gap-3 p-3 rounded-lg bg-accent/30">
      <div className="shrink-0 mt-0.5">{icon}</div>
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{content}</p>
      </div>
    </div>
  );
}

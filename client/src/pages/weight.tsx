import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2, TrendingDown, Target, Scale } from "lucide-react";
import type { WeightEntry } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

export default function WeightPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: entries, isLoading } = useQuery<WeightEntry[]>({
    queryKey: ["/api/weight"],
  });
  const { toast } = useToast();

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/weight", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/weight"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setDialogOpen(false);
      toast({ title: "Poids enregistré" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/weight/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/weight"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({ title: "Entrée supprimée" });
    },
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-64 rounded-lg" />
        <Skeleton className="h-32 rounded-lg" />
      </div>
    );
  }

  const sortedEntries = [...(entries || [])].sort((a, b) => a.date.localeCompare(b.date));
  const chartData = sortedEntries.map(e => ({
    date: new Date(e.date + "T00:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "short" }),
    weight: e.weight,
    bodyFat: e.bodyFat,
  }));

  const current = entries?.[0]?.weight;
  const start = sortedEntries[0]?.weight;
  const change = current && start ? Math.round((current - start) * 10) / 10 : null;
  const targetWeight = 85; // Target based on Hugo's goals

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Suivi du poids</h2>
          <p className="text-sm text-muted-foreground">Tendance et progression</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" data-testid="button-add-weight">
              <Plus className="w-4 h-4 mr-1" />
              Peser
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Nouvelle pesée</DialogTitle>
            </DialogHeader>
            <WeightForm
              onSubmit={(data) => createMutation.mutate(data)}
              isPending={createMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Scale className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Actuel</span>
            </div>
            <p className="text-xl font-semibold">{current || "--"} kg</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-xs text-muted-foreground">Variation</span>
            </div>
            <p className="text-xl font-semibold">
              {change != null ? `${change > 0 ? "+" : ""}${change}` : "--"} kg
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs text-muted-foreground">Objectif</span>
            </div>
            <p className="text-xl font-semibold">{targetWeight} kg</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {current ? `${(current - targetWeight).toFixed(1)} kg restants` : ""}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Weight chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Évolution du poids
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(200, 65%, 50%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(200, 65%, 50%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
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
                  unit=" kg"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "13px",
                  }}
                />
                <ReferenceLine
                  y={targetWeight}
                  stroke="hsl(152, 72%, 40%)"
                  strokeDasharray="5 5"
                  label={{ value: "Objectif", position: "right", fill: "hsl(152, 72%, 40%)", fontSize: 11 }}
                />
                <Area
                  type="monotone"
                  dataKey="weight"
                  name="Poids"
                  stroke="hsl(200, 65%, 50%)"
                  strokeWidth={2}
                  fill="url(#weightGradient)"
                  dot={{ fill: "hsl(200, 65%, 50%)", r: 4 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Body fat chart */}
      {sortedEntries.some(e => e.bodyFat) && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Masse grasse
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData.filter(d => d.bodyFat)}>
                  <defs>
                    <linearGradient id="bfGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
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
                    unit="%"
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
                    dataKey="bodyFat"
                    name="Masse grasse"
                    stroke="hsl(38, 92%, 50%)"
                    strokeWidth={2}
                    fill="url(#bfGradient)"
                    dot={{ fill: "hsl(38, 92%, 50%)", r: 3 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Entries list */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Historique des pesées
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {entries?.map(e => (
              <div
                key={e.id}
                className="flex items-center justify-between p-2 rounded-md hover:bg-accent/50 transition-colors"
                data-testid={`weight-entry-${e.id}`}
              >
                <div>
                  <p className="text-sm font-medium">{e.weight} kg</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(e.date + "T00:00:00").toLocaleDateString("fr-FR", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })}
                    {e.bodyFat && ` — ${e.bodyFat}% MG`}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => deleteMutation.mutate(e.id)}
                  data-testid={`button-delete-weight-${e.id}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Nutrition tips */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Conseils nutrition
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm">
            Avec un objectif de 85 kg et un entraînement 3-4x/semaine :
          </p>
          <ul className="text-sm text-muted-foreground space-y-1.5 ml-4 list-disc">
            <li>Déficit calorique modéré : -300 à -500 kcal/jour (ne pas compromettre la récupération)</li>
            <li>Protéines : 1.6-2g/kg soit ~150g/jour pour préserver la masse musculaire</li>
            <li>Glucides avant intensité : 30-40g 1h avant les séances tempo/fractionné</li>
            <li>Hydratation : 2-2.5L/jour, plus si séance &gt; 1h</li>
            <li>Rythme de perte visé : 0.3-0.5 kg/semaine (durable et compatible avec l'entraînement)</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function WeightForm({
  onSubmit,
  isPending,
}: {
  onSubmit: (data: any) => void;
  isPending: boolean;
}) {
  const [form, setForm] = useState({
    date: "2026-03-19",
    weight: "",
    bodyFat: "",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      date: form.date,
      weight: parseFloat(form.weight),
      bodyFat: form.bodyFat ? parseFloat(form.bodyFat) : null,
      notes: form.notes || null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <Label className="text-xs">Date</Label>
        <Input
          type="date"
          value={form.date}
          onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
          required
          data-testid="input-weight-date"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Poids (kg)</Label>
          <Input
            type="number"
            step="0.1"
            value={form.weight}
            onChange={e => setForm(f => ({ ...f, weight: e.target.value }))}
            placeholder="92.5"
            required
            data-testid="input-weight-value"
          />
        </div>
        <div>
          <Label className="text-xs">Masse grasse (%)</Label>
          <Input
            type="number"
            step="0.1"
            value={form.bodyFat}
            onChange={e => setForm(f => ({ ...f, bodyFat: e.target.value }))}
            placeholder="22"
            data-testid="input-weight-bodyfat"
          />
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={isPending} data-testid="button-submit-weight">
        {isPending ? "Enregistrement..." : "Enregistrer"}
      </Button>
    </form>
  );
}

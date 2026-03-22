import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2, Upload } from "lucide-react";
import {
  formatPace,
  formatDuration,
  formatDate,
  getSessionTypeLabel,
  getSessionTypeColor,
  getFeelingLabel,
} from "@/lib/utils-format";
import type { Activity } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function ActivitiesPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: activities, isLoading } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
  });
  const { toast } = useToast();

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/activities/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({ title: "Activité supprimée" });
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/activities", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setDialogOpen(false);
      toast({ title: "Activité ajoutée" });
    },
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Activités</h2>
          <p className="text-sm text-muted-foreground">
            {activities?.length || 0} courses enregistrées
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" data-testid="button-add-activity">
                <Plus className="w-4 h-4 mr-1" />
                Ajouter
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Nouvelle activité</DialogTitle>
              </DialogHeader>
              <AddActivityForm
                onSubmit={(data) => createMutation.mutate(data)}
                isPending={createMutation.isPending}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-2">
        {activities?.map((a) => (
          <Card key={a.id} data-testid={`activity-card-${a.id}`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={`${getSessionTypeColor(a.type)} border-0 text-xs`}>
                      {getSessionTypeLabel(a.type)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{formatDate(a.date)}</span>
                    {a.source === "garmin" && (
                      <Badge variant="outline" className="text-xs">Garmin</Badge>
                    )}
                  </div>
                  <p className="text-sm font-medium mt-1">{a.name}</p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 mt-2">
                    <Stat label="Distance" value={`${a.distanceKm} km`} />
                    <Stat label="Durée" value={formatDuration(a.durationMinutes)} />
                    <Stat label="Allure" value={`${formatPace(a.avgPaceMinKm)}/km`} />
                    <Stat label="FC moy." value={a.avgHr ? `${a.avgHr} bpm` : "--"} />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 mt-1">
                    <Stat label="FC max" value={a.maxHr ? `${a.maxHr} bpm` : "--"} />
                    <Stat label="Cadence" value={a.cadence ? `${a.cadence} spm` : "--"} />
                    <Stat label="D+" value={a.elevationGain ? `${a.elevationGain}m` : "--"} />
                    <Stat label="Ressenti" value={getFeelingLabel(a.feeling) || "--"} />
                  </div>

                  {a.notes && (
                    <p className="text-xs text-muted-foreground mt-2 italic">{a.notes}</p>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => deleteMutation.mutate(a.id)}
                  data-testid={`button-delete-activity-${a.id}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs text-muted-foreground">{label}</span>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}

function AddActivityForm({
  onSubmit,
  isPending,
}: {
  onSubmit: (data: any) => void;
  isPending: boolean;
}) {
  const [form, setForm] = useState({
    date: "2026-03-19",
    type: "easy_run",
    name: "",
    distanceKm: "",
    durationMinutes: "",
    avgHr: "",
    maxHr: "",
    cadence: "",
    elevationGain: "",
    feeling: "3",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const distanceKm = parseFloat(form.distanceKm);
    const durationMinutes = parseFloat(form.durationMinutes);
    const avgPaceMinKm = durationMinutes / distanceKm;

    onSubmit({
      ...form,
      distanceKm,
      durationMinutes,
      avgPaceMinKm: Math.round(avgPaceMinKm * 100) / 100,
      avgHr: form.avgHr ? parseInt(form.avgHr) : null,
      maxHr: form.maxHr ? parseInt(form.maxHr) : null,
      cadence: form.cadence ? parseInt(form.cadence) : null,
      elevationGain: form.elevationGain ? parseInt(form.elevationGain) : null,
      feeling: parseInt(form.feeling),
      calories: null,
      source: "manual",
      garminActivityId: null,
      laps: null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Date</Label>
          <Input
            type="date"
            value={form.date}
            onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
            required
            data-testid="input-activity-date"
          />
        </div>
        <div>
          <Label className="text-xs">Type</Label>
          <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
            <SelectTrigger data-testid="select-activity-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy_run">Footing</SelectItem>
              <SelectItem value="tempo">Tempo</SelectItem>
              <SelectItem value="intervals">Fractionné</SelectItem>
              <SelectItem value="long_run">Sortie longue</SelectItem>
              <SelectItem value="recovery">Récupération</SelectItem>
              <SelectItem value="race">Course</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label className="text-xs">Nom</Label>
        <Input
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          placeholder="Ex: Footing matinal"
          required
          data-testid="input-activity-name"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Distance (km)</Label>
          <Input
            type="number"
            step="0.1"
            value={form.distanceKm}
            onChange={e => setForm(f => ({ ...f, distanceKm: e.target.value }))}
            required
            data-testid="input-activity-distance"
          />
        </div>
        <div>
          <Label className="text-xs">Durée (min)</Label>
          <Input
            type="number"
            value={form.durationMinutes}
            onChange={e => setForm(f => ({ ...f, durationMinutes: e.target.value }))}
            required
            data-testid="input-activity-duration"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">FC moy. (bpm)</Label>
          <Input
            type="number"
            value={form.avgHr}
            onChange={e => setForm(f => ({ ...f, avgHr: e.target.value }))}
            data-testid="input-activity-avghr"
          />
        </div>
        <div>
          <Label className="text-xs">FC max (bpm)</Label>
          <Input
            type="number"
            value={form.maxHr}
            onChange={e => setForm(f => ({ ...f, maxHr: e.target.value }))}
            data-testid="input-activity-maxhr"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label className="text-xs">Cadence (spm)</Label>
          <Input
            type="number"
            value={form.cadence}
            onChange={e => setForm(f => ({ ...f, cadence: e.target.value }))}
          />
        </div>
        <div>
          <Label className="text-xs">D+ (m)</Label>
          <Input
            type="number"
            value={form.elevationGain}
            onChange={e => setForm(f => ({ ...f, elevationGain: e.target.value }))}
          />
        </div>
        <div>
          <Label className="text-xs">Ressenti (1-5)</Label>
          <Select value={form.feeling} onValueChange={v => setForm(f => ({ ...f, feeling: v }))}>
            <SelectTrigger data-testid="select-activity-feeling">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 - Epuisé</SelectItem>
              <SelectItem value="2">2 - Dur</SelectItem>
              <SelectItem value="3">3 - Correct</SelectItem>
              <SelectItem value="4">4 - Bien</SelectItem>
              <SelectItem value="5">5 - Excellent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label className="text-xs">Notes</Label>
        <Textarea
          value={form.notes}
          onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
          placeholder="Sensations, douleurs, conditions..."
          className="h-16"
          data-testid="input-activity-notes"
        />
      </div>

      <Button type="submit" className="w-full" disabled={isPending} data-testid="button-submit-activity">
        {isPending ? "Ajout..." : "Ajouter l'activité"}
      </Button>
    </form>
  );
}

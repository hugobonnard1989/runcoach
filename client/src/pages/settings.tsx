import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Watch, ExternalLink, CheckCircle2, AlertCircle, User, Target, RefreshCw, Loader2, Key } from "lucide-react";
import { SiStrava } from "react-icons/si";
import type { UserProfile } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { data: profile, isLoading } = useQuery<UserProfile>({
    queryKey: ["/api/profile"],
  });

  const { data: garminAuth } = useQuery({
    queryKey: ["/api/garmin/auth-url"],
    queryFn: () => apiRequest("GET", "/api/garmin/auth-url").then(r => r.json()),
  });

  const { data: stravaStatus, isLoading: stravaLoading } = useQuery({
    queryKey: ["/api/strava/status"],
    queryFn: () => apiRequest("GET", "/api/strava/status").then(r => r.json()),
  });

  const { data: apiConfig } = useQuery({
    queryKey: ["/api/config"],
    queryFn: () => apiRequest("GET", "/api/config").then(r => r.json()),
  });

  const [configForm, setConfigForm] = useState({
    stravaClientId: "",
    stravaClientSecret: "",
    perplexityApiKey: "",
  });
  const [configLoaded, setConfigLoaded] = useState(false);

  if (apiConfig && !configLoaded) {
    setConfigForm({
      stravaClientId: apiConfig.stravaClientId || "",
      stravaClientSecret: apiConfig.stravaClientSecret || "",
      perplexityApiKey: apiConfig.perplexityApiKey || "",
    });
    setConfigLoaded(true);
  }

  const saveConfigMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("PUT", "/api/config", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/config"] });
      queryClient.invalidateQueries({ queryKey: ["/api/strava/status"] });
      queryClient.invalidateQueries({ queryKey: ["/api/coach/status"] });
      toast({ title: "Configuration sauvegardée" });
    },
  });

  const { toast } = useToast();

  const syncStravaMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/strava/sync");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/strava/status"] });
      toast({
        title: "Synchronisation Strava réussie",
        description: `${data.imported} course(s) importée(s) sur ${data.total} activité(s).`,
      });
    },
    onError: () => {
      toast({
        title: "Erreur de synchronisation",
        description: "Vérifie ta connexion Strava dans les réglages.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("PUT", "/api/profile", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      toast({ title: "Profil mis à jour" });
    },
  });

  const [form, setForm] = useState<any>(null);

  // Initialize form when profile loads
  if (profile && !form) {
    setForm({
      name: profile.name || "",
      age: profile.age?.toString() || "",
      weight: profile.weight?.toString() || "",
      height: profile.height?.toString() || "",
      restingHr: profile.restingHr?.toString() || "",
      maxHr: profile.maxHr?.toString() || "",
      weeklyGoalKm: profile.weeklyGoalKm?.toString() || "",
      targetRace: profile.targetRace || "",
      targetDate: profile.targetDate || "",
      targetTime: profile.targetTime || "",
      injuryNotes: profile.injuryNotes || "",
      fitnessLevel: profile.fitnessLevel || "intermediate",
    });
  }

  if (isLoading || !form) {
    return (
      <div className="p-6">
        <div className="h-8 w-32 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  const handleSave = () => {
    updateMutation.mutate({
      name: form.name,
      age: form.age ? parseInt(form.age) : null,
      weight: form.weight ? parseFloat(form.weight) : null,
      height: form.height ? parseFloat(form.height) : null,
      restingHr: form.restingHr ? parseInt(form.restingHr) : null,
      maxHr: form.maxHr ? parseInt(form.maxHr) : null,
      weeklyGoalKm: form.weeklyGoalKm ? parseFloat(form.weeklyGoalKm) : null,
      targetRace: form.targetRace || null,
      targetDate: form.targetDate || null,
      targetTime: form.targetTime || null,
      injuryNotes: form.injuryNotes || null,
      fitnessLevel: form.fitnessLevel,
    });
  };

  const isGarminConnected = !!profile?.garminAccessToken;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-3xl mx-auto">
      <div>
        <h2 className="text-lg font-semibold">Réglages</h2>
        <p className="text-sm text-muted-foreground">Profil, objectifs et connexions</p>
      </div>

      {/* API Configuration */}
      <Card data-testid="card-api-config">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4" />
            <CardTitle className="text-sm font-medium">Configuration API</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <span className="text-xs font-medium">Strava API</span>
            <p className="text-xs text-muted-foreground mb-2">
              Crée une application sur{" "}
              <a href="https://www.strava.com/settings/api" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                strava.com/settings/api
              </a>{" "}
              pour obtenir tes clés.
            </p>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <Label className="text-xs">Client ID</Label>
                <Input
                  value={configForm.stravaClientId}
                  onChange={e => setConfigForm(f => ({ ...f, stravaClientId: e.target.value }))}
                  placeholder="12345"
                  data-testid="input-config-strava-id"
                />
              </div>
              <div>
                <Label className="text-xs">Client Secret</Label>
                <Input
                  type="password"
                  value={configForm.stravaClientSecret}
                  onChange={e => setConfigForm(f => ({ ...f, stravaClientSecret: e.target.value }))}
                  placeholder="••••••••"
                  data-testid="input-config-strava-secret"
                />
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <span className="text-xs font-medium">Coach IA Perplexity</span>
            <p className="text-xs text-muted-foreground mb-2">
              Obtiens une clé API sur{" "}
              <a href="https://docs.perplexity.ai/" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                docs.perplexity.ai
              </a>{" "}
              pour activer le coach IA.
            </p>
            <div>
              <Label className="text-xs">Clé API Perplexity</Label>
              <Input
                type="password"
                value={configForm.perplexityApiKey}
                onChange={e => setConfigForm(f => ({ ...f, perplexityApiKey: e.target.value }))}
                placeholder="pplx-••••••••"
                data-testid="input-config-perplexity-key"
              />
            </div>
          </div>

          <Button
            onClick={() => saveConfigMutation.mutate(configForm)}
            disabled={saveConfigMutation.isPending}
            className="w-full"
            data-testid="button-save-config"
          >
            {saveConfigMutation.isPending ? "Enregistrement..." : "Sauvegarder"}
          </Button>
        </CardContent>
      </Card>

      {/* Garmin Connection */}
      <Card data-testid="card-garmin-settings">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Watch className="w-4 h-4" />
            <CardTitle className="text-sm font-medium">Garmin Connect</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isGarminConnected ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm">Connecté</span>
                  <Badge variant="outline" className="text-xs">
                    ID: {profile?.garminUserId}
                  </Badge>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  <span className="text-sm">Non connecté</span>
                </>
              )}
            </div>
            {!isGarminConnected && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (garminAuth?.configured) {
                    window.open(garminAuth.authUrl, "_blank", "noopener,noreferrer");
                  } else {
                    toast({
                      title: "Configuration requise",
                      description: garminAuth?.instructions || "Configurez les clés API Garmin.",
                    });
                  }
                }}
                data-testid="button-connect-garmin"
              >
                <ExternalLink className="w-3.5 h-3.5 mr-1" />
                Connecter
              </Button>
            )}
          </div>

          <div className="p-3 rounded-lg bg-accent/30">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Pour connecter Garmin Connect automatiquement, vous devez :
            </p>
            <ol className="text-xs text-muted-foreground mt-2 space-y-1 list-decimal ml-4">
              <li>Vous inscrire au <a href="https://developer.garmin.com/gc-developer-program/" target="_blank" rel="noopener noreferrer" className="text-primary underline">programme développeur Garmin</a></li>
              <li>Créer une application et obtenir les clés OAuth2</li>
              <li>Configurer les variables GARMIN_CLIENT_ID et GARMIN_CLIENT_SECRET</li>
            </ol>
            <p className="text-xs text-muted-foreground mt-2">
              L'application utilisera l'API Wellness et Activity pour synchroniser automatiquement vos courses, fréquence cardiaque, et données de santé.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Strava Connection */}
      <Card data-testid="card-strava-settings">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <SiStrava className="w-4 h-4 text-[#FC4C02]" />
            <CardTitle className="text-sm font-medium">Strava</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {stravaLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              ) : stravaStatus?.connected ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm">Connecté</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  <span className="text-sm">Non connecté</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              {stravaStatus?.connected && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => syncStravaMutation.mutate()}
                  disabled={syncStravaMutation.isPending}
                  data-testid="button-sync-strava"
                >
                  {syncStravaMutation.isPending ? (
                    <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3.5 h-3.5 mr-1" />
                  )}
                  Synchroniser
                </Button>
              )}
              {!stravaStatus?.connected && !stravaLoading && stravaStatus?.authUrl && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    window.open(stravaStatus.authUrl, "_blank", "noopener,noreferrer");
                  }}
                  data-testid="button-connect-strava"
                >
                  <ExternalLink className="w-3.5 h-3.5 mr-1" />
                  Connecter
                </Button>
              )}
              {!stravaStatus?.connected && !stravaLoading && !stravaStatus?.configured && (
                <Badge variant="outline" className="text-xs">Non configuré</Badge>
              )}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-accent/30">
            <p className="text-xs text-muted-foreground leading-relaxed">
              {!stravaStatus?.configured ? (
                "Configure tes clés API Strava dans la section ci-dessus"
              ) : (
                "Connecte ton compte Strava pour importer automatiquement tes courses. Les activités de type \"Course\" seront synchronisées avec les données de distance, allure, fréquence cardiaque et dénivelé."
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Profile */}
      <Card data-testid="card-profile-settings">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <CardTitle className="text-sm font-medium">Profil coureur</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Prénom</Label>
              <Input
                value={form.name}
                onChange={e => setForm((f: any) => ({ ...f, name: e.target.value }))}
                data-testid="input-profile-name"
              />
            </div>
            <div>
              <Label className="text-xs">Âge</Label>
              <Input
                type="number"
                value={form.age}
                onChange={e => setForm((f: any) => ({ ...f, age: e.target.value }))}
                data-testid="input-profile-age"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Poids (kg)</Label>
              <Input
                type="number"
                step="0.1"
                value={form.weight}
                onChange={e => setForm((f: any) => ({ ...f, weight: e.target.value }))}
                data-testid="input-profile-weight"
              />
            </div>
            <div>
              <Label className="text-xs">Taille (cm)</Label>
              <Input
                type="number"
                value={form.height}
                onChange={e => setForm((f: any) => ({ ...f, height: e.target.value }))}
                data-testid="input-profile-height"
              />
            </div>
            <div>
              <Label className="text-xs">Niveau</Label>
              <Select value={form.fitnessLevel} onValueChange={v => setForm((f: any) => ({ ...f, fitnessLevel: v }))}>
                <SelectTrigger data-testid="select-profile-level">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Débutant</SelectItem>
                  <SelectItem value="intermediate">Intermédiaire</SelectItem>
                  <SelectItem value="advanced">Avancé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">FC repos (bpm)</Label>
              <Input
                type="number"
                value={form.restingHr}
                onChange={e => setForm((f: any) => ({ ...f, restingHr: e.target.value }))}
                data-testid="input-profile-rhr"
              />
            </div>
            <div>
              <Label className="text-xs">FC max (bpm)</Label>
              <Input
                type="number"
                value={form.maxHr}
                onChange={e => setForm((f: any) => ({ ...f, maxHr: e.target.value }))}
                data-testid="input-profile-maxhr"
              />
            </div>
          </div>

          <Separator />

          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4" />
            <span className="text-sm font-medium">Objectif</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Course cible</Label>
              <Input
                value={form.targetRace}
                onChange={e => setForm((f: any) => ({ ...f, targetRace: e.target.value }))}
                data-testid="input-profile-race"
              />
            </div>
            <div>
              <Label className="text-xs">Date</Label>
              <Input
                type="date"
                value={form.targetDate}
                onChange={e => setForm((f: any) => ({ ...f, targetDate: e.target.value }))}
                data-testid="input-profile-racedate"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Temps visé</Label>
              <Input
                value={form.targetTime}
                onChange={e => setForm((f: any) => ({ ...f, targetTime: e.target.value }))}
                placeholder="58:00"
                data-testid="input-profile-targettime"
              />
            </div>
            <div>
              <Label className="text-xs">Objectif hebdo (km)</Label>
              <Input
                type="number"
                value={form.weeklyGoalKm}
                onChange={e => setForm((f: any) => ({ ...f, weeklyGoalKm: e.target.value }))}
                data-testid="input-profile-weeklygoal"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs">Notes blessure / santé</Label>
            <Textarea
              value={form.injuryNotes}
              onChange={e => setForm((f: any) => ({ ...f, injuryNotes: e.target.value }))}
              className="h-20"
              data-testid="input-profile-injury"
            />
          </div>

          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="w-full"
            data-testid="button-save-profile"
          >
            {updateMutation.isPending ? "Enregistrement..." : "Sauvegarder"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { insertActivitySchema, insertWeightEntrySchema, insertUserProfileSchema, insertTrainingPlanSchema } from "@shared/schema";

export async function registerRoutes(server: Server, app: Express) {
  // =================== PROFILE ===================
  app.get("/api/profile", async (_req, res) => {
    const profile = await storage.getProfile();
    res.json(profile || null);
  });

  app.put("/api/profile", async (req, res) => {
    const parsed = insertUserProfileSchema.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
    const profile = await storage.upsertProfile(parsed.data as any);
    res.json(profile);
  });

  // =================== ACTIVITIES ===================
  app.get("/api/activities", async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 50;
    const activities = await storage.getActivities(limit);
    res.json(activities);
  });

  app.get("/api/activities/range", async (req, res) => {
    const { start, end } = req.query;
    if (!start || !end) return res.status(400).json({ error: "start and end required" });
    const activities = await storage.getActivitiesByDateRange(start as string, end as string);
    res.json(activities);
  });

  app.get("/api/activities/:id", async (req, res) => {
    const activity = await storage.getActivity(parseInt(req.params.id));
    if (!activity) return res.status(404).json({ error: "Not found" });
    res.json(activity);
  });

  app.post("/api/activities", async (req, res) => {
    const parsed = insertActivitySchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
    const activity = await storage.createActivity(parsed.data);
    res.status(201).json(activity);
  });

  app.delete("/api/activities/:id", async (req, res) => {
    await storage.deleteActivity(parseInt(req.params.id));
    res.json({ deleted: true });
  });

  // =================== WEIGHT ===================
  app.get("/api/weight", async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 50;
    const entries = await storage.getWeightEntries(limit);
    res.json(entries);
  });

  app.post("/api/weight", async (req, res) => {
    const parsed = insertWeightEntrySchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
    const entry = await storage.createWeightEntry(parsed.data);
    res.status(201).json(entry);
  });

  app.delete("/api/weight/:id", async (req, res) => {
    await storage.deleteWeightEntry(parseInt(req.params.id));
    res.json({ deleted: true });
  });

  // =================== TRAINING PLAN ===================
  app.get("/api/plan", async (_req, res) => {
    const plan = await storage.getTrainingPlan();
    res.json(plan);
  });

  app.get("/api/plan/week/:weekNumber", async (req, res) => {
    const week = await storage.getTrainingPlanByWeek(parseInt(req.params.weekNumber));
    res.json(week);
  });

  app.patch("/api/plan/:id", async (req, res) => {
    try {
      const session = await storage.updateTrainingSession(parseInt(req.params.id), req.body);
      res.json(session);
    } catch (e: any) {
      res.status(404).json({ error: e.message });
    }
  });

  // =================== COACHING ===================
  app.get("/api/coaching", async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 20;
    const advice = await storage.getCoachingAdvice(limit);
    res.json(advice);
  });

  // =================== STATS ===================
  app.get("/api/stats", async (_req, res) => {
    const activities = await storage.getActivities(100);
    const weights = await storage.getWeightEntries(50);
    const profile = await storage.getProfile();

    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const twoWeeksAgo = new Date(now);
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const thisWeek = activities.filter(a => new Date(a.date) >= weekAgo);
    const lastWeek = activities.filter(a => new Date(a.date) >= twoWeeksAgo && new Date(a.date) < weekAgo);

    const thisWeekKm = thisWeek.reduce((s, a) => s + a.distanceKm, 0);
    const lastWeekKm = lastWeek.reduce((s, a) => s + a.distanceKm, 0);
    const thisWeekDuration = thisWeek.reduce((s, a) => s + a.durationMinutes, 0);
    const totalKm = activities.reduce((s, a) => s + a.distanceKm, 0);
    const avgPace = activities.length > 0
      ? activities.reduce((s, a) => s + (a.avgPaceMinKm || 0), 0) / activities.filter(a => a.avgPaceMinKm).length
      : 0;

    const recentActivities = activities.slice(0, 7);
    const avgFeeling = recentActivities.length > 0
      ? recentActivities.reduce((s, a) => s + (a.feeling || 3), 0) / recentActivities.length
      : 3;
    const volumeScore = Math.min(thisWeekKm / (profile?.weeklyGoalKm || 25), 1) * 40;
    const consistencyScore = thisWeek.length >= 3 ? 30 : thisWeek.length * 10;
    const feelingScore = avgFeeling * 6;
    const fitnessScore = Math.round(volumeScore + consistencyScore + feelingScore);

    const currentWeight = weights.length > 0 ? weights[0].weight : null;
    const startWeight = weights.length > 1 ? weights[weights.length - 1].weight : currentWeight;

    const raceDate = profile?.targetDate ? new Date(profile.targetDate) : null;
    const daysToRace = raceDate ? Math.ceil((raceDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;

    res.json({
      thisWeek: {
        km: Math.round(thisWeekKm * 10) / 10,
        runs: thisWeek.length,
        duration: Math.round(thisWeekDuration),
        avgPace: thisWeek.length > 0
          ? Math.round(thisWeek.reduce((s, a) => s + (a.avgPaceMinKm || 0), 0) / thisWeek.filter(a => a.avgPaceMinKm).length * 100) / 100
          : null,
      },
      lastWeek: {
        km: Math.round(lastWeekKm * 10) / 10,
        runs: lastWeek.length,
      },
      overall: {
        totalKm: Math.round(totalKm * 10) / 10,
        totalRuns: activities.length,
        avgPace: Math.round(avgPace * 100) / 100,
      },
      fitnessScore,
      weight: {
        current: currentWeight,
        start: startWeight,
        change: currentWeight && startWeight ? Math.round((currentWeight - startWeight) * 10) / 10 : null,
      },
      daysToRace,
      weeklyChange: lastWeekKm > 0 ? Math.round(((thisWeekKm - lastWeekKm) / lastWeekKm) * 100) : null,
    });
  });

  // =================== GARMIN AUTH ===================
  app.get("/api/garmin/auth-url", (_req, res) => {
    const clientId = process.env.GARMIN_CLIENT_ID || "YOUR_GARMIN_CLIENT_ID";
    const redirectUri = process.env.GARMIN_REDIRECT_URI || "https://your-app.com/api/garmin/callback";
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = codeVerifier;
    const authUrl = `https://connect.garmin.com/oauth2Confirm?client_id=${clientId}&response_type=code&code_challenge=${codeChallenge}&code_challenge_method=S256&redirect_uri=${encodeURIComponent(redirectUri)}&state=runcoach`;
    res.json({
      authUrl,
      configured: clientId !== "YOUR_GARMIN_CLIENT_ID",
      instructions: "Pour connecter Garmin Connect, inscrivez-vous au programme développeur sur developer.garmin.com et configurez les variables GARMIN_CLIENT_ID et GARMIN_CLIENT_SECRET.",
    });
  });

  app.post("/api/garmin/callback", async (req, res) => {
    const { code, codeVerifier } = req.body;
    if (!code) return res.status(400).json({ error: "Authorization code required" });
    res.json({ success: true, message: "Garmin connected" });
  });

  // =================== COACH CHAT (Rule-Based) ===================
  const chatHistory: Array<{ role: string; content: string }> = [];

  app.get("/api/chat/history", (_req, res) => {
    res.json(chatHistory);
  });

  app.post("/api/chat", async (req, res) => {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message required" });

    const profile = await storage.getProfile();
    const plan = await storage.getTrainingPlan();
    const activities = await storage.getActivities(10);

    chatHistory.push({ role: "user", content: message });
    const response = generateCoachResponse(message, profile, plan, activities);
    chatHistory.push({ role: "assistant", content: response.message });

    // Apply plan modifications if any
    if (response.planUpdates) {
      for (const u of response.planUpdates) {
        try {
          await storage.updateTrainingSession(u.id, u.changes);
        } catch (e) { /* ignore missing sessions */ }
      }
    }

    res.json({
      message: response.message,
      planUpdated: !!response.planUpdates && response.planUpdates.length > 0,
    });
  });

  // =================== STRAVA (Direct API) ===================
  let stravaAccessToken: string | null = process.env.STRAVA_ACCESS_TOKEN || null;
  let stravaRefreshToken: string | null = process.env.STRAVA_REFRESH_TOKEN || null;

  app.get("/api/strava/status", async (_req, res) => {
    const clientId = process.env.STRAVA_CLIENT_ID;
    const configured = !!clientId;

    if (!configured) {
      return res.json({ connected: false, configured: false, error: "Strava non configuré" });
    }

    if (stravaAccessToken) {
      try {
        const response = await fetch("https://www.strava.com/api/v3/athlete", {
          headers: { Authorization: `Bearer ${stravaAccessToken}` },
        });
        if (response.ok) {
          const athlete = await response.json();
          return res.json({ connected: true, athlete: { name: `${athlete.firstname} ${athlete.lastname}` } });
        }
        // Token expired, try refresh
        const refreshed = await refreshStravaToken();
        if (refreshed) {
          return res.json({ connected: true });
        }
      } catch (e) { /* fall through */ }
    }

    // Not connected — provide auth URL
    const redirectUri = process.env.STRAVA_REDIRECT_URI || `${req.protocol}://${req.get("host")}/api/strava/callback`;
    const authUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=read,activity:read_all&approval_prompt=auto`;
    res.json({ connected: false, configured: true, authUrl });
  });

  app.get("/api/strava/callback", async (req, res) => {
    const { code } = req.query;
    if (!code) return res.status(400).send("Code manquant");

    try {
      const response = await fetch("https://www.strava.com/oauth/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: process.env.STRAVA_CLIENT_ID,
          client_secret: process.env.STRAVA_CLIENT_SECRET,
          code,
          grant_type: "authorization_code",
        }),
      });
      const data = await response.json();
      if (data.access_token) {
        stravaAccessToken = data.access_token;
        stravaRefreshToken = data.refresh_token;
        // Redirect back to settings page
        res.redirect("/#/settings");
      } else {
        res.status(400).json({ error: "Échec de connexion Strava", details: data });
      }
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/strava/sync", async (_req, res) => {
    if (!stravaAccessToken) {
      // Try refresh
      const refreshed = await refreshStravaToken();
      if (!refreshed) {
        return res.status(401).json({ error: "Strava non connecté", needsAuth: true });
      }
    }

    try {
      const response = await fetch("https://www.strava.com/api/v3/athlete/activities?per_page=20", {
        headers: { Authorization: `Bearer ${stravaAccessToken}` },
      });

      if (!response.ok) {
        if (response.status === 401) {
          const refreshed = await refreshStravaToken();
          if (!refreshed) {
            return res.status(401).json({ error: "Token Strava expiré", needsAuth: true });
          }
          // Retry with new token
          const retryResponse = await fetch("https://www.strava.com/api/v3/athlete/activities?per_page=20", {
            headers: { Authorization: `Bearer ${stravaAccessToken}` },
          });
          if (!retryResponse.ok) {
            return res.status(400).json({ error: "Erreur Strava après refresh" });
          }
          var stravaActivities = await retryResponse.json();
        } else {
          return res.status(400).json({ error: `Erreur Strava: ${response.status}` });
        }
      } else {
        var stravaActivities = await response.json();
      }

      const imported: any[] = [];
      for (const act of stravaActivities) {
        if (act.type !== "Run" && act.sport_type !== "Run") continue;

        const distKm = (act.distance || 0) / 1000;
        const durMin = (act.moving_time || act.elapsed_time || 0) / 60;
        const paceMinKm = durMin > 0 && distKm > 0 ? durMin / distKm : null;

        const newActivity = await storage.createActivity({
          date: act.start_date_local?.split("T")[0] || act.start_date?.split("T")[0] || new Date().toISOString().split("T")[0],
          type: categorizeStravaRun(act),
          name: act.name || "Course Strava",
          distanceKm: Math.round(distKm * 100) / 100,
          durationMinutes: Math.round(durMin * 10) / 10,
          avgPaceMinKm: paceMinKm ? Math.round(paceMinKm * 100) / 100 : null,
          avgHr: act.average_heartrate ? Math.round(act.average_heartrate) : null,
          maxHr: act.max_heartrate ? Math.round(act.max_heartrate) : null,
          cadence: act.average_cadence ? Math.round(act.average_cadence * 2) : null,
          elevationGain: act.total_elevation_gain ? Math.round(act.total_elevation_gain) : null,
          calories: act.calories || null,
          feeling: null,
          notes: `Importé depuis Strava${act.description ? ": " + act.description : ""}`,
          source: "strava",
          garminActivityId: String(act.id),
          laps: null,
        });
        imported.push(newActivity);
      }

      res.json({
        success: true,
        imported: imported.length,
        total: stravaActivities.length,
        activities: imported,
      });
    } catch (e: any) {
      res.status(400).json({ error: "Erreur de synchronisation Strava", details: e.message });
    }
  });

  async function refreshStravaToken(): Promise<boolean> {
    if (!stravaRefreshToken || !process.env.STRAVA_CLIENT_ID || !process.env.STRAVA_CLIENT_SECRET) return false;
    try {
      const response = await fetch("https://www.strava.com/oauth/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: process.env.STRAVA_CLIENT_ID,
          client_secret: process.env.STRAVA_CLIENT_SECRET,
          refresh_token: stravaRefreshToken,
          grant_type: "refresh_token",
        }),
      });
      const data = await response.json();
      if (data.access_token) {
        stravaAccessToken = data.access_token;
        stravaRefreshToken = data.refresh_token || stravaRefreshToken;
        return true;
      }
    } catch (e) { /* ignore */ }
    return false;
  }
}

// =================== RULE-BASED COACH ===================

interface CoachResponse {
  message: string;
  planUpdates?: Array<{ id: number; changes: any }>;
}

function generateCoachResponse(
  message: string,
  profile: any,
  plan: any[],
  activities: any[]
): CoachResponse {
  const msg = message.toLowerCase().trim();
  const name = profile?.name || "Hugo";
  const now = new Date();
  const today = now.toISOString().split("T")[0];

  // Find today's / upcoming sessions
  const todaySession = plan.find(s => s.date === today);
  const upcomingSessions = plan.filter(s => s.date >= today && !s.completed).slice(0, 5);
  const completedCount = plan.filter(s => s.completed).length;
  const totalSessions = plan.length;

  // Recent activity stats
  const recentKm = activities.slice(0, 5).reduce((s, a) => s + a.distanceKm, 0);
  const avgFeeling = activities.length > 0
    ? activities.reduce((s, a) => s + (a.feeling || 3), 0) / activities.length
    : 3;

  // Race countdown
  const raceDate = profile?.targetDate ? new Date(profile.targetDate) : null;
  const daysToRace = raceDate ? Math.ceil((raceDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;

  // ---- Greetings ----
  if (msg.match(/^(salut|bonjour|hello|hey|coucou|yo)/)) {
    let greeting = `Salut ${name} ! 👋 Bienvenue sur RunCoach.\n\n`;
    if (todaySession) {
      greeting += `📋 Aujourd'hui au programme : **${todaySession.sessionType === "rest" ? "Repos" : todaySession.description}**`;
      if (todaySession.targetDistanceKm) greeting += ` (${todaySession.targetDistanceKm}km)`;
      greeting += ".\n\n";
    }
    if (daysToRace !== null && daysToRace > 0) {
      greeting += `🏁 J-${daysToRace} avant ${profile?.targetRace || "ta course"}. `;
    }
    greeting += `Tu as complété ${completedCount}/${totalSessions} séances du plan. Comment te sens-tu ?`;
    return { message: greeting };
  }

  // ---- Plan overview / "Comment va mon plan?" ----
  if (msg.match(/(comment|quel|où|ou).*(plan|programme|entra[iî]nement)/) || msg.match(/mon plan/) || msg.match(/^plan$/)) {
    let response = `📊 **Bilan de ton plan**\n\n`;
    response += `✅ Séances complétées : ${completedCount}/${totalSessions}\n`;
    if (daysToRace !== null && daysToRace > 0) {
      response += `🏁 Course dans ${daysToRace} jours (${profile?.targetRace})\n`;
    }
    response += `\n**Prochaines séances :**\n`;
    for (const s of upcomingSessions.slice(0, 4)) {
      const dayName = new Date(s.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
      response += `• ${dayName} : ${s.description}`;
      if (s.targetDistanceKm) response += ` (${s.targetDistanceKm}km)`;
      response += "\n";
    }
    if (avgFeeling >= 3.5) {
      response += `\n💪 Tes ressentis récents sont bons (${avgFeeling.toFixed(1)}/5). Continue comme ça !`;
    } else if (avgFeeling >= 2.5) {
      response += `\n⚠️ Tes ressentis sont moyens (${avgFeeling.toFixed(1)}/5). Écoute bien ton corps.`;
    } else {
      response += `\n🔻 Tes ressentis sont faibles (${avgFeeling.toFixed(1)}/5). Pense à ralentir et récupérer.`;
    }
    return { message: response };
  }

  // ---- Modify a session (remplacer, changer, modifier) ----
  if (msg.match(/(remplac|chang|modifi|transform|switch|échang)/) && msg.match(/(séance|mardi|mercredi|lundi|jeudi|vendredi|samedi|dimanche|entra[iî]nement|session)/)) {
    // Try to find which session they want to modify
    const dayMap: Record<string, number> = { lundi: 1, mardi: 2, mercredi: 3, jeudi: 4, vendredi: 5, samedi: 6, dimanche: 0 };
    let targetSession: any = null;
    let targetDay = "";

    for (const [day, dayNum] of Object.entries(dayMap)) {
      if (msg.includes(day)) {
        targetDay = day;
        targetSession = upcomingSessions.find(s => new Date(s.date).getDay() === dayNum);
        break;
      }
    }

    // Determine what they want to change to
    let newType = "";
    let newDescription = "";
    if (msg.includes("fractionn") || msg.includes("interval") || msg.includes("vma")) {
      newType = "intervals";
      newDescription = "Fractionné: 6x400m R=1'30\" en 1:50-1:55";
    } else if (msg.includes("tempo") || msg.includes("seuil") || msg.includes("allure")) {
      newType = "tempo";
      newDescription = "Tempo: 20min à allure 10km (5:45-5:55/km)";
    } else if (msg.includes("repos") || msg.includes("off") || msg.includes("récup")) {
      newType = "rest";
      newDescription = "Repos complet ou marche active 30min";
    } else if (msg.includes("long") || msg.includes("sortie longue")) {
      newType = "long_run";
      newDescription = "Sortie longue allure confortable";
    } else if (msg.includes("footing") || msg.includes("facile") || msg.includes("souple")) {
      newType = "easy_run";
      newDescription = "Footing endurance fondamentale";
    } else if (msg.includes("renfo") || msg.includes("muscul") || msg.includes("gainage")) {
      newType = "strength";
      newDescription = "Renforcement: squats, fentes, gainage, exercices TFL";
    }

    if (targetSession && newType) {
      const dayLabel = new Date(targetSession.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
      const response = `✅ C'est fait ! J'ai modifié la séance de **${dayLabel}** :\n\n` +
        `• Avant : ${targetSession.description}\n` +
        `• Maintenant : **${newDescription}**\n\n` +
        (profile?.injuryNotes?.includes("TFL") ? "⚠️ Pense à bien t'échauffer et à surveiller ton TFL." : "Bonne séance !");
      return {
        message: response,
        planUpdates: [{ id: targetSession.id, changes: { sessionType: newType, description: newDescription } }],
      };
    }

    if (targetSession && !newType) {
      return {
        message: `Tu veux modifier la séance de ${targetDay}. Par quoi veux-tu la remplacer ?\n\n` +
          `• Fractionné\n• Tempo / allure seuil\n• Footing souple\n• Sortie longue\n• Renforcement\n• Repos`,
      };
    }

    if (!targetSession && newType) {
      return {
        message: `Quel jour veux-tu modifier ? Voici tes prochaines séances :\n\n` +
          upcomingSessions.slice(0, 4).map(s => {
            const d = new Date(s.date).toLocaleDateString("fr-FR", { weekday: "long" });
            return `• **${d}** : ${s.description}`;
          }).join("\n"),
      };
    }

    return {
      message: `Je peux modifier ton plan ! Dis-moi quel jour et quel type de séance tu veux. Par exemple :\n\n` +
        `• "Remplace ma séance de mardi par du fractionné"\n` +
        `• "Change jeudi en repos"\n` +
        `• "Transforme samedi en tempo"`,
    };
  }

  // ---- Injury / Pain ----
  if (msg.match(/(blessure|douleur|mal|tfl|genou|bandelette|ilio|syndrome|kiné)/)) {
    let response = `🏥 **Conseils blessure**\n\n`;
    if (profile?.injuryNotes) {
      response += `Rappel de ta situation : ${profile.injuryNotes}\n\n`;
    }
    response += `**En cas de douleur pendant une séance :**\n`;
    response += `1. Réduis immédiatement l'allure ou passe en marche\n`;
    response += `2. Si la douleur persiste > 5min, arrête la séance\n`;
    response += `3. Applique de la glace 15min après l'effort\n\n`;
    response += `**Prévention TFL :**\n`;
    response += `• Étirements du fascia lata et quadriceps après chaque course\n`;
    response += `• Renforcement moyen fessier (ponts, clam shells)\n`;
    response += `• Foam rolling sur la face externe de la cuisse\n`;
    response += `• Tes semelles de podologue aident à corriger l'appui\n\n`;
    response += `Si la douleur s'aggrave, consulte ton kiné avant la prochaine séance intensive.`;
    return { message: response };
  }

  // ---- Race readiness / objectif ----
  if (msg.match(/(pr[eê]t|objectif|course|10km|10 km|bois de boulogne|capable|chrono|temps)/)) {
    let response = `🏁 **Préparation course**\n\n`;
    if (daysToRace !== null) {
      response += `Il reste **${daysToRace} jours** avant ${profile?.targetRace || "ta course"}.\n`;
      response += `Objectif : **${profile?.targetTime || "à définir"}**\n\n`;
    }
    const runCount = activities.filter(a => a.type !== "rest" && a.type !== "strength").length;
    response += `📈 Tes ${runCount} dernières courses montrent `;
    const lastPaces = activities.filter(a => a.avgPaceMinKm).slice(0, 5).map(a => a.avgPaceMinKm!);
    if (lastPaces.length > 0) {
      const avgPace = lastPaces.reduce((s, p) => s + p, 0) / lastPaces.length;
      response += `une allure moyenne de **${Math.floor(avgPace)}:${String(Math.round((avgPace % 1) * 60)).padStart(2, "0")}/km**.\n\n`;
      if (profile?.targetTime) {
        const targetPace = parseInt(profile.targetTime) / 10; // rough for 10km
        if (avgPace <= targetPace + 0.3) {
          response += `💪 Tu es dans les clous pour ton objectif ! Continue l'affûtage.`;
        } else {
          response += `⚡ Tu es un peu au-dessus de l'allure cible. Concentre-toi sur les séances tempo pour progresser.`;
        }
      }
    } else {
      response += `une bonne progression.\n\n💪 Continue à suivre ton plan, la régularité paie !`;
    }
    return { message: response };
  }

  // ---- Today's session ----
  if (msg.match(/(aujourd'?hui|ce soir|ce matin|maintenant|quoi faire|quelle séance)/)) {
    if (todaySession) {
      let response = `📋 **Séance du jour**\n\n`;
      response += `**${todaySession.sessionType === "rest" ? "Repos" : todaySession.description}**\n`;
      if (todaySession.targetDistanceKm) response += `📏 Distance : ${todaySession.targetDistanceKm}km\n`;
      if (todaySession.targetPaceMinKm) response += `⏱ Allure : ${todaySession.targetPaceMinKm}/km\n`;
      if (todaySession.targetDurationMinutes) response += `⏰ Durée : ${todaySession.targetDurationMinutes}min\n`;
      response += `\n`;
      if (todaySession.sessionType === "intervals") {
        response += `**Conseils fractionné :**\n• Échauffe-toi 10-15min en footing progressif\n• Respecte les temps de récup\n• Finis par 5min de retour au calme`;
      } else if (todaySession.sessionType === "long_run") {
        response += `**Conseils sortie longue :**\n• Pars lentement, accélère si les sensations sont bonnes\n• Hydrate-toi régulièrement\n• Surveille ton TFL après 6km`;
      } else if (todaySession.sessionType === "tempo") {
        response += `**Conseils tempo :**\n• L'allure doit être "confortablement inconfortable"\n• Garde un rythme régulier\n• Ne pars pas trop vite`;
      } else if (todaySession.sessionType === "rest") {
        response += `Profite de cette journée de repos ! Tu peux faire des étirements ou une marche légère.`;
      }
      return { message: response };
    }
    return {
      message: `Pas de séance programmée aujourd'hui. Tu peux en profiter pour te reposer ou faire un peu de renforcement léger (gainage, étirements). 🧘`,
    };
  }

  // ---- Weight / nutrition ----
  if (msg.match(/(poids|nutrition|alimentation|manger|kilos?|maigri|régime|diet)/)) {
    let response = `🍎 **Nutrition & Poids**\n\n`;
    response += `**Avant l'entraînement (1-2h avant) :**\n`;
    response += `• 30-40g de glucides (banane, pain complet, barre céréales)\n`;
    response += `• Hydrate-toi bien (400-500ml d'eau)\n\n`;
    response += `**Après l'entraînement (dans les 30min) :**\n`;
    response += `• Protéines + glucides (yaourt + fruits, sandwich poulet)\n`;
    response += `• Recharge hydrique\n\n`;
    response += `**Pour la gestion du poids :**\n`;
    response += `• Déficit modéré (300-500 kcal/jour max)\n`;
    response += `• Ne coupe jamais les glucides avant une séance intense\n`;
    response += `• La perte de poids doit être progressive (0.5kg/semaine max)`;
    return { message: response };
  }

  // ---- Fatigue / recovery ----
  if (msg.match(/(fatigu|récup|dormir|sommeil|repos|épuis|courbature|lourd)/)) {
    return {
      message: `😴 **Récupération**\n\n` +
        `La récupération est aussi importante que l'entraînement !\n\n` +
        `**Check-list récup :**\n` +
        `• Sommeil : vise 7-8h. C'est là que ton corps se répare.\n` +
        `• Hydratation : 2-2.5L par jour, plus les jours de course.\n` +
        `• Étirements : 10min après chaque séance (mollets, quadriceps, TFL).\n` +
        `• Foam rolling : face externe cuisse + mollets.\n` +
        `• Alimentation : protéines dans les 30min post-effort.\n\n` +
        `Si tu te sens très fatigué, n'hésite pas à transformer une séance intense en footing léger. Mieux vaut un jour de repos que 2 semaines d'arrêt.`,
    };
  }

  // ---- Help / what can you do ----
  if (msg.match(/(aide|help|quoi|comment|tu (peux|sais|fais)|fonctionn)/)) {
    return {
      message: `🤖 **Ce que je peux faire pour toi :**\n\n` +
        `• 📋 **Voir ton plan** — "Comment va mon plan ?"\n` +
        `• ✏️ **Modifier une séance** — "Remplace ma séance de mardi par du fractionné"\n` +
        `• 📅 **Séance du jour** — "Qu'est-ce que je fais aujourd'hui ?"\n` +
        `• 🏁 **Objectif course** — "Est-ce que je suis prêt pour mon 10km ?"\n` +
        `• 🏥 **Conseils blessure** — "J'ai mal au genou"\n` +
        `• 🍎 **Nutrition** — "Que manger avant une course ?"\n` +
        `• 😴 **Récupération** — "Je suis fatigué"\n\n` +
        `Essaie l'une de ces phrases !`,
    };
  }

  // ---- Default ----
  return {
    message: `Merci pour ton message, ${name} ! 🏃\n\n` +
      `Je suis ton coach running et je peux t'aider avec :\n` +
      `• Ton plan d'entraînement\n` +
      `• Modifier tes séances\n` +
      `• Des conseils blessure et récupération\n` +
      `• Ta préparation course\n\n` +
      `Essaie par exemple : "Comment va mon plan ?" ou "Remplace ma séance de mardi par du fractionné".`,
  };
}

function categorizeStravaRun(act: any): string {
  const name = (act.name || "").toLowerCase();
  if (act.workout_type === 1 || name.includes("race") || name.includes("course")) return "race";
  if (act.workout_type === 3 || name.includes("tempo") || name.includes("seuil")) return "tempo";
  if (name.includes("fractionn") || name.includes("interval") || name.includes("vma")) return "intervals";
  if (name.includes("long") || name.includes("sortie longue")) return "long_run";
  if (name.includes("récup") || name.includes("recup") || name.includes("recovery")) return "recovery";
  const distKm = (act.distance || 0) / 1000;
  if (distKm > 12) return "long_run";
  return "easy_run";
}

function generateCodeVerifier(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  let result = "";
  for (let i = 0; i < 64; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

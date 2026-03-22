"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// server/index.ts
var index_exports = {};
__export(index_exports, {
  log: () => log
});
module.exports = __toCommonJS(index_exports);
var import_express2 = __toESM(require("express"), 1);

// server/routes.ts
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);

// server/storage.ts
var MemStorage = class {
  profiles = /* @__PURE__ */ new Map();
  activitiesMap = /* @__PURE__ */ new Map();
  weightMap = /* @__PURE__ */ new Map();
  planMap = /* @__PURE__ */ new Map();
  adviceMap = /* @__PURE__ */ new Map();
  nextIds = { profile: 1, activity: 1, weight: 1, plan: 1, advice: 1 };
  constructor() {
    this.seedData();
  }
  seedData() {
    const profile = {
      id: 1,
      name: "Hugo",
      age: 37,
      weight: 93,
      height: 178,
      restingHr: 58,
      maxHr: 183,
      weeklyGoalKm: 25,
      targetRace: "10km du Bois de Boulogne",
      targetDate: "2026-04-05",
      targetTime: "58:00",
      injuryNotes: "Reprise syndrome bandelette ilio-tibiale (TFL). Douleur d\xE9clench\xE9e vers 3-4km. Suivi kin\xE9 hebdomadaire. Semelles podologue r\xE9centes.",
      fitnessLevel: "intermediate",
      garminAccessToken: null,
      garminRefreshToken: null,
      garminUserId: null
    };
    this.profiles.set(1, profile);
    this.nextIds.profile = 2;
    const sampleActivities = [
      { date: "2026-03-17", type: "easy_run", name: "Footing r\xE9cup", distanceKm: 5.2, durationMinutes: 34, avgPaceMinKm: 6.54, avgHr: 142, maxHr: 155, cadence: 168, elevationGain: 25, calories: 420, feeling: 4, notes: "Bonnes sensations, pas de douleur TFL", source: "manual", garminActivityId: null, laps: null },
      { date: "2026-03-15", type: "long_run", name: "Sortie longue Boulogne", distanceKm: 8.1, durationMinutes: 52, avgPaceMinKm: 6.42, avgHr: 148, maxHr: 168, cadence: 170, elevationGain: 45, calories: 680, feeling: 3, notes: "L\xE9g\xE8re g\xEAne TFL apr\xE8s 6km, bien g\xE9r\xE9", source: "manual", garminActivityId: null, laps: null },
      { date: "2026-03-12", type: "intervals", name: "Fractionn\xE9 6x400m", distanceKm: 6, durationMinutes: 35, avgPaceMinKm: 5.83, avgHr: 156, maxHr: 178, cadence: 176, elevationGain: 15, calories: 510, feeling: 4, notes: "400m en 1:50-1:55, bonne r\xE9cup entre", source: "manual", garminActivityId: null, laps: null },
      { date: "2026-03-10", type: "easy_run", name: "Footing matinal", distanceKm: 4.5, durationMinutes: 30, avgPaceMinKm: 6.67, avgHr: 138, maxHr: 150, cadence: 166, elevationGain: 20, calories: 365, feeling: 4, notes: "", source: "manual", garminActivityId: null, laps: null },
      { date: "2026-03-08", type: "tempo", name: "Tempo run", distanceKm: 6.5, durationMinutes: 37, avgPaceMinKm: 5.69, avgHr: 160, maxHr: 172, cadence: 174, elevationGain: 30, calories: 550, feeling: 3, notes: "Allure soutenue, dernier km plus dur", source: "manual", garminActivityId: null, laps: null },
      { date: "2026-03-05", type: "easy_run", name: "Footing l\xE9ger", distanceKm: 5, durationMinutes: 33, avgPaceMinKm: 6.6, avgHr: 140, maxHr: 152, cadence: 167, elevationGain: 18, calories: 400, feeling: 5, notes: "Aucune g\xEAne, tr\xE8s bon feeling", source: "manual", garminActivityId: null, laps: null },
      { date: "2026-03-03", type: "intervals", name: "6/1 blocs progressifs", distanceKm: 5.5, durationMinutes: 33, avgPaceMinKm: 6, avgHr: 152, maxHr: 175, cadence: 172, elevationGain: 22, calories: 470, feeling: 3, notes: "Blocs 6min course / 1min marche", source: "manual", garminActivityId: null, laps: null },
      { date: "2026-03-01", type: "long_run", name: "Sortie longue", distanceKm: 7.5, durationMinutes: 50, avgPaceMinKm: 6.67, avgHr: 146, maxHr: 165, cadence: 169, elevationGain: 40, calories: 630, feeling: 3, notes: "Bonne progression", source: "manual", garminActivityId: null, laps: null },
      { date: "2026-02-27", type: "easy_run", name: "Footing", distanceKm: 4, durationMinutes: 27, avgPaceMinKm: 6.75, avgHr: 136, maxHr: 148, cadence: 165, elevationGain: 15, calories: 320, feeling: 4, notes: "", source: "manual", garminActivityId: null, laps: null },
      { date: "2026-02-24", type: "easy_run", name: "Reprise douce", distanceKm: 3.5, durationMinutes: 25, avgPaceMinKm: 7.14, avgHr: 132, maxHr: 145, cadence: 162, elevationGain: 10, calories: 275, feeling: 3, notes: "Post semelles podologue, prudent", source: "manual", garminActivityId: null, laps: null }
    ];
    sampleActivities.forEach((a) => {
      const id = this.nextIds.activity++;
      this.activitiesMap.set(id, { ...a, id });
    });
    const weightData = [
      { date: "2026-03-19", weight: 92.5, bodyFat: 22.1, notes: null },
      { date: "2026-03-16", weight: 92.8, bodyFat: 22.3, notes: null },
      { date: "2026-03-12", weight: 93, bodyFat: 22.4, notes: null },
      { date: "2026-03-08", weight: 93.2, bodyFat: 22.5, notes: null },
      { date: "2026-03-04", weight: 93.5, bodyFat: 22.7, notes: null },
      { date: "2026-02-28", weight: 93.8, bodyFat: 22.9, notes: null },
      { date: "2026-02-24", weight: 94, bodyFat: 23, notes: "D\xE9but suivi" }
    ];
    weightData.forEach((w) => {
      const id = this.nextIds.weight++;
      this.weightMap.set(id, { ...w, id });
    });
    this.generateTrainingPlan();
    const adviceData = [
      { date: "2026-03-19", category: "training", title: "Charge progressive respect\xE9e", content: "Ta mont\xE9e en volume est r\xE9guli\xE8re (+10-15% par semaine). Continue sur ce rythme. La prochaine sortie longue peut viser 9km.", priority: "info" },
      { date: "2026-03-19", category: "injury", title: "TFL sous contr\xF4le", content: "La g\xEAne TFL appara\xEEt apr\xE8s 6km mais reste g\xE9rable. Continue le renforcement et les \xE9tirements post-s\xE9ance. Si la douleur augmente, r\xE9duire les intervalles.", priority: "warning" },
      { date: "2026-03-19", category: "recovery", title: "R\xE9cup\xE9ration optimale", content: "Ton rythme cardiaque de repos est stable \xE0 58bpm. Bonne r\xE9cup\xE9ration entre les s\xE9ances. Maintiens 48h entre s\xE9ances intensives.", priority: "info" },
      { date: "2026-03-19", category: "nutrition", title: "Hydratation pr\xE9-course", content: "Avec ton objectif de perte de poids, veille \xE0 maintenir un apport glucidique suffisant avant les s\xE9ances d'intensit\xE9. 30-40g de glucides 1h avant.", priority: "info" }
    ];
    adviceData.forEach((a) => {
      const id = this.nextIds.advice++;
      this.adviceMap.set(id, { ...a, id });
    });
  }
  generateTrainingPlan() {
    const weeks = [
      // Week 1 (Mar 16-22) - Build
      [
        { dayOfWeek: 0, date: "2026-03-16", sessionType: "rest", description: "Repos ou marche active 30min", targetDistanceKm: null, targetPaceMinKm: null, targetDurationMinutes: 30 },
        { dayOfWeek: 1, date: "2026-03-17", sessionType: "easy_run", description: "Footing endurance fondamentale", targetDistanceKm: 5, targetPaceMinKm: "6:30-7:00", targetDurationMinutes: 35 },
        { dayOfWeek: 2, date: "2026-03-18", sessionType: "strength", description: "Renforcement: squats, fentes, gainage, exercices TFL", targetDistanceKm: null, targetPaceMinKm: null, targetDurationMinutes: 40 },
        { dayOfWeek: 3, date: "2026-03-19", sessionType: "intervals", description: `Fractionn\xE9: 8x400m R=1'30" en 1:50-1:55`, targetDistanceKm: 6.5, targetPaceMinKm: "4:40-4:50", targetDurationMinutes: 40 },
        { dayOfWeek: 4, date: "2026-03-20", sessionType: "rest", description: "Repos complet", targetDistanceKm: null, targetPaceMinKm: null, targetDurationMinutes: null },
        { dayOfWeek: 5, date: "2026-03-21", sessionType: "easy_run", description: "Footing souple + 4 acc\xE9l\xE9rations progressives", targetDistanceKm: 5, targetPaceMinKm: "6:20-6:45", targetDurationMinutes: 32 },
        { dayOfWeek: 6, date: "2026-03-22", sessionType: "long_run", description: "Sortie longue allure confortable. Surveiller TFL apr\xE8s 6km.", targetDistanceKm: 9, targetPaceMinKm: "6:30-7:00", targetDurationMinutes: 60 }
      ],
      // Week 2 (Mar 23-29) - Peak
      [
        { dayOfWeek: 0, date: "2026-03-23", sessionType: "rest", description: "Repos ou marche 30min + \xE9tirements", targetDistanceKm: null, targetPaceMinKm: null, targetDurationMinutes: 30 },
        { dayOfWeek: 1, date: "2026-03-24", sessionType: "easy_run", description: "Footing r\xE9cup\xE9ration", targetDistanceKm: 5, targetPaceMinKm: "6:30-7:00", targetDurationMinutes: 35 },
        { dayOfWeek: 2, date: "2026-03-25", sessionType: "strength", description: "Renforcement musculaire + exercices TFL", targetDistanceKm: null, targetPaceMinKm: null, targetDurationMinutes: 40 },
        { dayOfWeek: 3, date: "2026-03-26", sessionType: "tempo", description: "Tempo: 20min \xE0 allure 10km (5:45-5:55/km)", targetDistanceKm: 7, targetPaceMinKm: "5:45-5:55", targetDurationMinutes: 42 },
        { dayOfWeek: 4, date: "2026-03-27", sessionType: "rest", description: "Repos complet", targetDistanceKm: null, targetPaceMinKm: null, targetDurationMinutes: null },
        { dayOfWeek: 5, date: "2026-03-28", sessionType: "easy_run", description: "Footing l\xE9ger", targetDistanceKm: 4, targetPaceMinKm: "6:30-7:00", targetDurationMinutes: 28 },
        { dayOfWeek: 6, date: "2026-03-29", sessionType: "long_run", description: "Derni\xE8re sortie longue: 10km test allure course", targetDistanceKm: 10, targetPaceMinKm: "5:50-6:10", targetDurationMinutes: 60 }
      ],
      // Week 3 (Mar 30 - Apr 5) - Taper + Race
      [
        { dayOfWeek: 0, date: "2026-03-30", sessionType: "rest", description: "Repos complet", targetDistanceKm: null, targetPaceMinKm: null, targetDurationMinutes: null },
        { dayOfWeek: 1, date: "2026-03-31", sessionType: "easy_run", description: "Footing l\xE9ger + 3 lignes droites", targetDistanceKm: 4, targetPaceMinKm: "6:30-7:00", targetDurationMinutes: 28 },
        { dayOfWeek: 2, date: "2026-04-01", sessionType: "strength", description: "Renforcement l\xE9ger: gainage + mobilit\xE9", targetDistanceKm: null, targetPaceMinKm: null, targetDurationMinutes: 30 },
        { dayOfWeek: 3, date: "2026-04-02", sessionType: "intervals", description: "Rappel vitesse: 4x200m rapide R=2'", targetDistanceKm: 4, targetPaceMinKm: "4:30", targetDurationMinutes: 25 },
        { dayOfWeek: 4, date: "2026-04-03", sessionType: "rest", description: "Repos complet - veille de J-2", targetDistanceKm: null, targetPaceMinKm: null, targetDurationMinutes: null },
        { dayOfWeek: 5, date: "2026-04-04", sessionType: "easy_run", description: "Trot l\xE9ger 15min + 2 acc\xE9l\xE9rations. Pr\xE9parer affaires course.", targetDistanceKm: 2.5, targetPaceMinKm: "6:30", targetDurationMinutes: 15 },
        { dayOfWeek: 6, date: "2026-04-05", sessionType: "race", description: "COURSE: 10km du Bois de Boulogne. Objectif: 58:00. D\xE9part prudent, acc\xE9l\xE9rer apr\xE8s 5km.", targetDistanceKm: 10, targetPaceMinKm: "5:48", targetDurationMinutes: 58 }
      ]
    ];
    weeks.forEach((week, wi) => {
      week.forEach((session) => {
        const id = this.nextIds.plan++;
        this.planMap.set(id, {
          ...session,
          id,
          weekNumber: wi + 1,
          completed: session.date < "2026-03-19",
          actualActivityId: null,
          notes: null
        });
      });
    });
  }
  // Profile
  async getProfile() {
    return this.profiles.get(1);
  }
  async upsertProfile(profile) {
    const existing = this.profiles.get(1);
    const updated = { ...existing, ...profile, id: 1 };
    this.profiles.set(1, updated);
    return updated;
  }
  // Activities
  async getActivities(limit = 50) {
    return Array.from(this.activitiesMap.values()).sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit);
  }
  async getActivitiesByDateRange(startDate, endDate) {
    return Array.from(this.activitiesMap.values()).filter((a) => a.date >= startDate && a.date <= endDate).sort((a, b) => b.date.localeCompare(a.date));
  }
  async getActivity(id) {
    return this.activitiesMap.get(id);
  }
  async createActivity(activity) {
    const id = this.nextIds.activity++;
    const newActivity = { ...activity, id };
    this.activitiesMap.set(id, newActivity);
    return newActivity;
  }
  async deleteActivity(id) {
    this.activitiesMap.delete(id);
  }
  // Weight
  async getWeightEntries(limit = 50) {
    return Array.from(this.weightMap.values()).sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit);
  }
  async createWeightEntry(entry) {
    const id = this.nextIds.weight++;
    const newEntry = { ...entry, id };
    this.weightMap.set(id, newEntry);
    return newEntry;
  }
  async deleteWeightEntry(id) {
    this.weightMap.delete(id);
  }
  // Training plan
  async getTrainingPlan() {
    return Array.from(this.planMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  }
  async getTrainingPlanByWeek(weekNumber) {
    return Array.from(this.planMap.values()).filter((s) => s.weekNumber === weekNumber).sort((a, b) => a.date.localeCompare(b.date));
  }
  async createTrainingSession(session) {
    const id = this.nextIds.plan++;
    const newSession = { ...session, id };
    this.planMap.set(id, newSession);
    return newSession;
  }
  async updateTrainingSession(id, updates) {
    const existing = this.planMap.get(id);
    if (!existing) throw new Error("Session not found");
    const updated = { ...existing, ...updates };
    this.planMap.set(id, updated);
    return updated;
  }
  async clearTrainingPlan() {
    this.planMap.clear();
  }
  // Coaching
  async getCoachingAdvice(limit = 20) {
    return Array.from(this.adviceMap.values()).sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit);
  }
  async createCoachingAdvice(advice) {
    const id = this.nextIds.advice++;
    const newAdvice = { ...advice, id };
    this.adviceMap.set(id, newAdvice);
    return newAdvice;
  }
};
var storage = new MemStorage();

// shared/schema.ts
var import_pg_core = require("drizzle-orm/pg-core");
var import_drizzle_zod = require("drizzle-zod");
var userProfile = (0, import_pg_core.pgTable)("user_profile", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  name: (0, import_pg_core.text)("name").notNull(),
  age: (0, import_pg_core.integer)("age"),
  weight: (0, import_pg_core.real)("weight"),
  // kg
  height: (0, import_pg_core.real)("height"),
  // cm
  restingHr: (0, import_pg_core.integer)("resting_hr"),
  maxHr: (0, import_pg_core.integer)("max_hr"),
  weeklyGoalKm: (0, import_pg_core.real)("weekly_goal_km"),
  targetRace: (0, import_pg_core.text)("target_race"),
  targetDate: (0, import_pg_core.text)("target_date"),
  targetTime: (0, import_pg_core.text)("target_time"),
  // e.g. "55:00" for 10km
  injuryNotes: (0, import_pg_core.text)("injury_notes"),
  fitnessLevel: (0, import_pg_core.text)("fitness_level"),
  // beginner, intermediate, advanced
  garminAccessToken: (0, import_pg_core.text)("garmin_access_token"),
  garminRefreshToken: (0, import_pg_core.text)("garmin_refresh_token"),
  garminUserId: (0, import_pg_core.text)("garmin_user_id")
});
var insertUserProfileSchema = (0, import_drizzle_zod.createInsertSchema)(userProfile).omit({ id: true });
var activities = (0, import_pg_core.pgTable)("activities", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  date: (0, import_pg_core.text)("date").notNull(),
  // ISO date
  type: (0, import_pg_core.text)("type").notNull(),
  // easy_run, tempo, intervals, long_run, recovery, race
  name: (0, import_pg_core.text)("name").notNull(),
  distanceKm: (0, import_pg_core.real)("distance_km").notNull(),
  durationMinutes: (0, import_pg_core.real)("duration_minutes").notNull(),
  avgPaceMinKm: (0, import_pg_core.real)("avg_pace_min_km"),
  // min/km
  avgHr: (0, import_pg_core.integer)("avg_hr"),
  maxHr: (0, import_pg_core.integer)("max_hr"),
  cadence: (0, import_pg_core.integer)("cadence"),
  elevationGain: (0, import_pg_core.integer)("elevation_gain"),
  calories: (0, import_pg_core.integer)("calories"),
  feeling: (0, import_pg_core.integer)("feeling"),
  // 1-5 RPE
  notes: (0, import_pg_core.text)("notes"),
  source: (0, import_pg_core.text)("source"),
  // garmin, manual, gpx_import
  garminActivityId: (0, import_pg_core.text)("garmin_activity_id"),
  laps: (0, import_pg_core.json)("laps")
  // Array of lap data
});
var insertActivitySchema = (0, import_drizzle_zod.createInsertSchema)(activities).omit({ id: true });
var weightEntries = (0, import_pg_core.pgTable)("weight_entries", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  date: (0, import_pg_core.text)("date").notNull(),
  weight: (0, import_pg_core.real)("weight").notNull(),
  // kg
  bodyFat: (0, import_pg_core.real)("body_fat"),
  // percentage
  notes: (0, import_pg_core.text)("notes")
});
var insertWeightEntrySchema = (0, import_drizzle_zod.createInsertSchema)(weightEntries).omit({ id: true });
var trainingPlan = (0, import_pg_core.pgTable)("training_plan", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  weekNumber: (0, import_pg_core.integer)("week_number").notNull(),
  dayOfWeek: (0, import_pg_core.integer)("day_of_week").notNull(),
  // 0=Mon, 6=Sun
  date: (0, import_pg_core.text)("date").notNull(),
  sessionType: (0, import_pg_core.text)("session_type").notNull(),
  // easy_run, tempo, intervals, long_run, rest, cross_training, strength
  description: (0, import_pg_core.text)("description").notNull(),
  targetDistanceKm: (0, import_pg_core.real)("target_distance_km"),
  targetPaceMinKm: (0, import_pg_core.text)("target_pace_min_km"),
  // e.g. "6:00-6:30"
  targetDurationMinutes: (0, import_pg_core.integer)("target_duration_minutes"),
  completed: (0, import_pg_core.boolean)("completed").default(false),
  actualActivityId: (0, import_pg_core.integer)("actual_activity_id"),
  notes: (0, import_pg_core.text)("notes")
});
var insertTrainingPlanSchema = (0, import_drizzle_zod.createInsertSchema)(trainingPlan).omit({ id: true });
var coachingAdvice = (0, import_pg_core.pgTable)("coaching_advice", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  date: (0, import_pg_core.text)("date").notNull(),
  category: (0, import_pg_core.text)("category").notNull(),
  // training, recovery, nutrition, injury
  title: (0, import_pg_core.text)("title").notNull(),
  content: (0, import_pg_core.text)("content").notNull(),
  priority: (0, import_pg_core.text)("priority").notNull()
  // info, warning, alert
});
var insertCoachingAdviceSchema = (0, import_drizzle_zod.createInsertSchema)(coachingAdvice).omit({ id: true });

// server/routes.ts
var CONFIG_PATH = import_path.default.join(process.cwd(), "data", "config.json");
function loadConfig() {
  try {
    if (import_fs.default.existsSync(CONFIG_PATH)) {
      return JSON.parse(import_fs.default.readFileSync(CONFIG_PATH, "utf-8"));
    }
  } catch (e) {
  }
  return {};
}
function saveConfig(config) {
  const dir = import_path.default.dirname(CONFIG_PATH);
  if (!import_fs.default.existsSync(dir)) {
    import_fs.default.mkdirSync(dir, { recursive: true });
  }
  import_fs.default.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}
async function registerRoutes(server, app2) {
  app2.get("/api/config", (_req, res) => {
    const config = loadConfig();
    const masked = {};
    if (config.stravaClientId) masked.stravaClientId = config.stravaClientId;
    if (config.stravaClientSecret) masked.stravaClientSecret = config.stravaClientSecret.length > 4 ? "\u2022\u2022\u2022\u2022" + config.stravaClientSecret.slice(-4) : config.stravaClientSecret;
    if (config.perplexityApiKey) masked.perplexityApiKey = config.perplexityApiKey.length > 4 ? "\u2022\u2022\u2022\u2022" + config.perplexityApiKey.slice(-4) : config.perplexityApiKey;
    res.json(masked);
  });
  app2.put("/api/config", (req, res) => {
    const { stravaClientId, stravaClientSecret, perplexityApiKey } = req.body;
    const existing = loadConfig();
    const updated = { ...existing };
    if (stravaClientId !== void 0) updated.stravaClientId = stravaClientId;
    if (stravaClientSecret !== void 0 && !stravaClientSecret.startsWith("\u2022\u2022\u2022\u2022")) updated.stravaClientSecret = stravaClientSecret;
    if (perplexityApiKey !== void 0 && !perplexityApiKey.startsWith("\u2022\u2022\u2022\u2022")) updated.perplexityApiKey = perplexityApiKey;
    saveConfig(updated);
    res.json({ success: true });
  });
  app2.get("/api/profile", async (_req, res) => {
    const profile = await storage.getProfile();
    res.json(profile || null);
  });
  app2.put("/api/profile", async (req, res) => {
    const parsed = insertUserProfileSchema.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
    const profile = await storage.upsertProfile(parsed.data);
    res.json(profile);
  });
  app2.get("/api/activities", async (req, res) => {
    const limit = parseInt(req.query.limit) || 50;
    const activities2 = await storage.getActivities(limit);
    res.json(activities2);
  });
  app2.get("/api/activities/range", async (req, res) => {
    const { start, end } = req.query;
    if (!start || !end) return res.status(400).json({ error: "start and end required" });
    const activities2 = await storage.getActivitiesByDateRange(start, end);
    res.json(activities2);
  });
  app2.get("/api/activities/:id", async (req, res) => {
    const activity = await storage.getActivity(parseInt(req.params.id));
    if (!activity) return res.status(404).json({ error: "Not found" });
    res.json(activity);
  });
  app2.post("/api/activities", async (req, res) => {
    const parsed = insertActivitySchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
    const activity = await storage.createActivity(parsed.data);
    res.status(201).json(activity);
  });
  app2.delete("/api/activities/:id", async (req, res) => {
    await storage.deleteActivity(parseInt(req.params.id));
    res.json({ deleted: true });
  });
  app2.get("/api/weight", async (req, res) => {
    const limit = parseInt(req.query.limit) || 50;
    const entries = await storage.getWeightEntries(limit);
    res.json(entries);
  });
  app2.post("/api/weight", async (req, res) => {
    const parsed = insertWeightEntrySchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
    const entry = await storage.createWeightEntry(parsed.data);
    res.status(201).json(entry);
  });
  app2.delete("/api/weight/:id", async (req, res) => {
    await storage.deleteWeightEntry(parseInt(req.params.id));
    res.json({ deleted: true });
  });
  app2.get("/api/plan", async (_req, res) => {
    const plan = await storage.getTrainingPlan();
    res.json(plan);
  });
  app2.get("/api/plan/week/:weekNumber", async (req, res) => {
    const week = await storage.getTrainingPlanByWeek(parseInt(req.params.weekNumber));
    res.json(week);
  });
  app2.patch("/api/plan/:id", async (req, res) => {
    try {
      const session = await storage.updateTrainingSession(parseInt(req.params.id), req.body);
      res.json(session);
    } catch (e) {
      res.status(404).json({ error: e.message });
    }
  });
  app2.get("/api/coaching", async (req, res) => {
    const limit = parseInt(req.query.limit) || 20;
    const advice = await storage.getCoachingAdvice(limit);
    res.json(advice);
  });
  app2.get("/api/stats", async (_req, res) => {
    const activities2 = await storage.getActivities(100);
    const weights = await storage.getWeightEntries(50);
    const profile = await storage.getProfile();
    const now = /* @__PURE__ */ new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const twoWeeksAgo = new Date(now);
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const thisWeek = activities2.filter((a) => new Date(a.date) >= weekAgo);
    const lastWeek = activities2.filter((a) => new Date(a.date) >= twoWeeksAgo && new Date(a.date) < weekAgo);
    const thisWeekKm = thisWeek.reduce((s, a) => s + a.distanceKm, 0);
    const lastWeekKm = lastWeek.reduce((s, a) => s + a.distanceKm, 0);
    const thisWeekDuration = thisWeek.reduce((s, a) => s + a.durationMinutes, 0);
    const totalKm = activities2.reduce((s, a) => s + a.distanceKm, 0);
    const avgPace = activities2.length > 0 ? activities2.reduce((s, a) => s + (a.avgPaceMinKm || 0), 0) / activities2.filter((a) => a.avgPaceMinKm).length : 0;
    const recentActivities = activities2.slice(0, 7);
    const avgFeeling = recentActivities.length > 0 ? recentActivities.reduce((s, a) => s + (a.feeling || 3), 0) / recentActivities.length : 3;
    const volumeScore = Math.min(thisWeekKm / (profile?.weeklyGoalKm || 25), 1) * 40;
    const consistencyScore = thisWeek.length >= 3 ? 30 : thisWeek.length * 10;
    const feelingScore = avgFeeling * 6;
    const fitnessScore = Math.round(volumeScore + consistencyScore + feelingScore);
    const currentWeight = weights.length > 0 ? weights[0].weight : null;
    const startWeight = weights.length > 1 ? weights[weights.length - 1].weight : currentWeight;
    const raceDate = profile?.targetDate ? new Date(profile.targetDate) : null;
    const daysToRace = raceDate ? Math.ceil((raceDate.getTime() - now.getTime()) / (1e3 * 60 * 60 * 24)) : null;
    res.json({
      thisWeek: {
        km: Math.round(thisWeekKm * 10) / 10,
        runs: thisWeek.length,
        duration: Math.round(thisWeekDuration),
        avgPace: thisWeek.length > 0 ? Math.round(thisWeek.reduce((s, a) => s + (a.avgPaceMinKm || 0), 0) / thisWeek.filter((a) => a.avgPaceMinKm).length * 100) / 100 : null
      },
      lastWeek: {
        km: Math.round(lastWeekKm * 10) / 10,
        runs: lastWeek.length
      },
      overall: {
        totalKm: Math.round(totalKm * 10) / 10,
        totalRuns: activities2.length,
        avgPace: Math.round(avgPace * 100) / 100
      },
      fitnessScore,
      weight: {
        current: currentWeight,
        start: startWeight,
        change: currentWeight && startWeight ? Math.round((currentWeight - startWeight) * 10) / 10 : null
      },
      daysToRace,
      weeklyChange: lastWeekKm > 0 ? Math.round((thisWeekKm - lastWeekKm) / lastWeekKm * 100) : null
    });
  });
  app2.get("/api/garmin/auth-url", (_req, res) => {
    const clientId = process.env.GARMIN_CLIENT_ID || "YOUR_GARMIN_CLIENT_ID";
    const redirectUri = process.env.GARMIN_REDIRECT_URI || "https://your-app.com/api/garmin/callback";
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = codeVerifier;
    const authUrl = `https://connect.garmin.com/oauth2Confirm?client_id=${clientId}&response_type=code&code_challenge=${codeChallenge}&code_challenge_method=S256&redirect_uri=${encodeURIComponent(redirectUri)}&state=runcoach`;
    res.json({
      authUrl,
      configured: clientId !== "YOUR_GARMIN_CLIENT_ID",
      instructions: "Pour connecter Garmin Connect, inscrivez-vous au programme d\xE9veloppeur sur developer.garmin.com et configurez les variables GARMIN_CLIENT_ID et GARMIN_CLIENT_SECRET."
    });
  });
  app2.post("/api/garmin/callback", async (req, res) => {
    const { code, codeVerifier } = req.body;
    if (!code) return res.status(400).json({ error: "Authorization code required" });
    res.json({ success: true, message: "Garmin connected" });
  });
  const chatHistory = [];
  async function callPerplexityCoach(message, profile, plan, activities2, apiKey) {
    try {
      const now = /* @__PURE__ */ new Date();
      const today = now.toISOString().split("T")[0];
      const upcomingSessions = plan.filter((s) => s.date >= today && !s.completed).slice(0, 5);
      const recentActivities = activities2.slice(0, 5).map(
        (a) => `${a.date}: ${a.type} ${a.distanceKm}km en ${a.durationMinutes}min (allure ${a.avgPaceMinKm || "?"}/km, ressenti ${a.feeling || "?"})`
      ).join("\n");
      const upcomingPlan = upcomingSessions.map(
        (s) => `${s.date}: ${s.sessionType} - ${s.description}${s.targetDistanceKm ? ` (${s.targetDistanceKm}km)` : ""}`
      ).join("\n");
      const systemPrompt = `Tu es un coach de course \xE0 pied exp\xE9riment\xE9 et bienveillant. Tu parles en fran\xE7ais.
Profil du coureur :
- Nom : ${profile?.name || "l'athl\xE8te"}
- \xC2ge : ${profile?.age || "inconnu"}, Poids : ${profile?.weight || "inconnu"}kg
- Niveau : ${profile?.fitnessLevel || "interm\xE9diaire"}
- Objectif : ${profile?.targetRace || "non d\xE9fini"} le ${profile?.targetDate || "?"}, temps vis\xE9 : ${profile?.targetTime || "?"}
- Blessures/notes : ${profile?.injuryNotes || "aucune"}

Activit\xE9s r\xE9centes :
${recentActivities || "Aucune activit\xE9 r\xE9cente"}

Prochaines s\xE9ances pr\xE9vues :
${upcomingPlan || "Aucune s\xE9ance planifi\xE9e"}

R\xE9ponds de mani\xE8re concise, personnalis\xE9e et motivante. Utilise des \xE9mojis avec parcimonie. Si on te demande de modifier le plan, explique ce que tu recommandes.`;
      const messages = [
        { role: "system", content: systemPrompt },
        ...chatHistory.slice(-10).map((m) => ({ role: m.role, content: m.content })),
        { role: "user", content: message }
      ];
      const response = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "sonar",
          messages
        })
      });
      if (!response.ok) return null;
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) return null;
      return { message: content };
    } catch (e) {
      return null;
    }
  }
  app2.get("/api/coach/status", (_req, res) => {
    const apiKey = process.env.PERPLEXITY_API_KEY || loadConfig().perplexityApiKey;
    if (apiKey) {
      res.json({ mode: "ai", label: "Perplexity Sonar" });
    } else {
      res.json({ mode: "rules", label: "Coach automatique" });
    }
  });
  app2.get("/api/chat/history", (_req, res) => {
    res.json(chatHistory);
  });
  app2.post("/api/chat", async (req, res) => {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message required" });
    const profile = await storage.getProfile();
    const plan = await storage.getTrainingPlan();
    const activities2 = await storage.getActivities(10);
    chatHistory.push({ role: "user", content: message });
    const perplexityKey = process.env.PERPLEXITY_API_KEY || loadConfig().perplexityApiKey;
    let response;
    if (perplexityKey) {
      const aiResponse = await callPerplexityCoach(message, profile, plan, activities2, perplexityKey);
      response = aiResponse || generateCoachResponse(message, profile, plan, activities2);
    } else {
      response = generateCoachResponse(message, profile, plan, activities2);
    }
    chatHistory.push({ role: "assistant", content: response.message });
    if (response.planUpdates) {
      for (const u of response.planUpdates) {
        try {
          await storage.updateTrainingSession(u.id, u.changes);
        } catch (e) {
        }
      }
    }
    res.json({
      message: response.message,
      planUpdated: !!response.planUpdates && response.planUpdates.length > 0
    });
  });
  let stravaAccessToken = process.env.STRAVA_ACCESS_TOKEN || null;
  let stravaRefreshToken = process.env.STRAVA_REFRESH_TOKEN || null;
  app2.get("/api/strava/status", async (req, res) => {
    const clientId = process.env.STRAVA_CLIENT_ID || loadConfig().stravaClientId;
    const configured = !!clientId;
    if (!configured) {
      return res.json({ connected: false, configured: false, error: "Strava non configur\xE9" });
    }
    if (stravaAccessToken) {
      try {
        const response = await fetch("https://www.strava.com/api/v3/athlete", {
          headers: { Authorization: `Bearer ${stravaAccessToken}` }
        });
        if (response.ok) {
          const athlete = await response.json();
          return res.json({ connected: true, athlete: { name: `${athlete.firstname} ${athlete.lastname}` } });
        }
        const refreshed = await refreshStravaToken();
        if (refreshed) {
          return res.json({ connected: true });
        }
      } catch (e) {
      }
    }
    const redirectUri = process.env.STRAVA_REDIRECT_URI || `${req.protocol}://${req.get("host")}/api/strava/callback`;
    const authUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=read,activity:read_all&approval_prompt=auto`;
    res.json({ connected: false, configured: true, authUrl });
  });
  app2.get("/api/strava/callback", async (req, res) => {
    const { code } = req.query;
    if (!code) return res.status(400).send("Code manquant");
    try {
      const response = await fetch("https://www.strava.com/oauth/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: process.env.STRAVA_CLIENT_ID || loadConfig().stravaClientId,
          client_secret: process.env.STRAVA_CLIENT_SECRET || loadConfig().stravaClientSecret,
          code,
          grant_type: "authorization_code"
        })
      });
      const data = await response.json();
      if (data.access_token) {
        stravaAccessToken = data.access_token;
        stravaRefreshToken = data.refresh_token;
        res.redirect("/#/settings");
      } else {
        res.status(400).json({ error: "\xC9chec de connexion Strava", details: data });
      }
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  app2.post("/api/strava/sync", async (_req, res) => {
    if (!stravaAccessToken) {
      const refreshed = await refreshStravaToken();
      if (!refreshed) {
        return res.status(401).json({ error: "Strava non connect\xE9", needsAuth: true });
      }
    }
    try {
      const response = await fetch("https://www.strava.com/api/v3/athlete/activities?per_page=20", {
        headers: { Authorization: `Bearer ${stravaAccessToken}` }
      });
      if (!response.ok) {
        if (response.status === 401) {
          const refreshed = await refreshStravaToken();
          if (!refreshed) {
            return res.status(401).json({ error: "Token Strava expir\xE9", needsAuth: true });
          }
          const retryResponse = await fetch("https://www.strava.com/api/v3/athlete/activities?per_page=20", {
            headers: { Authorization: `Bearer ${stravaAccessToken}` }
          });
          if (!retryResponse.ok) {
            return res.status(400).json({ error: "Erreur Strava apr\xE8s refresh" });
          }
          var stravaActivities = await retryResponse.json();
        } else {
          return res.status(400).json({ error: `Erreur Strava: ${response.status}` });
        }
      } else {
        var stravaActivities = await response.json();
      }
      const imported = [];
      for (const act of stravaActivities) {
        if (act.type !== "Run" && act.sport_type !== "Run") continue;
        const distKm = (act.distance || 0) / 1e3;
        const durMin = (act.moving_time || act.elapsed_time || 0) / 60;
        const paceMinKm = durMin > 0 && distKm > 0 ? durMin / distKm : null;
        const newActivity = await storage.createActivity({
          date: act.start_date_local?.split("T")[0] || act.start_date?.split("T")[0] || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
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
          notes: `Import\xE9 depuis Strava${act.description ? ": " + act.description : ""}`,
          source: "strava",
          garminActivityId: String(act.id),
          laps: null
        });
        imported.push(newActivity);
      }
      res.json({
        success: true,
        imported: imported.length,
        total: stravaActivities.length,
        activities: imported
      });
    } catch (e) {
      res.status(400).json({ error: "Erreur de synchronisation Strava", details: e.message });
    }
  });
  async function refreshStravaToken() {
    const cfg = loadConfig();
    const clientId = process.env.STRAVA_CLIENT_ID || cfg.stravaClientId;
    const clientSecret = process.env.STRAVA_CLIENT_SECRET || cfg.stravaClientSecret;
    if (!stravaRefreshToken || !clientId || !clientSecret) return false;
    try {
      const response = await fetch("https://www.strava.com/oauth/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: stravaRefreshToken,
          grant_type: "refresh_token"
        })
      });
      const data = await response.json();
      if (data.access_token) {
        stravaAccessToken = data.access_token;
        stravaRefreshToken = data.refresh_token || stravaRefreshToken;
        return true;
      }
    } catch (e) {
    }
    return false;
  }
}
function generateCoachResponse(message, profile, plan, activities2) {
  const msg = message.toLowerCase().trim();
  const name = profile?.name || "Hugo";
  const now = /* @__PURE__ */ new Date();
  const today = now.toISOString().split("T")[0];
  const todaySession = plan.find((s) => s.date === today);
  const upcomingSessions = plan.filter((s) => s.date >= today && !s.completed).slice(0, 5);
  const completedCount = plan.filter((s) => s.completed).length;
  const totalSessions = plan.length;
  const recentKm = activities2.slice(0, 5).reduce((s, a) => s + a.distanceKm, 0);
  const avgFeeling = activities2.length > 0 ? activities2.reduce((s, a) => s + (a.feeling || 3), 0) / activities2.length : 3;
  const raceDate = profile?.targetDate ? new Date(profile.targetDate) : null;
  const daysToRace = raceDate ? Math.ceil((raceDate.getTime() - now.getTime()) / (1e3 * 60 * 60 * 24)) : null;
  if (msg.match(/^(salut|bonjour|hello|hey|coucou|yo)/)) {
    let greeting = `Salut ${name} ! \u{1F44B} Bienvenue sur RunCoach.

`;
    if (todaySession) {
      greeting += `\u{1F4CB} Aujourd'hui au programme : **${todaySession.sessionType === "rest" ? "Repos" : todaySession.description}**`;
      if (todaySession.targetDistanceKm) greeting += ` (${todaySession.targetDistanceKm}km)`;
      greeting += ".\n\n";
    }
    if (daysToRace !== null && daysToRace > 0) {
      greeting += `\u{1F3C1} J-${daysToRace} avant ${profile?.targetRace || "ta course"}. `;
    }
    greeting += `Tu as compl\xE9t\xE9 ${completedCount}/${totalSessions} s\xE9ances du plan. Comment te sens-tu ?`;
    return { message: greeting };
  }
  if (msg.match(/(comment|quel|où|ou).*(plan|programme|entra[iî]nement)/) || msg.match(/mon plan/) || msg.match(/^plan$/)) {
    let response = `\u{1F4CA} **Bilan de ton plan**

`;
    response += `\u2705 S\xE9ances compl\xE9t\xE9es : ${completedCount}/${totalSessions}
`;
    if (daysToRace !== null && daysToRace > 0) {
      response += `\u{1F3C1} Course dans ${daysToRace} jours (${profile?.targetRace})
`;
    }
    response += `
**Prochaines s\xE9ances :**
`;
    for (const s of upcomingSessions.slice(0, 4)) {
      const dayName = new Date(s.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
      response += `\u2022 ${dayName} : ${s.description}`;
      if (s.targetDistanceKm) response += ` (${s.targetDistanceKm}km)`;
      response += "\n";
    }
    if (avgFeeling >= 3.5) {
      response += `
\u{1F4AA} Tes ressentis r\xE9cents sont bons (${avgFeeling.toFixed(1)}/5). Continue comme \xE7a !`;
    } else if (avgFeeling >= 2.5) {
      response += `
\u26A0\uFE0F Tes ressentis sont moyens (${avgFeeling.toFixed(1)}/5). \xC9coute bien ton corps.`;
    } else {
      response += `
\u{1F53B} Tes ressentis sont faibles (${avgFeeling.toFixed(1)}/5). Pense \xE0 ralentir et r\xE9cup\xE9rer.`;
    }
    return { message: response };
  }
  if (msg.match(/(remplac|chang|modifi|transform|switch|échang)/) && msg.match(/(séance|mardi|mercredi|lundi|jeudi|vendredi|samedi|dimanche|entra[iî]nement|session)/)) {
    const dayMap = { lundi: 1, mardi: 2, mercredi: 3, jeudi: 4, vendredi: 5, samedi: 6, dimanche: 0 };
    let targetSession = null;
    let targetDay = "";
    for (const [day, dayNum] of Object.entries(dayMap)) {
      if (msg.includes(day)) {
        targetDay = day;
        targetSession = upcomingSessions.find((s) => new Date(s.date).getDay() === dayNum);
        break;
      }
    }
    let newType = "";
    let newDescription = "";
    if (msg.includes("fractionn") || msg.includes("interval") || msg.includes("vma")) {
      newType = "intervals";
      newDescription = `Fractionn\xE9: 6x400m R=1'30" en 1:50-1:55`;
    } else if (msg.includes("tempo") || msg.includes("seuil") || msg.includes("allure")) {
      newType = "tempo";
      newDescription = "Tempo: 20min \xE0 allure 10km (5:45-5:55/km)";
    } else if (msg.includes("repos") || msg.includes("off") || msg.includes("r\xE9cup")) {
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
      const response = `\u2705 C'est fait ! J'ai modifi\xE9 la s\xE9ance de **${dayLabel}** :

\u2022 Avant : ${targetSession.description}
\u2022 Maintenant : **${newDescription}**

` + (profile?.injuryNotes?.includes("TFL") ? "\u26A0\uFE0F Pense \xE0 bien t'\xE9chauffer et \xE0 surveiller ton TFL." : "Bonne s\xE9ance !");
      return {
        message: response,
        planUpdates: [{ id: targetSession.id, changes: { sessionType: newType, description: newDescription } }]
      };
    }
    if (targetSession && !newType) {
      return {
        message: `Tu veux modifier la s\xE9ance de ${targetDay}. Par quoi veux-tu la remplacer ?

\u2022 Fractionn\xE9
\u2022 Tempo / allure seuil
\u2022 Footing souple
\u2022 Sortie longue
\u2022 Renforcement
\u2022 Repos`
      };
    }
    if (!targetSession && newType) {
      return {
        message: `Quel jour veux-tu modifier ? Voici tes prochaines s\xE9ances :

` + upcomingSessions.slice(0, 4).map((s) => {
          const d = new Date(s.date).toLocaleDateString("fr-FR", { weekday: "long" });
          return `\u2022 **${d}** : ${s.description}`;
        }).join("\n")
      };
    }
    return {
      message: `Je peux modifier ton plan ! Dis-moi quel jour et quel type de s\xE9ance tu veux. Par exemple :

\u2022 "Remplace ma s\xE9ance de mardi par du fractionn\xE9"
\u2022 "Change jeudi en repos"
\u2022 "Transforme samedi en tempo"`
    };
  }
  if (msg.match(/(blessure|douleur|mal|tfl|genou|bandelette|ilio|syndrome|kiné)/)) {
    let response = `\u{1F3E5} **Conseils blessure**

`;
    if (profile?.injuryNotes) {
      response += `Rappel de ta situation : ${profile.injuryNotes}

`;
    }
    response += `**En cas de douleur pendant une s\xE9ance :**
`;
    response += `1. R\xE9duis imm\xE9diatement l'allure ou passe en marche
`;
    response += `2. Si la douleur persiste > 5min, arr\xEAte la s\xE9ance
`;
    response += `3. Applique de la glace 15min apr\xE8s l'effort

`;
    response += `**Pr\xE9vention TFL :**
`;
    response += `\u2022 \xC9tirements du fascia lata et quadriceps apr\xE8s chaque course
`;
    response += `\u2022 Renforcement moyen fessier (ponts, clam shells)
`;
    response += `\u2022 Foam rolling sur la face externe de la cuisse
`;
    response += `\u2022 Tes semelles de podologue aident \xE0 corriger l'appui

`;
    response += `Si la douleur s'aggrave, consulte ton kin\xE9 avant la prochaine s\xE9ance intensive.`;
    return { message: response };
  }
  if (msg.match(/(pr[eê]t|objectif|course|10km|10 km|bois de boulogne|capable|chrono|temps)/)) {
    let response = `\u{1F3C1} **Pr\xE9paration course**

`;
    if (daysToRace !== null) {
      response += `Il reste **${daysToRace} jours** avant ${profile?.targetRace || "ta course"}.
`;
      response += `Objectif : **${profile?.targetTime || "\xE0 d\xE9finir"}**

`;
    }
    const runCount = activities2.filter((a) => a.type !== "rest" && a.type !== "strength").length;
    response += `\u{1F4C8} Tes ${runCount} derni\xE8res courses montrent `;
    const lastPaces = activities2.filter((a) => a.avgPaceMinKm).slice(0, 5).map((a) => a.avgPaceMinKm);
    if (lastPaces.length > 0) {
      const avgPace = lastPaces.reduce((s, p) => s + p, 0) / lastPaces.length;
      response += `une allure moyenne de **${Math.floor(avgPace)}:${String(Math.round(avgPace % 1 * 60)).padStart(2, "0")}/km**.

`;
      if (profile?.targetTime) {
        const targetPace = parseInt(profile.targetTime) / 10;
        if (avgPace <= targetPace + 0.3) {
          response += `\u{1F4AA} Tu es dans les clous pour ton objectif ! Continue l'aff\xFBtage.`;
        } else {
          response += `\u26A1 Tu es un peu au-dessus de l'allure cible. Concentre-toi sur les s\xE9ances tempo pour progresser.`;
        }
      }
    } else {
      response += `une bonne progression.

\u{1F4AA} Continue \xE0 suivre ton plan, la r\xE9gularit\xE9 paie !`;
    }
    return { message: response };
  }
  if (msg.match(/(aujourd'?hui|ce soir|ce matin|maintenant|quoi faire|quelle séance)/)) {
    if (todaySession) {
      let response = `\u{1F4CB} **S\xE9ance du jour**

`;
      response += `**${todaySession.sessionType === "rest" ? "Repos" : todaySession.description}**
`;
      if (todaySession.targetDistanceKm) response += `\u{1F4CF} Distance : ${todaySession.targetDistanceKm}km
`;
      if (todaySession.targetPaceMinKm) response += `\u23F1 Allure : ${todaySession.targetPaceMinKm}/km
`;
      if (todaySession.targetDurationMinutes) response += `\u23F0 Dur\xE9e : ${todaySession.targetDurationMinutes}min
`;
      response += `
`;
      if (todaySession.sessionType === "intervals") {
        response += `**Conseils fractionn\xE9 :**
\u2022 \xC9chauffe-toi 10-15min en footing progressif
\u2022 Respecte les temps de r\xE9cup
\u2022 Finis par 5min de retour au calme`;
      } else if (todaySession.sessionType === "long_run") {
        response += `**Conseils sortie longue :**
\u2022 Pars lentement, acc\xE9l\xE8re si les sensations sont bonnes
\u2022 Hydrate-toi r\xE9guli\xE8rement
\u2022 Surveille ton TFL apr\xE8s 6km`;
      } else if (todaySession.sessionType === "tempo") {
        response += `**Conseils tempo :**
\u2022 L'allure doit \xEAtre "confortablement inconfortable"
\u2022 Garde un rythme r\xE9gulier
\u2022 Ne pars pas trop vite`;
      } else if (todaySession.sessionType === "rest") {
        response += `Profite de cette journ\xE9e de repos ! Tu peux faire des \xE9tirements ou une marche l\xE9g\xE8re.`;
      }
      return { message: response };
    }
    return {
      message: `Pas de s\xE9ance programm\xE9e aujourd'hui. Tu peux en profiter pour te reposer ou faire un peu de renforcement l\xE9ger (gainage, \xE9tirements). \u{1F9D8}`
    };
  }
  if (msg.match(/(poids|nutrition|alimentation|manger|kilos?|maigri|régime|diet)/)) {
    let response = `\u{1F34E} **Nutrition & Poids**

`;
    response += `**Avant l'entra\xEEnement (1-2h avant) :**
`;
    response += `\u2022 30-40g de glucides (banane, pain complet, barre c\xE9r\xE9ales)
`;
    response += `\u2022 Hydrate-toi bien (400-500ml d'eau)

`;
    response += `**Apr\xE8s l'entra\xEEnement (dans les 30min) :**
`;
    response += `\u2022 Prot\xE9ines + glucides (yaourt + fruits, sandwich poulet)
`;
    response += `\u2022 Recharge hydrique

`;
    response += `**Pour la gestion du poids :**
`;
    response += `\u2022 D\xE9ficit mod\xE9r\xE9 (300-500 kcal/jour max)
`;
    response += `\u2022 Ne coupe jamais les glucides avant une s\xE9ance intense
`;
    response += `\u2022 La perte de poids doit \xEAtre progressive (0.5kg/semaine max)`;
    return { message: response };
  }
  if (msg.match(/(fatigu|récup|dormir|sommeil|repos|épuis|courbature|lourd)/)) {
    return {
      message: `\u{1F634} **R\xE9cup\xE9ration**

La r\xE9cup\xE9ration est aussi importante que l'entra\xEEnement !

**Check-list r\xE9cup :**
\u2022 Sommeil : vise 7-8h. C'est l\xE0 que ton corps se r\xE9pare.
\u2022 Hydratation : 2-2.5L par jour, plus les jours de course.
\u2022 \xC9tirements : 10min apr\xE8s chaque s\xE9ance (mollets, quadriceps, TFL).
\u2022 Foam rolling : face externe cuisse + mollets.
\u2022 Alimentation : prot\xE9ines dans les 30min post-effort.

Si tu te sens tr\xE8s fatigu\xE9, n'h\xE9site pas \xE0 transformer une s\xE9ance intense en footing l\xE9ger. Mieux vaut un jour de repos que 2 semaines d'arr\xEAt.`
    };
  }
  if (msg.match(/(aide|help|quoi|comment|tu (peux|sais|fais)|fonctionn)/)) {
    return {
      message: `\u{1F916} **Ce que je peux faire pour toi :**

\u2022 \u{1F4CB} **Voir ton plan** \u2014 "Comment va mon plan ?"
\u2022 \u270F\uFE0F **Modifier une s\xE9ance** \u2014 "Remplace ma s\xE9ance de mardi par du fractionn\xE9"
\u2022 \u{1F4C5} **S\xE9ance du jour** \u2014 "Qu'est-ce que je fais aujourd'hui ?"
\u2022 \u{1F3C1} **Objectif course** \u2014 "Est-ce que je suis pr\xEAt pour mon 10km ?"
\u2022 \u{1F3E5} **Conseils blessure** \u2014 "J'ai mal au genou"
\u2022 \u{1F34E} **Nutrition** \u2014 "Que manger avant une course ?"
\u2022 \u{1F634} **R\xE9cup\xE9ration** \u2014 "Je suis fatigu\xE9"

Essaie l'une de ces phrases !`
    };
  }
  return {
    message: `Merci pour ton message, ${name} ! \u{1F3C3}

Je suis ton coach running et je peux t'aider avec :
\u2022 Ton plan d'entra\xEEnement
\u2022 Modifier tes s\xE9ances
\u2022 Des conseils blessure et r\xE9cup\xE9ration
\u2022 Ta pr\xE9paration course

Essaie par exemple : "Comment va mon plan ?" ou "Remplace ma s\xE9ance de mardi par du fractionn\xE9".`
  };
}
function categorizeStravaRun(act) {
  const name = (act.name || "").toLowerCase();
  if (act.workout_type === 1 || name.includes("race") || name.includes("course")) return "race";
  if (act.workout_type === 3 || name.includes("tempo") || name.includes("seuil")) return "tempo";
  if (name.includes("fractionn") || name.includes("interval") || name.includes("vma")) return "intervals";
  if (name.includes("long") || name.includes("sortie longue")) return "long_run";
  if (name.includes("r\xE9cup") || name.includes("recup") || name.includes("recovery")) return "recovery";
  const distKm = (act.distance || 0) / 1e3;
  if (distKm > 12) return "long_run";
  return "easy_run";
}
function generateCodeVerifier() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  let result = "";
  for (let i = 0; i < 64; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// server/static.ts
var import_express = __toESM(require("express"), 1);
var import_fs2 = __toESM(require("fs"), 1);
var import_path2 = __toESM(require("path"), 1);
function serveStatic(app2) {
  const distPath = import_path2.default.resolve(__dirname, "public");
  if (!import_fs2.default.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(import_express.default.static(distPath));
  app2.use("/{*path}", (_req, res) => {
    res.sendFile(import_path2.default.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var import_http = require("http");
var app = (0, import_express2.default)();
var httpServer = (0, import_http.createServer)(app);
app.use(
  import_express2.default.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    }
  })
);
app.use(import_express2.default.urlencoded({ extended: false }));
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  await registerRoutes(httpServer, app);
  app.use((err, _req, res, next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.error("Internal Server Error:", err);
    if (res.headersSent) {
      return next(err);
    }
    return res.status(status).json({ message });
  });
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true
    },
    () => {
      log(`serving on port ${port}`);
    }
  );
})();
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  log
});

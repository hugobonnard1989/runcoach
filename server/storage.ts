import type {
  UserProfile, InsertUserProfile,
  Activity, InsertActivity,
  WeightEntry, InsertWeightEntry,
  TrainingPlan, InsertTrainingPlan,
  CoachingAdvice, InsertCoachingAdvice,
} from "@shared/schema";

export interface IStorage {
  // User profile
  getProfile(): Promise<UserProfile | undefined>;
  upsertProfile(profile: InsertUserProfile): Promise<UserProfile>;

  // Activities
  getActivities(limit?: number): Promise<Activity[]>;
  getActivitiesByDateRange(startDate: string, endDate: string): Promise<Activity[]>;
  getActivity(id: number): Promise<Activity | undefined>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  deleteActivity(id: number): Promise<void>;

  // Weight
  getWeightEntries(limit?: number): Promise<WeightEntry[]>;
  createWeightEntry(entry: InsertWeightEntry): Promise<WeightEntry>;
  deleteWeightEntry(id: number): Promise<void>;

  // Training plan
  getTrainingPlan(): Promise<TrainingPlan[]>;
  getTrainingPlanByWeek(weekNumber: number): Promise<TrainingPlan[]>;
  createTrainingSession(session: InsertTrainingPlan): Promise<TrainingPlan>;
  updateTrainingSession(id: number, updates: Partial<InsertTrainingPlan>): Promise<TrainingPlan>;
  clearTrainingPlan(): Promise<void>;

  // Coaching
  getCoachingAdvice(limit?: number): Promise<CoachingAdvice[]>;
  createCoachingAdvice(advice: InsertCoachingAdvice): Promise<CoachingAdvice>;
}

export class MemStorage implements IStorage {
  private profiles: Map<number, UserProfile> = new Map();
  private activitiesMap: Map<number, Activity> = new Map();
  private weightMap: Map<number, WeightEntry> = new Map();
  private planMap: Map<number, TrainingPlan> = new Map();
  private adviceMap: Map<number, CoachingAdvice> = new Map();
  private nextIds = { profile: 1, activity: 1, weight: 1, plan: 1, advice: 1 };

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Seed Hugo's profile
    const profile: UserProfile = {
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
      injuryNotes: "Reprise syndrome bandelette ilio-tibiale (TFL). Douleur déclenchée vers 3-4km. Suivi kiné hebdomadaire. Semelles podologue récentes.",
      fitnessLevel: "intermediate",
      garminAccessToken: null,
      garminRefreshToken: null,
      garminUserId: null,
    };
    this.profiles.set(1, profile);
    this.nextIds.profile = 2;

    // Seed sample activities (last 4 weeks)
    const sampleActivities: InsertActivity[] = [
      { date: "2026-03-17", type: "easy_run", name: "Footing récup", distanceKm: 5.2, durationMinutes: 34, avgPaceMinKm: 6.54, avgHr: 142, maxHr: 155, cadence: 168, elevationGain: 25, calories: 420, feeling: 4, notes: "Bonnes sensations, pas de douleur TFL", source: "manual", garminActivityId: null, laps: null },
      { date: "2026-03-15", type: "long_run", name: "Sortie longue Boulogne", distanceKm: 8.1, durationMinutes: 52, avgPaceMinKm: 6.42, avgHr: 148, maxHr: 168, cadence: 170, elevationGain: 45, calories: 680, feeling: 3, notes: "Légère gêne TFL après 6km, bien géré", source: "manual", garminActivityId: null, laps: null },
      { date: "2026-03-12", type: "intervals", name: "Fractionné 6x400m", distanceKm: 6.0, durationMinutes: 35, avgPaceMinKm: 5.83, avgHr: 156, maxHr: 178, cadence: 176, elevationGain: 15, calories: 510, feeling: 4, notes: "400m en 1:50-1:55, bonne récup entre", source: "manual", garminActivityId: null, laps: null },
      { date: "2026-03-10", type: "easy_run", name: "Footing matinal", distanceKm: 4.5, durationMinutes: 30, avgPaceMinKm: 6.67, avgHr: 138, maxHr: 150, cadence: 166, elevationGain: 20, calories: 365, feeling: 4, notes: "", source: "manual", garminActivityId: null, laps: null },
      { date: "2026-03-08", type: "tempo", name: "Tempo run", distanceKm: 6.5, durationMinutes: 37, avgPaceMinKm: 5.69, avgHr: 160, maxHr: 172, cadence: 174, elevationGain: 30, calories: 550, feeling: 3, notes: "Allure soutenue, dernier km plus dur", source: "manual", garminActivityId: null, laps: null },
      { date: "2026-03-05", type: "easy_run", name: "Footing léger", distanceKm: 5.0, durationMinutes: 33, avgPaceMinKm: 6.60, avgHr: 140, maxHr: 152, cadence: 167, elevationGain: 18, calories: 400, feeling: 5, notes: "Aucune gêne, très bon feeling", source: "manual", garminActivityId: null, laps: null },
      { date: "2026-03-03", type: "intervals", name: "6/1 blocs progressifs", distanceKm: 5.5, durationMinutes: 33, avgPaceMinKm: 6.0, avgHr: 152, maxHr: 175, cadence: 172, elevationGain: 22, calories: 470, feeling: 3, notes: "Blocs 6min course / 1min marche", source: "manual", garminActivityId: null, laps: null },
      { date: "2026-03-01", type: "long_run", name: "Sortie longue", distanceKm: 7.5, durationMinutes: 50, avgPaceMinKm: 6.67, avgHr: 146, maxHr: 165, cadence: 169, elevationGain: 40, calories: 630, feeling: 3, notes: "Bonne progression", source: "manual", garminActivityId: null, laps: null },
      { date: "2026-02-27", type: "easy_run", name: "Footing", distanceKm: 4.0, durationMinutes: 27, avgPaceMinKm: 6.75, avgHr: 136, maxHr: 148, cadence: 165, elevationGain: 15, calories: 320, feeling: 4, notes: "", source: "manual", garminActivityId: null, laps: null },
      { date: "2026-02-24", type: "easy_run", name: "Reprise douce", distanceKm: 3.5, durationMinutes: 25, avgPaceMinKm: 7.14, avgHr: 132, maxHr: 145, cadence: 162, elevationGain: 10, calories: 275, feeling: 3, notes: "Post semelles podologue, prudent", source: "manual", garminActivityId: null, laps: null },
    ];

    sampleActivities.forEach(a => {
      const id = this.nextIds.activity++;
      this.activitiesMap.set(id, { ...a, id } as Activity);
    });

    // Seed weight entries
    const weightData: InsertWeightEntry[] = [
      { date: "2026-03-19", weight: 92.5, bodyFat: 22.1, notes: null },
      { date: "2026-03-16", weight: 92.8, bodyFat: 22.3, notes: null },
      { date: "2026-03-12", weight: 93.0, bodyFat: 22.4, notes: null },
      { date: "2026-03-08", weight: 93.2, bodyFat: 22.5, notes: null },
      { date: "2026-03-04", weight: 93.5, bodyFat: 22.7, notes: null },
      { date: "2026-02-28", weight: 93.8, bodyFat: 22.9, notes: null },
      { date: "2026-02-24", weight: 94.0, bodyFat: 23.0, notes: "Début suivi" },
    ];
    weightData.forEach(w => {
      const id = this.nextIds.weight++;
      this.weightMap.set(id, { ...w, id } as WeightEntry);
    });

    // Seed training plan (3 weeks to race)
    this.generateTrainingPlan();

    // Seed coaching advice
    const adviceData: InsertCoachingAdvice[] = [
      { date: "2026-03-19", category: "training", title: "Charge progressive respectée", content: "Ta montée en volume est régulière (+10-15% par semaine). Continue sur ce rythme. La prochaine sortie longue peut viser 9km.", priority: "info" },
      { date: "2026-03-19", category: "injury", title: "TFL sous contrôle", content: "La gêne TFL apparaît après 6km mais reste gérable. Continue le renforcement et les étirements post-séance. Si la douleur augmente, réduire les intervalles.", priority: "warning" },
      { date: "2026-03-19", category: "recovery", title: "Récupération optimale", content: "Ton rythme cardiaque de repos est stable à 58bpm. Bonne récupération entre les séances. Maintiens 48h entre séances intensives.", priority: "info" },
      { date: "2026-03-19", category: "nutrition", title: "Hydratation pré-course", content: "Avec ton objectif de perte de poids, veille à maintenir un apport glucidique suffisant avant les séances d'intensité. 30-40g de glucides 1h avant.", priority: "info" },
    ];
    adviceData.forEach(a => {
      const id = this.nextIds.advice++;
      this.adviceMap.set(id, { ...a, id } as CoachingAdvice);
    });
  }

  private generateTrainingPlan() {
    // Generate 3 weeks of training for 10km race on April 5
    const weeks = [
      // Week 1 (Mar 16-22) - Build
      [
        { dayOfWeek: 0, date: "2026-03-16", sessionType: "rest", description: "Repos ou marche active 30min", targetDistanceKm: null, targetPaceMinKm: null, targetDurationMinutes: 30 },
        { dayOfWeek: 1, date: "2026-03-17", sessionType: "easy_run", description: "Footing endurance fondamentale", targetDistanceKm: 5, targetPaceMinKm: "6:30-7:00", targetDurationMinutes: 35 },
        { dayOfWeek: 2, date: "2026-03-18", sessionType: "strength", description: "Renforcement: squats, fentes, gainage, exercices TFL", targetDistanceKm: null, targetPaceMinKm: null, targetDurationMinutes: 40 },
        { dayOfWeek: 3, date: "2026-03-19", sessionType: "intervals", description: "Fractionné: 8x400m R=1'30\" en 1:50-1:55", targetDistanceKm: 6.5, targetPaceMinKm: "4:40-4:50", targetDurationMinutes: 40 },
        { dayOfWeek: 4, date: "2026-03-20", sessionType: "rest", description: "Repos complet", targetDistanceKm: null, targetPaceMinKm: null, targetDurationMinutes: null },
        { dayOfWeek: 5, date: "2026-03-21", sessionType: "easy_run", description: "Footing souple + 4 accélérations progressives", targetDistanceKm: 5, targetPaceMinKm: "6:20-6:45", targetDurationMinutes: 32 },
        { dayOfWeek: 6, date: "2026-03-22", sessionType: "long_run", description: "Sortie longue allure confortable. Surveiller TFL après 6km.", targetDistanceKm: 9, targetPaceMinKm: "6:30-7:00", targetDurationMinutes: 60 },
      ],
      // Week 2 (Mar 23-29) - Peak
      [
        { dayOfWeek: 0, date: "2026-03-23", sessionType: "rest", description: "Repos ou marche 30min + étirements", targetDistanceKm: null, targetPaceMinKm: null, targetDurationMinutes: 30 },
        { dayOfWeek: 1, date: "2026-03-24", sessionType: "easy_run", description: "Footing récupération", targetDistanceKm: 5, targetPaceMinKm: "6:30-7:00", targetDurationMinutes: 35 },
        { dayOfWeek: 2, date: "2026-03-25", sessionType: "strength", description: "Renforcement musculaire + exercices TFL", targetDistanceKm: null, targetPaceMinKm: null, targetDurationMinutes: 40 },
        { dayOfWeek: 3, date: "2026-03-26", sessionType: "tempo", description: "Tempo: 20min à allure 10km (5:45-5:55/km)", targetDistanceKm: 7, targetPaceMinKm: "5:45-5:55", targetDurationMinutes: 42 },
        { dayOfWeek: 4, date: "2026-03-27", sessionType: "rest", description: "Repos complet", targetDistanceKm: null, targetPaceMinKm: null, targetDurationMinutes: null },
        { dayOfWeek: 5, date: "2026-03-28", sessionType: "easy_run", description: "Footing léger", targetDistanceKm: 4, targetPaceMinKm: "6:30-7:00", targetDurationMinutes: 28 },
        { dayOfWeek: 6, date: "2026-03-29", sessionType: "long_run", description: "Dernière sortie longue: 10km test allure course", targetDistanceKm: 10, targetPaceMinKm: "5:50-6:10", targetDurationMinutes: 60 },
      ],
      // Week 3 (Mar 30 - Apr 5) - Taper + Race
      [
        { dayOfWeek: 0, date: "2026-03-30", sessionType: "rest", description: "Repos complet", targetDistanceKm: null, targetPaceMinKm: null, targetDurationMinutes: null },
        { dayOfWeek: 1, date: "2026-03-31", sessionType: "easy_run", description: "Footing léger + 3 lignes droites", targetDistanceKm: 4, targetPaceMinKm: "6:30-7:00", targetDurationMinutes: 28 },
        { dayOfWeek: 2, date: "2026-04-01", sessionType: "strength", description: "Renforcement léger: gainage + mobilité", targetDistanceKm: null, targetPaceMinKm: null, targetDurationMinutes: 30 },
        { dayOfWeek: 3, date: "2026-04-02", sessionType: "intervals", description: "Rappel vitesse: 4x200m rapide R=2'", targetDistanceKm: 4, targetPaceMinKm: "4:30", targetDurationMinutes: 25 },
        { dayOfWeek: 4, date: "2026-04-03", sessionType: "rest", description: "Repos complet - veille de J-2", targetDistanceKm: null, targetPaceMinKm: null, targetDurationMinutes: null },
        { dayOfWeek: 5, date: "2026-04-04", sessionType: "easy_run", description: "Trot léger 15min + 2 accélérations. Préparer affaires course.", targetDistanceKm: 2.5, targetPaceMinKm: "6:30", targetDurationMinutes: 15 },
        { dayOfWeek: 6, date: "2026-04-05", sessionType: "race", description: "COURSE: 10km du Bois de Boulogne. Objectif: 58:00. Départ prudent, accélérer après 5km.", targetDistanceKm: 10, targetPaceMinKm: "5:48", targetDurationMinutes: 58 },
      ],
    ];

    weeks.forEach((week, wi) => {
      week.forEach(session => {
        const id = this.nextIds.plan++;
        this.planMap.set(id, {
          ...session,
          id,
          weekNumber: wi + 1,
          completed: session.date < "2026-03-19",
          actualActivityId: null,
          notes: null,
        } as TrainingPlan);
      });
    });
  }

  // Profile
  async getProfile(): Promise<UserProfile | undefined> {
    return this.profiles.get(1);
  }

  async upsertProfile(profile: InsertUserProfile): Promise<UserProfile> {
    const existing = this.profiles.get(1);
    const updated: UserProfile = { ...existing, ...profile, id: 1 } as UserProfile;
    this.profiles.set(1, updated);
    return updated;
  }

  // Activities
  async getActivities(limit = 50): Promise<Activity[]> {
    return Array.from(this.activitiesMap.values())
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, limit);
  }

  async getActivitiesByDateRange(startDate: string, endDate: string): Promise<Activity[]> {
    return Array.from(this.activitiesMap.values())
      .filter(a => a.date >= startDate && a.date <= endDate)
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  async getActivity(id: number): Promise<Activity | undefined> {
    return this.activitiesMap.get(id);
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const id = this.nextIds.activity++;
    const newActivity = { ...activity, id } as Activity;
    this.activitiesMap.set(id, newActivity);
    return newActivity;
  }

  async deleteActivity(id: number): Promise<void> {
    this.activitiesMap.delete(id);
  }

  // Weight
  async getWeightEntries(limit = 50): Promise<WeightEntry[]> {
    return Array.from(this.weightMap.values())
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, limit);
  }

  async createWeightEntry(entry: InsertWeightEntry): Promise<WeightEntry> {
    const id = this.nextIds.weight++;
    const newEntry = { ...entry, id } as WeightEntry;
    this.weightMap.set(id, newEntry);
    return newEntry;
  }

  async deleteWeightEntry(id: number): Promise<void> {
    this.weightMap.delete(id);
  }

  // Training plan
  async getTrainingPlan(): Promise<TrainingPlan[]> {
    return Array.from(this.planMap.values())
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  async getTrainingPlanByWeek(weekNumber: number): Promise<TrainingPlan[]> {
    return Array.from(this.planMap.values())
      .filter(s => s.weekNumber === weekNumber)
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  async createTrainingSession(session: InsertTrainingPlan): Promise<TrainingPlan> {
    const id = this.nextIds.plan++;
    const newSession = { ...session, id } as TrainingPlan;
    this.planMap.set(id, newSession);
    return newSession;
  }

  async updateTrainingSession(id: number, updates: Partial<InsertTrainingPlan>): Promise<TrainingPlan> {
    const existing = this.planMap.get(id);
    if (!existing) throw new Error("Session not found");
    const updated = { ...existing, ...updates };
    this.planMap.set(id, updated);
    return updated;
  }

  async clearTrainingPlan(): Promise<void> {
    this.planMap.clear();
  }

  // Coaching
  async getCoachingAdvice(limit = 20): Promise<CoachingAdvice[]> {
    return Array.from(this.adviceMap.values())
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, limit);
  }

  async createCoachingAdvice(advice: InsertCoachingAdvice): Promise<CoachingAdvice> {
    const id = this.nextIds.advice++;
    const newAdvice = { ...advice, id } as CoachingAdvice;
    this.adviceMap.set(id, newAdvice);
    return newAdvice;
  }
}

export const storage = new MemStorage();

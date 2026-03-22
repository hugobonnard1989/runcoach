import { pgTable, text, serial, integer, real, timestamp, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User profile
export const userProfile = pgTable("user_profile", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  age: integer("age"),
  weight: real("weight"), // kg
  height: real("height"), // cm
  restingHr: integer("resting_hr"),
  maxHr: integer("max_hr"),
  weeklyGoalKm: real("weekly_goal_km"),
  targetRace: text("target_race"),
  targetDate: text("target_date"),
  targetTime: text("target_time"), // e.g. "55:00" for 10km
  injuryNotes: text("injury_notes"),
  fitnessLevel: text("fitness_level"), // beginner, intermediate, advanced
  garminAccessToken: text("garmin_access_token"),
  garminRefreshToken: text("garmin_refresh_token"),
  garminUserId: text("garmin_user_id"),
});

export const insertUserProfileSchema = createInsertSchema(userProfile).omit({ id: true });
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type UserProfile = typeof userProfile.$inferSelect;

// Running activities
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(), // ISO date
  type: text("type").notNull(), // easy_run, tempo, intervals, long_run, recovery, race
  name: text("name").notNull(),
  distanceKm: real("distance_km").notNull(),
  durationMinutes: real("duration_minutes").notNull(),
  avgPaceMinKm: real("avg_pace_min_km"), // min/km
  avgHr: integer("avg_hr"),
  maxHr: integer("max_hr"),
  cadence: integer("cadence"),
  elevationGain: integer("elevation_gain"),
  calories: integer("calories"),
  feeling: integer("feeling"), // 1-5 RPE
  notes: text("notes"),
  source: text("source"), // garmin, manual, gpx_import
  garminActivityId: text("garmin_activity_id"),
  laps: json("laps"), // Array of lap data
});

export const insertActivitySchema = createInsertSchema(activities).omit({ id: true });
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activities.$inferSelect;

// Weight tracking
export const weightEntries = pgTable("weight_entries", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(),
  weight: real("weight").notNull(), // kg
  bodyFat: real("body_fat"), // percentage
  notes: text("notes"),
});

export const insertWeightEntrySchema = createInsertSchema(weightEntries).omit({ id: true });
export type InsertWeightEntry = z.infer<typeof insertWeightEntrySchema>;
export type WeightEntry = typeof weightEntries.$inferSelect;

// Training plan
export const trainingPlan = pgTable("training_plan", {
  id: serial("id").primaryKey(),
  weekNumber: integer("week_number").notNull(),
  dayOfWeek: integer("day_of_week").notNull(), // 0=Mon, 6=Sun
  date: text("date").notNull(),
  sessionType: text("session_type").notNull(), // easy_run, tempo, intervals, long_run, rest, cross_training, strength
  description: text("description").notNull(),
  targetDistanceKm: real("target_distance_km"),
  targetPaceMinKm: text("target_pace_min_km"), // e.g. "6:00-6:30"
  targetDurationMinutes: integer("target_duration_minutes"),
  completed: boolean("completed").default(false),
  actualActivityId: integer("actual_activity_id"),
  notes: text("notes"),
});

export const insertTrainingPlanSchema = createInsertSchema(trainingPlan).omit({ id: true });
export type InsertTrainingPlan = z.infer<typeof insertTrainingPlanSchema>;
export type TrainingPlan = typeof trainingPlan.$inferSelect;

// Coaching advice log
export const coachingAdvice = pgTable("coaching_advice", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(),
  category: text("category").notNull(), // training, recovery, nutrition, injury
  title: text("title").notNull(),
  content: text("content").notNull(),
  priority: text("priority").notNull(), // info, warning, alert
});

export const insertCoachingAdviceSchema = createInsertSchema(coachingAdvice).omit({ id: true });
export type InsertCoachingAdvice = z.infer<typeof insertCoachingAdviceSchema>;
export type CoachingAdvice = typeof coachingAdvice.$inferSelect;

export type WeekDay =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export interface UserProfile {
  id: string;
  name: string;
  /** ISO tarih (yyyy-mm-dd) */
  examDate: string | null;
  dailyStudyTargetMinutes: number;
  weeklyStudyDays: WeekDay[];
  /** Örn. ["09:00-12:00", "19:00-21:00"] */
  preferredStudyHours: string[];
  targetRanking: number | null;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

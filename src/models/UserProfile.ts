export type WeekDay =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export type StudyLevel = "baslangic" | "orta" | "iyi";

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
  /** Phase 1A: kurulum sırasında seçilen seviyeler ve ders tercihleri */
  tytLevel?: StudyLevel | null;
  aytLevel?: StudyLevel | null;
  strongSubjectIds?: string[];
  weakSubjectIds?: string[];
  /** Phase 5: dinlenme günü; eski profillerde bulunmayabilir. */
  restDay?: WeekDay | null;
  /** Phase 5: Bölüm Keşfi'nde favorilenen bölümlerin id'leri; eski profillerde bulunmayabilir. */
  favoriteDepartmentIds?: string[];
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

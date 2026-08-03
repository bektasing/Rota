export type ReviewStage = "day1" | "day3" | "day7" | "day14" | "day30";
export type ReviewStatus = "pending" | "completed";

export interface ReviewItem {
  id: string;
  mistakeId: string | null;
  subjectId: string;
  topicId: string | null;
  title: string;
  /** ISO tarih (yyyy-mm-dd) */
  scheduledDate: string;
  stage: ReviewStage;
  status: ReviewStatus;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

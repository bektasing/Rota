import type { ReviewStage } from "@/models/ReviewItem";

export const REVIEW_STAGE_ORDER: ReviewStage[] = ["day1", "day3", "day7", "day14", "day30"];

export const REVIEW_STAGE_DAYS: Record<ReviewStage, number> = {
  day1: 1,
  day3: 3,
  day7: 7,
  day14: 14,
  day30: 30,
};

export const REVIEW_STAGE_LABELS: Record<ReviewStage, string> = {
  day1: "1 gün",
  day3: "3 gün",
  day7: "7 gün",
  day14: "14 gün",
  day30: "30 gün",
};

/** Bir sonraki tekrar aşamasını döner; son aşamaysa null döner. */
export function nextReviewStage(stage: ReviewStage): ReviewStage | null {
  const index = REVIEW_STAGE_ORDER.indexOf(stage);
  if (index === -1 || index === REVIEW_STAGE_ORDER.length - 1) return null;
  return REVIEW_STAGE_ORDER[index + 1];
}

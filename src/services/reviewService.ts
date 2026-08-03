import { nextReviewStage, REVIEW_STAGE_DAYS } from "@/constants/review";
import type { MistakeRecord } from "@/models/MistakeRecord";
import type { ReviewItem } from "@/models/ReviewItem";
import { reviewItemRepository } from "@/repositories/reviewItemRepository";
import { addDays, fromDateKey, toDateKey } from "@/utils/date";
import { generateId } from "@/utils/id";

function addDaysToDateKey(dateKey: string, days: number): string {
  return toDateKey(addDays(fromDateKey(dateKey), days));
}

/** Bir yanlış kaydı oluşturulduğunda ilk tekrarı (1 gün sonrası) otomatik oluşturur. */
export async function createFirstReviewForMistake(mistake: MistakeRecord): Promise<void> {
  const now = new Date().toISOString();
  const today = toDateKey(new Date());

  await reviewItemRepository.add({
    id: generateId(),
    mistakeId: mistake.id,
    subjectId: mistake.subjectId,
    topicId: mistake.topicId,
    title: mistake.title,
    scheduledDate: addDaysToDateKey(today, 1),
    stage: "day1",
    status: "pending",
    completedAt: null,
    createdAt: now,
    updatedAt: now,
  });
}

/**
 * Bir tekrarı tamamlar. Yanlış kaydına bağlıysa ve son aşama değilse sıradaki
 * aşamayı oluşturur (aynı aşama için ikinci kez oluşturmaz).
 */
export async function completeReviewItem(item: ReviewItem): Promise<void> {
  const now = new Date().toISOString();
  const today = toDateKey(new Date());

  await reviewItemRepository.put({ ...item, status: "completed", completedAt: now, updatedAt: now });

  if (!item.mistakeId) return;

  const next = nextReviewStage(item.stage);
  if (!next) return;

  const existing = await reviewItemRepository.getByMistakeId(item.mistakeId);
  if (existing.some((review) => review.stage === next)) return;

  await reviewItemRepository.add({
    id: generateId(),
    mistakeId: item.mistakeId,
    subjectId: item.subjectId,
    topicId: item.topicId,
    title: item.title,
    scheduledDate: addDaysToDateKey(today, REVIEW_STAGE_DAYS[next]),
    stage: next,
    status: "pending",
    completedAt: null,
    createdAt: now,
    updatedAt: now,
  });
}

/** Bekleyen bir tekrarı bir gün ileri erteler. */
export async function postponeReviewItem(item: ReviewItem): Promise<void> {
  await reviewItemRepository.put({
    ...item,
    scheduledDate: addDaysToDateKey(item.scheduledDate, 1),
    updatedAt: new Date().toISOString(),
  });
}

/** Bir yanlış silinirken ona bağlı bekleyen tekrarları güvenli şekilde siler. */
export async function deletePendingReviewsForMistake(mistakeId: string): Promise<void> {
  const items = await reviewItemRepository.getByMistakeId(mistakeId);
  await Promise.all(
    items.filter((item) => item.status === "pending").map((item) => reviewItemRepository.remove(item.id)),
  );
}

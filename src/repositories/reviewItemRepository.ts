import { BaseRepository } from "@/repositories/BaseRepository";
import { runTransaction, STORE_NAMES } from "@/repositories/db";
import type { ReviewItem } from "@/models/ReviewItem";

class ReviewItemRepository extends BaseRepository<ReviewItem> {
  constructor() {
    super(STORE_NAMES.reviewItems);
  }

  getByMistakeId(mistakeId: string): Promise<ReviewItem[]> {
    return runTransaction<ReviewItem[]>(this.storeName, "readonly", (store) =>
      store.index("mistakeId").getAll(mistakeId) as IDBRequest<ReviewItem[]>,
    );
  }
}

export const reviewItemRepository = new ReviewItemRepository();

import { BaseRepository } from "@/repositories/BaseRepository";
import { runTransaction, STORE_NAMES } from "@/repositories/db";
import type { Topic } from "@/models/Topic";

class TopicRepository extends BaseRepository<Topic> {
  constructor() {
    super(STORE_NAMES.topics);
  }

  getBySubjectId(subjectId: string): Promise<Topic[]> {
    return runTransaction<Topic[]>(this.storeName, "readonly", (store) =>
      store.index("subjectId").getAll(subjectId) as IDBRequest<Topic[]>,
    );
  }
}

export const topicRepository = new TopicRepository();

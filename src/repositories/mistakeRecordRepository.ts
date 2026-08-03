import { BaseRepository } from "@/repositories/BaseRepository";
import { runTransaction, STORE_NAMES } from "@/repositories/db";
import type { MistakeRecord } from "@/models/MistakeRecord";

class MistakeRecordRepository extends BaseRepository<MistakeRecord> {
  constructor() {
    super(STORE_NAMES.mistakeRecords);
  }

  getByExamId(examId: string): Promise<MistakeRecord[]> {
    return runTransaction<MistakeRecord[]>(this.storeName, "readonly", (store) =>
      store.index("examId").getAll(examId) as IDBRequest<MistakeRecord[]>,
    );
  }
}

export const mistakeRecordRepository = new MistakeRecordRepository();

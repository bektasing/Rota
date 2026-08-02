import { BaseRepository } from "@/repositories/BaseRepository";
import { runTransaction, STORE_NAMES } from "@/repositories/db";
import type { StudySession } from "@/models/StudySession";

class StudySessionRepository extends BaseRepository<StudySession> {
  constructor() {
    super(STORE_NAMES.studySessions);
  }

  getByDate(date: string): Promise<StudySession[]> {
    return runTransaction<StudySession[]>(this.storeName, "readonly", (store) =>
      store.index("date").getAll(date) as IDBRequest<StudySession[]>,
    );
  }
}

export const studySessionRepository = new StudySessionRepository();

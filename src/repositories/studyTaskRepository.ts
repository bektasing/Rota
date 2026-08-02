import { BaseRepository } from "@/repositories/BaseRepository";
import { runTransaction, STORE_NAMES } from "@/repositories/db";
import type { StudyTask } from "@/models/StudyTask";

class StudyTaskRepository extends BaseRepository<StudyTask> {
  constructor() {
    super(STORE_NAMES.studyTasks);
  }

  getByDate(date: string): Promise<StudyTask[]> {
    return runTransaction<StudyTask[]>(this.storeName, "readonly", (store) =>
      store.index("date").getAll(date) as IDBRequest<StudyTask[]>,
    );
  }
}

export const studyTaskRepository = new StudyTaskRepository();

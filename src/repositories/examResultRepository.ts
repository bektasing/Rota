import { BaseRepository } from "@/repositories/BaseRepository";
import { STORE_NAMES } from "@/repositories/db";
import type { ExamResult } from "@/models/ExamResult";

class ExamResultRepository extends BaseRepository<ExamResult> {
  constructor() {
    super(STORE_NAMES.examResults);
  }
}

export const examResultRepository = new ExamResultRepository();

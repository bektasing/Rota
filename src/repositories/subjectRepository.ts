import { BaseRepository } from "@/repositories/BaseRepository";
import { STORE_NAMES } from "@/repositories/db";
import type { Subject } from "@/models/Subject";

class SubjectRepository extends BaseRepository<Subject> {
  constructor() {
    super(STORE_NAMES.subjects);
  }
}

export const subjectRepository = new SubjectRepository();

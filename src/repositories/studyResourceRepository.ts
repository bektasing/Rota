import { BaseRepository } from "@/repositories/BaseRepository";
import { STORE_NAMES } from "@/repositories/db";
import type { StudyResource } from "@/models/StudyResource";

class StudyResourceRepository extends BaseRepository<StudyResource> {
  constructor() {
    super(STORE_NAMES.studyResources);
  }
}

export const studyResourceRepository = new StudyResourceRepository();

import { BaseRepository } from "@/repositories/BaseRepository";
import { STORE_NAMES } from "@/repositories/db";
import type { StudyNote } from "@/models/StudyNote";

class StudyNoteRepository extends BaseRepository<StudyNote> {
  constructor() {
    super(STORE_NAMES.studyNotes);
  }
}

export const studyNoteRepository = new StudyNoteRepository();

import type { RotaBackup } from "@/models/backup";
import {
  goalRepository,
  studyNoteRepository,
  studyResourceRepository,
  studyTaskRepository,
  subjectRepository,
  topicRepository,
  userProfileRepository,
} from "@/repositories";
import { validateBackup } from "@/utils/validation";

const BACKUP_VERSION = 1;

export async function createBackup(): Promise<RotaBackup> {
  const [userProfile, subjects, topics, studyTasks, goals, studyResources, studyNotes] = await Promise.all([
    userProfileRepository.getProfile(),
    subjectRepository.getAll(),
    topicRepository.getAll(),
    studyTaskRepository.getAll(),
    goalRepository.getAll(),
    studyResourceRepository.getAll(),
    studyNoteRepository.getAll(),
  ]);

  return {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    data: {
      userProfile: userProfile ?? null,
      subjects,
      topics,
      studyTasks,
      goals,
      studyResources,
      studyNotes,
    },
  };
}

export interface RestoreResult {
  success: boolean;
  error?: string;
}

/**
 * Yedeği doğrular ve geçerliyse mevcut verinin tamamının yerine yazar.
 * Bozuk bir dosya mevcut veriye asla dokunmaz.
 * Eski yedeklerde bulunmayan koleksiyonlar boş kabul edilir.
 */
export async function restoreBackup(raw: unknown): Promise<RestoreResult> {
  const result = validateBackup(raw);

  if (!result.valid) {
    return { success: false, error: result.error };
  }

  const { data } = result.data;

  await Promise.all([
    subjectRepository.clear(),
    topicRepository.clear(),
    studyTaskRepository.clear(),
    goalRepository.clear(),
    studyResourceRepository.clear(),
    studyNoteRepository.clear(),
    userProfileRepository.clear(),
  ]);

  const writes: Array<Promise<unknown>> = [
    ...data.subjects.map((subject) => subjectRepository.add(subject)),
    ...data.topics.map((topic) => topicRepository.add(topic)),
    ...data.studyTasks.map((task) => studyTaskRepository.add(task)),
    ...data.goals.map((goal) => goalRepository.add(goal)),
    ...data.studyResources.map((resource) => studyResourceRepository.add(resource)),
    ...data.studyNotes.map((note) => studyNoteRepository.add(note)),
  ];

  if (data.userProfile) {
    writes.push(userProfileRepository.add(data.userProfile));
  }

  await Promise.all(writes);

  return { success: true };
}

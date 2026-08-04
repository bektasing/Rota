import type { RotaBackup, RotaBackupData } from "@/models/backup";
import {
  examResultRepository,
  goalRepository,
  mistakeRecordRepository,
  reviewItemRepository,
  studyNoteRepository,
  studyResourceRepository,
  studySessionRepository,
  studyTaskRepository,
  subjectRepository,
  topicRepository,
  userProfileRepository,
} from "@/repositories";
import { runWriteTransaction, STORE_NAMES, type StoreName } from "@/repositories/db";
import { validateBackup } from "@/utils/validation";

export const BACKUP_VERSION = 2;
export const BACKUP_APP_NAME = "Rota";

/** Yedekteki koleksiyonların hangi object store'a yazılacağı. */
const COLLECTION_STORES: [key: keyof RotaBackupData, store: StoreName][] = [
  ["subjects", STORE_NAMES.subjects],
  ["topics", STORE_NAMES.topics],
  ["studyTasks", STORE_NAMES.studyTasks],
  ["studySessions", STORE_NAMES.studySessions],
  ["examResults", STORE_NAMES.examResults],
  ["mistakeRecords", STORE_NAMES.mistakeRecords],
  ["reviewItems", STORE_NAMES.reviewItems],
  ["goals", STORE_NAMES.goals],
  ["studyResources", STORE_NAMES.studyResources],
  ["studyNotes", STORE_NAMES.studyNotes],
];

export async function createBackup(): Promise<RotaBackup> {
  const [
    userProfile,
    subjects,
    topics,
    studyTasks,
    studySessions,
    examResults,
    mistakeRecords,
    reviewItems,
    goals,
    studyResources,
    studyNotes,
  ] = await Promise.all([
    userProfileRepository.getProfile(),
    subjectRepository.getAll(),
    topicRepository.getAll(),
    studyTaskRepository.getAll(),
    studySessionRepository.getAll(),
    examResultRepository.getAll(),
    mistakeRecordRepository.getAll(),
    reviewItemRepository.getAll(),
    goalRepository.getAll(),
    studyResourceRepository.getAll(),
    studyNoteRepository.getAll(),
  ]);

  return {
    version: BACKUP_VERSION,
    app: BACKUP_APP_NAME,
    exportedAt: new Date().toISOString(),
    data: {
      userProfile: userProfile ?? null,
      subjects,
      topics,
      studyTasks,
      studySessions,
      examResults,
      mistakeRecords,
      reviewItems,
      goals,
      studyResources,
      studyNotes,
    },
  };
}

export interface BackupSummary {
  subjects: number;
  topics: number;
  studyTasks: number;
  studySessions: number;
  examResults: number;
  mistakeRecords: number;
  reviewItems: number;
  goals: number;
  studyResources: number;
  studyNotes: number;
  hasProfile: boolean;
}

/** Geri yükleme onayından önce kullanıcıya gösterilecek içerik özeti. */
export function summarizeBackup(backup: RotaBackup): BackupSummary {
  const { data } = backup;

  return {
    subjects: data.subjects.length,
    topics: data.topics.length,
    studyTasks: data.studyTasks.length,
    studySessions: data.studySessions.length,
    examResults: data.examResults.length,
    mistakeRecords: data.mistakeRecords.length,
    reviewItems: data.reviewItems.length,
    goals: data.goals.length,
    studyResources: data.studyResources.length,
    studyNotes: data.studyNotes.length,
    hasProfile: data.userProfile !== null,
  };
}

export interface RestoreResult {
  success: boolean;
  error?: string;
}

/**
 * Doğrulanmış bir yedeği tek bir IndexedDB transaction'ında uygular:
 * önce tüm store'lar temizlenir, sonra yedekteki kayıtlar yazılır.
 * Herhangi bir adım hata verirse transaction geri alınır; kısmi restore oluşmaz.
 * Birleştirme (merge) yapılmaz, mevcut veri yedekteki tam durumla değiştirilir.
 */
export async function applyBackup(backup: RotaBackup): Promise<RestoreResult> {
  const { data } = backup;
  const stores: StoreName[] = [...COLLECTION_STORES.map(([, store]) => store), STORE_NAMES.userProfile];

  try {
    await runWriteTransaction(stores, (getStore) => {
      for (const store of stores) {
        getStore(store).clear();
      }

      for (const [key, storeName] of COLLECTION_STORES) {
        const store = getStore(storeName);
        for (const item of data[key] as { id: string }[]) {
          store.put(item);
        }
      }

      if (data.userProfile) {
        getStore(STORE_NAMES.userProfile).put(data.userProfile);
      }
    });
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Yedek geri yüklenirken bir hata oluştu.",
    };
  }

  return { success: true };
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

  return applyBackup(result.data);
}

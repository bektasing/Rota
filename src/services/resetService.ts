import { FIXED_EXAM_DATE, FIXED_USER_NAME } from "@/constants/profile";
import type { UserProfile } from "@/models/UserProfile";
import { userProfileRepository } from "@/repositories";
import { runWriteTransaction, STORE_NAMES, type StoreName } from "@/repositories/db";
import { ensureDefaultSubjectsSeeded } from "@/services/bootstrapService";
import { clearActiveTimer } from "@/utils/timer";

/** Sıfırlamada silinen çalışma verisi store'ları (profil bilinçli olarak korunur). */
const RESET_STORES: StoreName[] = [
  STORE_NAMES.subjects,
  STORE_NAMES.topics,
  STORE_NAMES.studyTasks,
  STORE_NAMES.studySessions,
  STORE_NAMES.examResults,
  STORE_NAMES.mistakeRecords,
  STORE_NAMES.reviewItems,
  STORE_NAMES.goals,
  STORE_NAMES.studyResources,
  STORE_NAMES.studyNotes,
];

export interface ResetResult {
  success: boolean;
  error?: string;
}

/**
 * Tüm çalışma verilerini geri alınamaz şekilde siler ve varsayılan dersleri yeniden oluşturur.
 *
 * Korunanlar: Nisa profili, 19 Haziran 2027 sınav tarihi ve çalışma tercihleri
 * (günlük hedef, çalışma günleri, dinlenme günü, TYT/AYT seviyesi).
 * Güçlü/zayıf ders ve favori bölüm seçimleri, sildiğimiz derslerin id'lerine
 * bağlı oldukları için temizlenir; aksi hâlde yetim referans kalırdı.
 *
 * Silme işlemi tek bir transaction'da yapılır; yarıda kalırsa hiçbir store boşalmaz.
 */
export async function resetAllStudyData(): Promise<ResetResult> {
  const profile = await userProfileRepository.getProfile();

  try {
    await runWriteTransaction(RESET_STORES, (getStore) => {
      for (const store of RESET_STORES) {
        getStore(store).clear();
      }
    });
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Veriler sıfırlanırken bir hata oluştu.",
    };
  }

  // Ders tablosu boşaldığı için varsayılan TYT + AYT dersleri yeniden oluşur.
  await ensureDefaultSubjectsSeeded();

  if (profile) {
    const preserved: UserProfile = {
      ...profile,
      name: FIXED_USER_NAME,
      examDate: FIXED_EXAM_DATE,
      strongSubjectIds: [],
      weakSubjectIds: [],
      favoriteDepartmentIds: [],
      updatedAt: new Date().toISOString(),
    };
    await userProfileRepository.saveProfile(preserved);
  }

  clearActiveTimer();

  return { success: true };
}

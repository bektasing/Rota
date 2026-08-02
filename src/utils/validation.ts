import type { RotaBackup } from "@/models/backup";

export type BackupValidationResult =
  | { valid: true; data: RotaBackup }
  | { valid: false; error: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasValidId(item: unknown): item is { id: string } {
  return isRecord(item) && typeof item.id === "string" && item.id.length > 0;
}

/**
 * Dışa aktarılmış bir Rota yedek dosyasının beklenen şekle uyup uymadığını doğrular.
 * Bozuk veya yabancı bir JSON dosyası uygulamayı çökertmemeli; yalnızca reddedilmelidir.
 */
export function validateBackup(raw: unknown): BackupValidationResult {
  if (!isRecord(raw)) {
    return { valid: false, error: "Dosya geçerli bir yedek formatında değil." };
  }

  if (typeof raw.version !== "number") {
    return { valid: false, error: "Yedek dosyasında sürüm bilgisi eksik veya geçersiz." };
  }

  if (typeof raw.exportedAt !== "string") {
    return { valid: false, error: "Yedek dosyasında dışa aktarma tarihi eksik." };
  }

  if (!isRecord(raw.data)) {
    return { valid: false, error: "Yedek dosyasında veri alanı eksik." };
  }

  const { userProfile, subjects, topics, studyTasks } = raw.data;

  if (userProfile !== null && userProfile !== undefined && !hasValidId(userProfile)) {
    return { valid: false, error: "Kullanıcı profili verisi bozuk." };
  }

  if (!Array.isArray(subjects) || !subjects.every(hasValidId)) {
    return { valid: false, error: "Ders listesi bozuk." };
  }

  if (!Array.isArray(topics) || !topics.every(hasValidId)) {
    return { valid: false, error: "Konu listesi bozuk." };
  }

  if (!Array.isArray(studyTasks) || !studyTasks.every(hasValidId)) {
    return { valid: false, error: "Görev listesi bozuk." };
  }

  return {
    valid: true,
    data: {
      version: raw.version,
      exportedAt: raw.exportedAt,
      data: {
        userProfile: (userProfile as RotaBackup["data"]["userProfile"]) ?? null,
        subjects: subjects as RotaBackup["data"]["subjects"],
        topics: topics as RotaBackup["data"]["topics"],
        studyTasks: studyTasks as RotaBackup["data"]["studyTasks"],
      },
    },
  };
}

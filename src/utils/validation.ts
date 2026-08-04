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
 * Doğrulama, veri yazılmaya başlanmadan önce eksiksiz tamamlanır.
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

  // Sonradan eklenen koleksiyonlar eski yedeklerde bulunmaz; eksik olmaları dosyayı geçersiz kılmaz.
  const optional = readOptionalCollections(raw.data, [
    ["goals", "Hedef listesi bozuk."],
    ["studyResources", "Kaynak listesi bozuk."],
    ["studyNotes", "Not listesi bozuk."],
    ["studySessions", "Çalışma oturumu listesi bozuk."],
    ["examResults", "Deneme listesi bozuk."],
    ["mistakeRecords", "Yanlış listesi bozuk."],
    ["reviewItems", "Tekrar listesi bozuk."],
  ]);

  if (!optional.ok) {
    return { valid: false, error: optional.error };
  }

  const collections = optional.items;

  return {
    valid: true,
    data: {
      version: raw.version,
      app: typeof raw.app === "string" ? raw.app : undefined,
      exportedAt: raw.exportedAt,
      data: {
        userProfile: (userProfile as RotaBackup["data"]["userProfile"]) ?? null,
        subjects: subjects as RotaBackup["data"]["subjects"],
        topics: topics as RotaBackup["data"]["topics"],
        studyTasks: studyTasks as RotaBackup["data"]["studyTasks"],
        goals: collections.goals as RotaBackup["data"]["goals"],
        studyResources: collections.studyResources as RotaBackup["data"]["studyResources"],
        studyNotes: collections.studyNotes as RotaBackup["data"]["studyNotes"],
        studySessions: collections.studySessions as RotaBackup["data"]["studySessions"],
        examResults: collections.examResults as RotaBackup["data"]["examResults"],
        mistakeRecords: collections.mistakeRecords as RotaBackup["data"]["mistakeRecords"],
        reviewItems: collections.reviewItems as RotaBackup["data"]["reviewItems"],
      },
    },
  };
}

type OptionalCollectionsResult =
  | { ok: true; items: Record<string, { id: string }[]> }
  | { ok: false; error: string };

/** Yedekte bulunmayan (sonradan eklenmiş) koleksiyonları boş dizi kabul eder. */
function readOptionalCollections(
  data: Record<string, unknown>,
  entries: [key: string, errorMessage: string][],
): OptionalCollectionsResult {
  const items: Record<string, { id: string }[]> = {};

  for (const [key, errorMessage] of entries) {
    const value = data[key];

    if (value === undefined || value === null) {
      items[key] = [];
      continue;
    }

    if (!Array.isArray(value) || !value.every(hasValidId)) {
      return { ok: false, error: errorMessage };
    }

    items[key] = value;
  }

  return { ok: true, items };
}

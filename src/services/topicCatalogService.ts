import { TOPIC_CATALOG, type TopicCatalogEntry } from "@/constants/topicCatalog";
import type { ExamType, Subject } from "@/models/Subject";
import type { Topic } from "@/models/Topic";
import { topicRepository } from "@/repositories/topicRepository";
import { ensureDefaultSubjectsSeeded } from "@/services/bootstrapService";
import { generateId } from "@/utils/id";

let seedInFlight: Promise<void> | null = null;

function normalizeName(name: string): string {
  return name.trim().toLocaleLowerCase("tr-TR");
}

function subjectKey(examType: ExamType, name: string): string {
  return `${examType}::${normalizeName(name)}`;
}

/**
 * Görsellerden çıkarılan TYT/AYT konu kataloğunu mevcut derslere idempotent şekilde ekler.
 *
 * Güvenlik garantileri:
 * - Yalnızca eksik olan katalog konuları eklenir; hiçbir konu silinmez veya güncellenmez.
 * - Kullanıcının elle eklediği konular, mevcut durumlar (status) ve görev bağlantıları
 *   (topicId) dokunulmadan kalır.
 * - Eşleştirme hem sınav türüne hem ders adına bakar (aynı isimli TYT/AYT dersleri karışmaz).
 * - Kullanıcı varsayılan bir dersi yeniden adlandırmış veya silmişse, o ders için katalog
 *   konuları sessizce atlanır (zorla eşleştirme yapılmaz).
 * - Aynı anda gelen çağrılar (StrictMode'un efektleri iki kez çalıştırması gibi) aynı
 *   promise'i paylaşır; ardışık çağrılar da zaten var olan konuları tekrar eklemez.
 */
export function ensureTopicCatalogSeeded(): Promise<void> {
  if (!seedInFlight) {
    seedInFlight = seedTopicCatalog().finally(() => {
      seedInFlight = null;
    });
  }

  return seedInFlight;
}

async function seedTopicCatalog(): Promise<void> {
  const subjects = await ensureDefaultSubjectsSeeded();

  const subjectByKey = new Map<string, Subject>();
  for (const subject of subjects) {
    if (subject.examType === "OZEL") continue;
    subjectByKey.set(subjectKey(subject.examType, subject.name), subject);
  }

  const entriesBySubjectKey = new Map<string, TopicCatalogEntry[]>();
  for (const entry of TOPIC_CATALOG) {
    const key = subjectKey(entry.examType, entry.subjectName);
    const list = entriesBySubjectKey.get(key);
    if (list) {
      list.push(entry);
    } else {
      entriesBySubjectKey.set(key, [entry]);
    }
  }

  const now = new Date().toISOString();

  for (const [key, entries] of entriesBySubjectKey) {
    const subject = subjectByKey.get(key);
    if (!subject) continue;

    const existingTopics = await topicRepository.getBySubjectId(subject.id);
    const existingNames = new Set(existingTopics.map((topic) => normalizeName(topic.name)));
    let nextOrder = existingTopics.reduce((max, topic) => Math.max(max, topic.order), -1) + 1;

    const missing = [...entries]
      .filter((entry) => !existingNames.has(normalizeName(entry.topicName)))
      .sort((a, b) => a.order - b.order);

    for (const entry of missing) {
      const topic: Topic = {
        id: generateId(),
        subjectId: subject.id,
        name: entry.topicName,
        status: "not_started",
        difficulty: "medium",
        priority: "medium",
        masteryScore: 0,
        totalStudyMinutes: 0,
        totalQuestions: 0,
        correctCount: 0,
        incorrectCount: 0,
        blankCount: 0,
        lastStudiedAt: null,
        nextReviewAt: null,
        notes: "",
        order: nextOrder,
        createdAt: now,
        updatedAt: now,
      };
      nextOrder += 1;
      existingNames.add(normalizeName(entry.topicName));
      await topicRepository.add(topic);
    }
  }
}

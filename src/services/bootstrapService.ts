import { DEFAULT_SUBJECT_SEEDS } from "@/constants/subjects";
import type { Subject } from "@/models/Subject";
import { subjectRepository } from "@/repositories/subjectRepository";
import { generateId } from "@/utils/id";

let seedInFlight: Promise<Subject[]> | null = null;

/**
 * İlk açılışta ders tablosu boşsa varsayılan TYT + AYT Sayısal derslerini ekler.
 * Kullanıcı daha sonra bu dersleri düzenleyebilir veya pasif hale getirebilir.
 *
 * Aynı anda gelen çağrılar (örn. React StrictMode'un efektleri iki kez
 * çalıştırması) aynı promise'i paylaşır; aksi halde her iki çağrı da tabloyu
 * boş görüp dersleri iki kez eklerdi.
 */
export function ensureDefaultSubjectsSeeded(): Promise<Subject[]> {
  if (!seedInFlight) {
    seedInFlight = seedDefaultSubjects().finally(() => {
      seedInFlight = null;
    });
  }

  return seedInFlight;
}

async function seedDefaultSubjects(): Promise<Subject[]> {
  const existing = await subjectRepository.getAll();
  if (existing.length > 0) {
    return existing;
  }

  const now = new Date().toISOString();
  const subjects: Subject[] = DEFAULT_SUBJECT_SEEDS.map((seed, index) => ({
    id: generateId(),
    name: seed.name,
    examType: seed.examType,
    color: seed.color,
    icon: seed.icon,
    active: true,
    order: index,
    createdAt: now,
    updatedAt: now,
  }));

  await Promise.all(subjects.map((subject) => subjectRepository.add(subject)));

  return subjects;
}

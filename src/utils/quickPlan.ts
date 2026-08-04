import type { ExamType } from "@/models/Subject";
import type { TaskType } from "@/models/StudyTask";
import { addDays, toDateKey } from "@/utils/date";

export type QuickDayOption = "today" | "tomorrow" | "weekend" | "custom";

export interface QuickPlanDeepLink {
  examType: ExamType | null;
  subjectId: string | null;
  topicId: string | null;
}

/** Konu kartındaki "Planla" aksiyonunun Plan ekranına taşıdığı sorgu parametreleri. */
export function buildQuickPlanSearch(params: { examType: ExamType; subjectId: string; topicId?: string }): string {
  const search = new URLSearchParams({
    quick: "1",
    examType: params.examType,
    subjectId: params.subjectId,
  });
  if (params.topicId) {
    search.set("topicId", params.topicId);
  }
  return search.toString();
}

function isExamType(value: string | null): value is ExamType {
  return value === "TYT" || value === "AYT" || value === "OZEL";
}

/** URL sorgu parametrelerinden derin bağlantı bilgisini güvenli şekilde okur; geçersiz değerler null olur. */
export function parseQuickPlanDeepLink(search: URLSearchParams): QuickPlanDeepLink | null {
  if (search.get("quick") !== "1") return null;

  const examTypeRaw = search.get("examType");
  return {
    examType: isExamType(examTypeRaw) ? examTypeRaw : null,
    subjectId: search.get("subjectId"),
    topicId: search.get("topicId"),
  };
}

/** Bugünden sonraki en yakın cumartesiyi, saat dilimi kaymasına yol açmadan yerel tarihle hesaplar. */
export function computeNextWeekend(referenceDate: Date = new Date()): Date {
  let candidate = addDays(referenceDate, 1);
  while (candidate.getDay() !== 6) {
    candidate = addDays(candidate, 1);
  }
  return candidate;
}

export function resolveQuickDayKey(
  option: QuickDayOption,
  customDate: string,
  referenceDate: Date = new Date(),
): string {
  switch (option) {
    case "today":
      return toDateKey(referenceDate);
    case "tomorrow":
      return toDateKey(addDays(referenceDate, 1));
    case "weekend":
      return toDateKey(computeNextWeekend(referenceDate));
    case "custom":
      return customDate;
    default:
      return toDateKey(referenceDate);
  }
}

const FRONT_VOWELS = new Set(["e", "i", "ö", "ü"]);
const BACK_VOWELS = new Set(["a", "ı", "o", "u"]);
const UNVOICED_CONSONANTS = new Set(["ç", "f", "h", "k", "p", "s", "ş", "t"]);

function lastVowel(word: string): string | null {
  for (let i = word.length - 1; i >= 0; i--) {
    const ch = word[i].toLocaleLowerCase("tr-TR");
    if (FRONT_VOWELS.has(ch) || BACK_VOWELS.has(ch)) return ch;
  }
  return null;
}

/**
 * Basit ünlü uyumu: bir konu adına "-den/-dan/-ten/-tan" (ayrılma durumu) ekini uygun
 * biçimde ekler (örn. "Problemler" → "Problemlerden"). Türkçe'nin tüm istisnalarını
 * (ünlü ile biten sözcüklerdeki kaynaştırma harfi gibi) kapsamaz; gerçekçi bir yaklaşıklıktır.
 */
function withAblativeSuffix(word: string): string {
  const vowel = lastVowel(word) ?? "e";
  const lastChar = word.slice(-1).toLocaleLowerCase("tr-TR");
  const unvoiced = UNVOICED_CONSONANTS.has(lastChar);
  const front = FRONT_VOWELS.has(vowel);
  const suffix = front ? (unvoiced ? "ten" : "den") : unvoiced ? "tan" : "dan";
  return `${word}${suffix}`;
}

export interface AutoTitleParams {
  examType: ExamType;
  subjectName: string;
  topicName: string | null;
  workType: TaskType;
  questionTarget: number | null;
}

/** Ders/konu/çalışma türü seçimlerinden otomatik bir görev başlığı üretir. */
export function buildAutoTitle(params: AutoTitleParams): string {
  const { examType, subjectName, topicName, workType, questionTarget } = params;
  const base = examType === "OZEL" ? subjectName : `${examType} ${subjectName}`;

  switch (workType) {
    case "topic_study":
      return topicName ? `${base} · ${topicName} çalış` : `${base} çalış`;
    case "topic_review":
      return topicName ? `${base} · ${topicName} tekrarı` : `${base} tekrarı`;
    case "question_solving": {
      const countLabel = questionTarget != null && questionTarget > 0 ? `${questionTarget} soru çöz` : "soru çöz";
      return topicName ? `${base} · ${withAblativeSuffix(topicName)} ${countLabel}` : `${base} ${countLabel}`;
    }
    case "branch_exam":
      return topicName ? `${base} · ${topicName} branş denemesi` : `${base} branş denemesi`;
    case "general_exam":
      return `${base} genel denemesi`;
    case "mistake_analysis":
      return topicName ? `${base} · ${topicName} yanlış analizi` : `${base} yanlış analizi`;
    default:
      return topicName ? `${base} · ${topicName}` : base;
  }
}

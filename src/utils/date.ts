const FRIENDLY_DATE_FORMATTER = new Intl.DateTimeFormat("tr-TR", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

export function formatFriendlyDate(date: Date): string {
  return FRIENDLY_DATE_FORMATTER.format(date);
}

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * YKS'ye kalan gün sayısını hesaplar. Geçersiz/eksik tarih için null döner.
 * Sınav bugünse 0, geçmişteyse yine 0 döner (negatif gösterilmez).
 * Saat dilimi kaymasını önlemek için her iki tarih de yerel yıl/ay/gün
 * bileşenlerinden UTC gece yarısına normalize edilir.
 */
export function daysUntilExam(examDate: string | null, referenceDate: Date = new Date()): number | null {
  if (!examDate || !ISO_DATE_PATTERN.test(examDate)) {
    return null;
  }

  const [year, month, day] = examDate.split("-").map(Number);
  const examUTC = Date.UTC(year, month - 1, day);
  const parsed = new Date(examUTC);

  const isValidCalendarDate =
    parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day;

  if (!isValidCalendarDate) {
    return null;
  }

  const todayUTC = Date.UTC(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());
  const diffDays = Math.round((examUTC - todayUTC) / 86_400_000);

  return Math.max(0, diffDays);
}

/** Saate uygun doğal bir karşılama döner. */
export function getGreeting(date: Date = new Date()): string {
  const hour = date.getHours();

  if (hour < 6) return "İyi geceler";
  if (hour < 12) return "Günaydın";
  if (hour < 18) return "İyi günler";
  return "İyi akşamlar";
}

/** Yerel tarihi (saat dilimi kaymasız) yyyy-mm-dd anahtarına çevirir. */
export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** yyyy-mm-dd anahtarını, saat dilimi kaymasına yol açmadan yerel bir Date'e çevirir. */
export function fromDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function addDays(date: Date, amount: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

/** Haftanın Pazartesi gününü döner. */
export function startOfWeek(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  result.setDate(result.getDate() + diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

const SHORT_DAY_FORMATTER = new Intl.DateTimeFormat("tr-TR", { weekday: "short" });

export function formatShortDayLabel(date: Date): string {
  return SHORT_DAY_FORMATTER.format(date);
}

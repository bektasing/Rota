import { DAILY_MESSAGES } from "@/constants/dailyMessages";

function getDayOfYear(date: Date): number {
  const startOfYearUTC = Date.UTC(date.getFullYear(), 0, 1);
  const dateUTC = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.floor((dateUTC - startOfYearUTC) / 86_400_000);
}

/**
 * Takvim gününe göre deterministik bir mesaj döner; aynı gün içinde yenilemede değişmez.
 * Math.random kullanılmaz.
 */
export function getDailyMessage(date: Date = new Date()): string {
  const index = getDayOfYear(date) % DAILY_MESSAGES.length;
  return DAILY_MESSAGES[index];
}

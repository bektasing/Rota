import type { ExamResult } from "@/models/ExamResult";
import type { Goal } from "@/models/Goal";
import type { MistakeRecord } from "@/models/MistakeRecord";
import type { ReviewItem } from "@/models/ReviewItem";
import type { StudyResource } from "@/models/StudyResource";
import type { StudySession } from "@/models/StudySession";
import type { StudyTask } from "@/models/StudyTask";
import type { Subject } from "@/models/Subject";
import { addDays, toDateKey } from "@/utils/date";
import { sumSessionMinutes } from "@/utils/timer";

export type StatsRange = "7" | "30" | "all";

export interface StatsSource {
  sessions: StudySession[];
  tasks: StudyTask[];
  exams: ExamResult[];
  mistakes: MistakeRecord[];
  reviews: ReviewItem[];
  goals: Goal[];
  resources: StudyResource[];
}

export interface StatsSummary {
  totalMinutes: number;
  averageMinutesPerDay: number;
  sessionCount: number;
  questionCount: number;
  completedTaskCount: number;
  taskCompletionRate: number;
  examCount: number;
  lastExamNet: number | null;
  lastExamTitle: string | null;
  openMistakeCount: number;
  completedReviewCount: number;
  activeGoalCount: number;
  completedGoalCount: number;
  inProgressResourceCount: number;
}

export interface DailyBar {
  dateKey: string;
  label: string;
  minutes: number;
}

export interface SubjectTotal {
  subjectId: string;
  name: string;
  color: string;
  minutes: number;
}

export interface ExamPoint {
  id: string;
  date: string;
  title: string;
  net: number;
}

const DAY_LABEL_FORMATTER = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "numeric" });

/** Seçilen aralığın başlangıç gün anahtarı; "Tümü" için null (sınırsız). */
export function rangeStartKey(range: StatsRange, today: Date = new Date()): string | null {
  if (range === "all") return null;
  const days = range === "7" ? 7 : 30;
  return toDateKey(addDays(today, -(days - 1)));
}

function inRange(dateKey: string, startKey: string | null, todayKey: string): boolean {
  if (dateKey > todayKey) return false;
  return startKey === null || dateKey >= startKey;
}

/** ISO zaman damgasını yerel gün anahtarına çevirir (UTC kayması yok). */
function timestampToDateKey(timestamp: string): string {
  return toDateKey(new Date(timestamp));
}

export function computeSummary(
  source: StatsSource,
  range: StatsRange,
  today: Date = new Date(),
): StatsSummary {
  const todayKey = toDateKey(today);
  const startKey = rangeStartKey(range, today);

  const sessions = source.sessions.filter((s) => inRange(s.date, startKey, todayKey));
  const tasks = source.tasks.filter((t) => inRange(t.date, startKey, todayKey));
  const exams = source.exams
    .filter((e) => inRange(e.date, startKey, todayKey))
    .sort((a, b) => a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt));
  const mistakes = source.mistakes.filter((m) => inRange(timestampToDateKey(m.createdAt), startKey, todayKey));
  const completedReviews = source.reviews.filter(
    (r) => r.status === "completed" && r.completedAt && inRange(timestampToDateKey(r.completedAt), startKey, todayKey),
  );

  const totalMinutes = sumSessionMinutes(sessions);
  const dayCount = countRangeDays(range, source, today);
  const lastExam = exams[exams.length - 1] ?? null;
  const completedTaskCount = tasks.filter((t) => t.completed).length;

  return {
    totalMinutes,
    averageMinutesPerDay: dayCount > 0 ? Math.round(totalMinutes / dayCount) : 0,
    sessionCount: sessions.length,
    questionCount: sessions.reduce((sum, s) => sum + (s.actualQuestions ?? 0), 0),
    completedTaskCount,
    taskCompletionRate: tasks.length > 0 ? Math.round((completedTaskCount / tasks.length) * 100) : 0,
    examCount: exams.length,
    lastExamNet: lastExam ? lastExam.totalNet : null,
    lastExamTitle: lastExam ? lastExam.title : null,
    openMistakeCount: mistakes.filter((m) => m.status === "open").length,
    completedReviewCount: completedReviews.length,
    activeGoalCount: source.goals.filter((g) => g.status === "active").length,
    completedGoalCount: source.goals.filter((g) => g.status === "completed").length,
    inProgressResourceCount: source.resources.filter((r) => r.status === "in_progress").length,
  };
}

/**
 * Günlük ortalamanın bölüneceği gün sayısı.
 * "Tümü" seçiliyken ilk kayıttan bugüne kadarki gerçek gün sayısı kullanılır;
 * böylece uygulamayı yeni kullanmaya başlamış biri haksız yere düşük ortalama görmez.
 */
function countRangeDays(range: StatsRange, source: StatsSource, today: Date): number {
  if (range === "7") return 7;
  if (range === "30") return 30;

  const firstSessionDate = source.sessions.map((s) => s.date).sort()[0];
  if (!firstSessionDate) return 0;

  const startMs = new Date(`${firstSessionDate}T00:00:00`).getTime();
  const todayMs = new Date(`${toDateKey(today)}T00:00:00`).getTime();
  return Math.max(1, Math.round((todayMs - startMs) / 86_400_000) + 1);
}

/** Son N günün günlük çalışma süreleri (bugün dâhil, tarih sırasıyla). */
export function buildDailyBars(sessions: StudySession[], days: number, today: Date = new Date()): DailyBar[] {
  const minutesByDate = new Map<string, StudySession[]>();

  for (const session of sessions) {
    const existing = minutesByDate.get(session.date);
    if (existing) {
      existing.push(session);
    } else {
      minutesByDate.set(session.date, [session]);
    }
  }

  const bars: DailyBar[] = [];
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = addDays(today, -offset);
    const dateKey = toDateKey(date);
    bars.push({
      dateKey,
      label: DAY_LABEL_FORMATTER.format(date),
      minutes: sumSessionMinutes(minutesByDate.get(dateKey) ?? []),
    });
  }

  return bars;
}

/** Derslere göre toplam çalışma süresi (yalnızca süresi olan dersler, azalan sırada). */
export function buildSubjectTotals(
  sessions: StudySession[],
  subjects: Subject[],
  range: StatsRange,
  today: Date = new Date(),
): SubjectTotal[] {
  const todayKey = toDateKey(today);
  const startKey = rangeStartKey(range, today);
  const subjectsById = new Map(subjects.map((s) => [s.id, s]));
  const grouped = new Map<string, StudySession[]>();

  for (const session of sessions) {
    if (!session.subjectId) continue;
    if (!inRange(session.date, startKey, todayKey)) continue;
    const existing = grouped.get(session.subjectId);
    if (existing) {
      existing.push(session);
    } else {
      grouped.set(session.subjectId, [session]);
    }
  }

  return [...grouped.entries()]
    .map(([subjectId, subjectSessions]) => {
      const subject = subjectsById.get(subjectId);
      return {
        subjectId,
        name: subject?.name ?? "Ders silinmiş",
        color: subject?.color ?? "#8b8b8b",
        minutes: sumSessionMinutes(subjectSessions),
      };
    })
    .filter((entry) => entry.minutes > 0)
    .sort((a, b) => b.minutes - a.minutes);
}

/** Seçilen aralıktaki denemelerin toplam netleri, tarih sırasıyla. */
export function buildExamTrend(
  exams: ExamResult[],
  range: StatsRange,
  today: Date = new Date(),
): ExamPoint[] {
  const todayKey = toDateKey(today);
  const startKey = rangeStartKey(range, today);

  return exams
    .filter((exam) => inRange(exam.date, startKey, todayKey))
    .sort((a, b) => a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt))
    .map((exam) => ({ id: exam.id, date: exam.date, title: exam.title, net: exam.totalNet }));
}

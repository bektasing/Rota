export type ExamResultType = "TYT" | "AYT" | "BRANS";

export interface ExamSection {
  subjectId: string | null;
  subjectName: string;
  correct: number;
  wrong: number;
  blank: number;
  net: number;
}

export interface ExamResult {
  id: string;
  title: string;
  examType: ExamResultType;
  /** Branş denemesi için seçilen ders */
  subjectId: string | null;
  /** ISO tarih (yyyy-mm-dd) */
  date: string;
  durationMinutes: number | null;
  sections: ExamSection[];
  totalCorrect: number;
  totalWrong: number;
  totalBlank: number;
  totalNet: number;
  note: string;
  createdAt: string;
  updatedAt: string;
}

export type ExamType = "TYT" | "AYT";

export interface Subject {
  id: string;
  name: string;
  examType: ExamType;
  /** Tailwind renk tonu için hex kod */
  color: string;
  /** Lucide ikon adı (bkz. src/components/ui/SubjectIcon.tsx) */
  icon: string;
  active: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

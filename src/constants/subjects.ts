import type { ExamType } from "@/models/Subject";

export interface DefaultSubjectSeed {
  name: string;
  examType: ExamType;
  color: string;
  /** Lucide ikon adı */
  icon: string;
}

export const DEFAULT_TYT_SUBJECTS: DefaultSubjectSeed[] = [
  { name: "Türkçe", examType: "TYT", color: "#E86A6A", icon: "BookOpen" },
  { name: "Matematik", examType: "TYT", color: "#7C6AE8", icon: "Calculator" },
  { name: "Geometri", examType: "TYT", color: "#5B8DEF", icon: "Shapes" },
  { name: "Fizik", examType: "TYT", color: "#3FA1C4", icon: "Atom" },
  { name: "Kimya", examType: "TYT", color: "#4CAF8E", icon: "FlaskConical" },
  { name: "Biyoloji", examType: "TYT", color: "#6FBF6F", icon: "Leaf" },
  { name: "Tarih", examType: "TYT", color: "#C98A3E", icon: "Landmark" },
  { name: "Coğrafya", examType: "TYT", color: "#3EA88A", icon: "Globe" },
  { name: "Felsefe", examType: "TYT", color: "#9569C7", icon: "Brain" },
  { name: "Din Kültürü", examType: "TYT", color: "#B08968", icon: "BookMarked" },
];

export const DEFAULT_AYT_SAYISAL_SUBJECTS: DefaultSubjectSeed[] = [
  { name: "Matematik", examType: "AYT", color: "#7C6AE8", icon: "Calculator" },
  { name: "Geometri", examType: "AYT", color: "#5B8DEF", icon: "Shapes" },
  { name: "Fizik", examType: "AYT", color: "#3FA1C4", icon: "Atom" },
  { name: "Kimya", examType: "AYT", color: "#4CAF8E", icon: "FlaskConical" },
  { name: "Biyoloji", examType: "AYT", color: "#6FBF6F", icon: "Leaf" },
];

export const DEFAULT_SUBJECT_SEEDS: DefaultSubjectSeed[] = [
  ...DEFAULT_TYT_SUBJECTS,
  ...DEFAULT_AYT_SAYISAL_SUBJECTS,
];

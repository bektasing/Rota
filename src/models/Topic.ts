export type TopicStatus = "not_started" | "in_progress" | "completed";
export type TopicDifficulty = "easy" | "medium" | "hard";
export type TopicPriority = "low" | "medium" | "high";

export interface Topic {
  id: string;
  subjectId: string;
  name: string;
  status: TopicStatus;
  difficulty: TopicDifficulty;
  priority: TopicPriority;
  /** 0-100 arası hakimiyet puanı */
  masteryScore: number;
  totalStudyMinutes: number;
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  blankCount: number;
  lastStudiedAt: string | null;
  nextReviewAt: string | null;
  notes: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

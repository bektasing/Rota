export type ResourceType =
  | "question_bank"
  | "topic_book"
  | "exam_book"
  | "video_series"
  | "website"
  | "pdf"
  | "lecture_notes"
  | "other";

export type ResourceStatus = "planned" | "in_progress" | "completed" | "dropped";

export interface StudyResource {
  id: string;
  title: string;
  type: ResourceType;
  subjectId: string | null;
  publisherOrSource: string;
  /** Toplam test/video/sayfa sayısı; bilinmiyorsa null. */
  totalUnits: number | null;
  completedUnits: number;
  status: ResourceStatus;
  /** 1–5 arası isteğe bağlı puan. */
  rating: number | null;
  note: string;
  createdAt: string;
  updatedAt: string;
}

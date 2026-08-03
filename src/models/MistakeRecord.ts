export type MistakeReason =
  | "bilgi_eksikligi"
  | "dikkat_hatasi"
  | "islem_hatasi"
  | "soruyu_yanlis_anlama"
  | "sure_problemi"
  | "tahmin"
  | "diger";

export type MistakeStatus = "open" | "resolved";

export interface MistakeRecord {
  id: string;
  examId: string | null;
  subjectId: string;
  topicId: string | null;
  title: string;
  questionSource: string;
  reason: MistakeReason;
  solutionNote: string;
  status: MistakeStatus;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
}

export interface StudyNote {
  id: string;
  title: string;
  content: string;
  subjectId: string | null;
  topicId: string | null;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

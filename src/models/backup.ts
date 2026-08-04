import type { ExamResult } from "@/models/ExamResult";
import type { Goal } from "@/models/Goal";
import type { MistakeRecord } from "@/models/MistakeRecord";
import type { ReviewItem } from "@/models/ReviewItem";
import type { Subject } from "@/models/Subject";
import type { StudyNote } from "@/models/StudyNote";
import type { StudyResource } from "@/models/StudyResource";
import type { StudySession } from "@/models/StudySession";
import type { StudyTask } from "@/models/StudyTask";
import type { Topic } from "@/models/Topic";
import type { UserProfile } from "@/models/UserProfile";

export interface RotaBackupData {
  userProfile: UserProfile | null;
  subjects: Subject[];
  topics: Topic[];
  studyTasks: StudyTask[];
  /** Phase 4'te eklendi; eski yedeklerde bulunmayabilir (boş dizi kabul edilir). */
  goals: Goal[];
  studyResources: StudyResource[];
  studyNotes: StudyNote[];
  /** Phase 5'te eklendi; eski yedeklerde bulunmayabilir (boş dizi kabul edilir). */
  studySessions: StudySession[];
  examResults: ExamResult[];
  mistakeRecords: MistakeRecord[];
  reviewItems: ReviewItem[];
}

export interface RotaBackup {
  /** Yedek şeması sürümü; eski sürümler de okunabilir. */
  version: number;
  /** Dosyanın hangi uygulamadan geldiğini gösterir; eski yedeklerde bulunmayabilir. */
  app?: string;
  exportedAt: string;
  data: RotaBackupData;
}

import type { Goal } from "@/models/Goal";
import type { Subject } from "@/models/Subject";
import type { StudyNote } from "@/models/StudyNote";
import type { StudyResource } from "@/models/StudyResource";
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
}

export interface RotaBackup {
  version: number;
  exportedAt: string;
  data: RotaBackupData;
}

import type { Subject } from "@/models/Subject";
import type { StudyTask } from "@/models/StudyTask";
import type { Topic } from "@/models/Topic";
import type { UserProfile } from "@/models/UserProfile";

export interface RotaBackupData {
  userProfile: UserProfile | null;
  subjects: Subject[];
  topics: Topic[];
  studyTasks: StudyTask[];
}

export interface RotaBackup {
  version: number;
  exportedAt: string;
  data: RotaBackupData;
}

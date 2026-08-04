import { beforeEach, describe, expect, it } from "vitest";

import type { Subject } from "@/models/Subject";
import { subjectRepository } from "@/repositories/subjectRepository";
import { studyTaskRepository } from "@/repositories/studyTaskRepository";
import { topicRepository } from "@/repositories/topicRepository";
import { userProfileRepository } from "@/repositories/userProfileRepository";
import { createBackup, restoreBackup } from "@/services/backupService";

describe("backupService", () => {
  beforeEach(async () => {
    await Promise.all([
      subjectRepository.clear(),
      topicRepository.clear(),
      studyTaskRepository.clear(),
      userProfileRepository.clear(),
    ]);
  });

  it("mevcut verilerden bir yedek oluşturur", async () => {
    const now = new Date().toISOString();
    const subject: Subject = {
      id: "s1",
      name: "Matematik",
      examType: "TYT",
      color: "#7C6AE8",
      icon: "Calculator",
      active: true,
      order: 0,
      createdAt: now,
      updatedAt: now,
    };
    await subjectRepository.add(subject);

    const backup = await createBackup();

    expect(backup.version).toBe(2);
    expect(backup.data.subjects).toHaveLength(1);
    expect(backup.data.subjects[0].name).toBe("Matematik");
  });

  it("geçerli bir yedeği geri yükler ve mevcut veriyi değiştirir", async () => {
    await subjectRepository.add({
      id: "eski",
      name: "Eski Ders",
      examType: "TYT",
      color: "#000",
      icon: "BookOpen",
      active: true,
      order: 0,
      createdAt: "2020-01-01",
      updatedAt: "2020-01-01",
    });

    const result = await restoreBackup({
      version: 1,
      exportedAt: new Date().toISOString(),
      data: {
        userProfile: null,
        subjects: [
          {
            id: "yeni",
            name: "Yeni Ders",
            examType: "TYT",
            color: "#111",
            icon: "Calculator",
            active: true,
            order: 0,
            createdAt: "2026-01-01",
            updatedAt: "2026-01-01",
          },
        ],
        topics: [],
        studyTasks: [],
      },
    });

    expect(result.success).toBe(true);

    const subjects = await subjectRepository.getAll();
    expect(subjects).toHaveLength(1);
    expect(subjects[0].name).toBe("Yeni Ders");
  });

  it("profil içermeyen bir yedek mevcut profili silmez", async () => {
    const now = new Date().toISOString();
    await userProfileRepository.saveProfile({
      id: "p1",
      name: "Nisa",
      examDate: "2027-06-19",
      dailyStudyTargetMinutes: 240,
      weeklyStudyDays: ["monday"],
      preferredStudyHours: [],
      targetRanking: null,
      tytLevel: "orta",
      aytLevel: "orta",
      strongSubjectIds: [],
      weakSubjectIds: [],
      onboardingCompleted: true,
      createdAt: now,
      updatedAt: now,
    });

    const result = await restoreBackup({
      version: 1,
      exportedAt: now,
      data: { userProfile: null, subjects: [], topics: [], studyTasks: [] },
    });

    expect(result.success).toBe(true);

    const profile = await userProfileRepository.getProfile();
    expect(profile?.dailyStudyTargetMinutes).toBe(240);
  });

  it("bozuk bir yedeği reddeder ve mevcut veriye dokunmaz", async () => {
    await subjectRepository.add({
      id: "korunan",
      name: "Korunan Ders",
      examType: "TYT",
      color: "#000",
      icon: "BookOpen",
      active: true,
      order: 0,
      createdAt: "2020-01-01",
      updatedAt: "2020-01-01",
    });

    const result = await restoreBackup({ garbage: true });

    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();

    const subjects = await subjectRepository.getAll();
    expect(subjects).toHaveLength(1);
    expect(subjects[0].name).toBe("Korunan Ders");
  });
});

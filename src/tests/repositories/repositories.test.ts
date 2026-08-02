import { beforeEach, describe, expect, it } from "vitest";

import type { StudyTask } from "@/models/StudyTask";
import type { Topic } from "@/models/Topic";
import type { UserProfile } from "@/models/UserProfile";
import { studyTaskRepository } from "@/repositories/studyTaskRepository";
import { topicRepository } from "@/repositories/topicRepository";
import { userProfileRepository } from "@/repositories/userProfileRepository";

describe("topicRepository", () => {
  beforeEach(async () => {
    await topicRepository.clear();
  });

  it("bir konu ekler ve derse göre listeler", async () => {
    const now = new Date().toISOString();
    const topic: Topic = {
      id: "t1",
      subjectId: "subject-1",
      name: "Türev",
      status: "not_started",
      difficulty: "medium",
      priority: "high",
      masteryScore: 0,
      totalStudyMinutes: 0,
      totalQuestions: 0,
      correctCount: 0,
      incorrectCount: 0,
      blankCount: 0,
      lastStudiedAt: null,
      nextReviewAt: null,
      notes: "",
      order: 0,
      createdAt: now,
      updatedAt: now,
    };

    await topicRepository.add(topic);

    const bySubject = await topicRepository.getBySubjectId("subject-1");
    expect(bySubject).toHaveLength(1);
    expect(bySubject[0].name).toBe("Türev");
  });
});

describe("studyTaskRepository", () => {
  beforeEach(async () => {
    await studyTaskRepository.clear();
  });

  it("bir görev ekler ve tarihe göre listeler", async () => {
    const now = new Date().toISOString();
    const task: StudyTask = {
      id: "task-1",
      title: "Matematik soru çöz",
      subjectId: "subject-1",
      topicId: null,
      taskType: "question_solving",
      date: "2026-08-02",
      startTime: null,
      estimatedMinutes: 60,
      questionTarget: 40,
      priority: "medium",
      notes: "",
      completed: false,
      completedAt: null,
      actualMinutes: null,
      actualQuestions: null,
      isPinned: false,
      createdAt: now,
      updatedAt: now,
    };

    await studyTaskRepository.add(task);

    const byDate = await studyTaskRepository.getByDate("2026-08-02");
    expect(byDate).toHaveLength(1);
    expect(byDate[0].title).toBe("Matematik soru çöz");
  });
});

describe("userProfileRepository", () => {
  beforeEach(async () => {
    await userProfileRepository.clear();
  });

  it("profil yokken undefined döner", async () => {
    await expect(userProfileRepository.getProfile()).resolves.toBeUndefined();
  });

  it("profili kaydeder ve getProfile ile döner", async () => {
    const now = new Date().toISOString();
    const profile: UserProfile = {
      id: "profile-1",
      name: "Öğrenci",
      examDate: null,
      dailyStudyTargetMinutes: 180,
      weeklyStudyDays: ["monday", "tuesday"],
      preferredStudyHours: [],
      targetRanking: null,
      onboardingCompleted: false,
      createdAt: now,
      updatedAt: now,
    };

    await userProfileRepository.saveProfile(profile);

    // userProfileRepository.getProfile() Rota'nın sabit kullanıcısına (Nisa) göçürür.
    const found = await userProfileRepository.getProfile();
    expect(found?.name).toBe("Nisa");
  });
});

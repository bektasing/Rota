import { beforeEach, describe, expect, it } from "vitest";

import { subjectRepository } from "@/repositories/subjectRepository";
import { ensureDefaultSubjectsSeeded } from "@/services/bootstrapService";

describe("ensureDefaultSubjectsSeeded", () => {
  beforeEach(async () => {
    await subjectRepository.clear();
  });

  it("ders tablosu boşken varsayılan dersleri ekler", async () => {
    const subjects = await ensureDefaultSubjectsSeeded();

    expect(subjects.length).toBeGreaterThan(0);
    expect(subjects.filter((s) => s.examType === "TYT")).toHaveLength(10);
    expect(subjects.filter((s) => s.examType === "AYT")).toHaveLength(5);
  });

  it("zaten ders varsa yeniden tohumlamaz", async () => {
    await ensureDefaultSubjectsSeeded();
    const first = await subjectRepository.getAll();

    const second = await ensureDefaultSubjectsSeeded();

    expect(second).toHaveLength(first.length);
    const allAfter = await subjectRepository.getAll();
    expect(allAfter).toHaveLength(first.length);
  });
});

import { beforeEach, describe, expect, it } from "vitest";

import type { Subject } from "@/models/Subject";
import { subjectRepository } from "@/repositories/subjectRepository";

function makeSubject(overrides: Partial<Subject> = {}): Subject {
  const now = new Date().toISOString();
  return {
    id: "subject-1",
    name: "Matematik",
    examType: "TYT",
    color: "#7C6AE8",
    icon: "Calculator",
    active: true,
    order: 0,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe("subjectRepository", () => {
  beforeEach(async () => {
    await subjectRepository.clear();
  });

  it("başlangıçta boş liste döner", async () => {
    await expect(subjectRepository.getAll()).resolves.toEqual([]);
  });

  it("bir ders ekler ve id ile geri okur", async () => {
    const subject = makeSubject();
    await subjectRepository.add(subject);

    const found = await subjectRepository.getById(subject.id);
    expect(found).toEqual(subject);
  });

  it("getAll ile eklenen tüm dersleri döner", async () => {
    await subjectRepository.add(makeSubject({ id: "s1", name: "Matematik" }));
    await subjectRepository.add(makeSubject({ id: "s2", name: "Geometri" }));

    const all = await subjectRepository.getAll();
    expect(all).toHaveLength(2);
    expect(all.map((s) => s.name).sort()).toEqual(["Geometri", "Matematik"]);
  });

  it("put ile mevcut kaydı günceller", async () => {
    const subject = makeSubject();
    await subjectRepository.add(subject);

    await subjectRepository.put({ ...subject, name: "Geometri", active: false });

    const updated = await subjectRepository.getById(subject.id);
    expect(updated?.name).toBe("Geometri");
    expect(updated?.active).toBe(false);
  });

  it("remove ile kaydı siler", async () => {
    const subject = makeSubject();
    await subjectRepository.add(subject);

    await subjectRepository.remove(subject.id);

    await expect(subjectRepository.getById(subject.id)).resolves.toBeUndefined();
  });

  it("var olmayan bir id için undefined döner", async () => {
    await expect(subjectRepository.getById("olmayan-id")).resolves.toBeUndefined();
  });
});

import { describe, expect, it } from "vitest";

import { validateBackup } from "@/utils/validation";

function validBackup() {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    data: {
      userProfile: null,
      subjects: [{ id: "s1", name: "Matematik" }],
      topics: [],
      studyTasks: [],
    },
  };
}

describe("validateBackup", () => {
  it("geçerli bir yedeği kabul eder", () => {
    const result = validateBackup(validBackup());
    expect(result.valid).toBe(true);
  });

  it("null girdiyi reddeder", () => {
    expect(validateBackup(null).valid).toBe(false);
  });

  it("bir dizi girdiyi reddeder", () => {
    expect(validateBackup([1, 2, 3]).valid).toBe(false);
  });

  it("sürüm alanı eksikse reddeder", () => {
    const backup = validBackup();
    // @ts-expect-error kasıtlı olarak bozuk veri
    delete backup.version;
    expect(validateBackup(backup).valid).toBe(false);
  });

  it("data alanı eksikse reddeder", () => {
    expect(validateBackup({ version: 1, exportedAt: "x" }).valid).toBe(false);
  });

  it("subjects bir dizi değilse reddeder", () => {
    const backup = validBackup();
    // @ts-expect-error kasıtlı olarak bozuk veri
    backup.data.subjects = "bozuk";
    expect(validateBackup(backup).valid).toBe(false);
  });

  it("id alanı olmayan bir ders girdisini reddeder", () => {
    const backup = validBackup();
    // @ts-expect-error kasıtlı olarak bozuk veri
    backup.data.subjects = [{ name: "id'siz ders" }];
    expect(validateBackup(backup).valid).toBe(false);
  });

  it("rastgele bozuk bir JSON dosyasını çökmeden reddeder", () => {
    expect(() => validateBackup("bozuk metin")).not.toThrow();
    expect(validateBackup("bozuk metin").valid).toBe(false);
  });
});

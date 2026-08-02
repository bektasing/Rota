import { describe, expect, it } from "vitest";

import { formatFriendlyDate } from "@/utils/date";

describe("formatFriendlyDate", () => {
  it("tarihi Türkçe gün, ay adıyla biçimlendirir", () => {
    const result = formatFriendlyDate(new Date(2026, 7, 2));

    expect(result.toLocaleLowerCase("tr-TR")).toContain("ağustos");
    expect(result).toContain("2");
  });
});

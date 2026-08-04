import type { ExamType } from "@/models/Subject";

interface QuickPlanMemory {
  examType: ExamType;
  subjectId: string | null;
}

/**
 * Hızlı Planla panelinin son kullanılan TYT/AYT ve ders seçimini hafızada tutar.
 * Bilinçli olarak basit tutuldu: kalıcı depoya yazılmaz (sayfa yenilenince sıfırlanır),
 * yalnızca panel yeniden açıldığında son seçimi hatırlatan küçük bir kolaylıktır.
 */
let memory: QuickPlanMemory = { examType: "TYT", subjectId: null };

export function getQuickPlanMemory(): QuickPlanMemory {
  return memory;
}

export function setQuickPlanMemory(next: QuickPlanMemory): void {
  memory = next;
}

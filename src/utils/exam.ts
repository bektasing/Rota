/**
 * Net hesabı: doğru - yanlış / 4. Negatif doğru/yanlış girişleri kabul edilmez.
 */
export function computeNet(correct: number, wrong: number): number {
  const safeCorrect = Number.isFinite(correct) ? Math.max(0, correct) : 0;
  const safeWrong = Number.isFinite(wrong) ? Math.max(0, wrong) : 0;
  return Math.round((safeCorrect - safeWrong / 4) * 100) / 100;
}

export function formatNet(net: number): string {
  return net.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

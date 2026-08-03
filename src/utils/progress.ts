/**
 * İlerleme yüzdesini her zaman 0–100 arasında, güvenli şekilde hesaplar.
 * Hedef değeri sıfır/negatif ya da geçersizse 0 döner (sahte ilerleme üretmez).
 */
export function computePercent(current: number, target: number | null): number {
  if (target == null || !Number.isFinite(target) || target <= 0) return 0;
  if (!Number.isFinite(current) || current <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((current / target) * 100)));
}

/** Sayıyı Türkçe biçimde, gereksiz ondalık olmadan yazar. */
export function formatAmount(value: number): string {
  const safe = Number.isFinite(value) ? value : 0;
  return Number.isInteger(safe) ? String(safe) : safe.toLocaleString("tr-TR", { maximumFractionDigits: 2 });
}

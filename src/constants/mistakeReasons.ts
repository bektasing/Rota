import type { MistakeReason, MistakeStatus } from "@/models/MistakeRecord";

export const MISTAKE_REASON_OPTIONS: { value: MistakeReason; label: string }[] = [
  { value: "bilgi_eksikligi", label: "Bilgi eksikliği" },
  { value: "dikkat_hatasi", label: "Dikkat hatası" },
  { value: "islem_hatasi", label: "İşlem hatası" },
  { value: "soruyu_yanlis_anlama", label: "Soruyu yanlış anlama" },
  { value: "sure_problemi", label: "Süre problemi" },
  { value: "tahmin", label: "Tahmin" },
  { value: "diger", label: "Diğer" },
];

export const MISTAKE_REASON_LABELS: Record<MistakeReason, string> = Object.fromEntries(
  MISTAKE_REASON_OPTIONS.map((option) => [option.value, option.label]),
) as Record<MistakeReason, string>;

export const MISTAKE_STATUS_OPTIONS: { value: MistakeStatus; label: string }[] = [
  { value: "open", label: "Açık" },
  { value: "resolved", label: "Çözüldü" },
];

export const MISTAKE_STATUS_LABELS: Record<MistakeStatus, string> = Object.fromEntries(
  MISTAKE_STATUS_OPTIONS.map((option) => [option.value, option.label]),
) as Record<MistakeStatus, string>;

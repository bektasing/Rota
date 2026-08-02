import type { WeekDay } from "@/models/UserProfile";

/** Pazartesi başlangıçlı, sabit sıralı hafta günleri. */
export const WEEK_DAYS: { value: WeekDay; label: string }[] = [
  { value: "monday", label: "Pazartesi" },
  { value: "tuesday", label: "Salı" },
  { value: "wednesday", label: "Çarşamba" },
  { value: "thursday", label: "Perşembe" },
  { value: "friday", label: "Cuma" },
  { value: "saturday", label: "Cumartesi" },
  { value: "sunday", label: "Pazar" },
];

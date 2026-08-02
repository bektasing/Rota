const FRIENDLY_DATE_FORMATTER = new Intl.DateTimeFormat("tr-TR", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

export function formatFriendlyDate(date: Date): string {
  return FRIENDLY_DATE_FORMATTER.format(date);
}

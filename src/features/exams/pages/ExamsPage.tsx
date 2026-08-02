import { ClipboardList } from "lucide-react";

import { PlaceholderScreen } from "@/components/layout/PlaceholderScreen";

export function ExamsPage() {
  return (
    <PlaceholderScreen
      title="Denemeler"
      description="TYT, AYT ve branş denemelerinin sonuçlarını burada kaydedip net gelişimini takip edeceksin."
      icon={ClipboardList}
    />
  );
}

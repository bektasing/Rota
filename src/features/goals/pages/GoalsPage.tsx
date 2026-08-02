import { Target } from "lucide-react";

import { PlaceholderScreen } from "@/components/layout/PlaceholderScreen";

export function GoalsPage() {
  return (
    <PlaceholderScreen
      title="Hedefler"
      description="Günlük ve haftalık çalışma hedeflerini burada oluşturup ilerlemeni otomatik takip edeceksin."
      icon={Target}
    />
  );
}

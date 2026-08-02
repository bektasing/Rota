import { RefreshCw } from "lucide-react";

import { PlaceholderScreen } from "@/components/layout/PlaceholderScreen";

export function ReviewsPage() {
  return (
    <PlaceholderScreen
      title="Tekrarlar"
      description="Günü gelen tekrarların 1, 3, 7, 14 ve 30 günlük aralıklarla burada listelenecek."
      icon={RefreshCw}
    />
  );
}

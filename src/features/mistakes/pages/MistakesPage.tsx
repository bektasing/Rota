import { AlertTriangle } from "lucide-react";

import { PlaceholderScreen } from "@/components/layout/PlaceholderScreen";

export function MistakesPage() {
  return (
    <PlaceholderScreen
      title="Yanlışlar"
      description="Yaptığın yanlışları ders, konu ve hata türüne göre kaydedip tekrar listesine ekleyeceksin."
      icon={AlertTriangle}
    />
  );
}

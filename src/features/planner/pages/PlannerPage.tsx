import { CalendarDays } from "lucide-react";

import { PlaceholderScreen } from "@/components/layout/PlaceholderScreen";

export function PlannerPage() {
  return (
    <PlaceholderScreen
      title="Planlayıcı"
      description="Günlük ve haftalık çalışma planını burada oluşturacaksın. Bu ekran bir sonraki geliştirme adımında hazır olacak."
      icon={CalendarDays}
    />
  );
}

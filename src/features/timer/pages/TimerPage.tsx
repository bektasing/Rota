import { Timer } from "lucide-react";

import { PlaceholderScreen } from "@/components/layout/PlaceholderScreen";

export function TimerPage() {
  return (
    <PlaceholderScreen
      title="Çalış"
      description="Kronometre ve Pomodoro modlarıyla çalışma sürelerini burada kaydedeceksin. Bu ekran ilerleyen bir adımda eklenecek."
      icon={Timer}
    />
  );
}

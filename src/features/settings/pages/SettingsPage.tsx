import { Settings } from "lucide-react";

import { PlaceholderScreen } from "@/components/layout/PlaceholderScreen";

export function SettingsPage() {
  return (
    <PlaceholderScreen
      title="Ayarlar"
      description="Profilin, Pomodoro sürelerin, net katsayın ve veri yedekleme seçeneklerin burada toplanacak. Şimdilik tema değiştirme butonunu üst çubuktan kullanabilirsin."
      icon={Settings}
    />
  );
}

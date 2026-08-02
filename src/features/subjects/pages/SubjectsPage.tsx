import { Library } from "lucide-react";

import { PlaceholderScreen } from "@/components/layout/PlaceholderScreen";

export function SubjectsPage() {
  return (
    <PlaceholderScreen
      title="Dersler ve Konular"
      description="Ders ve konularını buradan ekleyip düzenleyeceksin. Varsayılan TYT ve AYT Sayısal dersleri arka planda zaten hazırlandı."
      icon={Library}
    />
  );
}

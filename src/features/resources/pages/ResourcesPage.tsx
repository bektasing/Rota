import { BookOpen } from "lucide-react";

import { PlaceholderScreen } from "@/components/layout/PlaceholderScreen";

export function ResourcesPage() {
  return (
    <PlaceholderScreen
      title="Kaynaklar"
      description="Kullandığın soru bankası, kitap ve video kaynaklarının ilerlemesini burada tutacaksın."
      icon={BookOpen}
    />
  );
}

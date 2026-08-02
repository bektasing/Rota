import { Compass } from "lucide-react";

import { PlaceholderScreen } from "@/components/layout/PlaceholderScreen";

export function NotFoundPage() {
  return (
    <PlaceholderScreen
      title="Sayfa bulunamadı"
      description="Aradığın sayfa mevcut değil. Alt menüden ya da yan menüden istediğin bölüme ulaşabilirsin."
      icon={Compass}
    />
  );
}

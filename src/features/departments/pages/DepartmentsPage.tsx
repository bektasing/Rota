import { Compass } from "lucide-react";

import { PlaceholderScreen } from "@/components/layout/PlaceholderScreen";

export function DepartmentsPage() {
  return (
    <PlaceholderScreen
      title="Bölüm Keşfi"
      description="Düşündüğün bölümleri artı/eksileriyle not alıp karşılaştırabileceğin alan burada olacak. Kesin bir karar önermez, sadece araştırmana yardımcı olur."
      icon={Compass}
    />
  );
}

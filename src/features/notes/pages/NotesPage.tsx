import { StickyNote } from "lucide-react";

import { PlaceholderScreen } from "@/components/layout/PlaceholderScreen";

export function NotesPage() {
  return (
    <PlaceholderScreen
      title="Notlar"
      description="Ders notlarını, formülleri ve hatırlatmalarını burada ekleyip sabitleyeceksin."
      icon={StickyNote}
    />
  );
}

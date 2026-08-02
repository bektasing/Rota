import type { LucideIcon } from "lucide-react";

import { EmptyState } from "@/components/ui/EmptyState";

interface PlaceholderScreenProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

/**
 * Henüz geliştirilmemiş ekranlar için tutarlı, dürüst bir yer tutucu.
 * Sonraki phase'lerde gerçek içerikle değiştirilecek.
 */
export function PlaceholderScreen({ title, description, icon }: PlaceholderScreenProps) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 p-4 md:p-6">
      <h1 className="text-xl font-semibold text-foreground">{title}</h1>
      <EmptyState
        icon={icon}
        title="Bu bölüm yakında burada olacak"
        description={description}
      />
    </div>
  );
}

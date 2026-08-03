import type { LucideIcon } from "lucide-react";

import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";

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
    <div className="flex max-w-3xl flex-col gap-4">
      <PageHeader title={title} />
      <EmptyState icon={icon} title="Bu bölüm yakında burada olacak" description={description} />
    </div>
  );
}

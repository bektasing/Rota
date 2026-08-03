import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { MORE_NAV_ITEMS } from "@/constants/navigation";

export function MorePage() {
  return (
    <div className="flex flex-col gap-4 md:gap-5">
      <PageHeader title="Daha Fazla" description="Tüm bölümlere buradan ulaşabilirsin." />

      <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
        {MORE_NAV_ITEMS.map((item) => (
          <Link key={item.path} to={item.path} className="rounded-card">
            <Card interactive padding="sm" className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <item.icon className="h-[18px] w-[18px]" aria-hidden />
              </span>
              <span className="flex-1 text-sm font-semibold text-foreground">{item.label}</span>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

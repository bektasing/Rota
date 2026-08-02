import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

import { MORE_NAV_ITEMS } from "@/constants/navigation";

export function MorePage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 p-4 md:p-6">
      <h1 className="text-xl font-semibold text-foreground">Daha Fazla</h1>
      <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface shadow-sm shadow-black/[0.03]">
        {MORE_NAV_ITEMS.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted"
          >
            <item.icon className="h-5 w-5 text-primary" aria-hidden />
            <span className="flex-1">{item.label}</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden />
          </Link>
        ))}
      </div>
    </div>
  );
}

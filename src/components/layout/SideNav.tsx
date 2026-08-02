import { NavLink } from "react-router-dom";

import { MAIN_NAV_ITEMS, MORE_NAV_ITEMS } from "@/constants/navigation";
import { ROUTES } from "@/constants/routes";
import { cx } from "@/utils/cx";

const primaryItems = MAIN_NAV_ITEMS.filter((item) => item.path !== ROUTES.more);

function navLinkClass({ isActive }: { isActive: boolean }): string {
  return cx(
    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
    isActive
      ? "bg-primary/10 text-primary"
      : "text-muted-foreground hover:bg-surface-muted hover:text-foreground",
  );
}

export function SideNav() {
  return (
    <nav
      aria-label="Ana navigasyon"
      className="hidden w-64 shrink-0 flex-col gap-6 border-r border-border bg-surface px-4 py-6 md:flex"
    >
      <div className="flex items-center gap-2 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
          R
        </div>
        <span className="text-lg font-semibold">Rota</span>
      </div>

      <ul className="flex flex-col gap-1">
        {primaryItems.map((item) => (
          <li key={item.path}>
            <NavLink to={item.path} end={item.path === ROUTES.home} className={navLinkClass}>
              <item.icon className="h-5 w-5" aria-hidden />
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-1">
        <p className="px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Daha Fazla
        </p>
        <ul className="flex flex-col gap-1">
          {MORE_NAV_ITEMS.map((item) => (
            <li key={item.path}>
              <NavLink to={item.path} className={navLinkClass}>
                <item.icon className="h-5 w-5" aria-hidden />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

import { NavLink } from "react-router-dom";

import { MAIN_NAV_ITEMS } from "@/constants/navigation";
import { ROUTES } from "@/constants/routes";
import { cx } from "@/utils/cx";

export function BottomNav() {
  return (
    <nav
      aria-label="Ana navigasyon"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="flex items-stretch justify-between px-1">
        {MAIN_NAV_ITEMS.map((item) => (
          <li key={item.path} className="flex-1">
            <NavLink
              to={item.path}
              end={item.path === ROUTES.home}
              className={({ isActive }) =>
                cx(
                  "flex flex-col items-center gap-1 px-1 py-2.5 text-[11px] font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className="h-6 w-6" aria-hidden strokeWidth={isActive ? 2.4 : 2} />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

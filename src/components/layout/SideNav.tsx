import { NavLink } from "react-router-dom";

import { MAIN_NAV_ITEMS, MORE_NAV_ITEMS } from "@/constants/navigation";
import { ROUTES } from "@/constants/routes";
import { cx } from "@/utils/cx";

const primaryItems = MAIN_NAV_ITEMS.filter((item) => item.path !== ROUTES.more);

function primaryLinkClass({ isActive }: { isActive: boolean }): string {
  return cx(
    "press relative flex min-h-10 items-center gap-2.5 rounded-xl px-3 text-sm font-semibold",
    isActive
      ? "bg-primary-soft text-primary"
      : "text-muted-foreground hover:bg-surface-muted hover:text-foreground",
  );
}

function secondaryLinkClass({ isActive }: { isActive: boolean }): string {
  return cx(
    "press flex min-h-9 items-center gap-2.5 rounded-lg px-3 text-[13px] font-medium",
    isActive ? "bg-surface-muted text-foreground" : "text-muted-foreground hover:text-foreground",
  );
}

export function SideNav() {
  return (
    <nav
      aria-label="Ana navigasyon"
      className="sticky top-0 hidden h-dvh w-[228px] shrink-0 flex-col gap-5 overflow-y-auto border-r border-border bg-surface px-3 py-5 md:flex"
    >
      <div className="flex items-center gap-2.5 px-2">
        <div className="bg-brand-gradient flex h-9 w-9 items-center justify-center rounded-xl text-sm font-black text-primary-foreground shadow-brand">
          R
        </div>
        <div className="leading-tight">
          <p className="text-[15px] font-bold text-foreground">Rota</p>
          <p className="text-[11px] text-muted-foreground">YKS çalışma asistanı</p>
        </div>
      </div>

      <ul className="flex flex-col gap-0.5">
        {primaryItems.map((item) => (
          <li key={item.path}>
            <NavLink to={item.path} end={item.path === ROUTES.home} className={primaryLinkClass}>
              {({ isActive }) => (
                <>
                  <item.icon className="h-[18px] w-[18px]" aria-hidden strokeWidth={isActive ? 2.4 : 2} />
                  {item.label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-1">
        <p className="px-3 text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground/70">
          Daha Fazla
        </p>
        <ul className="flex flex-col">
          {MORE_NAV_ITEMS.map((item) => (
            <li key={item.path}>
              <NavLink to={item.path} className={secondaryLinkClass}>
                <item.icon className="h-4 w-4 shrink-0" aria-hidden />
                <span className="truncate">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

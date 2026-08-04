import { CalendarClock } from "lucide-react";
import { useLocation } from "react-router-dom";

import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { findNavTitle } from "@/constants/navigation";
import { useUserProfile } from "@/hooks/useUserProfile";
import { daysUntilExam, formatFriendlyDate } from "@/utils/date";

export function TopBar() {
  const location = useLocation();
  const { profile } = useUserProfile();

  const today = new Date();
  const title = findNavTitle(location.pathname);
  const remainingDays = profile?.examDate ? daysUntilExam(profile.examDate, today) : null;

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-surface/85 pt-[env(safe-area-inset-top)] backdrop-blur">
      <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-3 px-4 py-2.5 md:px-8 md:py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="bg-brand-gradient flex h-8 w-8 items-center justify-center rounded-lg text-xs font-black text-primary-foreground md:hidden">
            R
          </div>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-[15px] font-bold text-foreground md:text-base">{title}</p>
            <p className="hidden text-xs capitalize text-muted-foreground md:block">{formatFriendlyDate(today)}</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {remainingDays !== null && (
            <span className="hidden items-center gap-1.5 rounded-full border border-border bg-surface-muted px-3 py-1.5 text-[13px] font-semibold text-foreground sm:flex">
              <CalendarClock className="h-4 w-4 text-primary" aria-hidden />
              YKS'ye {remainingDays} gün
            </span>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

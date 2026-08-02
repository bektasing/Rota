import { Moon, Sun } from "lucide-react";

import { useTheme } from "@/hooks/useTheme";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Açık temaya geç" : "Koyu temaya geç"}
      aria-pressed={isDark}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-foreground transition-colors hover:bg-surface-muted active:scale-95"
    >
      {isDark ? <Sun className="h-5 w-5" aria-hidden /> : <Moon className="h-5 w-5" aria-hidden />}
    </button>
  );
}

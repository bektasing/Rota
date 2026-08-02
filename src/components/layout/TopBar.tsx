import { ThemeToggle } from "@/components/ui/ThemeToggle";

export function TopBar() {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-surface/90 px-4 py-3 backdrop-blur md:px-6">
      <div className="flex items-center gap-2 md:hidden">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
          R
        </div>
        <span className="text-base font-semibold">Rota</span>
      </div>
      <div className="hidden md:block" />
      <ThemeToggle />
    </header>
  );
}

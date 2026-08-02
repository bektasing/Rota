import { Outlet } from "react-router-dom";

import { BottomNav } from "@/components/layout/BottomNav";
import { SideNav } from "@/components/layout/SideNav";
import { TopBar } from "@/components/layout/TopBar";

export function AppShell() {
  return (
    <div className="flex min-h-dvh bg-background">
      <SideNav />
      <div className="flex min-h-dvh flex-1 flex-col">
        <TopBar />
        <main className="flex-1 pb-20 md:pb-6">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </div>
  );
}

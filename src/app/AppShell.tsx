import { Navigate, Outlet } from "react-router-dom";

import { BottomNav } from "@/components/layout/BottomNav";
import { SideNav } from "@/components/layout/SideNav";
import { TopBar } from "@/components/layout/TopBar";
import { ROUTES } from "@/constants/routes";
import { useUserProfile } from "@/hooks/useUserProfile";

export function AppShell() {
  const { profile, loading } = useUserProfile();

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background text-sm text-muted-foreground">
        Yükleniyor…
      </div>
    );
  }

  if (!profile || !profile.onboardingCompleted) {
    return <Navigate to={ROUTES.onboarding} replace />;
  }

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

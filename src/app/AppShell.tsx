import { Navigate, Outlet, useLocation } from "react-router-dom";

import { BottomNav } from "@/components/layout/BottomNav";
import { SideNav } from "@/components/layout/SideNav";
import { TopBar } from "@/components/layout/TopBar";
import { ROUTES } from "@/constants/routes";
import { useUserProfile } from "@/hooks/useUserProfile";

export function AppShell() {
  const { profile, loading } = useUserProfile();
  const location = useLocation();

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
      <div className="flex min-h-dvh min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex-1">
          {/* Masaüstünde geniş ama sınırlı içerik alanı; mobilde alt navigasyon için boşluk. */}
          <div
            key={location.pathname}
            className="animate-rise mx-auto w-full max-w-[1440px] px-4 pb-28 pt-5 md:px-8 md:pb-10 md:pt-7"
          >
            <Outlet />
          </div>
        </main>
        <BottomNav />
      </div>
    </div>
  );
}

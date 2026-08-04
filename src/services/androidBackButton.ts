import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";

import { router } from "@/app/routes";
import { ROUTES } from "@/constants/routes";
import { consumeNativeBack } from "@/utils/nativeBackStack";

let listening = false;

/**
 * Android donanım geri tuşunu uygulamanın davranışına bağlar:
 * önce açık bir form/onay paneli varsa onu kapatır, yoksa uygulama içi
 * geçmişte geri gider, kök sayfadaysa uygulamadan çıkar. Yalnızca native
 * Capacitor ortamında etkindir; web/PWA sürümünde tarayıcı geri tuşunu yönetir.
 */
export function setupAndroidBackButton(): void {
  if (listening || !Capacitor.isNativePlatform()) return;
  listening = true;

  App.addListener("backButton", () => {
    if (consumeNativeBack()) return;

    const path = window.location.pathname;
    if (path === ROUTES.home) {
      void App.exitApp();
      return;
    }

    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0;
    if (idx > 0) {
      router.navigate(-1);
    } else {
      void router.navigate(ROUTES.home);
    }
  });
}

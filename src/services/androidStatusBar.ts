import { Capacitor } from "@capacitor/core";
import { Style, StatusBar } from "@capacitor/status-bar";

let listening = false;

function applyForCurrentTheme() {
  const isDark = document.documentElement.classList.contains("dark");
  void StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light });
}

/**
 * Durum çubuğunu içerik altına almadan (edge-to-edge) açık/koyu temayla
 * uyumlu simge rengiyle tutar. Uygulama TopBar'ı zaten
 * `env(safe-area-inset-top)` ile durum çubuğunun altından başlıyor.
 * Yalnızca native Capacitor ortamında etkindir.
 */
export function setupAndroidStatusBar(): void {
  if (listening || !Capacitor.isNativePlatform()) return;
  listening = true;

  void StatusBar.setOverlaysWebView({ overlay: true });
  applyForCurrentTheme();

  new MutationObserver(applyForCurrentTheme).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
}

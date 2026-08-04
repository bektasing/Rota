import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Capacitor } from "@capacitor/core";

import App from "@/app/App";

import "@/index.css";

if (Capacitor.isNativePlatform() && "serviceWorker" in navigator) {
  // vite-plugin-pwa index.html'e koşulsuz bir registerSW.js enjekte eder; bu satır
  // onu yalnızca native Capacitor ortamında sessizce devre dışı bırakır, üretilen
  // dosyalara dokunmadan web/PWA sürümünün service worker davranışını korur.
  navigator.serviceWorker.register = (() =>
    Promise.resolve()) as unknown as typeof navigator.serviceWorker.register;
}

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Kök element (#root) bulunamadı.");
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

import "@testing-library/jest-dom/vitest";
import "fake-indexeddb/auto";

import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// vitest globals kapalı olduğu için @testing-library/react'in otomatik
// cleanup mekanizması tetiklenmiyor; testler arası DOM'u elle temizliyoruz.
afterEach(() => {
  cleanup();
});

// jsdom, window.matchMedia'yı desteklemiyor; tema tespiti bu API'yi kullanıyor.
if (!window.matchMedia) {
  window.matchMedia = (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}

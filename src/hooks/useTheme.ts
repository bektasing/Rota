import { useContext } from "react";

import { ThemeContext, type ThemeContextValue } from "@/store/ThemeContext";

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme, ThemeProvider içinde kullanılmalıdır.");
  }
  return ctx;
}

import { RouterProvider } from "react-router-dom";

import { router } from "@/app/routes";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ThemeProvider } from "@/store/ThemeContext";

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </ErrorBoundary>
  );
}

import { Component, type ErrorInfo, type ReactNode } from "react";
import { RefreshCw } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("Rota beklenmedik bir hatayla karşılaştı:", error, errorInfo);
  }

  handleReload = (): void => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background p-6 text-center text-foreground">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-danger/10 text-danger">
          <RefreshCw className="h-7 w-7" aria-hidden />
        </div>
        <div className="space-y-1">
          <h1 className="text-lg font-semibold">Bir şeyler ters gitti</h1>
          <p className="mx-auto max-w-xs text-sm text-muted-foreground">
            Sayfa beklenmedik bir hatayla karşılaştı. Yeniden yüklemeyi deneyebilirsin, verilerin
            cihazında güvende kalır.
          </p>
        </div>
        <button
          type="button"
          onClick={this.handleReload}
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 active:scale-95"
        >
          Sayfayı yenile
        </button>
      </div>
    );
  }
}

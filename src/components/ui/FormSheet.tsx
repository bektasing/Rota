import type { ReactNode } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/Button";

interface FormSheetProps {
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  /** Kaydet butonunun metni. */
  submitLabel?: string;
  submitting?: boolean;
  onSubmit: () => void;
  error?: string | null;
}

/**
 * Mobilde alttan açılan, masaüstünde ortalanan form paneli.
 * Yeni bir modal kütüphanesi eklemeden tüm formlarda aynı davranışı sağlar.
 */
export function FormSheet({
  title,
  description,
  onClose,
  children,
  submitLabel = "Kaydet",
  submitting = false,
  onSubmit,
  error,
}: FormSheetProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-0 backdrop-blur-[2px] md:items-center md:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="animate-rise flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-panel border border-border bg-surface shadow-lifted md:rounded-panel">
        <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3.5 md:px-6">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-foreground">{title}</h2>
            {description && <p className="mt-0.5 text-[13px] text-muted-foreground">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="press flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-surface-muted hover:text-foreground"
            aria-label="Kapat"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-3.5 overflow-y-auto px-4 py-4 md:px-6">{children}</div>

        <div className="flex items-center justify-end gap-2 border-t border-border bg-surface-subtle px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:px-6">
          {error && <p className="mr-auto text-[13px] font-medium text-danger">{error}</p>}
          <Button variant="ghost" onClick={onClose}>
            Vazgeç
          </Button>
          <Button onClick={onSubmit} disabled={submitting}>
            {submitting ? "Kaydediliyor…" : submitLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

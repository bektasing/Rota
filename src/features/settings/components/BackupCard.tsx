import { useRef, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { Check, DatabaseBackup, Download, Upload } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/features/settings/components/ConfirmDialog";
import type { RotaBackup } from "@/models/backup";
import {
  applyBackup,
  createBackup,
  summarizeBackup,
  type BackupSummary,
} from "@/services/backupService";
import { saveOrShareBackupNative } from "@/services/nativeBackup";
import { toDateKey } from "@/utils/date";
import { downloadJson } from "@/utils/download";
import { readJsonFile } from "@/utils/readJsonFile";
import { validateBackup } from "@/utils/validation";

const isNative = Capacitor.isNativePlatform();

/** Onay ekranında gösterilen kayıt sayıları. */
const SUMMARY_ROWS: [key: keyof BackupSummary, label: string][] = [
  ["subjects", "Ders"],
  ["topics", "Konu"],
  ["studyTasks", "Görev"],
  ["studySessions", "Çalışma oturumu"],
  ["examResults", "Deneme"],
  ["mistakeRecords", "Yanlış"],
  ["reviewItems", "Tekrar"],
  ["goals", "Hedef"],
  ["studyResources", "Kaynak"],
  ["studyNotes", "Not"],
];

const EXPORT_DATE_FORMATTER = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

interface PendingRestore {
  backup: RotaBackup;
  summary: BackupSummary;
  fileName: string;
}

export function BackupCard() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);
  const [pending, setPending] = useState<PendingRestore | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleExport() {
    setExporting(true);
    setError(null);
    try {
      const backup = await createBackup();
      // Yerel tarihe göre anlaşılır dosya adı: rota-yedek-2026-08-04.json
      const filename = `rota-yedek-${toDateKey(new Date())}.json`;
      if (isNative) {
        await saveOrShareBackupNative(filename, backup);
      } else {
        downloadJson(filename, backup);
      }
      setExported(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Yedek oluşturulamadı.");
    } finally {
      setExporting(false);
    }
  }

  async function handleFileSelected(file: File | undefined) {
    if (!file) return;

    setError(null);
    setExported(false);

    try {
      const raw = await readJsonFile(file);
      // Doğrulama tamamlanmadan hiçbir veri silinmez veya yazılmaz.
      const result = validateBackup(raw);

      if (!result.valid) {
        setError(result.error);
        return;
      }

      setPending({
        backup: result.data,
        summary: summarizeBackup(result.data),
        fileName: file.name,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Dosya okunamadı.");
    }
  }

  async function handleConfirmRestore() {
    if (!pending) return;

    setRestoring(true);
    const result = await applyBackup(pending.backup);

    if (!result.success) {
      setRestoring(false);
      setError(result.error ?? "Yedek geri yüklenemedi.");
      setPending(null);
      return;
    }

    // Tüm ekranların yeni veriyle açılması için güvenli tam yenileme.
    window.location.reload();
  }

  return (
    <Card padding="lg" className="flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
          <DatabaseBackup className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <h2 className="text-base font-bold text-foreground">Yedekleme</h2>
          <p className="text-[13px] text-muted-foreground">
            Tüm verilerin cihazında tutulur. JSON yedeğini indirip güvenli bir yerde saklayabilirsin.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={handleExport} disabled={exporting}>
          <Download className="h-4 w-4" aria-hidden />
          {exporting ? "Hazırlanıyor…" : isNative ? "Yedeği kaydet / paylaş" : "Yedeği indir"}
        </Button>
        <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
          <Upload className="h-4 w-4" aria-hidden />
          Yedeği geri yükle
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          aria-label="Yedek dosyası seç"
          onChange={(e) => {
            void handleFileSelected(e.target.files?.[0]);
            // Aynı dosya art arda seçilebilsin diye input sıfırlanır.
            e.target.value = "";
          }}
        />
      </div>

      {exported && (
        <p className="flex items-center gap-1.5 text-[13px] font-semibold text-success">
          <Check className="h-4 w-4" aria-hidden />
          {isNative ? "Yedek dosyan hazır, kaydetmek için paylaşım ekranını kullan." : "Yedek dosyan indirildi."}
        </p>
      )}

      {error && <p className="text-[13px] font-medium text-danger">{error}</p>}

      <p className="text-xs text-muted-foreground">
        Yedek dosyası profilini, derslerini, konularını, görevlerini, çalışma oturumlarını, denemelerini,
        yanlışlarını, tekrarlarını, hedeflerini, kaynaklarını ve notlarını içerir.
      </p>

      {pending && (
        <ConfirmDialog
          title="Yedeği geri yükle"
          description={pending.fileName}
          confirmLabel="Geri yükle"
          confirmVariant="danger"
          busy={restoring}
          busyLabel="Geri yükleniyor…"
          onConfirm={handleConfirmRestore}
          onCancel={() => setPending(null)}
        >
          <p className="text-[13px] text-muted-foreground">
            {EXPORT_DATE_FORMATTER.format(new Date(pending.backup.exportedAt))} tarihinde oluşturulmuş yedek
            (sürüm {pending.backup.version}).
          </p>

          <ul className="grid grid-cols-2 gap-2">
            {SUMMARY_ROWS.map(([key, label]) => (
              <li
                key={key}
                className="flex items-center justify-between gap-2 rounded-xl border border-border bg-surface-subtle px-3 py-2"
              >
                <span className="text-[13px] text-muted-foreground">{label}</span>
                <span className="text-sm font-bold tabular-nums text-foreground">
                  {pending.summary[key] as number}
                </span>
              </li>
            ))}
          </ul>

          <p className="rounded-xl border border-danger/30 bg-danger-soft px-3 py-2.5 text-[13px] font-medium text-danger">
            Bu işlem mevcut tüm verilerinin üzerine yazar. Şu anki kayıtların yedekteki durumla değiştirilir ve
            geri alınamaz.
          </p>
          <p className="text-xs text-muted-foreground">
            {pending.summary.hasProfile
              ? "Yedekteki çalışma tercihlerin de geri yüklenecek."
              : "Bu yedekte profil bilgisi yok; mevcut tercihlerin korunacak."}
          </p>
        </ConfirmDialog>
      )}
    </Card>
  );
}

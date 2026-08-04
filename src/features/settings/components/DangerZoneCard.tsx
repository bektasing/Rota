import { useState } from "react";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { INPUT_CLASS } from "@/components/ui/formStyles";
import { ConfirmDialog } from "@/features/settings/components/ConfirmDialog";
import { resetAllStudyData } from "@/services/resetService";

const CONFIRM_WORD = "SIFIRLA";

const DELETED_ITEMS = [
  "Görevler",
  "Çalışma oturumları",
  "Denemeler",
  "Yanlışlar",
  "Tekrarlar",
  "Hedefler",
  "Kaynaklar",
  "Notlar",
  "Konular ve özel dersler",
  "İstatistiklerin dayandığı tüm kayıtlar",
];

export function DangerZoneCard() {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function close() {
    setOpen(false);
    setConfirmText("");
  }

  async function handleReset() {
    setResetting(true);
    setError(null);

    const result = await resetAllStudyData();

    if (!result.success) {
      setResetting(false);
      setError(result.error ?? "Veriler sıfırlanamadı.");
      return;
    }

    // Tüm ekranların temiz veriyle açılması için güvenli tam yenileme.
    window.location.reload();
  }

  return (
    <Card padding="lg" className="flex flex-col gap-4 border-danger/30">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-danger-soft text-danger">
          <AlertTriangle className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <h2 className="text-base font-bold text-foreground">Tehlikeli bölge</h2>
          <p className="text-[13px] text-muted-foreground">
            Baştan başlamak istersen tüm çalışma kayıtlarını silebilirsin. Bu işlem geri alınamaz.
          </p>
        </div>
      </div>

      <p className="text-[13px] text-muted-foreground">
        Adın, sınav tarihin ve çalışma tercihlerin korunur; varsayılan TYT ve AYT dersleri yeniden oluşturulur.
      </p>

      {error && <p className="text-[13px] font-medium text-danger">{error}</p>}

      <div>
        <Button variant="danger" onClick={() => setOpen(true)}>
          Tüm çalışma verilerini sıfırla
        </Button>
      </div>

      {open && (
        <ConfirmDialog
          title="Tüm çalışma verilerini sıfırla"
          description="Bu işlem geri alınamaz."
          confirmLabel="Verileri sıfırla"
          confirmVariant="danger"
          confirmDisabled={confirmText.trim() !== CONFIRM_WORD}
          busy={resetting}
          busyLabel="Sıfırlanıyor…"
          onConfirm={handleReset}
          onCancel={close}
        >
          <p className="text-[13px] text-muted-foreground">Silinecek kayıtlar:</p>
          <ul className="flex flex-col gap-1.5 rounded-xl border border-border bg-surface-subtle px-3.5 py-3">
            {DELETED_ITEMS.map((item) => (
              <li key={item} className="flex items-center gap-2 text-[13px] text-foreground">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-danger" aria-hidden />
                {item}
              </li>
            ))}
          </ul>

          <p className="rounded-xl border border-danger/30 bg-danger-soft px-3 py-2.5 text-[13px] font-medium text-danger">
            Bu kayıtlar kalıcı olarak silinir ve geri getirilemez. Devam etmeden önce yedek almak isteyebilirsin.
          </p>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="reset-confirm" className="text-[13px] font-semibold text-foreground">
              Onaylamak için <span className="font-black">{CONFIRM_WORD}</span> yaz
            </label>
            <input
              id="reset-confirm"
              type="text"
              autoComplete="off"
              className={INPUT_CLASS}
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={CONFIRM_WORD}
            />
          </div>
        </ConfirmDialog>
      )}
    </Card>
  );
}

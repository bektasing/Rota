import { CalendarDays, Library } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { useSubjects } from "@/hooks/useSubjects";
import { formatFriendlyDate } from "@/utils/date";

export function DashboardPage() {
  const { subjects, loading, error } = useSubjects();
  const tytCount = subjects.filter((subject) => subject.examType === "TYT").length;
  const aytCount = subjects.filter((subject) => subject.examType === "AYT").length;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 p-4 md:p-6">
      <Card className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <CalendarDays className="h-6 w-6" aria-hidden />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-foreground">Merhaba! 👋</h1>
          <p className="text-sm capitalize text-muted-foreground">
            {formatFriendlyDate(new Date())}
          </p>
        </div>
      </Card>

      <Card className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/20 text-accent-foreground">
          <Library className="h-6 w-6" aria-hidden />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-foreground">Ders kütüphanen</h2>
          {loading && <p className="text-sm text-muted-foreground">Dersler yükleniyor…</p>}
          {error && <p className="text-sm text-danger">{error}</p>}
          {!loading && !error && (
            <p className="text-sm text-muted-foreground">
              TYT için {tytCount}, AYT Sayısal için {aytCount} ders hazır.
            </p>
          )}
        </div>
      </Card>

      <EmptyState
        icon={CalendarDays}
        title="Günlük plan ve görevler yakında burada"
        description="Planlayıcı bir sonraki adımda eklenecek. O zamana kadar dersler ve konular sana hazır bekliyor."
      />
    </div>
  );
}

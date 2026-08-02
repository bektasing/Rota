import { useEffect, useState } from "react";

import type { Subject } from "@/models/Subject";
import { ensureDefaultSubjectsSeeded } from "@/services/bootstrapService";

interface UseSubjectsResult {
  subjects: Subject[];
  loading: boolean;
  error: string | null;
}

/** Dersleri IndexedDB'den yükler; tablo boşsa varsayılan dersleri tohumlar. */
export function useSubjects(): UseSubjectsResult {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    ensureDefaultSubjectsSeeded()
      .then((seeded) => {
        if (!cancelled) setSubjects(seeded);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Dersler yüklenirken bir hata oluştu.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { subjects, loading, error };
}

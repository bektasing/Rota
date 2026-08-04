import { useEffect, useState } from "react";

import type { UserProfile } from "@/models/UserProfile";
import { userProfileRepository } from "@/repositories/userProfileRepository";

interface UseUserProfileResult {
  profile: UserProfile | undefined;
  loading: boolean;
}

export function useUserProfile(): UseUserProfileResult {
  const [profile, setProfile] = useState<UserProfile | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    userProfileRepository
      .getProfile()
      .catch(() => undefined)
      .then((found) => {
        // Hata durumunda da yükleme biter; aksi hâlde ekran "Yükleniyor…" da takılırdı.
        if (!cancelled) {
          setProfile(found);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { profile, loading };
}

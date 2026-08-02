import { FIXED_EXAM_DATE, FIXED_USER_NAME } from "@/constants/profile";
import { BaseRepository } from "@/repositories/BaseRepository";
import { STORE_NAMES } from "@/repositories/db";
import type { UserProfile } from "@/models/UserProfile";

class UserProfileRepository extends BaseRepository<UserProfile> {
  constructor() {
    super(STORE_NAMES.userProfile);
  }

  /**
   * Uygulama tek kullanıcılıdır; ilk (ve tek) profili döndürür.
   * Rota yalnızca Nisa için geliştirildiği için, farklı bir isim veya sınav
   * tarihiyle kaydedilmiş eski bir profil bulunursa (örn. önceki test verisi)
   * diğer tercihler korunarak sessizce sabit değerlere göçürülür.
   */
  async getProfile(): Promise<UserProfile | undefined> {
    const all = await this.getAll();
    const profile = all[0];
    if (!profile) return undefined;

    if (profile.name !== FIXED_USER_NAME || profile.examDate !== FIXED_EXAM_DATE) {
      const migrated: UserProfile = {
        ...profile,
        name: FIXED_USER_NAME,
        examDate: FIXED_EXAM_DATE,
        updatedAt: new Date().toISOString(),
      };
      await this.put(migrated);
      return migrated;
    }

    return profile;
  }

  async saveProfile(profile: UserProfile): Promise<UserProfile> {
    return this.put(profile);
  }
}

export const userProfileRepository = new UserProfileRepository();

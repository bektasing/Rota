import { BaseRepository } from "@/repositories/BaseRepository";
import { STORE_NAMES } from "@/repositories/db";
import type { UserProfile } from "@/models/UserProfile";

class UserProfileRepository extends BaseRepository<UserProfile> {
  constructor() {
    super(STORE_NAMES.userProfile);
  }

  /** Uygulama tek kullanıcılıdır; ilk (ve tek) profili döndürür. */
  async getProfile(): Promise<UserProfile | undefined> {
    const all = await this.getAll();
    return all[0];
  }

  async saveProfile(profile: UserProfile): Promise<UserProfile> {
    return this.put(profile);
  }
}

export const userProfileRepository = new UserProfileRepository();

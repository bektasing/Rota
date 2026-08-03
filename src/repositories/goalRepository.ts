import { BaseRepository } from "@/repositories/BaseRepository";
import { STORE_NAMES } from "@/repositories/db";
import type { Goal } from "@/models/Goal";

class GoalRepository extends BaseRepository<Goal> {
  constructor() {
    super(STORE_NAMES.goals);
  }
}

export const goalRepository = new GoalRepository();

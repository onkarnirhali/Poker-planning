// backend/src/services/VoteService.ts
import { Repository, DataSource } from "typeorm";
import { Vote } from "../entities/Vote";

export class VoteService {
  private voteRepo: Repository<Vote>;

  constructor(ds: DataSource) {
    this.voteRepo = ds.getRepository(Vote);
  }

  /** Save multiple votes at once */
  async saveVotes(votes: { storyId: string; userId: string; value: string }[]) {
    const voteEntities = votes.map(v =>
      this.voteRepo.create({
        story_id: v.storyId,
        user_id: v.userId,
        value: v.value,
        isRevealed: true,
      })
    );
    return this.voteRepo.save(voteEntities);
  }
}
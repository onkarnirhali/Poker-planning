// backend/src/services/StoryService.ts

import { Repository, DataSource } from "typeorm";
import { Story } from "../entities/Story";

export class StoryService {
  private storyRepository: Repository<Story>;

  constructor(dataSource: DataSource) {
    this.storyRepository = dataSource.getRepository(Story);
  }

  /**
   * Add a new story to a session.
   * Enforces a maximum of 20 stories per session.
   */
  async addStory(
    sessionId: string,
    title: string,
    description?: string,
    storyType: string = "feature",
    priority?: string
  ) {
    // 1) Check existing count
    const count = await this.storyRepository.count({ where: { session_id: sessionId } });
    if (count >= 20) {
      throw new Error("Cannot exceed 20 stories per session");
    }

    // 2) Create a new Story entity
    const story = this.storyRepository.create({
      session_id: sessionId,
      title,
      description,
      storyType,
      priority,
      orderIndex: count, // place at the end
      isClosed: false    // default
    });

    // 3) Save to DB
    return await this.storyRepository.save(story);
  }

  /**
   * Get all stories for a session, ordered by orderIndex.
   */
  async getStories(sessionId: string) {
    return await this.storyRepository.find({
      where: { session_id: sessionId },
      order: { orderIndex: "ASC" },
    });
  }

  /**
   * Update a story’s fields.
   * Cannot update a story that is already closed.
   */
  async updateStory(
    storyId: string,
    updates: Partial<Story>,
    facilitatorId: string // we’ll assume session‐level ownership is checked in controller
  ) {
    const story = await this.storyRepository.findOne({ where: { id: storyId } });
    if (!story) {
      throw new Error("Story not found");
    }
    if (story.isClosed) {
      throw new Error("Cannot edit a closed story");
    }

    Object.assign(story, updates);
    return await this.storyRepository.save(story);
  }

  /**
   * Delete a story (only if not closed).
   */
  async deleteStory(storyId: string) {
    const story = await this.storyRepository.findOne({ where: { id: storyId } });
    if (!story) {
      throw new Error("Story not found");
    }
    if (story.isClosed) {
      throw new Error("Cannot delete a closed story");
    }
    await this.storyRepository.delete(storyId);
  }

  /**
   * Reorder stories given a new array of story IDs.
   * The order of IDs in newOrder array corresponds to ascending orderIndex.
   */
  async reorderStories(sessionId: string, newOrder: string[]) {
    // Loop through each storyId in newOrder
    for (let index = 0; index < newOrder.length; index++) {
      const storyId = newOrder[index];
      // Update only if belongs to this session (to avoid hijacking)
      await this.storyRepository.update(
        { id: storyId, session_id: sessionId },
        { orderIndex: index }
      );
    }
  }
}
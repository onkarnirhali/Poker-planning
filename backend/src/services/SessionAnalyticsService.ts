// backend/src/services/SessionAnalyticsService.ts

import { Repository, DataSource } from "typeorm";
import { Session } from "../entities/Session";
import { Story } from "../entities/Story";
import { Vote } from "../entities/Vote";

export class SessionAnalyticsService {
  private sessionRepository: Repository<Session>;
  private storyRepository: Repository<Story>;
  private voteRepository: Repository<Vote>;

  constructor(dataSource: DataSource) {
    this.sessionRepository = dataSource.getRepository(Session);
    this.storyRepository = dataSource.getRepository(Story);
    this.voteRepository = dataSource.getRepository(Vote);
  }

  /**
   * Get comprehensive analytics for a session
   */
  async getSessionAnalytics(sessionId: string) {
    // 1. Get basic session info
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
      relations: ['facilitator']
    });

    if (!session) {
      throw new Error("Session not found");
    }

    // 2. Get all stories for this session
    const stories = await this.storyRepository.find({
      where: { session_id: sessionId },
      order: { orderIndex: "ASC" }
    });

    // 3. Calculate story progress
    const storyProgress = this.calculateStoryProgress(stories);

    // 4. Determine session status
    const sessionStatus = this.calculateSessionStatus(storyProgress, session);

    // 5. Get participant count (from votes table - unique users who voted)
    const participantCount = await this.getParticipantCount(sessionId);

    return {
      sessionId,
      basicInfo: {
        name: session.name,
        deckType: session.deckType,
        createdAt: session.createdAt,
        facilitatorId: session.facilitator_id,
        timerDuration: session.timerDuration,
        maxParticipants: session.maxParticipants
      },
      storyProgress: {
        totalStories: storyProgress.totalStories,
        estimatedStories: storyProgress.estimatedStories,
        pendingStories: storyProgress.pendingStories,
        completionRate: storyProgress.completionRate
      },
      stories: stories.map(story => ({
        id: story.id,
        title: story.title,
        description: story.description,
        storyType: story.storyType,
        priority: story.priority,
        orderIndex: story.orderIndex,
        status: this.getStoryStatus(story),
        finalScore: story.finalScore || null,
        createdAt: story.createdAt,
        updatedAt: story.updatedAt
      })),
      participantCount,
      currentStatus: sessionStatus,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Calculate story progress metrics
   */
  private calculateStoryProgress(stories: Story[]) {
    const totalStories = stories.length;
    const estimatedStories = stories.filter(story => 
      story.finalScore !== null && story.finalScore !== undefined
    ).length;
    const pendingStories = totalStories - estimatedStories;
    const completionRate = totalStories > 0 ? Math.round((estimatedStories / totalStories) * 100) : 0;

    return {
      totalStories,
      estimatedStories,
      pendingStories,
      completionRate
    };
  }

  /**
   * Determine individual story status
   */
  private getStoryStatus(story: Story): 'estimated' | 'pending' {
    // If story has a final score, it's estimated
    if (story.finalScore !== null && story.finalScore !== undefined) {
      return 'estimated';
    }
    
    // Otherwise it's pending
    return 'pending';
  }

  /**
   * Calculate overall session status based on story progress
   */
  private calculateSessionStatus(storyProgress: any, session: Session): 'draft' | 'active' | 'completed' {
    const { totalStories, completionRate } = storyProgress;
    
    // Completed: All stories have final scores
    if (totalStories > 0 && completionRate === 100) {
      return 'completed';
    }
    
    // Active: Has stories and some progress
    if (totalStories > 0) {
      return 'active';
    }
    
    // Draft: No stories yet
    return 'draft';
  }

  /**
   * Get count of unique participants who have voted
   */
  private async getParticipantCount(sessionId: string): Promise<number> {
    try {
      // Get all stories for this session first
      const stories = await this.storyRepository.find({
        where: { session_id: sessionId },
        select: ['id']
      });

      if (stories.length === 0) {
        return 0;
      }

      const storyIds = stories.map(story => story.id);

      // Count unique users who have voted on any story in this session
      const result = await this.voteRepository
        .createQueryBuilder('vote')
        .select('COUNT(DISTINCT vote.user_id)', 'count')
        .where('vote.story_id IN (:...storyIds)', { storyIds })
        .getRawOne();

      return parseInt(result.count) || 0;
    } catch (error) {
      console.error('Error calculating participant count:', error);
      return 0;
    }
  }

  /**
   * Get analytics for multiple sessions (for sessions list page)
   */
  async getMultipleSessionsAnalytics(sessionIds: string[]) {
    const analyticsPromises = sessionIds.map(sessionId => 
      this.getSessionAnalytics(sessionId).catch(error => {
        console.error(`Error getting analytics for session ${sessionId}:`, error);
        return null;
      })
    );

    const results = await Promise.all(analyticsPromises);
    
    // Filter out failed requests and return successful ones
    return results.filter(result => result !== null);
  }
}
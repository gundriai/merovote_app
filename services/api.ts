// API service for MeroVote mobile app
import { AggregatedPoll, PollStats } from '../types';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://txmr1pcp-3300.inc1.devtunnels.ms';

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Get access token from storage (same as web app)
    const accessToken = await this.getAccessToken();
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add authorization header if token exists (same as web app)
    if (accessToken) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${accessToken}`,
      };
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const text = await response.text() || response.statusText;
        throw new Error(`${response.status}: ${text}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  private async getAccessToken(): Promise<string | null> {
    // TODO: Implement proper token storage for mobile
    // For now, return null to match unauthenticated behavior
    return null;
  }

  // Polls API - Using Aggregated Polls API
  async getPolls(category?: string): Promise<AggregatedPoll[]> {
    if (category && category !== 'ALL') {
      const response = await this.request<{polls: AggregatedPoll[]}>(`/api/aggregated-polls/category/${category}`);
      return response.polls;
    } else {
      const response = await this.request<{polls: AggregatedPoll[]}>('/api/aggregated-polls');
      return response.polls;
    }
  }

  async getPollById(id: string): Promise<AggregatedPoll> {
    return this.request<AggregatedPoll>(`/api/aggregated-polls/${id}`);
  }

  async voteOnPoll(pollId: string, optionId: string): Promise<void> {
    return this.request<void>('/api/votes', {
      method: 'POST',
      body: JSON.stringify({ 
        pollId, 
        optionId,
        // Note: userId should be added from auth context
      }),
    });
  }

  // Admin API - Using regular polls API for admin operations
  async getAdminStats(): Promise<PollStats> {
    // Get stats from aggregated polls response
    const response = await this.request<{totalPolls: number, totalVotes: number, totalComments: number}>('/api/aggregated-polls');
    return {
      totalPolls: response.totalPolls,
      activePolls: response.totalPolls, // Assuming all visible polls are active
      totalVotes: response.totalVotes,
      totalComments: response.totalComments,
    };
  }

  async getAdminPolls(): Promise<AggregatedPoll[]> {
    // For admin, get all polls including hidden ones
    const response = await this.request<{polls: AggregatedPoll[]}>('/api/aggregated-polls');
    return response.polls;
  }

  async createPoll(pollData: any): Promise<AggregatedPoll> {
    return this.request<AggregatedPoll>('/api/admin/polls', {
      method: 'POST',
      body: JSON.stringify(pollData),
    });
  }

  async updatePoll(pollId: string, pollData: any): Promise<AggregatedPoll> {
    return this.request<AggregatedPoll>(`/api/admin/polls/${pollId}`, {
      method: 'PUT',
      body: JSON.stringify(pollData),
    });
  }

  async deletePoll(pollId: string): Promise<void> {
    return this.request<void>(`/api/admin/polls/${pollId}`, {
      method: 'DELETE',
    });
  }

  async togglePollVisibility(pollId: string): Promise<void> {
    return this.request<void>(`/api/admin/polls/${pollId}/toggle-visibility`, {
      method: 'PATCH',
    });
  }

  // Auth API
  async getCurrentUser(): Promise<any> {
    return this.request<any>('/api/auth/me');
  }

  async logout(): Promise<void> {
    return this.request<void>('/api/auth/logout', {
      method: 'POST',
    });
  }

  // Comments API - Using same approach as web app
  async addComment(pollId: string, content: string, author?: string): Promise<void> {
    try {
      // Get current poll data
      const poll = await this.getPollById(pollId);
      
      // Create new comment
      const newComment = {
        id: `comment_${Date.now()}`,
        pollId,
        content,
        author: author || 'Anonymous',
        createdAt: new Date().toISOString(),
        gajjabCount: 0,
        bekarCount: 0,
        furiousCount: 0
      };

      // Add comment to existing comments
      const updatedComments = [...(poll.comments || []), newComment];

      // Update poll with new comment using PATCH (same as web app)
      return this.request<void>(`/api/polls/${pollId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          comments: updatedComments
        }),
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      throw new Error('Failed to add comment');
    }
  }

  async addCommentReaction(pollId: string, commentId: string, reactionType: 'gajjab' | 'bekar' | 'furious'): Promise<void> {
    try {
      // Get current poll data
      const poll = await this.getPollById(pollId);
      
      // Find and update the comment
      const updatedComments = (poll.comments || []).map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            [`${reactionType}Count`]: (comment[`${reactionType}Count`] || 0) + 1
          };
        }
        return comment;
      });

      // Update poll with updated comments using PATCH (same as web app)
      return this.request<void>(`/api/polls/${pollId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          comments: updatedComments
        }),
      });
    } catch (error) {
      console.error('Error adding comment reaction:', error);
      throw new Error('Failed to add comment reaction');
    }
  }

  async getComments(pollId: string): Promise<any[]> {
    // Comments are included in the poll data, so we don't need a separate endpoint
    const poll = await this.getPollById(pollId);
    return poll.comments || [];
  }
}

export const apiService = new ApiService();


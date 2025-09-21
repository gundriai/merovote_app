// API service for MeroVote mobile app
import { AggregatedPoll, PollStats } from '../types';
import { StorageManager } from './storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://merovotebackend-app-hxb0g6deh8auc5gh.centralindia-01.azurewebsites.net';

// Error handling utility
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private async throwIfResNotOk(res: Response): Promise<void> {
    if (!res.ok) {
      const text = (await res.text()) || res.statusText;
      throw new ApiError(res.status, text);
    }
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
      await this.throwIfResNotOk(response);
      return await response.json();
    } catch (error) {
      console.log('API request failed:', error);
      throw error;
    }
  }

  private async getAccessToken(): Promise<string | null> {
    try {
      return await StorageManager.getAccessToken();
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }

  private async getCurrentUserData(): Promise<any | null> {
    try {
      return await StorageManager.getUserData();
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
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

  async voteOnPoll(pollId: string, optionId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Get current user data to include userId
      const userData = await this.getCurrentUserData();
      if (!userData) {
        return { success: false, error: 'Authentication required' };
      }

      await this.request<void>('/api/votes', {
        method: 'POST',
        body: JSON.stringify({ 
          pollId, 
          optionId,
          userId: userData.id,
        }),
      });
      return { success: true };
    } catch (error) {
      console.error('Error voting on poll:', error);
      if (error instanceof ApiError) {
        if (error.status === 401) {
          return { success: false, error: 'Authentication required' };
        }
        if (error.status === 400) {
          // Handle specific backend error messages
          const errorMessage = error.message;
          if (errorMessage.includes('Already Voted')) {
            return { success: false, error: 'You have already voted on this poll' };
          }
          if (errorMessage.includes('Poll is not active')) {
            return { success: false, error: 'This poll is not currently active' };
          }
          if (errorMessage.includes('Poll not found')) {
            return { success: false, error: 'Poll not found' };
          }
          return { success: false, error: 'Failed to vote on poll' };
        }
        return { success: false, error: 'Failed to vote on poll' };
      }
      return { success: false, error: 'Network error' };
    }
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

  // Comments API - Try different approach
  async addComment(pollId: string, content: string, author?: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Try using a dedicated comment endpoint first
      try {
        await this.request<void>('/api/comments', {
          method: 'POST',
          body: JSON.stringify({
            pollId,
            content,
            author: author || 'Anonymous',
          }),
        });
        return { success: true };
      } catch (commentError) {
        console.log('Dedicated comment endpoint failed, trying poll update approach:', commentError);
        
        // Fallback to poll update approach (same as web app)
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
        await this.request<void>(`/api/polls/${pollId}`, {
          method: 'PATCH',
          body: JSON.stringify({
            comments: updatedComments
          }),
        });
        return { success: true };
      }
    } catch (error) {
      console.log('Error adding comment:', error);
      if (error instanceof ApiError) {
        if (error.status === 401) {
          return { success: false, error: 'Authentication required' };
        }
        return { success: false, error: 'Failed to add comment' };
      }
      return { success: false, error: 'Network error' };
    }
  }

  async addCommentReaction(pollId: string, commentId: string, reactionType: 'gajjab' | 'bekar' | 'furious'): Promise<{ success: boolean; error?: string }> {
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
      await this.request<void>(`/api/polls/${pollId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          comments: updatedComments
        }),
      });
      return { success: true };
    } catch (error) {
      console.log('Error adding comment reaction:', error);
      if (error instanceof ApiError) {
        if (error.status === 401) {
          return { success: false, error: 'Authentication required' };
        }
        return { success: false, error: 'Failed to add comment reaction' };
      }
      return { success: false, error: 'Network error' };
    }
  }

  async getComments(pollId: string): Promise<any[]> {
    // Comments are included in the poll data, so we don't need a separate endpoint
    const poll = await this.getPollById(pollId);
    return poll.comments || [];
  }
}

export const apiService = new ApiService();


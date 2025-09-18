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
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
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
}

export const apiService = new ApiService();

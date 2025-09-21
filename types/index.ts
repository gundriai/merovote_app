// Shared types for the MeroVote mobile app
export interface PollCategory {
  id: string;
  label: string;
  icon: string;
  order: number;
  labelKey: string; // Translation key
}

export interface PollOption {
  id: string;
  label: string;
  type?: string;
  icon?: string;
  color?: string;
  voteCount: number;
  candidateId?: string;
}

export interface Candidate {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  voteCount: number;
}

export interface Comment {
  id: string;
  pollId?: string; // Make optional for mock data compatibility
  content: string;
  author: string;
  createdAt: string;
  gajjabCount: number;
  bekarCount: number;
  furiousCount: number;
}

export interface AggregatedPoll {
  id: string;
  title: string;
  description?: string;
  type: 'REACTION_BASED' | 'ONE_VS_ONE';
  category: string;
  startDate: string;
  endDate: string;
  isHidden: boolean;
  totalVotes: number;
  totalComments: number;
  createdAt: string;
  mediaUrl?: string;
  pollOptions?: PollOption[];
  candidates?: Candidate[];
  comments?: Comment[];
  voteCounts?: { [key: string]: number };
  votedDetails?: {
    alreadyVoted: boolean;
    optionChosen?: string;
  };
}

export interface PollStats {
  totalPolls: number;
  activePolls: number;
  totalVotes: number;
  totalComments: number;
}

export interface User {
  id: string;
  name?: string;
  email?: string;
  photo?: string;
  role?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface VoteOption {
  type: string;
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  hoverColor: string;
}

export interface Banner {
  id: string;
  imageUrl: string;
  imageAlt: string;
  title: string;
  subtitle?: string;
  button?: {
    text: string;
    href: string;
  };
  order?: number;
  likeCount?: number;
  isActive?: boolean;
}

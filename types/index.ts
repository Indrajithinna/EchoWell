// Main type definitions
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  created_at: string;
}

export interface Session {
  user: User;
  expires: string;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
}

// Voice conversation types
export interface VoiceMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  audioUrl?: string
  timestamp: Date
  duration?: number
}

export interface VoiceSession {
  id: string
  conversationId: string
  startTime: Date
  endTime?: Date
  totalDuration: number
  messageCount: number
}

// Chat-related type definitions
export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  metadata?: {
    mood?: number;
    context?: string;
  };
}

export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
}

export interface ChatContext {
  currentMood?: number;
  recentMoods: number[];
  userGoals: string[];
  musicPreferences: string[];
}

export interface CrisisDetection {
  isCrisis: boolean;
  confidence: number;
  suggestedActions: string[];
}

export interface DailySummary {
  id: string
  user_id: string
  date: string
  conversation_count: number
  total_messages: number
  avg_mood_score: number | null
  dominant_emotions: Record<string, number>
  topics_discussed: string[]
  conversation_quality: 'short' | 'moderate' | 'deep'
  ai_insights: string | null
  voice_tone_analysis: {
    avg_tone: string
    tone_variations: Record<string, number>
    emotional_stability: number
  }
  created_at: string
  updated_at: string
}

export interface VoiceToneLog {
  id: string
  user_id: string
  conversation_id: string
  tone_detected: string
  confidence_score: number
  pitch_average: number
  speech_rate: number
  energy_level: 'low' | 'medium' | 'high'
  emotional_state: Record<string, any>
  recorded_at: string
}

export interface ConversationMetrics {
  id: string
  user_id: string
  conversation_id: string
  duration_seconds: number
  message_count: number
  avg_response_time: number
  topics_covered: string[]
  depth_score: number
  engagement_score: number
  created_at: string
}

export interface ConversationInsights {
  emotionalTrend: 'improving' | 'stable' | 'declining'
  topTopics: Array<{
    topic: string
    frequency: number
    sentiment: 'positive' | 'neutral' | 'negative'
  }>
  moodPatterns: {
    morning: number
    afternoon: number
    evening: number
  }
  conversationQuality: {
    averageDepth: number
    engagementLevel: number
    therapeuticValue: number
  }
  recommendations: string[]
}

export interface WeeklySummary {
  week_start: string
  total_conversations: number
  total_messages: number
  avg_daily_mood: number
  emotional_growth: number
  top_themes: string[]
  progress_areas: string[]
  achievements: string[]
  insights: string
}

export interface MonthlyReport {
  month: string
  total_sessions: number
  mood_trend: 'improving' | 'stable' | 'declining'
  emotional_stability_score: number
  therapeutic_progress: number
  goals_achieved: number
  insights: string
  recommendations: string[]
}

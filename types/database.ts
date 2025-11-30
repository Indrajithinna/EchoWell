export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          image: string | null
          subscription_tier: 'free' | 'premium'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          image?: string | null
          subscription_tier?: 'free' | 'premium'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          image?: string | null
          subscription_tier?: 'free' | 'premium'
          updated_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          user_id: string
          title: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          role: 'user' | 'assistant'
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          role: 'user' | 'assistant'
          content: string
          created_at?: string
        }
      }
      mood_logs: {
        Row: {
          id: string
          user_id: string
          mood_score: number
          emotions: string[]
          notes: string | null
          logged_at: string
        }
        Insert: {
          id?: string
          user_id: string
          mood_score: number
          emotions: string[]
          notes?: string | null
          logged_at?: string
        }
      }
      music_sessions: {
        Row: {
          id: string
          user_id: string
          mood_before: number | null
          mood_after: number | null
          track_ids: string[]
          duration: number
          session_type: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          mood_before?: number | null
          mood_after?: number | null
          track_ids: string[]
          duration: number
          session_type: string
          created_at?: string
        }
      }
      therapy_goals: {
        Row: {
          id: string
          user_id: string
          goal_text: string
          status: 'active' | 'completed' | 'paused'
          progress: number
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          goal_text: string
          status?: 'active' | 'completed' | 'paused'
          progress?: number
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          goal_text?: string
          status?: 'active' | 'completed' | 'paused'
          progress?: number
          completed_at?: string | null
        }
      }
      daily_summaries: {
        Row: {
          id: string
          user_id: string
          date: string
          conversation_count: number
          total_messages: number
          avg_mood_score: number | null
          dominant_emotions: Json
          topics_discussed: string[]
          conversation_quality: 'short' | 'moderate' | 'deep'
          ai_insights: string | null
          voice_tone_analysis: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          conversation_count?: number
          total_messages?: number
          avg_mood_score?: number | null
          dominant_emotions?: Json
          topics_discussed?: string[]
          conversation_quality?: 'short' | 'moderate' | 'deep'
          ai_insights?: string | null
          voice_tone_analysis?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          conversation_count?: number
          total_messages?: number
          avg_mood_score?: number | null
          dominant_emotions?: Json
          topics_discussed?: string[]
          conversation_quality?: 'short' | 'moderate' | 'deep'
          ai_insights?: string | null
          voice_tone_analysis?: Json
          updated_at?: string
        }
      }
      voice_tone_logs: {
        Row: {
          id: string
          user_id: string
          conversation_id: string
          tone_detected: string
          confidence_score: number
          pitch_average: number
          speech_rate: number
          energy_level: 'low' | 'medium' | 'high'
          emotional_state: Json
          recorded_at: string
        }
        Insert: {
          id?: string
          user_id: string
          conversation_id: string
          tone_detected: string
          confidence_score: number
          pitch_average: number
          speech_rate: number
          energy_level: 'low' | 'medium' | 'high'
          emotional_state?: Json
          recorded_at?: string
        }
      }
      conversation_metrics: {
        Row: {
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
        Insert: {
          id?: string
          user_id: string
          conversation_id: string
          duration_seconds: number
          message_count: number
          avg_response_time: number
          topics_covered?: string[]
          depth_score: number
          engagement_score: number
          created_at?: string
        }
      }
    }
  }
}

export type User = Database['public']['Tables']['users']['Row']
export type Conversation = Database['public']['Tables']['conversations']['Row']
export type Message = Database['public']['Tables']['messages']['Row']
export type MoodLog = Database['public']['Tables']['mood_logs']['Row']
export type MusicSession = Database['public']['Tables']['music_sessions']['Row']
export type TherapyGoal = Database['public']['Tables']['therapy_goals']['Row']
export type DailySummary = Database['public']['Tables']['daily_summaries']['Row']
export type VoiceToneLog = Database['public']['Tables']['voice_tone_logs']['Row']
export type ConversationMetrics = Database['public']['Tables']['conversation_metrics']['Row']

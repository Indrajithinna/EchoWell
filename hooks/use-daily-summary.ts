'use client'

import { useState, useEffect, useCallback } from 'react'

interface DailySummary {
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

interface WeeklySummary {
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

interface MonthlySummary {
  month: string
  total_sessions: number
  mood_trend: 'improving' | 'stable' | 'declining'
  emotional_stability_score: number
  therapeutic_progress: number
  goals_achieved: number
  insights: string
  recommendations: string[]
}

interface UseDailySummaryReturn {
  dailySummary: DailySummary | null
  weeklySummary: WeeklySummary | null
  monthlySummary: MonthlySummary | null
  isLoading: boolean
  error: string | null
  generateSummary: (date?: string) => Promise<DailySummary | null>
  fetchWeeklySummary: (date?: string) => Promise<WeeklySummary | null>
  fetchMonthlySummary: (date?: string) => Promise<MonthlySummary | null>
  refetch: () => Promise<void>
}

export function useDailySummary(initialDate?: string): UseDailySummaryReturn {
  const [dailySummary, setDailySummary] = useState<DailySummary | null>(null)
  const [weeklySummary, setWeeklySummary] = useState<WeeklySummary | null>(null)
  const [monthlySummary, setMonthlySummary] = useState<MonthlySummary | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDailySummary = useCallback(async (date?: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const dateParam = date || new Date().toISOString().split('T')[0]
      const response = await fetch(`/api/daily-summary?date=${dateParam}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch daily summary')
      }

      const data = await response.json()
      setDailySummary(data.summary)
      return data.summary
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      console.error('Daily summary fetch error:', err)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const generateSummary = useCallback(async (date?: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/daily-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to generate daily summary')
      }

      const data = await response.json()
      setDailySummary(data.summary)
      return data.summary
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      console.error('Daily summary generation error:', err)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchWeeklySummary = useCallback(async (date?: string) => {
    try {
      const dateParam = date || new Date().toISOString().split('T')[0]
      const response = await fetch(`/api/analytics/summaries?type=weekly&date=${dateParam}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch weekly summary')
      }

      const data = await response.json()
      setWeeklySummary(data.summaries)
      return data.summaries
    } catch (err) {
      console.error('Weekly summary fetch error:', err)
      return null
    }
  }, [])

  const fetchMonthlySummary = useCallback(async (date?: string) => {
    try {
      const dateParam = date || new Date().toISOString().split('T')[0]
      const response = await fetch(`/api/analytics/summaries?type=monthly&date=${dateParam}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch monthly summary')
      }

      const data = await response.json()
      setMonthlySummary(data.summaries)
      return data.summaries
    } catch (err) {
      console.error('Monthly summary fetch error:', err)
      return null
    }
  }, [])

  const refetch = useCallback(() => {
    return fetchDailySummary(initialDate)
  }, [fetchDailySummary, initialDate])

  useEffect(() => {
    if (initialDate) {
      fetchDailySummary(initialDate)
    }
  }, [fetchDailySummary, initialDate])

  return {
    dailySummary,
    weeklySummary,
    monthlySummary,
    isLoading,
    error,
    generateSummary,
    fetchWeeklySummary,
    fetchMonthlySummary,
    refetch,
  }
}

'use client'

import { useState, useEffect, useCallback } from 'react'

interface WeeklySummary {
  period: {
    start: string
    end: string
  }
  metrics: {
    daysActive: number
    totalConversations: number
    totalMessages: number
    avgMood: number
  }
  topTopics: Array<{
    topic: string
    count: number
  }>
  topEmotions: Array<{
    emotion: string
    count: number
  }>
  toneTrend: string[]
  insights: {
    overview: string
    patterns: string
    growth: string
    recommendations: string[]
    celebration: string
  }
}

interface UseWeeklySummaryReturn {
  summary: WeeklySummary | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useWeeklySummary(): UseWeeklySummaryReturn {
  const [summary, setSummary] = useState<WeeklySummary | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchWeeklySummary = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/weekly-summary')
      
      if (!response.ok) {
        throw new Error('Failed to fetch weekly summary')
      }

      const data = await response.json()
      setSummary(data.summary)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      console.error('Weekly summary fetch error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const refetch = useCallback(() => {
    return fetchWeeklySummary()
  }, [fetchWeeklySummary])

  useEffect(() => {
    fetchWeeklySummary()
  }, [fetchWeeklySummary])

  return {
    summary,
    isLoading,
    error,
    refetch,
  }
}

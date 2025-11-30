'use client'

import { useState, useEffect, useCallback } from 'react'

interface VoiceToneLog {
  id: string
  user_id: string
  conversation_id: string | null
  tone_detected: string
  confidence_score: number
  pitch_average: number
  speech_rate: number
  energy_level: string
  emotional_state: {
    valence: number
    arousal: number
    dominance: number
  }
  recorded_at: string
}

interface UseVoiceToneLogsReturn {
  logs: VoiceToneLog[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  getLogsByDateRange: (days: number) => Promise<void>
}

export function useVoiceToneLogs(initialDays: number = 7): UseVoiceToneLogsReturn {
  const [logs, setLogs] = useState<VoiceToneLog[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchLogs = useCallback(async (days: number) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/voice/tone-analysis?days=${days}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch voice tone logs')
      }

      const data = await response.json()
      setLogs(data.logs || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      console.error('Voice tone logs fetch error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const refetch = useCallback(() => {
    return fetchLogs(7) // Default to 7 days
  }, [fetchLogs])

  const getLogsByDateRange = useCallback((days: number) => {
    return fetchLogs(days)
  }, [fetchLogs])

  useEffect(() => {
    fetchLogs(initialDays)
  }, [fetchLogs, initialDays])

  return {
    logs,
    isLoading,
    error,
    refetch,
    getLogsByDateRange,
  }
}

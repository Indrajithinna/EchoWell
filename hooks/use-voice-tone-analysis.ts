'use client'

import { useState, useCallback } from 'react'
import { VoiceToneResult } from '@/lib/voice-analysis'

interface UseVoiceToneAnalysisReturn {
  isAnalyzing: boolean
  toneResult: VoiceToneResult | null
  error: string | null
  analyzeTone: (audioBlob: Blob, conversationId?: string) => Promise<VoiceToneResult | null>
  reset: () => void
}

export function useVoiceToneAnalysis(): UseVoiceToneAnalysisReturn {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [toneResult, setToneResult] = useState<VoiceToneResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const analyzeTone = useCallback(async (audioBlob: Blob, conversationId?: string): Promise<VoiceToneResult | null> => {
    setIsAnalyzing(true)
    setError(null)
    
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'audio.wav')
      if (conversationId) {
        formData.append('conversationId', conversationId)
      }

      const response = await fetch('/api/voice/analyze-tone', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to analyze voice tone')
      }

      const data = await response.json()
      const result = data.toneResult as VoiceToneResult
      
      setToneResult(result)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      console.error('Voice tone analysis error:', err)
      return null
    } finally {
      setIsAnalyzing(false)
    }
  }, [])

  const reset = useCallback(() => {
    setToneResult(null)
    setError(null)
    setIsAnalyzing(false)
  }, [])

  return {
    isAnalyzing,
    toneResult,
    error,
    analyzeTone,
    reset,
  }
}

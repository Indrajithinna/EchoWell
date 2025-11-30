'use client'

import { useState, useEffect } from 'react'
import { Mic, Brain, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useVoiceToneAnalysis } from '@/hooks/use-voice-tone-analysis'
import { VoiceToneResult } from '@/lib/voice-analysis'

interface VoiceToneAnalyzerProps {
  audioBlob: Blob | null
  conversationId?: string
  onToneDetected?: (toneResult: VoiceToneResult) => void
  showRecommendations?: boolean
}

export default function VoiceToneAnalyzer({
  audioBlob,
  conversationId,
  onToneDetected,
  showRecommendations = true,
}: VoiceToneAnalyzerProps) {
  const { isAnalyzing, toneResult, error, analyzeTone, reset } = useVoiceToneAnalysis()
  const [hasAnalyzed, setHasAnalyzed] = useState(false)

  useEffect(() => {
    if (audioBlob && !hasAnalyzed) {
      analyzeTone(audioBlob, conversationId).then((result) => {
        if (result && onToneDetected) {
          onToneDetected(result)
        }
        setHasAnalyzed(true)
      })
    }
  }, [audioBlob, conversationId, hasAnalyzed, analyzeTone, onToneDetected])

  useEffect(() => {
    if (!audioBlob) {
      setHasAnalyzed(false)
      reset()
    }
  }, [audioBlob, reset])

  const getToneColor = (tone: string) => {
    const colors: Record<string, string> = {
      calm: 'text-blue-600 bg-blue-50 border-blue-200',
      anxious: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      sad: 'text-purple-600 bg-purple-50 border-purple-200',
      happy: 'text-green-600 bg-green-50 border-green-200',
      stressed: 'text-orange-600 bg-orange-50 border-orange-200',
      angry: 'text-red-600 bg-red-50 border-red-200',
      neutral: 'text-gray-600 bg-gray-50 border-gray-200',
    }
    return colors[tone] || colors.neutral
  }

  const getToneIcon = (tone: string) => {
    const icons: Record<string, JSX.Element> = {
      calm: <Brain className="w-4 h-4" />,
      anxious: <AlertCircle className="w-4 h-4" />,
      sad: <AlertCircle className="w-4 h-4" />,
      happy: <CheckCircle className="w-4 h-4" />,
      stressed: <AlertCircle className="w-4 h-4" />,
      angry: <AlertCircle className="w-4 h-4" />,
      neutral: <Brain className="w-4 h-4" />,
    }
    return icons[tone] || icons.neutral
  }

  if (!audioBlob) {
    return null
  }

  if (isAnalyzing) {
    return (
      <Card className="border-2 border-dashed border-gray-300">
        <CardContent className="p-4">
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-calm-500" />
            <span className="text-sm text-gray-600">Analyzing voice tone...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <div>
              <p className="text-sm font-medium text-red-800">Analysis Failed</p>
              <p className="text-xs text-red-600">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!toneResult) {
    return null
  }

  return (
    <Card className="border-2 border-calm-200 bg-gradient-to-r from-calm-50 to-zen-50">
      <CardContent className="p-4">
        {/* Tone Detection Result */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Mic className="w-4 h-4 text-calm-500" />
            <span className="text-sm font-medium text-gray-700">Voice Analysis</span>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getToneColor(toneResult.tone)}`}>
            <div className="flex items-center gap-1">
              {getToneIcon(toneResult.tone)}
              {toneResult.tone.charAt(0).toUpperCase() + toneResult.tone.slice(1)}
            </div>
          </div>
        </div>

        {/* Confidence Score */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>Confidence</span>
            <span>{Math.round(toneResult.confidence * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-calm-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${toneResult.confidence * 100}%` }}
            />
          </div>
        </div>

        {/* Audio Features */}
        <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
          <div>
            <span className="text-gray-500">Speech Rate:</span>
            <span className="ml-1 font-medium">{Math.round(toneResult.speechRate)} wpm</span>
          </div>
          <div>
            <span className="text-gray-500">Energy:</span>
            <span className="ml-1 font-medium capitalize">{toneResult.energyLevel}</span>
          </div>
        </div>

        {/* Emotional State */}
        <div className="mb-3">
          <p className="text-xs text-gray-500 mb-2">Emotional State</p>
          <div className="flex gap-2">
            <div className="flex-1">
              <div className="text-xs text-gray-600 mb-1">Valence</div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    toneResult.emotionalState.valence > 0 ? 'bg-green-400' : 'bg-red-400'
                  }`}
                  style={{
                    width: `${Math.abs(toneResult.emotionalState.valence) * 50 + 50}%`,
                  }}
                />
              </div>
            </div>
            <div className="flex-1">
              <div className="text-xs text-gray-600 mb-1">Arousal</div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-blue-400 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${toneResult.emotionalState.arousal * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {showRecommendations && toneResult.recommendations.length > 0 && (
          <div className="border-t border-gray-200 pt-3">
            <p className="text-xs font-medium text-gray-700 mb-2">AI Recommendations</p>
            <ul className="space-y-1">
              {toneResult.recommendations.slice(0, 3).map((recommendation, index) => (
                <li key={index} className="text-xs text-gray-600 flex items-start gap-2">
                  <span className="text-calm-500 mt-0.5">•</span>
                  <span>{recommendation}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

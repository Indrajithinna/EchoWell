'use client'

import { useState, useEffect } from 'react'
import { Brain, TrendingUp, TrendingDown, Activity, BarChart3 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useVoiceToneLogs } from '@/hooks/use-voice-tone-logs'

interface VoiceToneAnalytics {
  totalLogs: number
  dominantTone: string
  averageConfidence: number
  toneDistribution: Record<string, number>
  emotionalTrend: {
    valence: number[]
    arousal: number[]
    dominance: number[]
  }
  recentPatterns: {
    stressLevel: 'low' | 'medium' | 'high'
    trend: 'improving' | 'stable' | 'declining'
  }
}

export default function VoiceToneDashboard() {
  const { logs, isLoading, error, getLogsByDateRange } = useVoiceToneLogs(30)
  const [analytics, setAnalytics] = useState<VoiceToneAnalytics | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState(30)

  useEffect(() => {
    if (logs.length > 0) {
      const analyticsData = calculateAnalytics(logs)
      setAnalytics(analyticsData)
    }
  }, [logs])

  const calculateAnalytics = (toneLogs: any[]): VoiceToneAnalytics => {
    const totalLogs = toneLogs.length
    
    // Calculate tone distribution
    const toneDistribution: Record<string, number> = {}
    toneLogs.forEach(log => {
      toneDistribution[log.tone_detected] = (toneDistribution[log.tone_detected] || 0) + 1
    })
    
    // Find dominant tone
    const dominantTone = Object.entries(toneDistribution)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'neutral'
    
    // Calculate average confidence
    const averageConfidence = toneLogs.reduce((sum, log) => sum + log.confidence_score, 0) / totalLogs
    
    // Calculate emotional trends
    const emotionalTrend = {
      valence: toneLogs.map(log => log.emotional_state?.valence || 0),
      arousal: toneLogs.map(log => log.emotional_state?.arousal || 0),
      dominance: toneLogs.map(log => log.emotional_state?.dominance || 0),
    }
    
    // Determine stress level and trend
    const recentLogs = toneLogs.slice(-7) // Last 7 logs
    const avgRecentArousal = recentLogs.reduce((sum, log) => sum + (log.emotional_state?.arousal || 0), 0) / recentLogs.length
    const stressLevel = avgRecentArousal > 0.7 ? 'high' : avgRecentArousal > 0.4 ? 'medium' : 'low'
    
    // Calculate trend
    const firstHalf = emotionalTrend.valence.slice(0, Math.floor(emotionalTrend.valence.length / 2))
    const secondHalf = emotionalTrend.valence.slice(Math.floor(emotionalTrend.valence.length / 2))
    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length
    const trend = secondAvg > firstAvg + 0.1 ? 'improving' : secondAvg < firstAvg - 0.1 ? 'declining' : 'stable'
    
    return {
      totalLogs,
      dominantTone,
      averageConfidence,
      toneDistribution,
      emotionalTrend,
      recentPatterns: {
        stressLevel,
        trend,
      },
    }
  }

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

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="w-4 h-4 text-green-500" />
      case 'declining':
        return <TrendingDown className="w-4 h-4 text-red-500" />
      default:
        return <Activity className="w-4 h-4 text-blue-500" />
    }
  }

  const getStressColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      default:
        return 'text-green-600 bg-green-50 border-green-200'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-calm-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading voice tone analytics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <p className="text-red-800">Error loading analytics: {error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!analytics || analytics.totalLogs === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Brain className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Voice Tone Data Yet
          </h3>
          <p className="text-gray-600">
            Start using voice chat to see your emotional tone analytics.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex gap-2">
        {[7, 14, 30, 90].map((days) => (
          <button
            key={days}
            onClick={() => {
              setSelectedPeriod(days)
              getLogsByDateRange(days)
            }}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              selectedPeriod === days
                ? 'bg-calm-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {days} days
          </button>
        ))}
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Analyses</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalLogs}</p>
              </div>
              <Brain className="w-8 h-8 text-calm-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Dominant Tone</p>
                <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getToneColor(analytics.dominantTone)}`}>
                  {analytics.dominantTone.charAt(0).toUpperCase() + analytics.dominantTone.slice(1)}
                </div>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Confidence</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(analytics.averageConfidence * 100)}%
                </p>
              </div>
              <Activity className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Current Stress</p>
                <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStressColor(analytics.recentPatterns.stressLevel)}`}>
                  {analytics.recentPatterns.stressLevel.charAt(0).toUpperCase() + analytics.recentPatterns.stressLevel.slice(1)}
                </div>
              </div>
              {getTrendIcon(analytics.recentPatterns.trend)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tone Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Tone Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(analytics.toneDistribution)
              .sort(([,a], [,b]) => b - a)
              .map(([tone, count]) => {
                const percentage = (count / analytics.totalLogs) * 100
                return (
                  <div key={tone} className="flex items-center gap-3">
                    <div className="w-20 text-sm font-medium capitalize">
                      {tone}
                    </div>
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-calm-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="w-16 text-sm text-gray-600 text-right">
                      {count} ({Math.round(percentage)}%)
                    </div>
                  </div>
                )
              })}
          </div>
        </CardContent>
      </Card>

      {/* Emotional Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Emotional Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Valence (Positivity)</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((analytics.emotionalTrend.valence.reduce((sum, val) => sum + val, 0) / analytics.emotionalTrend.valence.length) + 1) * 50}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {analytics.emotionalTrend.valence.length > 0 
                  ? Math.round((analytics.emotionalTrend.valence.reduce((sum, val) => sum + val, 0) / analytics.emotionalTrend.valence.length) * 100) / 100
                  : 0
                }
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Arousal (Energy)</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(analytics.emotionalTrend.arousal.reduce((sum, val) => sum + val, 0) / analytics.emotionalTrend.arousal.length) * 100}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {analytics.emotionalTrend.arousal.length > 0 
                  ? Math.round((analytics.emotionalTrend.arousal.reduce((sum, val) => sum + val, 0) / analytics.emotionalTrend.arousal.length) * 100) / 100
                  : 0
                }
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Dominance (Control)</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(analytics.emotionalTrend.dominance.reduce((sum, val) => sum + val, 0) / analytics.emotionalTrend.dominance.length) * 100}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {analytics.emotionalTrend.dominance.length > 0 
                  ? Math.round((analytics.emotionalTrend.dominance.reduce((sum, val) => sum + val, 0) / analytics.emotionalTrend.dominance.length) * 100) / 100
                  : 0
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

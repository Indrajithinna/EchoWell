'use client'

import { useState, useEffect } from 'react'
import { Calendar, MessageSquare, Brain, TrendingUp, Users, Activity, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useDailySummary } from '@/hooks/use-daily-summary'

interface DailySummaryDashboardProps {
  date?: string
}

export default function DailySummaryDashboard({ date }: DailySummaryDashboardProps) {
  const { 
    dailySummary, 
    weeklySummary, 
    monthlySummary,
    isLoading, 
    error, 
    generateSummary, 
    fetchWeeklySummary, 
    fetchMonthlySummary,
    refetch 
  } = useDailySummary(date)

  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily')

  useEffect(() => {
    if (selectedPeriod === 'weekly') {
      fetchWeeklySummary(date)
    } else if (selectedPeriod === 'monthly') {
      fetchMonthlySummary(date)
    }
  }, [selectedPeriod, date, fetchWeeklySummary, fetchMonthlySummary])

  const getQualityColor = (quality: string) => {
    const colors = {
      short: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      moderate: 'text-blue-600 bg-blue-50 border-blue-200',
      deep: 'text-green-600 bg-green-50 border-green-200',
    }
    return colors[quality as keyof typeof colors] || colors.moderate
  }

  const getMoodColor = (score: number | null) => {
    if (!score) return 'text-gray-500'
    if (score >= 7) return 'text-green-600'
    if (score >= 4) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="w-4 h-4 text-green-500" />
      case 'declining':
        return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />
      default:
        return <Activity className="w-4 h-4 text-blue-500" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-calm-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading summary...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <p className="text-red-800">Error loading summary: {error}</p>
          <Button onClick={refetch} className="mt-4">
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!dailySummary && selectedPeriod === 'daily') {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Summary Available
          </h3>
          <p className="text-gray-600 mb-6">
            No conversation data found for this date. Start a conversation to generate your daily summary.
          </p>
          <Button onClick={() => generateSummary(date)}>
            Generate Summary
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex gap-2">
        {[
          { key: 'daily', label: 'Daily' },
          { key: 'weekly', label: 'Weekly' },
          { key: 'monthly', label: 'Monthly' },
        ].map((period) => (
          <button
            key={period.key}
            onClick={() => setSelectedPeriod(period.key as any)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedPeriod === period.key
                ? 'bg-calm-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {period.label}
          </button>
        ))}
        <Button
          onClick={refetch}
          variant="outline"
          size="sm"
          className="ml-auto"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Daily Summary */}
      {selectedPeriod === 'daily' && dailySummary && (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Conversations</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {dailySummary.conversation_count}
                    </p>
                  </div>
                  <MessageSquare className="w-8 h-8 text-calm-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Messages</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {dailySummary.total_messages}
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Avg Mood</p>
                    <p className={`text-2xl font-bold ${getMoodColor(dailySummary.avg_mood_score)}`}>
                      {dailySummary.avg_mood_score ? dailySummary.avg_mood_score.toFixed(1) : 'N/A'}
                    </p>
                  </div>
                  <Brain className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Quality</p>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getQualityColor(dailySummary.conversation_quality)}`}>
                      {dailySummary.conversation_quality.charAt(0).toUpperCase() + dailySummary.conversation_quality.slice(1)}
                    </div>
                  </div>
                  <Activity className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Topics and Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Topics Discussed */}
            <Card>
              <CardHeader>
                <CardTitle>Topics Discussed</CardTitle>
              </CardHeader>
              <CardContent>
                {dailySummary.topics_discussed.length > 0 ? (
                  <div className="space-y-2">
                    {dailySummary.topics_discussed.map((topic, index) => (
                      <div
                        key={index}
                        className="px-3 py-2 bg-calm-50 rounded-lg text-sm text-calm-700 border border-calm-200"
                      >
                        {topic}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No specific topics identified today.</p>
                )}
              </CardContent>
            </Card>

            {/* Voice Tone Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Voice Tone Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                {dailySummary.voice_tone_analysis ? (
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Dominant Tone</p>
                      <p className="font-medium capitalize">
                        {dailySummary.voice_tone_analysis.avg_tone}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Emotional Stability</p>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-calm-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(dailySummary.voice_tone_analysis.emotional_stability || 0.5) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No voice tone data available.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* AI Insights */}
          {dailySummary.ai_insights && (
            <Card>
              <CardHeader>
                <CardTitle>Daily Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {dailySummary.ai_insights}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Weekly Summary */}
      {selectedPeriod === 'weekly' && weeklySummary && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{weeklySummary.total_conversations}</p>
                  <p className="text-sm text-gray-600">Total Conversations</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{weeklySummary.avg_daily_mood}</p>
                  <p className="text-sm text-gray-600">Average Mood</p>
                </div>
                <div className="text-center">
                  <p className={`text-2xl font-bold ${weeklySummary.emotional_growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {weeklySummary.emotional_growth >= 0 ? '+' : ''}{weeklySummary.emotional_growth}
                  </p>
                  <p className="text-sm text-gray-600">Emotional Growth</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Top Themes</h4>
                  <div className="flex flex-wrap gap-2">
                    {weeklySummary.top_themes.map((theme, index) => (
                      <span key={index} className="px-3 py-1 bg-calm-50 text-calm-700 rounded-full text-sm border border-calm-200">
                        {theme}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Achievements</h4>
                  <ul className="space-y-1">
                    {weeklySummary.achievements.map((achievement, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        {achievement}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="prose prose-sm">
                  <p className="text-gray-700 whitespace-pre-wrap">{weeklySummary.insights}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Monthly Summary */}
      {selectedPeriod === 'monthly' && monthlySummary && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{monthlySummary.total_sessions}</p>
                  <p className="text-sm text-gray-600">Total Sessions</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    {getTrendIcon(monthlySummary.mood_trend)}
                    <span className="text-2xl font-bold capitalize">{monthlySummary.mood_trend}</span>
                  </div>
                  <p className="text-sm text-gray-600">Mood Trend</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(monthlySummary.emotional_stability_score * 100)}%
                  </p>
                  <p className="text-sm text-gray-600">Emotional Stability</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{monthlySummary.goals_achieved}</p>
                  <p className="text-sm text-gray-600">Goals Achieved</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="prose prose-sm">
                  <p className="text-gray-700 whitespace-pre-wrap">{monthlySummary.insights}</p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Recommendations</h4>
                  <ul className="space-y-1">
                    {monthlySummary.recommendations.map((recommendation, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-center gap-2">
                        <span className="text-blue-500">•</span>
                        {recommendation}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

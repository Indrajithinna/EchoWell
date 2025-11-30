'use client'

import { useState, useEffect } from 'react'
import { Calendar, TrendingUp, MessageSquare, Mic, Heart, ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { format, subDays, addDays } from 'date-fns'

interface DailySummary {
  date: string
  conversation_count: number
  total_messages: number
  avg_mood_score: number
  conversation_quality: string
  ai_insights: string
  voice_tone_analysis: {
    avg_tone: string
    tone_variations: Record<string, number>
    emotional_stability: number
  }
  topics_discussed: string[]
}

export default function OverviewPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [summary, setSummary] = useState<DailySummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDailySummary(currentDate)
  }, [currentDate])

  const fetchDailySummary = async (date: Date) => {
    setIsLoading(true)
    try {
      const dateStr = format(date, 'yyyy-MM-dd')
      const response = await fetch(`/api/daily-summary?date=${dateStr}`)
      
      if (!response.ok) throw new Error('Failed to fetch summary')
      
      const data = await response.json()
      setSummary(data.summary)
    } catch (error) {
      console.error('Error fetching summary:', error)
      setSummary(null)
    } finally {
      setIsLoading(false)
    }
  }

  const previousDay = () => {
    setCurrentDate(prev => subDays(prev, 1))
  }

  const nextDay = () => {
    if (currentDate < new Date()) {
      setCurrentDate(prev => addDays(prev, 1))
    }
  }

  const getToneColor = (tone: string) => {
    const colors: Record<string, string> = {
      calm: 'text-blue-600 bg-blue-100',
      happy: 'text-green-600 bg-green-100',
      sad: 'text-purple-600 bg-purple-100',
      anxious: 'text-yellow-600 bg-yellow-100',
      stressed: 'text-orange-600 bg-orange-100',
      angry: 'text-red-600 bg-red-100',
      neutral: 'text-gray-600 bg-gray-100',
    }
    return colors[tone] || colors.neutral
  }

  const getQualityBadge = (quality: string) => {
    const badges: Record<string, { text: string; color: string }> = {
      short: { text: 'Brief', color: 'bg-yellow-100 text-yellow-700' },
      moderate: { text: 'Good', color: 'bg-blue-100 text-blue-700' },
      deep: { text: 'Deep', color: 'bg-green-100 text-green-700' },
    }
    return badges[quality] || badges.short
  }

  const isToday = format(currentDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-blue-50/30 to-purple-50/30">
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
        {/* Header with Date Navigation */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={previousDay}
            >
              <ChevronLeft size={24} />
            </Button>
            
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-1">
                {isToday ? 'Today' : format(currentDate, 'EEEE')}
              </h1>
              <p className="text-gray-600">
                {format(currentDate, 'MMMM d, yyyy')}
              </p>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={nextDay}
              disabled={isToday}
            >
              <ChevronRight size={24} />
            </Button>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 justify-center">
            <Button variant="default" size="sm">
              Overview
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.location.href = '/overview/spotlight'}>
              Spotlight
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-calm-500"></div>
            <p className="text-gray-600 mt-4">Loading your day...</p>
          </div>
        ) : !summary ? (
          <Card>
            <CardContent className="p-12 text-center">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {isToday ? 'No conversations yet today' : 'No data for this day'}
              </h3>
              <p className="text-gray-600 mb-6">
                {isToday 
                  ? 'Start a conversation and I\'ll provide insights about your day.'
                  : 'Try having a longer conversation next time, and I\'ll send you a new perspective on everything you talked about.'
                }
              </p>
              {isToday && (
                <Button onClick={() => window.location.href = '/chat'}>
                  Start Conversation
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600">Conversations</p>
                      <p className="text-2xl font-bold text-gray-900">{summary.conversation_count}</p>
                    </div>
                    <MessageSquare className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600">Messages</p>
                      <p className="text-2xl font-bold text-gray-900">{summary.total_messages}</p>
                    </div>
                    <Mic className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600">Avg Mood</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {summary.avg_mood_score?.toFixed(1) || 'N/A'}/10
                      </p>
                    </div>
                    <Heart className="w-8 h-8 text-pink-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600">Quality</p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getQualityBadge(summary.conversation_quality).color}`}>
                        {getQualityBadge(summary.conversation_quality).text}
                      </span>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Voice Tone Analysis */}
            {summary.voice_tone_analysis && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mic size={20} />
                    Voice Tone Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Predominant Tone</p>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getToneColor(summary.voice_tone_analysis.avg_tone)}`}>
                          {summary.voice_tone_analysis.avg_tone}
                        </span>
                        <span className="text-sm text-gray-500">
                          Emotional Stability: {(summary.voice_tone_analysis.emotional_stability * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>

                    {Object.keys(summary.voice_tone_analysis.tone_variations).length > 0 && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Tone Variations</p>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(summary.voice_tone_analysis.tone_variations).map(([tone, count]) => (
                            <span
                              key={tone}
                              className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getToneColor(tone)}`}
                            >
                              {tone} ({count})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-900">
                        💡 <strong>Tone Insight:</strong> {getToneInsight(summary.voice_tone_analysis.avg_tone, summary.voice_tone_analysis.emotional_stability)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* AI Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp size={20} />
                  Daily Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {summary.ai_insights}
                  </p>
                </div>

                {summary.topics_discussed && summary.topics_discussed.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-900 mb-3">Topics Discussed</p>
                    <div className="flex flex-wrap gap-2">
                      {summary.topics_discussed.map((topic, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-zen-100 text-zen-700 rounded-full text-sm font-medium"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Conversation Quality Note */}
            {summary.conversation_quality === 'short' && (
              <Card className="bg-yellow-50 border-yellow-200">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <MessageSquare className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-yellow-900 mb-1">
                        Your conversation was a little short
                      </h4>
                      <p className="text-sm text-yellow-800">
                        Try having a longer conversation next time, and I'll send you a new perspective on everything you talked about. Deeper conversations help me provide better insights and support.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Button */}
            <div className="flex justify-center pt-4">
              <Button
                size="lg"
                onClick={() => window.location.href = '/chat'}
                className="px-8"
              >
                {isToday ? 'Continue Conversation' : 'Start New Conversation'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function getToneInsight(tone: string, stability: number): string {
  const insights: Record<string, string> = {
    calm: stability > 0.7
      ? 'Your voice showed consistent calmness throughout the day. This is a great sign of emotional balance.'
      : 'While you had calm moments, there were some variations in your emotional tone.',
    anxious: 'Your voice showed signs of anxiety. Remember to practice breathing exercises and take breaks when needed.',
    sad: 'I noticed sadness in your voice today. It\'s okay to feel this way. Consider reaching out to someone you trust.',
    stressed: 'Your voice indicated stress. Try to identify stressors and use coping techniques we\'ve discussed.',
    happy: 'Your voice was upbeat and positive! It\'s wonderful to see you in good spirits.',
    angry: 'Your voice showed frustration. Remember, it\'s valid to feel angry, but let\'s work on healthy expression.',
    neutral: 'Your voice tone was steady and neutral throughout our conversations.',
  }
  return insights[tone] || 'I\'m here to support you regardless of how you\'re feeling.'
}

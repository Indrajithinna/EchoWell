'use client'

import { useState } from 'react'
import { Calendar, TrendingUp, MessageSquare, Heart, Award, Target, RefreshCw } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useWeeklySummary } from '@/hooks/use-weekly-summary'

export default function WeeklySummaryReport() {
  const { summary, isLoading, error, refetch } = useWeeklySummary()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-calm-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Generating your weekly report...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <p className="text-red-800">Error loading weekly summary: {error}</p>
          <Button onClick={refetch} className="mt-4">
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!summary) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Weekly Data Yet
          </h3>
          <p className="text-gray-600 mb-6">
            Keep using MindfulAI for a few more days to see your weekly insights!
          </p>
          <Button onClick={() => window.location.href = '/chat'}>
            Start a Conversation
          </Button>
        </CardContent>
      </Card>
    )
  }

  const getMoodColor = (mood: number) => {
    if (mood >= 7) return 'text-green-600 bg-green-50 border-green-200'
    if (mood >= 4) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-red-600 bg-red-50 border-red-200'
  }

  const getEmotionColor = (emotion: string) => {
    const colors: Record<string, string> = {
      happy: 'text-green-600 bg-green-50 border-green-200',
      sad: 'text-blue-600 bg-blue-50 border-blue-200',
      anxious: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      calm: 'text-purple-600 bg-purple-50 border-purple-200',
      excited: 'text-orange-600 bg-orange-50 border-orange-200',
      worried: 'text-red-600 bg-red-50 border-red-200',
    }
    return colors[emotion] || 'text-gray-600 bg-gray-50 border-gray-200'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Weekly Summary Report</h2>
          <p className="text-gray-600">
            {summary.period.start} - {summary.period.end}
          </p>
        </div>
        <Button onClick={refetch} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700">Days Active</p>
                <p className="text-2xl font-bold text-blue-900">
                  {summary.metrics.daysActive}/7
                </p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700">Conversations</p>
                <p className="text-2xl font-bold text-green-900">
                  {summary.metrics.totalConversations}
                </p>
              </div>
              <MessageSquare className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700">Messages</p>
                <p className="text-2xl font-bold text-purple-900">
                  {summary.metrics.totalMessages}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-br ${getMoodColor(summary.metrics.avgMood)}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm">Average Mood</p>
                <p className="text-2xl font-bold">
                  {summary.metrics.avgMood}/10
                </p>
              </div>
              <Heart className="w-8 h-8" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-indigo-800">
            <Heart size={20} />
            Your Week in Review
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <p className="text-indigo-900 whitespace-pre-wrap leading-relaxed mb-4">
              {summary.insights.overview}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <h4 className="font-semibold text-indigo-800 mb-2">Patterns Observed</h4>
                <p className="text-indigo-900 text-sm">{summary.insights.patterns}</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-indigo-800 mb-2">Areas of Growth</h4>
                <p className="text-indigo-900 text-sm">{summary.insights.growth}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Topics */}
      {summary.topTopics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target size={20} />
              Most Discussed Topics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {summary.topTopics.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-calm-50 rounded-lg border border-calm-200">
                  <span className="font-medium text-gray-900 capitalize">{item.topic}</span>
                  <span className="px-3 py-1 bg-calm-100 text-calm-700 rounded-full text-sm font-medium">
                    {item.count} times
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Emotions */}
      {summary.topEmotions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart size={20} />
              Emotional Patterns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {summary.topEmotions.map((item, index) => (
                <span
                  key={index}
                  className={`px-3 py-2 rounded-full text-sm font-medium border capitalize ${getEmotionColor(item.emotion)}`}
                >
                  {item.emotion} ({item.count})
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tone Trend */}
      {summary.toneTrend.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp size={20} />
              Voice Tone Progression
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 flex-wrap">
              {summary.toneTrend.map((tone, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium capitalize">
                    {tone}
                  </span>
                  {index < summary.toneTrend.length - 1 && (
                    <span className="text-gray-400">→</span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {summary.insights.recommendations.length > 0 && (
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Award size={20} />
              Recommendations for Next Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {summary.insights.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-green-600 mt-1">•</span>
                  <span className="text-green-900">{recommendation}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Celebration */}
      {summary.insights.celebration && (
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <Award size={20} />
              Celebrating Your Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-900">{summary.insights.celebration}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

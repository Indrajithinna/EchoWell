'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, Heart, Calendar, Sparkles } from 'lucide-react'
import MoodLogger from '@/components/dashboard/mood-logger'
import MoodChart from '@/components/dashboard/mood-chart'
import MoodSonifier from '@/components/dashboard/mood-sonifier'
import StatCard from '@/components/dashboard/stat-card'

interface MoodLog {
  id: string
  mood_score: number
  emotions: string[]
  notes: string | null
  logged_at: string
}

interface MoodStats {
  avgMood: number
  totalLogs: number
  topEmotions: Array<{ emotion: string; count: number }>
}

export default function MoodPage() {
  const [logs, setLogs] = useState<MoodLog[]>([])
  const [stats, setStats] = useState<MoodStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState(30)

  const fetchMoodData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/mood/history?days=${timeRange}`)
      if (!response.ok) throw new Error('Failed to fetch mood data')

      const data = await response.json()
      setLogs(data.logs)
      setStats(data.stats)
    } catch (error) {
      console.error('Error fetching mood data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMoodData()
  }, [timeRange])

  const getMoodEmoji = (score: number) => {
    if (score >= 8) return '😊'
    if (score >= 6) return '🙂'
    if (score >= 4) return '😐'
    if (score >= 2) return '😔'
    return '😢'
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-blue-50/30 to-purple-50/30">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Heart className="w-8 h-8 text-pink-500" />
            Mood Tracker
          </h1>
          <p className="text-gray-600">
            Track your emotional wellbeing and discover patterns over time.
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[7, 14, 30, 90].map((days) => (
            <button
              key={days}
              onClick={() => setTimeRange(days)}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${timeRange === days
                ? 'bg-gradient-to-r from-calm-500 to-zen-500 text-white shadow-md'
                : 'bg-white border border-gray-200 text-gray-700 hover:border-calm-300'
                }`}
            >
              {days} Days
            </button>
          ))}
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="Average Mood"
              value={`${stats.avgMood}/10 ${getMoodEmoji(stats.avgMood)}`}
              icon={TrendingUp}
              description="Last 30 days"
              color="from-green-500 to-emerald-500"
            />
            <StatCard
              title="Total Check-ins"
              value={stats.totalLogs}
              icon={Calendar}
              description={`${Math.round((stats.totalLogs / timeRange) * 100)}% completion rate`}
              color="from-blue-500 to-cyan-500"
            />
            <StatCard
              title="Top Emotion"
              value={stats.topEmotions[0]?.emotion || 'None'}
              icon={Sparkles}
              description={`${stats.topEmotions[0]?.count || 0} times`}
              color="from-purple-500 to-pink-500"
            />
          </div>
        )}

        {/* Mood Sonification */}
        {logs.length > 0 && <MoodSonifier logs={logs} />}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Logger */}
          <div className="lg:col-span-1">
            <MoodLogger onLogComplete={fetchMoodData} />

            {/* Recent Emotions */}
            {stats && stats.topEmotions.length > 0 && (
              <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Top Emotions
                </h3>
                <div className="space-y-3">
                  {stats.topEmotions.map(({ emotion, count }) => (
                    <div key={emotion} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{emotion}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-calm-500 to-zen-500 rounded-full"
                            style={{
                              width: `${(count / stats.totalLogs) * 100}%`
                            }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 w-8 text-right">
                          {count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Chart and History */}
          <div className="lg:col-span-2 space-y-6">
            <MoodChart data={logs} />

            {/* Recent Logs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Recent Logs
              </h3>

              {logs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No mood logs yet.</p>
                  <p className="text-sm mt-1">Start tracking your mood today!</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {logs.slice(-10).reverse().map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="text-3xl">{getMoodEmoji(log.mood_score)}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-gray-900">
                            {log.mood_score}/10
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(log.logged_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        {log.emotions.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {log.emotions.map((emotion) => (
                              <span
                                key={emotion}
                                className="px-2 py-1 bg-white rounded-full text-xs text-gray-600 border border-gray-200"
                              >
                                {emotion}
                              </span>
                            ))}
                          </div>
                        )}
                        {log.notes && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {log.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { supabaseAdmin as supabase } from '@/lib/supabase'
import { DailySummary } from '@/types/database'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') || 'weekly' // weekly, monthly
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]

    let summaries
    if (type === 'weekly') {
      summaries = await generateWeeklySummary(session.user.id, date)
    } else {
      summaries = await generateMonthlySummary(session.user.id, date)
    }

    return NextResponse.json({ summaries })
  } catch (error) {
    console.error('Analytics summaries error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics summaries' },
      { status: 500 }
    )
  }
}

async function generateWeeklySummary(userId: string, date: string) {
  const targetDate = new Date(date)
  const startOfWeek = new Date(targetDate)
  startOfWeek.setDate(targetDate.getDate() - targetDate.getDay())
  startOfWeek.setHours(0, 0, 0, 0)

  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)
  endOfWeek.setHours(23, 59, 59, 999)

  // Get daily summaries for the week
  const { data: dailySummariesData } = await supabase
    .from('daily_summaries')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startOfWeek.toISOString().split('T')[0])
    .lte('date', endOfWeek.toISOString().split('T')[0])
    .order('date', { ascending: true })

  const dailySummaries = (dailySummariesData || []) as DailySummary[]

  if (!dailySummaries || dailySummaries.length === 0) {
    return {
      week_start: startOfWeek.toISOString().split('T')[0],
      total_conversations: 0,
      total_messages: 0,
      avg_daily_mood: 0,
      emotional_growth: 0,
      top_themes: [],
      progress_areas: [],
      achievements: [],
      insights: 'No activity this week. Start conversations to see your weekly insights.',
    }
  }

  // Calculate weekly metrics
  const totalConversations = dailySummaries.reduce((sum, day) => sum + day.conversation_count, 0)
  const totalMessages = dailySummaries.reduce((sum, day) => sum + day.total_messages, 0)

  const moodScores = dailySummaries
    .filter(day => day.avg_mood_score !== null)
    .map(day => day.avg_mood_score as number)

  const avgDailyMood = moodScores.length > 0
    ? moodScores.reduce((sum, score) => sum + score, 0) / moodScores.length
    : 0

  // Calculate emotional growth
  const firstHalfMood = moodScores.slice(0, Math.floor(moodScores.length / 2))
  const secondHalfMood = moodScores.slice(Math.floor(moodScores.length / 2))

  const firstHalfAvg = firstHalfMood.length > 0
    ? firstHalfMood.reduce((sum, score) => sum + score, 0) / firstHalfMood.length
    : 0
  const secondHalfAvg = secondHalfMood.length > 0
    ? secondHalfMood.reduce((sum, score) => sum + score, 0) / secondHalfMood.length
    : 0

  const emotionalGrowth = secondHalfAvg - firstHalfAvg

  // Extract themes
  const allTopics = dailySummaries.flatMap(day => day.topics_discussed || [])
  const topicCounts: Record<string, number> = {}
  allTopics.forEach(topic => {
    topicCounts[topic] = (topicCounts[topic] || 0) + 1
  })
  const topThemes = Object.entries(topicCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([topic]) => topic)

  // Generate AI insights
  const weeklyInsights = await generateWeeklyInsights(dailySummaries, emotionalGrowth)

  return {
    week_start: startOfWeek.toISOString().split('T')[0],
    total_conversations: totalConversations,
    total_messages: totalMessages,
    avg_daily_mood: Math.round(avgDailyMood * 10) / 10,
    emotional_growth: Math.round(emotionalGrowth * 10) / 10,
    top_themes: topThemes,
    progress_areas: weeklyInsights.progressAreas,
    achievements: weeklyInsights.achievements,
    insights: weeklyInsights.insights,
  }
}

async function generateMonthlySummary(userId: string, date: string) {
  const targetDate = new Date(date)
  const startOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1)
  const endOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0)
  endOfMonth.setHours(23, 59, 59, 999)

  // Get daily summaries for the month
  const { data: dailySummariesData } = await supabase
    .from('daily_summaries')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startOfMonth.toISOString().split('T')[0])
    .lte('date', endOfMonth.toISOString().split('T')[0])
    .order('date', { ascending: true })

  const dailySummaries = (dailySummariesData || []) as DailySummary[]

  if (!dailySummaries || dailySummaries.length === 0) {
    return {
      month: startOfMonth.toISOString().split('T')[0].slice(0, 7),
      total_sessions: 0,
      mood_trend: 'stable',
      emotional_stability_score: 0,
      therapeutic_progress: 0,
      goals_achieved: 0,
      insights: 'No activity this month. Start conversations to see your monthly insights.',
      recommendations: [],
    }
  }

  // Calculate monthly metrics
  const totalSessions = dailySummaries.reduce((sum, day) => sum + day.conversation_count, 0)

  const moodScores = dailySummaries
    .filter(day => day.avg_mood_score !== null)
    .map(day => day.avg_mood_score as number)

  // Calculate mood trend
  const firstWeekMood = moodScores.slice(0, Math.floor(moodScores.length / 4))
  const lastWeekMood = moodScores.slice(-Math.floor(moodScores.length / 4))

  const firstWeekAvg = firstWeekMood.length > 0
    ? firstWeekMood.reduce((sum, score) => sum + score, 0) / firstWeekMood.length
    : 0
  const lastWeekAvg = lastWeekMood.length > 0
    ? lastWeekMood.reduce((sum, score) => sum + score, 0) / lastWeekMood.length
    : 0

  const moodTrend = lastWeekAvg > firstWeekAvg + 0.5 ? 'improving'
    : lastWeekAvg < firstWeekAvg - 0.5 ? 'declining'
      : 'stable'

  // Calculate emotional stability
  const moodVariance = moodScores.length > 1
    ? calculateVariance(moodScores)
    : 0
  const emotionalStabilityScore = Math.max(0, 1 - moodVariance / 10)

  // Calculate therapeutic progress
  const deepConversations = dailySummaries.filter(day => day.conversation_quality === 'deep').length
  const totalDays = dailySummaries.length
  const therapeuticProgress = totalDays > 0 ? deepConversations / totalDays : 0

  // Generate AI insights
  const monthlyInsights = await generateMonthlyInsights(dailySummaries, moodTrend)

  return {
    month: startOfMonth.toISOString().split('T')[0].slice(0, 7),
    total_sessions: totalSessions,
    mood_trend: moodTrend,
    emotional_stability_score: Math.round(emotionalStabilityScore * 100) / 100,
    therapeutic_progress: Math.round(therapeuticProgress * 100) / 100,
    goals_achieved: monthlyInsights.goalsAchieved,
    insights: monthlyInsights.insights,
    recommendations: monthlyInsights.recommendations,
  }
}

async function generateWeeklyInsights(dailySummaries: DailySummary[], emotionalGrowth: number) {
  const conversationText = dailySummaries
    .map(day => day.ai_insights || '')
    .join(' ')
    .slice(0, 2000)

  const prompt = `Analyze this week's therapeutic progress based on daily summaries and emotional growth of ${emotionalGrowth.toFixed(1)}.

Daily summaries: "${conversationText}"

Provide insights in JSON format:
{
  "progressAreas": ["area1", "area2"],
  "achievements": ["achievement1", "achievement2"],
  "insights": "Comprehensive weekly analysis and encouragement"
}

Be supportive, encouraging, and focus on growth and progress.`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    })

    const result = JSON.parse(response.choices[0].message.content || '{}')
    return {
      progressAreas: result.progressAreas || [],
      achievements: result.achievements || [],
      insights: result.insights || 'Great progress this week!',
    }
  } catch (error) {
    console.error('Weekly insights generation error:', error)
    return {
      progressAreas: ['emotional awareness', 'communication'],
      achievements: ['consistent engagement', 'positive mood trends'],
      insights: 'You showed great consistency this week. Keep up the positive momentum!',
    }
  }
}

async function generateMonthlyInsights(dailySummaries: DailySummary[], moodTrend: string) {
  const conversationText = dailySummaries
    .map(day => day.ai_insights || '')
    .join(' ')
    .slice(0, 3000)

  const prompt = `Analyze this month's therapeutic progress with mood trend: ${moodTrend}.

Monthly summaries: "${conversationText}"

Provide insights in JSON format:
{
  "goalsAchieved": 3,
  "insights": "Comprehensive monthly analysis",
  "recommendations": ["recommendation1", "recommendation2"]
}

Be encouraging and provide actionable recommendations for continued growth.`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    })

    const result = JSON.parse(response.choices[0].message.content || '{}')
    return {
      goalsAchieved: result.goalsAchieved || 2,
      insights: result.insights || 'Excellent progress this month!',
      recommendations: result.recommendations || ['Continue regular conversations', 'Practice mindfulness'],
    }
  } catch (error) {
    console.error('Monthly insights generation error:', error)
    return {
      goalsAchieved: 2,
      insights: 'You made significant progress this month. Well done!',
      recommendations: ['Continue regular conversations', 'Practice mindfulness'],
    }
  }
}

function calculateVariance(numbers: number[]): number {
  const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length
  const squaredDiffs = numbers.map(num => Math.pow(num - mean, 2))
  return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / numbers.length
}

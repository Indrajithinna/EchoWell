import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { supabaseAdmin as supabase } from '@/lib/supabase'
import OpenAI from 'openai'
import { subDays, format } from 'date-fns'

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

    // Get last 7 days of summaries
    const endDate = new Date()
    const startDate = subDays(endDate, 7)

    const { data: dailySummaries } = await supabase
      .from('daily_summaries')
      .select('*')
      .eq('user_id', session.user.id)
      .gte('date', format(startDate, 'yyyy-MM-dd'))
      .lte('date', format(endDate, 'yyyy-MM-dd'))
      .order('date', { ascending: true })

    if (!dailySummaries || dailySummaries.length === 0) {
      return NextResponse.json({
        summary: null,
        message: 'Not enough data for weekly summary. Keep using the app!'
      })
    }

    // Generate comprehensive weekly insights
    const weeklyInsights = await generateWeeklyInsights(dailySummaries)

    return NextResponse.json({ summary: weeklyInsights })
  } catch (error) {
    console.error('Weekly summary error:', error)
    return NextResponse.json(
      { error: 'Failed to generate weekly summary' },
      { status: 500 }
    )
  }
}

async function generateWeeklyInsights(dailySummaries: any[]) {
  // Calculate weekly metrics
  const totalConversations = dailySummaries.reduce((sum, day) => sum + day.conversation_count, 0)
  const totalMessages = dailySummaries.reduce((sum, day) => sum + day.total_messages, 0)
  const avgMood = dailySummaries
    .filter(day => day.avg_mood_score)
    .reduce((sum, day) => sum + day.avg_mood_score, 0) / dailySummaries.length

  // Collect all topics
  const allTopics = dailySummaries.flatMap(day => day.topics_discussed || [])
  const topicCounts: Record<string, number> = {}
  allTopics.forEach(topic => {
    topicCounts[topic] = (topicCounts[topic] || 0) + 1
  })

  // Dominant emotions across week
  const weeklyEmotions: Record<string, number> = {}
  dailySummaries.forEach(day => {
    if (day.dominant_emotions) {
      Object.entries(day.dominant_emotions).forEach(([emotion, count]) => {
        weeklyEmotions[emotion] = (weeklyEmotions[emotion] || 0) + (count as number)
      })
    }
  })

  // Voice tone trends
  const tonesTrend = dailySummaries
    .filter(day => day.voice_tone_analysis?.avg_tone)
    .map(day => day.voice_tone_analysis.avg_tone)

  // Generate AI insights
  const prompt = `As an empathetic AI therapist, provide a comprehensive weekly summary for this person.

Weekly Data:
- Days active: ${dailySummaries.length}/7
- Total conversations: ${totalConversations}
- Total messages: ${totalMessages}
- Average mood: ${avgMood.toFixed(1)}/10
- Top topics: ${Object.entries(topicCounts).slice(0, 5).map(([t, c]) => `${t} (${c})`).join(', ')}
- Dominant emotions: ${Object.entries(weeklyEmotions).slice(0, 5).map(([e, c]) => `${e} (${c})`).join(', ')}
- Voice tone progression: ${tonesTrend.join(' → ')}

Daily Insights:
${dailySummaries.map(day => `${day.date}: ${day.ai_insights?.substring(0, 200)}`).join('\n')}

Provide:
- Warm, personalized weekly overview (2-3 paragraphs)
- Notable patterns or progress observed
- Areas of growth
- Gentle recommendations for next week
- Celebration of positive moments

Be encouraging, supportive, and always polite. Format as JSON:
{
  "overview": "...",
  "patterns": "...",
  "growth": "...",
  "recommendations": [...],
  "celebration": "..."
}`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  })

  const insights = JSON.parse(response.choices[0].message.content || '{}')

  return {
    period: {
      start: dailySummaries[0].date,
      end: dailySummaries[dailySummaries.length - 1].date,
    },
    metrics: {
      daysActive: dailySummaries.length,
      totalConversations,
      totalMessages,
      avgMood: Math.round(avgMood * 10) / 10,
    },
    topTopics: Object.entries(topicCounts)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([topic, count]) => ({ topic, count })),
    topEmotions: Object.entries(weeklyEmotions)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([emotion, count]) => ({ emotion, count })),
    toneTrend: tonesTrend,
    insights: insights,
  }
}

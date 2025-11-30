import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { supabase } from '@/lib/supabase'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]

    // Get daily summary
    const { data: summary, error } = await supabase
      .from('daily_summaries')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('date', date)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    if (!summary) {
      // Generate summary if not exists
      const generatedSummary = await generateDailySummary(session.user.id, date)
      return NextResponse.json({ summary: generatedSummary })
    }

    return NextResponse.json({ summary })
  } catch (error) {
    console.error('Daily summary error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch daily summary' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const date = new Date().toISOString().split('T')[0]
    const summary = await generateDailySummary(session.user.id, date)

    return NextResponse.json({ summary })
  } catch (error) {
    console.error('Generate summary error:', error)
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    )
  }
}

async function generateDailySummary(userId: string, date: string) {
  // Get all conversations and messages for the day
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)

  // Get conversations
  const { data: conversations } = await supabase
    .from('conversations')
    .select('id')
    .eq('user_id', userId)
    .gte('created_at', startOfDay.toISOString())
    .lte('created_at', endOfDay.toISOString())

  if (!conversations || conversations.length === 0) {
    return null
  }

  const conversationIds = conversations.map(c => c.id)

  // Get all messages
  const { data: messages } = await supabase
    .from('messages')
    .select('role, content, created_at')
    .in('conversation_id', conversationIds)
    .order('created_at', { ascending: true })

  // Get mood logs
  const { data: moodLogs } = await supabase
    .from('mood_logs')
    .select('mood_score, emotions')
    .eq('user_id', userId)
    .gte('logged_at', startOfDay.toISOString())
    .lte('logged_at', endOfDay.toISOString())

  // Get voice tone logs
  const { data: voiceLogs } = await supabase
    .from('voice_tone_logs')
    .select('tone_detected, confidence_score, emotional_state')
    .eq('user_id', userId)
    .gte('recorded_at', startOfDay.toISOString())
    .lte('recorded_at', endOfDay.toISOString())

  // Analyze conversation quality
  const userMessages = messages?.filter(m => m.role === 'user') || []
  const conversationQuality = 
    userMessages.length < 3 ? 'short' :
    userMessages.length < 10 ? 'moderate' : 'deep'

  // Extract topics and generate insights
  const conversationText = userMessages
    .map(m => m.content)
    .join(' ')
    .slice(0, 3000)

  const aiInsights = await generateAIInsights(
    conversationText,
    moodLogs || [],
    voiceLogs || []
  )

  // Calculate metrics
  const avgMood = moodLogs && moodLogs.length > 0
    ? moodLogs.reduce((sum, log) => sum + log.mood_score, 0) / moodLogs.length
    : null

  const dominantEmotions = calculateDominantEmotions(moodLogs || [])
  const voiceToneAnalysis = analyzeVoiceTones(voiceLogs || [])

  // Save summary
  const { data: summary, error } = await supabase
    .from('daily_summaries')
    .upsert({
      user_id: userId,
      date: date,
      conversation_count: conversations.length,
      total_messages: messages?.length || 0,
      avg_mood_score: avgMood,
      dominant_emotions: dominantEmotions,
      topics_discussed: aiInsights.topics,
      conversation_quality: conversationQuality,
      ai_insights: aiInsights.text,
      voice_tone_analysis: voiceToneAnalysis,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  return summary
}

async function generateAIInsights(
  conversationText: string,
  moodLogs: any[],
  voiceLogs: any[]
): Promise<{ text: string; topics: string[] }> {
  if (!conversationText || conversationText.trim().length < 50) {
    return {
      text: 'Your conversation today was brief. Try having a longer conversation tomorrow for deeper insights.',
      topics: [],
    }
  }

  const prompt = `As an empathetic AI therapist, analyze this person's day based on their conversations, mood logs, and voice tone.

Conversation: "${conversationText}"
Mood Logs: ${JSON.stringify(moodLogs)}
Voice Tones: ${JSON.stringify(voiceLogs)}

Provide:
1. A compassionate, supportive summary (2-3 paragraphs)
2. Key topics they discussed
3. Patterns you noticed
4. Gentle encouragement for tomorrow

Format as JSON:
{
  "summary": "...",
  "topics": ["topic1", "topic2"],
  "patterns": "...",
  "encouragement": "..."
}

Be warm, non-judgmental, and supportive. Always remain polite and understanding.`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  })

  const result = JSON.parse(response.choices[0].message.content || '{}')

  return {
    text: `${result.summary}\n\n${result.patterns}\n\n${result.encouragement}`,
    topics: result.topics || [],
  }
}

function calculateDominantEmotions(moodLogs: any[]) {
  const emotionCounts: Record<string, number> = {}
  
  moodLogs.forEach(log => {
    if (log.emotions && Array.isArray(log.emotions)) {
      log.emotions.forEach((emotion: string) => {
        emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1
      })
    }
  })

  return emotionCounts
}

function analyzeVoiceTones(voiceLogs: any[]) {
  if (voiceLogs.length === 0) {
    return {
      avg_tone: 'neutral',
      tone_variations: {},
      emotional_stability: 0.5,
    }
  }

  const toneCount: Record<string, number> = {}
  let totalConfidence = 0

  voiceLogs.forEach(log => {
    toneCount[log.tone_detected] = (toneCount[log.tone_detected] || 0) + 1
    totalConfidence += log.confidence_score
  })

  const avgConfidence = totalConfidence / voiceLogs.length
  const mostCommonTone = Object.entries(toneCount)
    .sort(([, a], [, b]) => b - a)[0][0]

  return {
    avg_tone: mostCommonTone,
    tone_variations: toneCount,
    emotional_stability: avgConfidence,
  }
}

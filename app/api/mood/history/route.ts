import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const days = parseInt(searchParams.get('days') || '30')

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data, error } = await supabase
      .from('mood_logs')
      .select('*')
      .eq('user_id', session.user.id)
      .gte('logged_at', startDate.toISOString())
      .order('logged_at', { ascending: true })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch mood history' },
        { status: 500 }
      )
    }

    // Calculate statistics
    const avgMood = data.length > 0
      ? data.reduce((sum, log) => sum + log.mood_score, 0) / data.length
      : 0

    const emotionCounts: Record<string, number> = {}
    data.forEach(log => {
      log.emotions.forEach((emotion: string) => {
        emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1
      })
    })

    return NextResponse.json({
      logs: data,
      stats: {
        avgMood: Math.round(avgMood * 10) / 10,
        totalLogs: data.length,
        topEmotions: Object.entries(emotionCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([emotion, count]) => ({ emotion, count })),
      }
    })
  } catch (error) {
    console.error('Mood history API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

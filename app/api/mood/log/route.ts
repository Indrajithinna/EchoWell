import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { mood_score, emotions, notes } = await req.json()

    if (!mood_score || mood_score < 1 || mood_score > 10) {
      return NextResponse.json(
        { error: 'Invalid mood score. Must be between 1-10' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('mood_logs')
      .insert({
        user_id: session.user.id,
        mood_score,
        emotions: emotions || [],
        notes: notes || null,
        logged_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to save mood log' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Mood log API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

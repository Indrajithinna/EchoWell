import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { supabase } from '@/lib/supabase'
import { analyzeVoiceTone } from '@/lib/voice-analysis'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const audioFile = formData.get('audio') as File
    const conversationId = formData.get('conversationId') as string

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 })
    }

    // Convert File to Blob
    const audioBlob = new Blob([await audioFile.arrayBuffer()], { type: audioFile.type })

    // Analyze voice tone
    const toneResult = await analyzeVoiceTone(audioBlob)

    // Save to database
    const { data, error } = await supabase
      .from('voice_tone_logs')
      .insert({
        user_id: session.user.id,
        conversation_id: conversationId || null,
        tone_detected: toneResult.tone,
        confidence_score: toneResult.confidence,
        pitch_average: toneResult.pitch,
        speech_rate: toneResult.speechRate,
        energy_level: toneResult.energyLevel,
        emotional_state: toneResult.emotionalState,
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
    }

    return NextResponse.json({
      tone: toneResult.tone,
      confidence: toneResult.confidence,
      recommendations: toneResult.recommendations,
      emotionalState: toneResult.emotionalState,
    })
  } catch (error) {
    console.error('Tone analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze voice tone' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const days = parseInt(searchParams.get('days') || '7')

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data, error } = await supabase
      .from('voice_tone_logs')
      .select('*')
      .eq('user_id', session.user.id)
      .gte('recorded_at', startDate.toISOString())
      .order('recorded_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ logs: data })
  } catch (error) {
    console.error('Fetch tone logs error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tone logs' },
      { status: 500 }
    )
  }
}

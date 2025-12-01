import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { analyzeVoiceTone } from '@/lib/voice-analysis'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const audioFile = formData.get('audio') as File

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 })
    }

    // Convert File to Blob for analysis
    const audioBlob = new Blob([await audioFile.arrayBuffer()], { type: audioFile.type })

    // Analyze voice tone
    const toneResult = await analyzeVoiceTone(audioBlob)

    // Log the voice tone analysis to database
    try {
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )

      await supabase.from('voice_tone_logs').insert({
        user_id: session.user.id,
        conversation_id: formData.get('conversationId') as string || null,
        tone_detected: toneResult.tone,
        confidence_score: toneResult.confidence,
        pitch_average: toneResult.pitch,
        speech_rate: toneResult.speechRate,
        energy_level: toneResult.energyLevel,
        emotional_state: toneResult.emotionalState,
      })
    } catch (dbError) {
      console.error('Failed to log voice tone analysis:', dbError)
      // Continue without throwing - the analysis is still useful
    }

    return NextResponse.json({
      success: true,
      toneResult,
    })
  } catch (error) {
    console.error('Voice tone analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze voice tone' },
      { status: 500 }
    )
  }
}

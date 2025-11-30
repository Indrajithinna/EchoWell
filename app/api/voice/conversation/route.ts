import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { getChatResponse } from '@/lib/ai'
import { analyzeVoiceTone, adjustResponseForTone } from '@/lib/voice-analysis'
import { supabase } from '@/lib/supabase'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { audioBlob, messages, conversationId } = await req.json()

    // Convert base64 to Blob if needed
    let blob: Blob
    if (typeof audioBlob === 'string') {
      // Handle base64 encoded audio
      const audioData = Uint8Array.from(atob(audioBlob), c => c.charCodeAt(0))
      blob = new Blob([audioData], { type: 'audio/webm' })
    } else {
      // Handle direct blob
      blob = new Blob([audioBlob], { type: 'audio/webm' })
    }

    // 1. Analyze voice tone FIRST
    const toneResult = await analyzeVoiceTone(blob)

    // Log voice tone to database
    try {
      await supabase.from('voice_tone_logs').insert({
        user_id: session.user.id,
        conversation_id: conversationId || null,
        tone_detected: toneResult.tone,
        confidence_score: toneResult.confidence,
        pitch_average: toneResult.pitch,
        speech_rate: toneResult.speechRate,
        energy_level: toneResult.energyLevel,
        emotional_state: toneResult.emotionalState,
      })
    } catch (dbError) {
      console.error('Failed to log voice tone:', dbError)
      // Continue without throwing - analysis is still useful
    }

    // 2. Convert speech to text
    let userText = 'I had trouble understanding your voice message.'
    try {
      const transcription = await openai.audio.transcriptions.create({
        file: new File([blob], 'audio.wav'),
        model: 'whisper-1',
      })
      userText = transcription.text
    } catch (transcriptionError) {
      console.error('Speech-to-text error:', transcriptionError)
      // Continue with fallback text
    }

    // 3. Get AI response with tone-aware system prompt
    const aiResponse = await getChatResponse([
      ...messages,
      { role: 'user', content: userText }
    ], toneResult.tone, toneResult.confidence)

    // 4. Adjust response based on tone
    const adjustedResponse = adjustResponseForTone(aiResponse, toneResult)

    // 5. Convert AI response to speech with appropriate voice settings
    const voiceSettings = getVoiceSettingsForTone(toneResult.tone)
    
    let audioUrl = ''
    try {
      const mp3 = await openai.audio.speech.create({
        model: 'tts-1',
        voice: voiceSettings.voice,
        input: adjustedResponse,
        speed: voiceSettings.speed,
      })

      const audioBuffer = Buffer.from(await mp3.arrayBuffer())
      audioUrl = `data:audio/mpeg;base64,${audioBuffer.toString('base64')}`
    } catch (ttsError) {
      console.error('Text-to-speech error:', ttsError)
      // Continue without audio - user can still read the response
    }

    return NextResponse.json({
      userText,
      aiResponse: adjustedResponse,
      audioUrl,
      toneDetected: toneResult.tone,
      toneConfidence: toneResult.confidence,
      recommendations: toneResult.recommendations,
      emotionalState: toneResult.emotionalState,
    })
  } catch (error) {
    console.error('Voice conversation error:', error)
    return NextResponse.json(
      { error: 'Failed to process voice conversation' },
      { status: 500 }
    )
  }
}

// Get voice settings based on detected tone
function getVoiceSettingsForTone(tone: string) {
  const settings: Record<string, { voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer'; speed: number }> = {
    anxious: { voice: 'nova', speed: 0.90 }, // Slower, calming
    sad: { voice: 'nova', speed: 0.92 }, // Gentle and warm
    stressed: { voice: 'nova', speed: 0.88 }, // Very slow and soothing
    angry: { voice: 'nova', speed: 0.93 }, // Calm and steady
    happy: { voice: 'shimmer', speed: 1.05 }, // Upbeat
    calm: { voice: 'alloy', speed: 0.95 }, // Natural pace
    neutral: { voice: 'alloy', speed: 1.0 }, // Standard
  }

  return settings[tone] || settings.neutral
}

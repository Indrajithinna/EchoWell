import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import axios from 'axios'

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1/sound-generation'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { prompt, duration = 10, prompt_influence = 0.5 } = await req.json()

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    if (!ELEVENLABS_API_KEY) {
      return NextResponse.json(
        { error: 'ElevenLabs API key is not configured' },
        { status: 500 }
      )
    }

    // Call ElevenLabs Sound Generation API
    const response = await axios.post(
      ELEVENLABS_API_URL,
      {
        text: prompt,
        duration_seconds: Math.min(Math.max(duration, 0.5), 22), // ElevenLabs limit is usually around 22s for sound gen
        prompt_influence: prompt_influence,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        responseType: 'arraybuffer', // We get audio binary back
        timeout: 60000,
      }
    )

    // Convert audio buffer to base64
    const audioBase64 = Buffer.from(response.data).toString('base64')
    const audioUrl = `data:audio/mpeg;base64,${audioBase64}`

    return NextResponse.json({
      success: true,
      audioUrl: audioUrl,
      audioBase64: audioBase64,
      duration: duration,
      prompt: prompt,
      metadata: {
        provider: 'elevenlabs',
        generatedAt: new Date().toISOString(),
      }
    })

  } catch (error: any) {
    console.error('ElevenLabs generation error:', error)

    if (error.response) {
      // Try to parse the error message from the buffer if possible
      let errorMessage = 'Music generation failed'
      try {
        const textDecoder = new TextDecoder()
        const errorText = textDecoder.decode(error.response.data)
        const errorJson = JSON.parse(errorText)
        errorMessage = errorJson.detail?.message || errorJson.message || errorMessage
      } catch (e) {
        // ignore parsing error
      }

      return NextResponse.json(
        {
          error: errorMessage,
          details: 'ElevenLabs API Error'
        },
        { status: error.response.status }
      )
    }

    return NextResponse.json(
      { error: 'Failed to generate music. Please try again.' },
      { status: 500 }
    )
  }
}


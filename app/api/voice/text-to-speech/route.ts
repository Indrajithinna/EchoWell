import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
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

    const { text, voice = 'alloy' } = await req.json()

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 })
    }

    // Available voices: alloy, echo, fable, onyx, nova, shimmer
    const mp3 = await openai.audio.speech.create({
      model: 'tts-1',
      voice: voice as 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer',
      input: text,
      speed: 1.0,
    })

    const buffer = Buffer.from(await mp3.arrayBuffer())

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('Text-to-speech error:', error)
    return NextResponse.json(
      { error: 'Failed to generate speech' },
      { status: 500 }
    )
  }
}

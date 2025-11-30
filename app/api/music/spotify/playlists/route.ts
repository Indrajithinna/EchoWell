import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/route'
import { getSpotifyToken, searchPlaylistsByMood, getRecommendations } from '@/lib/spotify'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const mood = searchParams.get('mood') || 'calm'
    const type = searchParams.get('type') || 'playlists' // 'playlists' or 'recommendations'

    const token = await getSpotifyToken()

    let data
    if (type === 'recommendations') {
      data = await getRecommendations(mood, token)
    } else {
      data = await searchPlaylistsByMood(mood, token)
    }

    // Ensure we always return an array, even if empty
    const validData = Array.isArray(data) ? data.filter(item => item && item.id) : []

    return NextResponse.json({ data: validData })
  } catch (error) {
    console.error('Music API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch music' },
      { status: 500 }
    )
  }
}

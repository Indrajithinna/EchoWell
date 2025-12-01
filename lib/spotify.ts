import axios from 'axios'

const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/api/token'
const SPOTIFY_API_URL = 'https://api.spotify.com/v1'

interface SpotifyTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
}

// Get Spotify access token
export async function getSpotifyToken(): Promise<string> {
  const clientId = process.env.SPOTIFY_CLIENT_ID!
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET!

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  try {
    const response = await axios.post<SpotifyTokenResponse>(
      SPOTIFY_AUTH_URL,
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    )

    return response.data.access_token
  } catch (error) {
    console.error('Spotify auth error:', error)
    throw new Error('Failed to authenticate with Spotify')
  }
}

// Search for playlists by mood
export async function searchPlaylistsByMood(mood: string, token: string) {
  try {
    const moodKeywords: Record<string, string> = {
      happy: 'happy upbeat positive',
      sad: 'sad melancholy emotional',
      calm: 'calm relaxing peaceful meditation',
      anxious: 'calm anxiety relief peaceful',
      energetic: 'energetic workout motivation',
      stressed: 'stress relief calm soothing',
    }

    const searchQuery = moodKeywords[mood.toLowerCase()] || 'relaxing calm'

    const response = await axios.get(`${SPOTIFY_API_URL}/search`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      params: {
        q: searchQuery,
        type: 'playlist',
        limit: 10,
      },
    })

    const items = response.data.playlists?.items || []
    return items.filter((item: any) => item && item.id) // Filter out null/undefined items
  } catch (error) {
    console.error('Spotify search error:', error)
    throw new Error('Failed to search Spotify playlists')
  }
}

// Get playlist tracks
export async function getPlaylistTracks(playlistId: string, token: string) {
  try {
    const response = await axios.get(
      `${SPOTIFY_API_URL}/playlists/${playlistId}/tracks`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        params: {
          limit: 20,
        },
      }
    )

    return response.data.items
  } catch (error) {
    console.error('Spotify playlist tracks error:', error)
    throw new Error('Failed to fetch playlist tracks')
  }
}

// Get recommendations based on mood
export async function getRecommendations(
  mood: string,
  token: string
) {
  try {
    // Mood-based audio features
    const moodFeatures: Record<string, any> = {
      happy: { target_valence: 0.8, target_energy: 0.7 },
      sad: { target_valence: 0.3, target_energy: 0.4 },
      calm: { target_valence: 0.5, target_energy: 0.3, target_acousticness: 0.7 },
      anxious: { target_valence: 0.6, target_energy: 0.3, target_acousticness: 0.8 },
      energetic: { target_valence: 0.7, target_energy: 0.9 },
    }

    const features = moodFeatures[mood.toLowerCase()] || moodFeatures.calm

    // Seed artists for different moods (popular artists for better results)
    const seedArtists = mood === 'calm' || mood === 'anxious'
      ? '4NHQUGzhtTLFvgF5SZesLK,3YQKmKGau1PzlVlkL1iodx,7CajNmpbOovFoOoasH2HaY' // Bonobo, Tycho, Nils Frahm
      : mood === 'energetic'
        ? '1vCWHaC5f2uS3yhpwWbIA6,4gzpq5DPGxSnKTe4SA8HAU,6M2wZ9GZgrQXHCFfjv46we' // Avicii, Calvin Harris, Daft Punk
        : '4q3ewBCX7sLwd24euuV69X,1dfeR4HaWDbWqFHLkxsg1d,6qqNVTkY8uBg9cP3Jd7DAH' // Bad Bunny, Queen, Billie Eilish

    const response = await axios.get(`${SPOTIFY_API_URL}/recommendations`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      params: {
        seed_artists: seedArtists,
        limit: 20,
        ...features,
      },
    })

    const tracks = response.data.tracks || []
    return tracks.filter((track: any) => track && track.id) // Filter out null/undefined tracks
  } catch (error) {
    console.error('Spotify recommendations error:', error)

    // Return fallback recommendations when Spotify API fails
    return getFallbackRecommendations(mood)
  }
}

// Fallback recommendations when Spotify API is unavailable
function getFallbackRecommendations(mood: string) {
  const fallbackTracks: Record<string, any[]> = {
    calm: [
      { name: "Weightless", artist: "Marconi Union", id: "fallback1", external_urls: { spotify: "#" } },
      { name: "Clair de Lune", artist: "Claude Debussy", id: "fallback2", external_urls: { spotify: "#" } },
      { name: "Ambient 1: Music for Airports", artist: "Brian Eno", id: "fallback3", external_urls: { spotify: "#" } }
    ],
    happy: [
      { name: "Here Comes the Sun", artist: "The Beatles", id: "fallback4", external_urls: { spotify: "#" } },
      { name: "Walking on Sunshine", artist: "Katrina and the Waves", id: "fallback5", external_urls: { spotify: "#" } },
      { name: "Good Vibrations", artist: "The Beach Boys", id: "fallback6", external_urls: { spotify: "#" } }
    ],
    energetic: [
      { name: "Eye of the Tiger", artist: "Survivor", id: "fallback7", external_urls: { spotify: "#" } },
      { name: "Don't Stop Me Now", artist: "Queen", id: "fallback8", external_urls: { spotify: "#" } },
      { name: "Happy", artist: "Pharrell Williams", id: "fallback9", external_urls: { spotify: "#" } }
    ]
  }

  return fallbackTracks[mood.toLowerCase()] || fallbackTracks.calm
}

'use client'

import { useState, useEffect } from 'react'
import { Music, Loader2, Sparkles } from 'lucide-react'
import MoodSelector from '@/components/music/mood-selector'
import PlaylistCard from '@/components/music/playlist-card'
import MusicPlayer from '@/components/music/music-player'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

interface Track {
  id: string
  name: string
  artists?: Array<{ name: string }>
  album?: {
    images?: Array<{ url: string }>
  }
  preview_url: string | null
}

interface Playlist {
  id: string
  name: string
  description: string
  images: Array<{ url: string }>
  external_urls: {
    spotify: string
  }
}

export default function MusicPage() {
  const [selectedMood, setSelectedMood] = useState('calm')
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [recommendations, setRecommendations] = useState<Track[]>([])
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [viewType, setViewType] = useState<'playlists' | 'recommendations'>('recommendations')
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null)
  const [moodBefore, setMoodBefore] = useState<number | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchMusic()
  }, [selectedMood, viewType])

  const fetchMusic = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(
        `/api/music/spotify/playlists?mood=${selectedMood}&type=${viewType}`
      )

      if (!response.ok) throw new Error('Failed to fetch music')

      const data = await response.json()

      if (viewType === 'recommendations') {
        const validRecommendations = data.data?.filter(track => track && track.id) || []
        setRecommendations(validRecommendations)
        if (validRecommendations.length > 0) {
          setCurrentTrack(validRecommendations[0])
          setCurrentTrackIndex(0)
        }
      } else {
        const validPlaylists = data.data?.filter(playlist => playlist && playlist.id) || []
        setPlaylists(validPlaylists)
      }
    } catch (error) {
      console.error('Error fetching music:', error)
      toast({
        title: 'Error',
        description: 'Failed to load music. Please try again.',
        variant: 'error',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleMoodSelect = (mood: string) => {
    setSelectedMood(mood)
    setCurrentTrack(null)
    setCurrentTrackIndex(0)
  }

  const handleNext = () => {
    if (currentTrackIndex < recommendations.length - 1) {
      const nextIndex = currentTrackIndex + 1
      setCurrentTrackIndex(nextIndex)
      setCurrentTrack(recommendations[nextIndex])
    }
  }

  const handlePrevious = () => {
    if (currentTrackIndex > 0) {
      const prevIndex = currentTrackIndex - 1
      setCurrentTrackIndex(prevIndex)
      setCurrentTrack(recommendations[prevIndex])
    }
  }

  const startSession = () => {
    setSessionStartTime(new Date())
    // Could show a mood rating dialog here
    setMoodBefore(5) // Default, or prompt user
  }

  const endSession = async () => {
    if (!sessionStartTime) return

    const duration = Math.floor((new Date().getTime() - sessionStartTime.getTime()) / 1000)

    try {
      // Save session to database
      await fetch('/api/music/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mood_before: moodBefore,
          mood_after: null, // Could prompt user for post-session mood
          track_ids: [currentTrack?.id],
          duration,
          session_type: selectedMood,
        }),
      })

      toast({
        title: 'Session Saved',
        description: 'Your music therapy session has been recorded.',
        variant: 'success',
      })

      setSessionStartTime(null)
      setMoodBefore(null)
    } catch (error) {
      console.error('Error saving session:', error)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-purple-50/30 to-pink-50/30">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Music className="w-8 h-8 text-zen-500" />
            Music Therapy
          </h1>
          <p className="text-gray-600">
            Let music guide your emotional wellbeing. Choose your mood and discover therapeutic sounds.
          </p>
        </div>

        {/* Mood Selector */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <MoodSelector selectedMood={selectedMood} onMoodSelect={handleMoodSelect} />
        </div>

        {/* View Toggle */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={viewType === 'recommendations' ? 'default' : 'outline'}
            onClick={() => setViewType('recommendations')}
          >
            <Sparkles size={16} className="mr-2" />
            AI Recommendations
          </Button>
          <Button
            variant={viewType === 'playlists' ? 'default' : 'outline'}
            onClick={() => setViewType('playlists')}
          >
            <Music size={16} className="mr-2" />
            Curated Playlists
          </Button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-calm-500" />
          </div>
        )}

        {/* Music Player for Recommendations */}
        {!isLoading && viewType === 'recommendations' && currentTrack && (
          <div className="mb-8">
            <MusicPlayer
              track={currentTrack}
              onNext={currentTrackIndex < recommendations.length - 1 ? handleNext : undefined}
              onPrevious={currentTrackIndex > 0 ? handlePrevious : undefined}
            />

            {/* Session Controls */}
            <div className="mt-4 flex justify-center gap-4">
              {!sessionStartTime ? (
                <Button onClick={startSession} className="px-6">
                  Start Therapy Session
                </Button>
              ) : (
                <Button onClick={endSession} variant="outline" className="px-6">
                  End Session & Save
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Recommendations List */}
        {!isLoading && viewType === 'recommendations' && recommendations.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Recommended Tracks
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {recommendations.map((track, index) => (
                <button
                  key={track.id}
                  onClick={() => {
                    setCurrentTrack(track)
                    setCurrentTrackIndex(index)
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                    currentTrackIndex === index
                      ? 'bg-calm-50 border-2 border-calm-300'
                      : 'hover:bg-gray-50 border-2 border-transparent'
                  }`}
                >
                  <img
                    src={track.album?.images?.[0]?.url || '/placeholder-album.png'}
                    alt={track.name}
                    className="w-12 h-12 rounded"
                  />
                  <div className="flex-1 text-left min-w-0">
                    <p className="font-medium text-gray-900 truncate">{track.name}</p>
                    <p className="text-sm text-gray-600 truncate">
                      {track.artists?.map(a => a.name).join(', ') || 'Unknown Artist'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Playlists Grid */}
        {!isLoading && viewType === 'playlists' && playlists.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {playlists
              .filter(playlist => playlist && playlist.id) // Filter out null/undefined playlists
              .map((playlist) => (
                <PlaylistCard key={playlist.id} playlist={playlist} />
              ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && (
          (viewType === 'recommendations' && recommendations.length === 0) ||
          (viewType === 'playlists' && playlists.length === 0)
        ) && (
          <div className="text-center py-12 text-gray-500">
            <Music className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>No music found for this mood.</p>
            <p className="text-sm mt-1">Try selecting a different mood!</p>
          </div>
        )}
      </div>
    </div>
  )
}

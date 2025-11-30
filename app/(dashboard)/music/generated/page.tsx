'use client'

import { useState, useEffect } from 'react'
import { Music, Download, Play, Pause, Trash2, Loader2, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

interface GeneratedMusic {
  id: string
  prompt: string
  audioUrl: string
  mood: string
  style: string
  duration: number
  createdAt: string
}

export default function GeneratedMusicPage() {
  const [musicLibrary, setMusicLibrary] = useState<GeneratedMusic[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    // Load from localStorage (or you can create an API endpoint)
    const savedMusic = localStorage.getItem('generatedMusic')
    if (savedMusic) {
      setMusicLibrary(JSON.parse(savedMusic))
    }
    setIsLoading(false)
  }, [])

  const togglePlay = (music: GeneratedMusic) => {
    if (playingId === music.id) {
      // Stop current audio
      currentAudio?.pause()
      setPlayingId(null)
    } else {
      // Stop previous audio
      if (currentAudio) {
        currentAudio.pause()
      }

      // Play new audio
      const audio = new Audio(music.audioUrl)
      audio.onended = () => setPlayingId(null)
      audio.play()
      setCurrentAudio(audio)
      setPlayingId(music.id)
    }
  }

  const downloadMusic = (music: GeneratedMusic) => {
    const link = document.createElement('a')
    link.href = music.audioUrl
    link.download = `therapy-music-${music.mood}-${Date.now()}.wav`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: 'Download Started',
      description: 'Your music is being downloaded.',
      variant: 'success',
    })
  }

  const deleteMusic = (id: string) => {
    if (!confirm('Are you sure you want to delete this music?')) return

    const updated = musicLibrary.filter(m => m.id !== id)
    setMusicLibrary(updated)
    localStorage.setItem('generatedMusic', JSON.stringify(updated))

    if (playingId === id) {
      currentAudio?.pause()
      setPlayingId(null)
    }

    toast({
      title: 'Deleted',
      description: 'Music has been removed from your library.',
      variant: 'success',
    })
  }

  const getMoodColor = (mood: string) => {
    const colors: Record<string, string> = {
      calm: 'from-blue-400 to-cyan-400',
      happy: 'from-yellow-400 to-orange-400',
      sad: 'from-purple-400 to-indigo-400',
      anxious: 'from-green-400 to-teal-400',
    }
    return colors[mood] || 'from-gray-400 to-gray-500'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-calm-500" />
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-purple-50/30 to-pink-50/30">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Music className="w-8 h-8 text-purple-500" />
            Generated Music Library
          </h1>
          <p className="text-gray-600">
            Your personalized therapy music created by AI.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Tracks</p>
                  <p className="text-2xl font-bold text-gray-900">{musicLibrary.length}</p>
                </div>
                <Music className="w-10 h-10 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Duration</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.floor(musicLibrary.reduce((sum, m) => sum + m.duration, 0) / 60)} min
                  </p>
                </div>
                <Clock className="w-10 h-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Most Used Mood</p>
                  <p className="text-2xl font-bold text-gray-900 capitalize">
                    {musicLibrary.length > 0 
                      ? musicLibrary[0].mood 
                      : 'None'
                    }
                  </p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-400 rounded-lg" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Music Grid */}
        {musicLibrary.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Music className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Generated Music Yet
              </h3>
              <p className="text-gray-600 mb-6">
                Start a conversation in the chat and generate personalized therapy music.
              </p>
              <Button onClick={() => window.location.href = '/chat'}>
                Go to Chat
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {musicLibrary.map((music) => (
              <Card key={music.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className={`h-32 bg-gradient-to-br ${getMoodColor(music.mood)} relative`}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      onClick={() => togglePlay(music)}
                      className="w-16 h-16 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all transform hover:scale-110"
                    >
                      {playingId === music.id ? (
                        <Pause className="w-8 h-8 text-gray-900" />
                      ) : (
                        <Play className="w-8 h-8 text-gray-900 ml-1" />
                      )}
                    </button>
                  </div>
                  
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 bg-white/90 rounded-full text-xs font-medium capitalize">
                      {music.mood}
                    </span>
                  </div>
                </div>

                <CardContent className="p-4">
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {music.prompt}
                  </p>

                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <span>{music.duration}s</span>
                    <span>{new Date(music.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => downloadMusic(music)}
                    >
                      <Download size={14} className="mr-1" />
                      Download
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteMusic(music.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

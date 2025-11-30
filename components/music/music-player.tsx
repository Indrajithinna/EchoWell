'use client'

import { useState, useRef, useEffect } from 'react'
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Track {
  id: string
  name: string
  artists?: Array<{ name: string }>
  album?: {
    images?: Array<{ url: string }>
  }
  preview_url: string | null
}

interface MusicPlayerProps {
  track: Track
  onNext?: () => void
  onPrevious?: () => void
}

export default function MusicPlayer({ track, onNext, onPrevious }: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [volume, setVolume] = useState(0.7)
  const [isMuted, setIsMuted] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  useEffect(() => {
    setIsPlaying(false)
    setProgress(0)
    if (audioRef.current) {
      audioRef.current.currentTime = 0
    }
  }, [track])

  const togglePlay = () => {
    if (!audioRef.current || !track.preview_url) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100
      setProgress(progress)
    }
  }

  const handleEnded = () => {
    setIsPlaying(false)
    setProgress(0)
    if (onNext) onNext()
  }

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value)
    setProgress(value)
    if (audioRef.current) {
      audioRef.current.currentTime = (value / 100) * audioRef.current.duration
    }
  }

  if (!track.preview_url) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 text-center text-gray-500">
        Preview not available for this track
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <audio
        ref={audioRef}
        src={track.preview_url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      />

      <div className="flex items-center gap-4 mb-4">
        {/* Album Art */}
        <img
          src={track.album?.images?.[0]?.url || '/placeholder-album.png'}
          alt={track.name}
          className="w-20 h-20 rounded-lg shadow-md"
        />

        {/* Track Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{track.name}</h3>
          <p className="text-sm text-gray-600 truncate">
            {track.artists?.map(a => a.name).join(', ') || 'Unknown Artist'}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={handleProgressChange}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-calm-500"
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={onPrevious}
            disabled={!onPrevious}
          >
            <SkipBack size={20} />
          </Button>

          <Button
            size="lg"
            onClick={togglePlay}
            className="w-12 h-12 rounded-full bg-gradient-to-r from-calm-500 to-zen-500 hover:from-calm-600 hover:to-zen-600"
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-1" />}
          </Button>

          <Button
            size="icon"
            variant="ghost"
            onClick={onNext}
            disabled={!onNext}
          >
            <SkipForward size={20} />
          </Button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-2">
          <button onClick={toggleMute} className="text-gray-600 hover:text-gray-800">
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-calm-500"
          />
        </div>
      </div>
    </div>
  )
}

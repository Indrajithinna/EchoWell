'use client'

import { Play, Pause } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'

interface VoiceMessageBubbleProps {
  audioUrl: string
  role: 'user' | 'assistant'
  transcript: string
  duration?: number
}

export default function VoiceMessageBubble({
  audioUrl,
  role,
  transcript,
  duration = 0,
}: VoiceMessageBubbleProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)
  const isUser = role === 'user'

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateProgress = () => {
      const progress = (audio.currentTime / audio.duration) * 100
      setProgress(progress)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setProgress(0)
    }

    audio.addEventListener('timeupdate', updateProgress)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', updateProgress)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [])

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} animate-fade-in`}>
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      <div className={`flex-1 max-w-[80%]`}>
        <div
          className={`px-4 py-3 rounded-2xl ${
            isUser
              ? 'bg-gradient-to-r from-calm-500 to-zen-500 text-white rounded-tr-none'
              : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm'
          }`}
        >
          {/* Audio Player */}
          <div className="flex items-center gap-3 mb-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={togglePlay}
              className={`w-10 h-10 rounded-full ${
                isUser ? 'hover:bg-white/20' : 'hover:bg-gray-100'
              }`}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
            </Button>

            {/* Waveform Visualization */}
            <div className="flex-1">
              <div className="relative h-8 flex items-center">
                <div className="w-full h-1 bg-gray-300 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${isUser ? 'bg-white' : 'bg-calm-500'} transition-all`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>

            <span className={`text-xs ${isUser ? 'text-white/80' : 'text-gray-500'}`}>
              {duration > 0 ? formatTime(duration) : '0:00'}
            </span>
          </div>

          {/* Transcript */}
          <p className="text-sm mt-2 pt-2 border-t border-current/20">
            {transcript}
          </p>
        </div>
      </div>
    </div>
  )
}

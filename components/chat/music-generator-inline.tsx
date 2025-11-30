'use client'

import { useState } from 'react'
import { Music, Wand2, Loader2, Download, Play, Pause } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

interface MusicGeneratorInlineProps {
  conversationContext: string
  onMusicGenerated?: (audioUrl: string) => void
}

export default function MusicGeneratorInline({ 
  conversationContext,
  onMusicGenerated 
}: MusicGeneratorInlineProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null)
  const { toast } = useToast()

  const moodStyles = [
    { mood: 'calm', style: 'ambient', label: 'Calming Ambient', color: 'from-blue-400 to-cyan-400' },
    { mood: 'happy', style: 'upbeat', label: 'Uplifting Melody', color: 'from-yellow-400 to-orange-400' },
    { mood: 'sad', style: 'melancholic', label: 'Gentle Piano', color: 'from-purple-400 to-indigo-400' },
    { mood: 'anxious', style: 'peaceful', label: 'Peaceful Waves', color: 'from-green-400 to-teal-400' },
  ]

  const generateMusic = async (mood: string, style: string) => {
    setIsGenerating(true)
    
    try {
      // Create prompt based on conversation context
      const prompt = `Create therapeutic ${style} music for someone feeling ${mood}. ${conversationContext.slice(0, 200)}`

      const response = await fetch('/api/music/generate-from-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt,
          duration: 60, // 1 minute
          mood: mood,
          style: style,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Generation failed')
      }

      const data = await response.json()
      
      // Handle both URL and base64 responses
      const audioUrl = data.audioUrl || `data:audio/wav;base64,${data.audioBase64}`
      setGeneratedAudioUrl(audioUrl)
      
      // Save to music library
      const newMusic = {
        id: Date.now().toString(),
        prompt: prompt,
        audioUrl: audioUrl,
        mood: mood,
        style: style,
        duration: duration,
        createdAt: new Date().toISOString(),
      }
      
      // Save to localStorage
      const existingMusic = JSON.parse(localStorage.getItem('generatedMusic') || '[]')
      const updatedMusic = [...existingMusic, newMusic]
      localStorage.setItem('generatedMusic', JSON.stringify(updatedMusic))
      
      if (onMusicGenerated) {
        onMusicGenerated(audioUrl)
      }

      toast({
        title: 'Music Generated!',
        description: 'Your personalized therapy music is ready.',
        variant: 'success',
      })
    } catch (error: any) {
      console.error('Music generation error:', error)
      toast({
        title: 'Generation Failed',
        description: error.message || 'Could not generate music. Please try again.',
        variant: 'error',
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const togglePlay = () => {
    if (!generatedAudioUrl) return

    if (!audioElement) {
      const audio = new Audio(generatedAudioUrl)
      audio.onended = () => setIsPlaying(false)
      setAudioElement(audio)
      audio.play()
      setIsPlaying(true)
    } else {
      if (isPlaying) {
        audioElement.pause()
        setIsPlaying(false)
      } else {
        audioElement.play()
        setIsPlaying(true)
      }
    }
  }

  const downloadMusic = () => {
    if (!generatedAudioUrl) return

    const link = document.createElement('a')
    link.href = generatedAudioUrl
    link.download = `therapy-music-${Date.now()}.wav`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200 p-6 my-4">
      <div className="flex items-center gap-2 mb-4">
        <Music className="w-5 h-5 text-purple-600" />
        <h3 className="font-semibold text-gray-800">Generate Therapy Music</h3>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Based on our conversation, I can create personalized music to help you feel better.
      </p>

      {!generatedAudioUrl ? (
        <div className="grid grid-cols-2 gap-3">
          {moodStyles.map((item) => (
            <button
              key={item.mood}
              onClick={() => generateMusic(item.mood, item.style)}
              disabled={isGenerating}
              className={`p-4 rounded-xl bg-gradient-to-br ${item.color} text-white font-medium shadow-md hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isGenerating ? (
                <Loader2 className="w-5 h-5 mx-auto animate-spin" />
              ) : (
                <>
                  <Wand2 className="w-5 h-5 mx-auto mb-2" />
                  <span className="text-sm">{item.label}</span>
                </>
              )}
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {/* Audio Player */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <Button
                onClick={togglePlay}
                size="lg"
                className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-1" />}
              </Button>
              
              <div className="flex-1">
                <p className="font-medium text-gray-900">Your Personalized Music</p>
                <p className="text-sm text-gray-500">Generated just for you</p>
              </div>

              <Button
                onClick={downloadMusic}
                variant="outline"
                size="icon"
              >
                <Download size={18} />
              </Button>
            </div>
          </div>

          {/* Generate Another */}
          <Button
            onClick={() => setGeneratedAudioUrl(null)}
            variant="outline"
            className="w-full"
          >
            Generate Different Music
          </Button>
        </div>
      )}

      {isGenerating && (
        <div className="mt-4 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-purple-600">
            <Loader2 className="animate-spin" size={16} />
            <span>Creating your personalized music... This may take up to 2 minutes.</span>
          </div>
        </div>
      )}
    </div>
  )
}

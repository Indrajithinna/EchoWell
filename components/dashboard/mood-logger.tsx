'use client'

import { useState } from 'react'
import { Smile, Meh, Frown, Heart, Cloud, Zap, Coffee } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

const emotions = [
  { name: 'Happy', icon: Smile, color: 'bg-green-100 text-green-600' },
  { name: 'Calm', icon: Cloud, color: 'bg-blue-100 text-blue-600' },
  { name: 'Anxious', icon: Zap, color: 'bg-yellow-100 text-yellow-600' },
  { name: 'Sad', icon: Frown, color: 'bg-purple-100 text-purple-600' },
  { name: 'Energetic', icon: Coffee, color: 'bg-orange-100 text-orange-600' },
  { name: 'Grateful', icon: Heart, color: 'bg-pink-100 text-pink-600' },
]

export default function MoodLogger({ onLogComplete }: { onLogComplete?: () => void }) {
  const [moodScore, setMoodScore] = useState(5)
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const toggleEmotion = (emotion: string) => {
    setSelectedEmotions(prev =>
      prev.includes(emotion)
        ? prev.filter(e => e !== emotion)
        : [...prev, emotion]
    )
  }

  const handleSubmit = async () => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/mood/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mood_score: moodScore,
          emotions: selectedEmotions,
          notes,
        }),
      })

      if (!response.ok) throw new Error('Failed to log mood')

      toast({
        title: 'Mood Logged!',
        description: 'Your mood has been saved successfully.',
        variant: 'success',
      })

      // Reset form
      setMoodScore(5)
      setSelectedEmotions([])
      setNotes('')

      if (onLogComplete) onLogComplete()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to log mood. Please try again.',
        variant: 'error',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getMoodEmoji = (score: number) => {
    if (score >= 8) return '😊'
    if (score >= 6) return '🙂'
    if (score >= 4) return '😐'
    if (score >= 2) return '😔'
    return '😢'
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-6">
        How are you feeling?
      </h3>

      {/* Mood Score Slider */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-600">Rate your mood</span>
          <span className="text-3xl">{getMoodEmoji(moodScore)}</span>
        </div>
        
        <input
          type="range"
          min="1"
          max="10"
          value={moodScore}
          onChange={(e) => setMoodScore(parseInt(e.target.value))}
          className="w-full h-2 bg-gradient-to-r from-red-300 via-yellow-300 to-green-300 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, 
              rgb(252, 165, 165) 0%, 
              rgb(253, 224, 71) 50%, 
              rgb(134, 239, 172) 100%)`
          }}
        />
        
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>Terrible</span>
          <span className="font-semibold text-gray-700">{moodScore}/10</span>
          <span>Amazing</span>
        </div>
      </div>

      {/* Emotion Selector */}
      <div className="mb-6">
        <label className="text-sm text-gray-600 mb-3 block">
          What emotions are you feeling?
        </label>
        <div className="grid grid-cols-3 gap-3">
          {emotions.map((emotion) => {
            const Icon = emotion.icon
            const isSelected = selectedEmotions.includes(emotion.name)

            return (
              <button
                key={emotion.name}
                onClick={() => toggleEmotion(emotion.name)}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                  isSelected
                    ? `${emotion.color} border-current`
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Icon size={20} />
                <span className="text-xs font-medium">{emotion.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Notes */}
      <div className="mb-6">
        <label className="text-sm text-gray-600 mb-2 block">
          Any thoughts? (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-calm-400 focus:outline-none resize-none"
          rows={3}
          maxLength={500}
        />
      </div>

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        isLoading={isLoading}
        className="w-full"
      >
        Log Mood
      </Button>
    </div>
  )
}

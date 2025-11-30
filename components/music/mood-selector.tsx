'use client'

import { Smile, Frown, Meh, Zap, Cloud, Heart } from 'lucide-react'

const moods = [
  { name: 'Happy', value: 'happy', icon: Smile, color: 'bg-yellow-100 text-yellow-600 border-yellow-300' },
  { name: 'Sad', value: 'sad', icon: Frown, color: 'bg-blue-100 text-blue-600 border-blue-300' },
  { name: 'Calm', value: 'calm', icon: Cloud, color: 'bg-green-100 text-green-600 border-green-300' },
  { name: 'Anxious', value: 'anxious', icon: Zap, color: 'bg-orange-100 text-orange-600 border-orange-300' },
  { name: 'Energetic', value: 'energetic', icon: Heart, color: 'bg-red-100 text-red-600 border-red-300' },
  { name: 'Neutral', value: 'neutral', icon: Meh, color: 'bg-gray-100 text-gray-600 border-gray-300' },
]

interface MoodSelectorProps {
  selectedMood: string
  onMoodSelect: (mood: string) => void
}

export default function MoodSelector({ selectedMood, onMoodSelect }: MoodSelectorProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        How are you feeling?
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {moods.map((mood) => {
          const Icon = mood.icon
          const isSelected = selectedMood === mood.value

          return (
            <button
              key={mood.value}
              onClick={() => onMoodSelect(mood.value)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                isSelected
                  ? `${mood.color} border-current shadow-md transform scale-105`
                  : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <Icon size={28} />
              <span className="font-medium text-sm">{mood.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

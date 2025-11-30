'use client'

import { useState } from 'react'
import { Music, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MusicGenerationTriggerProps {
  onTrigger: () => void
  disabled?: boolean
}

export default function MusicGenerationTrigger({ 
  onTrigger, 
  disabled = false 
}: MusicGenerationTriggerProps) {
  return (
    <button
      onClick={onTrigger}
      disabled={disabled}
      className="group relative inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Music className="w-4 h-4" />
      <span className="text-sm font-medium">Generate Therapy Music</span>
      <Sparkles className="w-4 h-4 group-hover:animate-pulse" />
      
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
        AI will create personalized music based on your conversation
      </div>
    </button>
  )
}

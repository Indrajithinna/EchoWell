'use client'

import { useState } from 'react'
import { Mic, Square, Send, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useVoiceRecorder } from '@/hooks/use-voice-recorder'

interface VoiceRecorderProps {
  onSendVoice: (audioBlob: Blob) => Promise<void>
  isProcessing: boolean
}

export default function VoiceRecorder({ onSendVoice, isProcessing }: VoiceRecorderProps) {
  const {
    isRecording,
    audioBlob,
    duration,
    startRecording,
    stopRecording,
    resetRecording,
  } = useVoiceRecorder()

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleSend = async () => {
    if (audioBlob) {
      await onSendVoice(audioBlob)
      resetRecording()
    }
  }

  return (
    <div className="bg-white rounded-xl border-2 border-calm-200 p-4">
      {/* Recording Status */}
      {isRecording && (
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="flex gap-1">
            <div className="w-2 h-8 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-8 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '100ms' }}></div>
            <div className="w-2 h-8 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></div>
            <div className="w-2 h-8 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
          </div>
          <span className="text-lg font-mono font-semibold text-red-600">
            {formatDuration(duration)}
          </span>
        </div>
      )}

      {/* Audio Preview */}
      {audioBlob && !isRecording && (
        <div className="mb-4">
          <audio
            controls
            src={URL.createObjectURL(audioBlob)}
            className="w-full"
          />
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        {!isRecording && !audioBlob && (
          <Button
            onClick={startRecording}
            disabled={isProcessing}
            size="lg"
            className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 rounded-full w-16 h-16"
          >
            <Mic size={24} />
          </Button>
        )}

        {isRecording && (
          <Button
            onClick={stopRecording}
            size="lg"
            className="bg-red-600 hover:bg-red-700 rounded-full w-16 h-16"
          >
            <Square size={24} />
          </Button>
        )}

        {audioBlob && !isRecording && (
          <>
            <Button
              onClick={resetRecording}
              variant="outline"
              size="lg"
              disabled={isProcessing}
            >
              <Trash2 size={20} />
            </Button>
            <Button
              onClick={handleSend}
              size="lg"
              disabled={isProcessing}
              className="bg-gradient-to-r from-calm-500 to-zen-500 hover:from-calm-600 hover:to-zen-600"
            >
              {isProcessing ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Send size={20} />
              )}
            </Button>
          </>
        )}
      </div>

      <p className="text-xs text-gray-500 text-center mt-3">
        {isRecording
          ? 'Recording... Click stop when finished'
          : audioBlob
          ? 'Review your message and send'
          : 'Click the microphone to start recording'}
      </p>
    </div>
  )
}

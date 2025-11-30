export interface VoiceMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  audioUrl?: string
  timestamp: Date
  duration?: number
}

export interface VoiceSession {
  id: string
  conversationId: string
  startTime: Date
  endTime?: Date
  totalDuration: number
  messageCount: number
}

export interface VoiceRecording {
  id: string
  blob: Blob
  duration: number
  timestamp: Date
}

export interface VoiceConfig {
  language: string
  voice: string
  rate: number
  pitch: number
  volume: number
}

export interface SpeechRecognitionResult {
  transcript: string
  confidence: number
  isFinal: boolean
}

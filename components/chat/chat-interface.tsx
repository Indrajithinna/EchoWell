'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Send, Mic, MicOff, Volume2, VolumeX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import MessageBubble from './message-bubble'
import TypingIndicator from './typing-indicator'
import CrisisBanner from './crisis-banner'
import { useToast } from '@/hooks/use-toast'
import { useSoundEffects } from '@/hooks/use-sound-effects'
import SonicSanctuary from '@/components/accessibility/sonic-sanctuary'
import HapticBreathing from '@/components/accessibility/haptic-breathing'
import { Compass } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [showCrisisBanner, setShowCrisisBanner] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)
  const [ttsEnabled, setTtsEnabled] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const { playSound } = useSoundEffects()
  const [showSonicMode, setShowSonicMode] = useState(false)
  const recognitionRef = useRef<any>(null)
  const router = useRouter()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Setup browser speech APIs availability once on mount
  useEffect(() => {
    const SpeechRecognitionImpl =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (SpeechRecognitionImpl) {
      setSpeechSupported(true)
      const recognition = new SpeechRecognitionImpl()
      recognition.lang = 'en-US'
      recognition.interimResults = true
      recognition.continuous = false
      recognition.onresult = (event: any) => {
        let transcript = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i]
          transcript += result[0].transcript
        }
        // Update input live while speaking
        setInputValue(prev => {
          // If there was previous typed text, append with space
          const base = prev && !prev.endsWith(' ') ? prev + ' ' : prev
          return (base || '') + transcript
        })
      }
      recognition.onend = () => setIsRecording(false)
      recognition.onerror = () => setIsRecording(false)
      recognitionRef.current = recognition
    }
  }, [])

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      role: 'user',
      content: inputValue.trim()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          conversationId
        })
      })

      const data = await response.json()

      if (data.crisis) {
        setShowCrisisBanner(true)
        toast({
          title: 'Crisis Resources Available',
          description: 'Please reach out for immediate professional help.',
          variant: 'error'
        })
      }

      const aiMessage: Message = {
        role: 'assistant',
        content: data.message
      }

      setMessages(prev => [...prev, aiMessage])

      // Speak AI response if enabled and supported
      try {
        if (ttsEnabled && typeof window !== 'undefined' && 'speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(data.message)

          // Emotional Mirror Logic: Simple sentiment analysis
          const lowerMsg = data.message.toLowerCase()
          if (lowerMsg.includes('sorry') || lowerMsg.includes('sad') || lowerMsg.includes('difficult') || lowerMsg.includes('hear that')) {
            // Empathetic/Sad tone
            utterance.rate = 0.8
            utterance.pitch = 0.8
          } else if (lowerMsg.includes('great') || lowerMsg.includes('awesome') || lowerMsg.includes('happy') || lowerMsg.includes('congratulations')) {
            // Happy/Excited tone
            utterance.rate = 1.1
            utterance.pitch = 1.2
          } else {
            // Neutral
            utterance.rate = 1
            utterance.pitch = 1
          }

          utterance.volume = 1
          utterance.lang = 'en-US'
          window.speechSynthesis.cancel()
          window.speechSynthesis.speak(utterance)
        }
      } catch { }

      if (data.conversationId && !conversationId) {
        setConversationId(data.conversationId)
      }
      playSound('success')
    } catch (error) {
      playSound('error')
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const toggleRecording = () => {
    if (!speechSupported) {
      toast({ title: 'Voice not supported', description: 'Your browser does not support speech recognition.', variant: 'error' })
      return
    }
    const rec = recognitionRef.current
    if (!rec) return
    if (isRecording) {
      try { rec.stop() } catch { }
      setIsRecording(false)
      playSound('off')
    } else {
      try {
        setInputValue('')
        rec.start()
        setIsRecording(true)
        playSound('on')
      } catch { }
    }
  }

  const toggleTts = () => {
    setTtsEnabled(prev => {
      const next = !prev
      if (!next && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
      return next
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Global keyboard shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Alt+M to toggle microphone
      if (e.altKey && e.key === 'm') {
        e.preventDefault()
        toggleRecording()
      }
      // Alt+S to toggle TTS
      if (e.altKey && e.key === 's') {
        e.preventDefault()
        toggleTts()
      }
    }

    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [isRecording, speechSupported, ttsEnabled])

  // Shake to Speak
  useEffect(() => {
    let lastX = 0, lastY = 0, lastZ = 0
    let lastUpdate = 0
    const threshold = 15

    const handleMotion = (e: DeviceMotionEvent) => {
      const current = e.accelerationIncludingGravity
      if (!current) return

      const now = Date.now()
      if ((now - lastUpdate) > 100) {
        const diffTime = now - lastUpdate
        lastUpdate = now

        const x = current.x || 0
        const y = current.y || 0
        const z = current.z || 0

        const speed = Math.abs(x + y + z - lastX - lastY - lastZ) / diffTime * 10000

        if (speed > threshold) {
          toggleRecording()
          playSound('neutral')
          toast({ title: 'Shake detected', description: 'Toggling microphone...' })
        }

        lastX = x
        lastY = y
        lastZ = z
      }
    }

    if (typeof window !== 'undefined' && 'DeviceMotionEvent' in window) {
      window.addEventListener('devicemotion', handleMotion)
    }

    return () => {
      if (typeof window !== 'undefined' && 'DeviceMotionEvent' in window) {
        window.removeEventListener('devicemotion', handleMotion)
      }
    }
  }, [toggleRecording, playSound])

  // Flip to Silence (Privacy Mode)
  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      const beta = e.beta // Front/back tilt [-180, 180]

      // Check if face down (approximate)
      if (beta && (beta > 150 || beta < -150)) {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel()
            playSound('off')
            toast({ title: 'Privacy Mode', description: 'Speech silenced.' })
          }
        }
        if (isRecording) {
          setIsRecording(false)
          recognitionRef.current?.stop()
        }
      }
    }

    if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
      window.addEventListener('deviceorientation', handleOrientation)
    }

    return () => {
      if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
        window.removeEventListener('deviceorientation', handleOrientation)
      }
    }
  }, [isRecording, playSound])

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <h1 className="text-lg font-semibold text-gray-900">MindfulAI Chat</h1>
        <p className="text-sm text-gray-600">Your AI mental wellness companion</p>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowSonicMode(true)}
          className="ml-auto text-xs"
          aria-label="Enter Sonic Sanctuary Mode"
        >
          <Compass className="w-4 h-4 mr-1" />
          Sonic Mode
        </Button>
        {/* Screen Reader Instructions */}
        <div className="sr-only" role="note" aria-live="polite">
          Accessibility shortcuts: Press Alt plus M to toggle microphone. Press Alt plus S to toggle voice output.
        </div>
      </div>

      {/* Crisis Banner */}
      {showCrisisBanner && <CrisisBanner />}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <p className="text-lg mb-2">Welcome to MindfulAI</p>
            <p className="text-sm">I'm here to listen and provide emotional support. How are you feeling today?</p>
          </div>
        )}

        {messages.map((message, index) => (
          <MessageBubble key={index} message={message} />
        ))}

        {isLoading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Share what's on your mind..."
              disabled={isLoading}
              className="resize-none"
            />
          </div>
          {/* Voice input toggle */}
          <Button
            onClick={toggleRecording}
            disabled={!speechSupported || isLoading}
            size="icon"
            variant={isRecording ? 'destructive' : 'secondary'}
            className={isRecording ? 'animate-pulse-soft' : ''}
            aria-label={isRecording ? 'Stop recording' : 'Start recording'}
            title={isRecording ? 'Stop recording' : 'Start recording'}
          >
            {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
          </Button>
          {/* TTS toggle */}
          <Button
            onClick={toggleTts}
            disabled={isLoading}
            size="icon"
            variant="secondary"
            aria-label={ttsEnabled ? 'Mute voice' : 'Enable voice'}
            title={ttsEnabled ? 'Mute voice' : 'Enable voice'}
          >
            {ttsEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </Button>
          <Button
            onClick={sendMessage}
            disabled={!inputValue.trim() || isLoading}
            size="icon"
            className="bg-gradient-to-r from-calm-500 to-zen-500 hover:from-calm-600 hover:to-zen-600"
            aria-label="Send message"
          >
            <Send size={16} />
          </Button>
        </div>

        <p className="text-xs text-gray-500 mt-2 text-center">
          MindfulAI is not a replacement for professional therapy. In crisis? Call 988.
        </p>

        {/* Haptic Breathing (Always available at bottom) */}
        <HapticBreathing />
      </div>
      {
        showSonicMode && (
          <SonicSanctuary
            onClose={() => setShowSonicMode(false)}
            onNavigate={(dest) => {
              setShowSonicMode(false)
              playSound('success')

              // Map destinations to routes
              const routes: Record<string, string> = {
                'chat': '/chat',
                'music': '/music',
                'meditate': '/mood'
              }

              const route = routes[dest]
              if (route) {
                router.push(route)
                toast({ title: `Navigating to ${dest}...`, description: 'Please wait.' })
              }
            }}
          />
        )
      }
    </div>
  )
}

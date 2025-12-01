'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Send, Sparkles, Mic, MessageSquare, Music } from 'lucide-react'
import MessageBubble from '@/components/chat/message-bubble'
import VoiceMessageBubble from '@/components/chat/voice-message-bubble'
import TypingIndicator from '@/components/chat/typing-indicator'
import CrisisBanner from '@/components/chat/crisis-banner'
import VoiceRecorder from '@/components/chat/voice-recorder'
import MusicGeneratorInline from '@/components/chat/music-generator-inline'
import MusicGenerationTrigger from '@/components/chat/music-generation-trigger'
import { Button } from '@/components/ui/button'
import { useSoundEffects } from '@/hooks/use-sound-effects'
import SonicSanctuary from '@/components/accessibility/sonic-sanctuary'
import HapticBreathing from '@/components/accessibility/haptic-breathing'
import { Compass, Volume2, VolumeX } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Message {
  role: 'user' | 'assistant'
  content: string
  audioUrl?: string
  isVoice?: boolean
  duration?: number
}

export default function ChatPage() {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showCrisisBanner, setShowCrisisBanner] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [isVoiceMode, setIsVoiceMode] = useState(false)
  const [showMusicGenerator, setShowMusicGenerator] = useState(false)
  const [conversationContext, setConversationContext] = useState('')
  const [shouldSuggestMusic, setShouldSuggestMusic] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Accessibility State
  const { playSound } = useSoundEffects()
  const [showSonicMode, setShowSonicMode] = useState(false)
  const [ttsEnabled, setTtsEnabled] = useState(true)
  const router = useRouter()
  const recognitionRef = useRef<any>(null) // For Shake to Speak toggle

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
          setIsVoiceMode(prev => !prev)
          playSound('neutral')
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
  }, [playSound])

  // Flip to Silence
  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      const beta = e.beta
      if (beta && (beta > 150 || beta < -150)) {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel()
            playSound('off')
          }
        }
        setIsVoiceMode(false)
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
  }, [playSound])

  // Keyboard Shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'm') {
        e.preventDefault()
        setIsVoiceMode(prev => !prev)
        playSound('neutral')
      }
      if (e.altKey && e.key === 's') {
        e.preventDefault()
        setTtsEnabled(prev => !prev)
        playSound('neutral')
      }
    }

    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [playSound])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(scrollToBottom, [messages])

  const suggestedPrompts = [
    "I'm feeling overwhelmed today",
    "I need help managing anxiety",
    "Can we talk about my sleep issues?",
    "I want to set some personal goals"
  ]

  const handleSuggestion = (prompt: string) => {
    setInput(prompt)
    inputRef.current?.focus()
  }

  const analyzeSentimentForMusic = (userMessage: string) => {
    const musicTriggerKeywords = [
      'stressed', 'anxious', 'worried', 'sad', 'depressed', 'overwhelmed',
      'can\'t sleep', 'tired', 'exhausted', 'music', 'relax', 'calm down',
      'help me relax', 'need to unwind', 'meditation'
    ]

    const lowerMessage = userMessage.toLowerCase()
    const shouldSuggest = musicTriggerKeywords.some(keyword =>
      lowerMessage.includes(keyword)
    )

    if (shouldSuggest && messages.length > 2) {
      setShouldSuggestMusic(true)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = { role: 'user', content: input.trim(), isVoice: false }

    // Analyze if we should suggest music
    analyzeSentimentForMusic(input.trim())

    // Update conversation context
    setConversationContext(prev =>
      `${prev} User: ${input.trim()}`.slice(-500)
    )

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].slice(-10),
          conversationId,
        }),
      })

      if (!response.ok) throw new Error('Failed to get response')

      const data = await response.json()

      if (data.crisis) {
        setShowCrisisBanner(true)
      }

      if (data.conversationId && !conversationId) {
        setConversationId(data.conversationId)
      }

      // Update context with AI response
      setConversationContext(prev =>
        `${prev} Assistant: ${data.message}`.slice(-500)
      )

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.message,
        isVoice: false
      }])

      // Emotional Mirror TTS
      if (ttsEnabled && !isVoiceMode && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(data.message)
        const lowerMsg = data.message.toLowerCase()

        if (lowerMsg.includes('sorry') || lowerMsg.includes('sad') || lowerMsg.includes('difficult')) {
          utterance.rate = 0.8; utterance.pitch = 0.8
        } else if (lowerMsg.includes('great') || lowerMsg.includes('happy')) {
          utterance.rate = 1.1; utterance.pitch = 1.2
        }

        window.speechSynthesis.cancel()
        window.speechSynthesis.speak(utterance)
      }

      playSound('success')
    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again.',
        isVoice: false
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleVoiceMessage = async (audioBlob: Blob) => {
    setIsLoading(true)

    try {
      // Convert audio blob to base64
      const arrayBuffer = await audioBlob.arrayBuffer()
      const base64Audio = btoa(
        new Uint8Array(arrayBuffer).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ''
        )
      )

      // Send to voice conversation endpoint
      const response = await fetch('/api/voice/conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioBlob: base64Audio,
          messages: messages.slice(-10),
          conversationId,
        }),
      })

      if (!response.ok) throw new Error('Failed to process voice message')

      const data = await response.json()

      // Add user voice message
      setMessages(prev => [...prev, {
        role: 'user',
        content: data.userText,
        audioUrl: URL.createObjectURL(audioBlob),
        isVoice: true,
        duration: 0,
      }])

      // Add AI voice response
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.aiResponse,
        audioUrl: data.audioUrl,
        isVoice: true,
        duration: 0,
      }])

      // Auto-play AI response
      const audio = new Audio(data.audioUrl)
      audio.play()

    } catch (error) {
      console.error('Voice message error:', error)
      alert('Failed to process voice message. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-blue-50/30 to-purple-50/30">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-zen-500" />
              AI Companion
            </h1>
            <p className="text-sm text-gray-500">Your safe space to talk</p>
          </div>

          {/* Mode Toggle */}
          <div className="flex items-center gap-2">
            <Button
              variant={!isVoiceMode ? 'default' : 'outline'}
              size="sm"
              onClick={() => setIsVoiceMode(false)}
            >
              <MessageSquare size={16} className="mr-2" />
              Text
            </Button>
            <Button
              variant={isVoiceMode ? 'default' : 'outline'}
              size="sm"
              onClick={() => setIsVoiceMode(true)}
            >
              <Mic size={16} className="mr-2" />
              Voice
            </Button>
          </div>

          {/* Accessibility Controls */}
          <div className="flex items-center gap-2 ml-2 border-l pl-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTtsEnabled(!ttsEnabled)}
              title={ttsEnabled ? "Mute TTS" : "Enable TTS"}
            >
              {ttsEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSonicMode(true)}
              className="text-xs"
            >
              <Compass className="w-4 h-4 mr-1" />
              Sonic
            </Button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {showCrisisBanner && <CrisisBanner />}

          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-calm-500 to-zen-500 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-lg">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                How are you feeling today?
              </h2>
              <p className="text-gray-600 mb-8">
                I'm here to listen and support you through whatever you're experiencing.
              </p>

              {!isVoiceMode && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                  {suggestedPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestion(prompt)}
                      className="p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-calm-300 hover:shadow-md transition-all text-left text-sm text-gray-700 hover:text-calm-600"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {messages.map((msg, idx) => (
            msg.isVoice ? (
              <VoiceMessageBubble
                key={idx}
                audioUrl={msg.audioUrl!}
                role={msg.role}
                transcript={msg.content}
                duration={msg.duration}
              />
            ) : (
              <MessageBubble key={idx} message={msg} />
            )
          ))}

          {/* Smart Music Generation Suggestion */}
          {shouldSuggestMusic && !showMusicGenerator && messages.length > 3 && (
            <div className="flex justify-center animate-fade-in">
              <MusicGenerationTrigger
                onTrigger={() => {
                  setShowMusicGenerator(true)
                  setShouldSuggestMusic(false)
                }}
              />
            </div>
          )}

          {/* Music Generator */}
          {showMusicGenerator && (
            <MusicGeneratorInline
              conversationContext={conversationContext}
              onMusicGenerated={(audioUrl) => {
                // Add generated music to messages as a special message type
                setMessages(prev => [...prev, {
                  role: 'assistant',
                  content: '🎵 I\'ve created personalized therapy music for you based on our conversation. Take a moment to listen and let it help you feel better.',
                  isVoice: false,
                }])
              }}
            />
          )}

          {isLoading && <TypingIndicator />}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t px-4 md:px-6 py-4 flex-shrink-0">
        <div className="max-w-4xl mx-auto">
          {isVoiceMode ? (
            <VoiceRecorder
              onSendVoice={handleVoiceMessage}
              isProcessing={isLoading}
            />
          ) : (
            <form onSubmit={sendMessage}>
              <div className="flex gap-2 items-end">
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..."
                    className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-gray-200 focus:border-calm-400 focus:outline-none transition-colors resize-none"
                    disabled={isLoading}
                    maxLength={500}
                  />
                  <span className="absolute right-3 bottom-3 text-xs text-gray-400">
                    {input.length}/500
                  </span>
                </div>
                <Button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  size="lg"
                  className="px-6 rounded-xl"
                >
                  <Send size={18} />
                </Button>
              </div>
            </form>
          )}

          <p className="text-xs text-gray-500 mt-2 text-center">
            EchoWell is not a replacement for professional therapy. In crisis, call 988.
          </p>
        </div>
      </div>

      {/* Floating Music Generation Button */}
      {!showMusicGenerator && messages.length > 0 && (
        <button
          onClick={() => setShowMusicGenerator(true)}
          className="fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center z-40 animate-bounce"
          title="Generate Therapy Music"
        >
          <Music size={24} />
        </button>
      )}
      {/* Haptic Breathing */}
      <div className="fixed bottom-4 left-4 z-40">
        <HapticBreathing />
      </div>

      {/* Sonic Sanctuary Modal */}
      {showSonicMode && (
        <SonicSanctuary
          onClose={() => setShowSonicMode(false)}
          onNavigate={(dest) => {
            setShowSonicMode(false)
            playSound('success')
            // Navigation logic
            if (dest === 'music') setShowMusicGenerator(true)
            // For other destinations, we might route or scroll
          }}
        />
      )}
    </div>
  )
}
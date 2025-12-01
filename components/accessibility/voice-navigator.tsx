'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Mic, MicOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { useSoundEffects } from '@/hooks/use-sound-effects'

export default function VoiceNavigator() {
    const [isListening, setIsListening] = useState(false)
    const [isSupported, setIsSupported] = useState(false)
    const recognitionRef = useRef<any>(null)
    const router = useRouter()
    const { toast } = useToast()
    const { playSound } = useSoundEffects()

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognitionImpl = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
            if (SpeechRecognitionImpl) {
                setIsSupported(true)
                const recognition = new SpeechRecognitionImpl()
                recognition.lang = 'en-US'
                recognition.continuous = false
                recognition.interimResults = false

                recognition.onresult = (event: any) => {
                    const command = event.results[0][0].transcript.toLowerCase()
                    handleCommand(command)
                    setIsListening(false)
                }

                recognition.onerror = (event: any) => {
                    console.error('Voice navigation error:', event.error)
                    setIsListening(false)
                    playSound('error')
                }

                recognition.onend = () => {
                    setIsListening(false)
                }

                recognitionRef.current = recognition
            }
        }
    }, [])

    const speak = (text: string) => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel()
            const utterance = new SpeechSynthesisUtterance(text)
            window.speechSynthesis.speak(utterance)
        }
    }

    const handleCommand = (command: string) => {
        console.log('Voice command:', command)

        if (command.includes('chat') || command.includes('talk')) {
            speak('Navigating to Chat')
            router.push('/chat')
        } else if (command.includes('music') || command.includes('listen')) {
            speak('Navigating to Music')
            router.push('/music')
        } else if (command.includes('mood') || command.includes('feeling') || command.includes('log')) {
            speak('Navigating to Mood Log')
            router.push('/mood')
        } else if (command.includes('home') || command.includes('dashboard')) {
            speak('Navigating to Home')
            router.push('/dashboard')
        } else if (command.includes('summary') || command.includes('read')) {
            speak('Navigating to Daily Summary')
            router.push('/dashboard?view=summary')
        } else {
            speak("I didn't understand that command. Try saying Go to Chat or Go to Music.")
            playSound('error')
            return
        }

        playSound('success')
    }

    const toggleListening = () => {
        if (!isSupported) {
            toast({ title: 'Not Supported', description: 'Voice navigation is not supported in this browser.', variant: 'error' })
            return
        }

        if (isListening) {
            recognitionRef.current?.stop()
            playSound('off')
        } else {
            try {
                recognitionRef.current?.start()
                playSound('on')
                speak('Listening')
                toast({ title: 'Listening...', description: 'Say a command like "Go to Chat"' })
            } catch (e) {
                console.error(e)
            }
        }
        setIsListening(!isListening)
    }

    // Global hotkey listener
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.altKey && e.key === 'v') {
                e.preventDefault()
                toggleListening()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isListening, isSupported])

    if (!isSupported) return null

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <Button
                onClick={toggleListening}
                size="lg"
                className={`rounded-full shadow-lg ${isListening ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                aria-label={isListening ? "Stop Voice Navigation" : "Start Voice Navigation (Alt + V)"}
            >
                {isListening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
            </Button>
        </div>
    )
}

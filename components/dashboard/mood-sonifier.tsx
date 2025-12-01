'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Play, Square, Music } from 'lucide-react'

interface MoodLog {
    mood_score: number
    logged_at: string
}

interface MoodSonifierProps {
    logs: MoodLog[]
}

export default function MoodSonifier({ logs }: MoodSonifierProps) {
    const [isPlaying, setIsPlaying] = useState(false)
    const audioContextRef = useRef<AudioContext | null>(null)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    const playNote = (frequency: number, duration: number, time: number) => {
        if (!audioContextRef.current) return

        const ctx = audioContextRef.current
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.type = 'sine'
        osc.frequency.setValueAtTime(frequency, time)

        gain.gain.setValueAtTime(0.1, time)
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(time)
        osc.stop(time + duration)
    }

    const startSonification = async () => {
        if (logs.length === 0) return

        // Initialize AudioContext on user interaction
        if (!audioContextRef.current) {
            const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext
            audioContextRef.current = new AudioContextClass()
        }

        const ctx = audioContextRef.current
        if (ctx?.state === 'suspended') {
            await ctx.resume()
        }

        setIsPlaying(true)

        // Sort logs by date (oldest first)
        const sortedLogs = [...logs].sort((a, b) =>
            new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime()
        )

        const now = ctx!.currentTime
        const step = 0.3 // Time between notes in seconds

        sortedLogs.forEach((log, index) => {
            // Map mood score (1-10) to frequency (C4 to C6 scale approx)
            // 1 = 261.63 (C4), 10 = 1046.50 (C6)
            const baseFreq = 261.63
            const frequency = baseFreq * Math.pow(2, (log.mood_score - 1) / 4.5) // Scale mapping

            playNote(frequency, 0.5, now + (index * step))
        })

        // Auto stop after playback
        const totalDuration = sortedLogs.length * step * 1000
        timeoutRef.current = setTimeout(() => {
            setIsPlaying(false)
        }, totalDuration)
    }

    const stopSonification = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
        }
        setIsPlaying(false)
    }

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Music className="w-5 h-5 text-purple-500" />
                        Listen to your Mood
                    </h3>
                    <p className="text-sm text-gray-500">
                        Hear your emotional journey over time. Higher pitch means better mood.
                    </p>
                </div>
                <Button
                    onClick={isPlaying ? stopSonification : startSonification}
                    variant={isPlaying ? "destructive" : "default"}
                    size="sm"
                    className="min-w-[100px]"
                    aria-label={isPlaying ? "Stop listening" : "Start listening to mood history"}
                >
                    {isPlaying ? (
                        <>
                            <Square className="w-4 h-4 mr-2" /> Stop
                        </>
                    ) : (
                        <>
                            <Play className="w-4 h-4 mr-2" /> Listen
                        </>
                    )}
                </Button>
            </div>
        </div>
    )
}

'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Wind, Play, Square } from 'lucide-react'

export default function HapticBreathing() {
    const [isActive, setIsActive] = useState(false)
    const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale' | 'idle'>('idle')

    const vibrate = useCallback((pattern: number | number[]) => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(pattern)
        }
    }, [])

    useEffect(() => {
        if (!isActive) {
            setPhase('idle')
            return
        }


        let isMounted = true

        const cycle = async () => {
            if (!isMounted || !isActive) return

            // Inhale (4s) - Rising vibration pattern
            setPhase('inhale')
            // Pulse faster and faster to simulate filling up
            vibrate([100, 100, 100, 100, 200, 100, 300])

            await new Promise(r => setTimeout(r, 4000))
            if (!isMounted || !isActive) return

            // Hold (4s) - Steady vibration
            setPhase('hold')
            vibrate([500, 500, 500, 500]) // Long steady pulses

            await new Promise(r => setTimeout(r, 4000))
            if (!isMounted || !isActive) return

            // Exhale (4s) - Falling vibration pattern
            setPhase('exhale')
            vibrate([300, 100, 200, 100, 100, 100])

            await new Promise(r => setTimeout(r, 4000))
            if (!isMounted || !isActive) return

            // Loop
            cycle()
        }

        cycle()

        return () => {
            isMounted = false

            vibrate(0)
        }
    }, [isActive, vibrate])

    return (
        <div className="p-4 border rounded-lg bg-white shadow-sm mt-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2 text-gray-900">
                    <Wind className="w-5 h-5" />
                    Haptic Breathing
                </h3>
                <Button
                    variant={isActive ? "destructive" : "outline"}
                    size="sm"
                    onClick={() => setIsActive(!isActive)}
                    aria-label={isActive ? "Stop breathing exercise" : "Start breathing exercise"}
                >
                    {isActive ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
            </div>

            <div className="text-center py-6 bg-gray-50 rounded-md" aria-live="polite">
                <div className={`text-2xl font-bold transition-all duration-500 ${phase === 'inhale' ? 'text-blue-500 scale-110' :
                    phase === 'hold' ? 'text-purple-500 scale-100' :
                        phase === 'exhale' ? 'text-green-500 scale-90' : 'text-gray-400'
                    }`}>
                    {phase === 'idle' ? 'Press Play' : phase.toUpperCase()}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                    {isActive ? 'Hold device to chest to feel the rhythm.' : 'Vibration-guided breathing.'}
                </p>
            </div>
        </div>
    )
}

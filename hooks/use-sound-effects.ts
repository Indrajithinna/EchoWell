'use client'

import { useCallback, useRef, useEffect } from 'react'

type SoundType = 'success' | 'error' | 'neutral' | 'on' | 'off' | 'nav-left' | 'nav-right' | 'nav-center' | 'navigate' | 'focus' | 'click' | 'toggle_on' | 'toggle_off' | 'notification'

export function useSoundEffects() {
    const audioContextRef = useRef<AudioContext | null>(null)

    useEffect(() => {
        const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext
        if (AudioContextClass) {
            audioContextRef.current = new AudioContextClass()
        }
    }, [])

    const triggerHaptic = (pattern: number | number[]) => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(pattern)
        }
    }

    const playSound = useCallback((type: SoundType) => {
        if (!audioContextRef.current) return

        const ctx = audioContextRef.current
        if (ctx.state === 'suspended') {
            ctx.resume()
        }

        const oscillator = ctx.createOscillator()
        const gainNode = ctx.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(ctx.destination)

        const now = ctx.currentTime

        switch (type) {
            case 'success':
                // Haptic: Short double pulse
                triggerHaptic([50, 50, 50])

                // Audio: Ascending chime
                oscillator.type = 'sine'
                oscillator.frequency.setValueAtTime(500, now)
                oscillator.frequency.exponentialRampToValueAtTime(1000, now + 0.1)
                gainNode.gain.setValueAtTime(0.1, now)
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1)
                oscillator.start(now)
                oscillator.stop(now + 0.1)
                break

            case 'error':
                // Haptic: Long buzz
                triggerHaptic(300)

                // Audio: Descending buzz
                oscillator.type = 'sawtooth'
                oscillator.frequency.setValueAtTime(200, now)
                oscillator.frequency.linearRampToValueAtTime(100, now + 0.2)
                gainNode.gain.setValueAtTime(0.1, now)
                gainNode.gain.linearRampToValueAtTime(0.01, now + 0.2)
                oscillator.start(now)
                oscillator.stop(now + 0.2)
                break

            case 'neutral':
                // Haptic: Light tap
                triggerHaptic(20)

                // Audio: Blip
                oscillator.type = 'sine'
                oscillator.frequency.setValueAtTime(440, now)
                gainNode.gain.setValueAtTime(0.05, now)
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1)
                oscillator.start(now)
                oscillator.stop(now + 0.1)
                break

            case 'on':
                // Haptic: Rising pulse
                triggerHaptic([30, 30, 60])

                // Audio: Rising two-tone
                oscillator.type = 'sine'
                oscillator.frequency.setValueAtTime(400, now)
                oscillator.frequency.setValueAtTime(600, now + 0.1)
                gainNode.gain.setValueAtTime(0.05, now)
                gainNode.gain.setValueAtTime(0.05, now + 0.1)
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2)
                oscillator.start(now)
                oscillator.stop(now + 0.2)
                break

            case 'off':
                // Haptic: Falling pulse
                triggerHaptic([60, 30, 30])

                // Audio: Falling two-tone
                oscillator.type = 'sine'
                oscillator.frequency.setValueAtTime(600, now)
                oscillator.frequency.setValueAtTime(400, now + 0.1)
                gainNode.gain.setValueAtTime(0.05, now)
                gainNode.gain.setValueAtTime(0.05, now + 0.1)
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2)
                oscillator.start(now)
                oscillator.stop(now + 0.2)
                break

            case 'nav-left':
                oscillator.type = 'triangle'
                oscillator.frequency.setValueAtTime(300, now)
                gainNode.gain.setValueAtTime(0.05, now)
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3)
                oscillator.start(now)
                oscillator.stop(now + 0.3)
                break

            case 'nav-right':
                oscillator.type = 'triangle'
                oscillator.frequency.setValueAtTime(600, now)
                gainNode.gain.setValueAtTime(0.05, now)
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3)
                oscillator.start(now)
                oscillator.stop(now + 0.3)
                break

            case 'nav-center':
                oscillator.type = 'sine'
                oscillator.frequency.setValueAtTime(800, now)
                gainNode.gain.setValueAtTime(0.05, now)
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1)
                oscillator.start(now)
                oscillator.stop(now + 0.1)
                break

            case 'navigate':
                // Audio: Soft swipe sound
                oscillator.type = 'sine'
                oscillator.frequency.setValueAtTime(300, now)
                oscillator.frequency.linearRampToValueAtTime(600, now + 0.15)
                gainNode.gain.setValueAtTime(0.05, now)
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15)
                oscillator.start(now)
                oscillator.stop(now + 0.15)
                break

            case 'focus':
                // Soft pop
                oscillator.type = 'sine'
                oscillator.frequency.setValueAtTime(300, now)
                gainNode.gain.setValueAtTime(0.02, now)
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05)
                oscillator.start(now)
                oscillator.stop(now + 0.05)
                break

            case 'click':
                // Sharp click
                oscillator.type = 'square'
                oscillator.frequency.setValueAtTime(800, now)
                gainNode.gain.setValueAtTime(0.02, now)
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.03)
                oscillator.start(now)
                oscillator.stop(now + 0.03)
                break

            case 'toggle_on':
                // Rising pitch
                oscillator.type = 'sine'
                oscillator.frequency.setValueAtTime(400, now)
                oscillator.frequency.linearRampToValueAtTime(600, now + 0.1)
                gainNode.gain.setValueAtTime(0.05, now)
                gainNode.gain.linearRampToValueAtTime(0.0, now + 0.1)
                oscillator.start(now)
                oscillator.stop(now + 0.1)
                break

            case 'toggle_off':
                // Falling pitch
                oscillator.type = 'sine'
                oscillator.frequency.setValueAtTime(600, now)
                oscillator.frequency.linearRampToValueAtTime(400, now + 0.1)
                gainNode.gain.setValueAtTime(0.05, now)
                gainNode.gain.linearRampToValueAtTime(0.0, now + 0.1)
                oscillator.start(now)
                oscillator.stop(now + 0.1)
                break

            case 'notification':
                // Bell-like
                oscillator.type = 'triangle'
                oscillator.frequency.setValueAtTime(880, now) // A5
                gainNode.gain.setValueAtTime(0.1, now)
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.5)
                oscillator.start(now)
                oscillator.stop(now + 0.5)
                break
        }
    }, [])

    return { playSound }
}

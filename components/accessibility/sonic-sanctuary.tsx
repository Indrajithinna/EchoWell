'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Compass, Headphones, X } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface SonicSanctuaryProps {
    onClose: () => void
    onNavigate: (destination: string) => void
}

export default function SonicSanctuary({ onClose, onNavigate }: SonicSanctuaryProps) {
    const [permissionGranted, setPermissionGranted] = useState(false)
    const [heading, setHeading] = useState(0) // 0-360 degrees
    const audioContextRef = useRef<AudioContext | null>(null)
    const sourcesRef = useRef<any[]>([])
    const { toast } = useToast()

    // Destinations at specific angles (degrees)
    const destinations = [
        { id: 'chat', name: 'Chat Companion', angle: 0, color: 'bg-blue-500' },      // North
        { id: 'music', name: 'Music Therapy', angle: 90, color: 'bg-purple-500' },   // East
        { id: 'meditate', name: 'Meditation', angle: 270, color: 'bg-green-500' }    // West
    ]

    const initAudio = () => {
        if (audioContextRef.current) return

        const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext
        const ctx = new AudioContextClass()
        audioContextRef.current = ctx

        // Create 3D sound sources
        destinations.forEach(dest => {
            const oscillator = ctx.createOscillator()
            const panner = ctx.createPanner()
            const gain = ctx.createGain()

            // Configure sound based on destination
            if (dest.id === 'chat') {
                oscillator.type = 'sine' // Gentle pulse
                oscillator.frequency.setValueAtTime(440, ctx.currentTime)
            } else if (dest.id === 'music') {
                oscillator.type = 'triangle' // Musical drone
                oscillator.frequency.setValueAtTime(330, ctx.currentTime)
            } else {
                oscillator.type = 'sine' // Low meditation hum
                oscillator.frequency.setValueAtTime(110, ctx.currentTime)
            }

            // Position the sound in 3D space
            // Convert angle to radians for X/Z coordinates
            // 0 deg = North (Forward) = Z: 1, X: 0
            const rad = (dest.angle - 90) * (Math.PI / 180)
            const x = Math.cos(rad)
            const z = Math.sin(rad)

            panner.panningModel = 'HRTF'
            panner.positionX.setValueAtTime(x, ctx.currentTime)
            panner.positionZ.setValueAtTime(z, ctx.currentTime)

            gain.gain.value = 0.1

            oscillator.connect(panner)
            panner.connect(gain)
            gain.connect(ctx.destination)
            oscillator.start()

            sourcesRef.current.push({ panner, gain, oscillator, id: dest.id })
        })
    }

    const handleOrientation = (event: DeviceOrientationEvent) => {
        // alpha is the compass direction (0-360)
        if (event.alpha !== null) {
            setHeading(event.alpha)
            updateAudioListener(event.alpha)
        }
    }

    const updateAudioListener = (angle: number) => {
        if (!audioContextRef.current) return
        const ctx = audioContextRef.current

        // Update listener orientation
        // This effectively rotates the "head" of the user in the 3D audio space
        const rad = (angle - 90) * (Math.PI / 180)
        const x = Math.cos(rad)
        const z = Math.sin(rad)

        // Web Audio API listener orientation is complex, simplified here:
        // We actually just want to know how close we are to each source
        // But for true 3D, we rotate the listener
        const listener = ctx.listener
        if (listener.forwardX) {
            listener.forwardX.setValueAtTime(x, ctx.currentTime)
            listener.forwardZ.setValueAtTime(z, ctx.currentTime)
        }
    }

    const requestAccess = async () => {
        try {
            // iOS 13+ requires permission
            if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
                const response = await (DeviceOrientationEvent as any).requestPermission()
                if (response === 'granted') {
                    setPermissionGranted(true)
                    window.addEventListener('deviceorientation', handleOrientation)
                    initAudio()
                }
            } else {
                // Non-iOS or older devices
                setPermissionGranted(true)
                window.addEventListener('deviceorientation', handleOrientation)
                initAudio()
            }
        } catch (e) {
            toast({ title: 'Error', description: 'Could not access device orientation.', variant: 'error' })
        }
    }

    // Calculate closest destination
    const getClosestDestination = () => {
        // Simple distance check on the circle
        return destinations.reduce((prev, curr) => {
            const prevDiff = Math.abs(prev.angle - heading)
            const currDiff = Math.abs(curr.angle - heading)
            // Handle wrap around 360/0
            const prevDiffWrap = 360 - prevDiff
            const currDiffWrap = 360 - currDiff

            const minPrev = Math.min(prevDiff, prevDiffWrap)
            const minCurr = Math.min(currDiff, currDiffWrap)

            return minCurr < minPrev ? curr : prev
        })
    }

    const closest = getClosestDestination()
    const isAligned = Math.abs(closest.angle - heading) < 20 || Math.abs(closest.angle - heading) > 340

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') {
                setHeading(prev => {
                    const next = (prev - 10 + 360) % 360
                    updateAudioListener(next)
                    return next
                })
            } else if (e.key === 'ArrowRight') {
                setHeading(prev => {
                    const next = (prev + 10) % 360
                    updateAudioListener(next)
                    return next
                })
            } else if (e.key === 'Enter' && isAligned) {
                onNavigate(closest.id)
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isAligned, closest])

    // Cleanup
    useEffect(() => {
        return () => {
            window.removeEventListener('deviceorientation', handleOrientation)
            if (audioContextRef.current) {
                audioContextRef.current.close()
            }
        }
    }, [])

    return (
        <div className="fixed inset-0 z-50 bg-black text-white flex flex-col items-center justify-center p-4">
            <Button
                variant="ghost"
                className="absolute top-4 right-4 text-white"
                onClick={onClose}
            >
                <X size={24} />
            </Button>

            {!permissionGranted ? (
                <div className="text-center space-y-6">
                    <Headphones size={64} className="mx-auto text-blue-400 animate-pulse" />
                    <h2 className="text-2xl font-bold">Enter Sonic Sanctuary</h2>
                    <p className="max-w-md text-gray-300">
                        Navigate EchoWell using 3D sound. Put on headphones, stand up, and physically turn to find your destination.
                        Or use the Left and Right arrow keys to rotate.
                    </p>
                    <Button
                        onClick={requestAccess}
                        size="lg"
                        className="bg-white text-black hover:bg-gray-200"
                        autoFocus
                    >
                        Start Experience
                    </Button>
                </div>
            ) : (
                <div className="text-center space-y-8 w-full max-w-md">
                    <div className="relative w-64 h-64 mx-auto rounded-full border-4 border-gray-800 flex items-center justify-center">
                        {/* Compass Needle Visual */}
                        <div
                            className="absolute w-full h-1 bg-red-500 transition-transform duration-100"
                            style={{ transform: `rotate(${heading}deg)` }}
                        />

                        {/* Destination Markers */}
                        {destinations.map(dest => (
                            <div
                                key={dest.id}
                                className={`absolute w-4 h-4 rounded-full ${dest.color}`}
                                style={{
                                    transform: `rotate(${dest.angle}deg) translateX(120px) rotate(-${dest.angle}deg)`
                                }}
                            />
                        ))}

                        <div className="text-4xl font-mono">{Math.round(heading)}°</div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-xl text-gray-400">Facing:</h3>
                        <div className={`text-3xl font-bold transition-all duration-300 ${isAligned ? 'text-white scale-110' : 'text-gray-600'}`}>
                            {closest.name}
                        </div>

                        <p className="text-sm text-gray-500">
                            {isAligned ? 'Tilt phone forward to enter' : 'Turn to align with a destination'}
                        </p>

                        {/* Manual Slider for Desktop Testing */}
                        <div className="pt-8">
                            <label className="text-xs text-gray-500">Desktop Simulation Slider</label>
                            <input
                                type="range"
                                min="0"
                                max="360"
                                value={heading}
                                onChange={(e) => {
                                    const val = Number(e.target.value)
                                    setHeading(val)
                                    updateAudioListener(val)
                                }}
                                className="w-full"
                            />
                        </div>

                        <Button
                            className={`w-full py-8 text-xl ${isAligned ? closest.color : 'bg-gray-800'}`}
                            disabled={!isAligned}
                            onClick={() => onNavigate(closest.id)}
                        >
                            Enter {closest.name}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}

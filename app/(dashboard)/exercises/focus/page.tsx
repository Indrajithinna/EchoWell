"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, RotateCcw, Volume2, ChevronLeft, Headphones } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function FocusTimerPage() {
    const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutes
    const [isActive, setIsActive] = useState(false)
    const [mode, setMode] = useState<"focus" | "break">("focus")

    // Audio toggles (visual only for MVP, implementation would hook into HTMLAudioElement)
    const [sounds, setSounds] = useState([
        { id: "rain", name: "Heavy Rain", active: false, volume: 50 },
        { id: "forest", name: "Forest Birds", active: false, volume: 40 },
        { id: "white", name: "White Noise", active: false, volume: 30 },
    ])

    useEffect(() => {
        let interval: NodeJS.Timeout

        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1)
            }, 1000)
        } else if (timeLeft === 0) {
            setIsActive(false)
            // Switch mode automatically
            if (mode === "focus") {
                setMode("break")
                setTimeLeft(5 * 60)
            } else {
                setMode("focus")
                setTimeLeft(25 * 60)
            }
        }

        return () => clearInterval(interval)
    }, [isActive, timeLeft, mode])

    const toggleTimer = () => setIsActive(!isActive)

    const resetTimer = () => {
        setIsActive(false)
        setTimeLeft(mode === "focus" ? 25 * 60 : 5 * 60)
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }

    const toggleSound = (id: string) => {
        setSounds(sounds.map(s => s.id === id ? { ...s, active: !s.active } : s))
    }

    return (
        <div className="min-h-screen p-8 flex flex-col items-center">
            <div className="w-full max-w-4xl self-start mb-8">
                <Button variant="ghost" asChild className="pl-0 hover:bg-transparent hover:text-white">
                    <Link href="/exercises" className="flex items-center gap-2 text-slate-400">
                        <ChevronLeft className="h-4 w-4" /> Back to Studio
                    </Link>
                </Button>
            </div>

            <div className="w-full max-w-md space-y-8">
                {/* Timer Card */}
                <Card className="flex flex-col items-center justify-center p-12 border-slate-800 bg-slate-900/50 backdrop-blur">
                    <Badge variant="outline" className={cn("mb-6 px-4 py-1", mode === "focus" ? "text-purple-400 border-purple-400/30" : "text-green-400 border-green-400/30")}>
                        {mode === "focus" ? "Focus Session" : "Short Break"}
                    </Badge>

                    <div className="font-mono text-8xl font-bold tracking-tighter text-white tabular-nums">
                        {formatTime(timeLeft)}
                    </div>

                    <div className="mt-8 flex gap-4">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-14 w-14 rounded-full border-slate-700 hover:bg-slate-800"
                            onClick={resetTimer}
                        >
                            <RotateCcw className="h-5 w-5" />
                        </Button>

                        <Button
                            size="icon"
                            className={cn("h-14 w-14 rounded-full shadow-lg hover:scale-105 transition-transform", isActive ? "bg-red-500 hover:bg-red-600" : "bg-purple-600 hover:bg-purple-700")}
                            onClick={toggleTimer}
                        >
                            {isActive ? <Pause className="h-6 w-6 fill-current" /> : <Play className="h-6 w-6 fill-current ml-1" />}
                        </Button>
                    </div>
                </Card>

                {/* Soundscapes */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-slate-300 flex items-center gap-2">
                        <Headphones className="h-4 w-4" /> Ambient Sounds
                    </h3>

                    <div className="grid gap-3">
                        {sounds.map((sound) => (
                            <div key={sound.id} className="flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-900/40 p-3 transition-colors hover:bg-slate-900/60">
                                <Button
                                    size="icon"
                                    variant={sound.active ? "default" : "secondary"}
                                    className={cn("h-10 w-10 shrink-0 rounded-full", sound.active ? "bg-purple-600 hover:bg-purple-700" : "bg-slate-800 text-slate-400")}
                                    onClick={() => toggleSound(sound.id)}
                                >
                                    <Volume2 className="h-4 w-4" />
                                </Button>

                                <div className="flex-1">
                                    <div className="mb-2 flex items-center justify-between">
                                        <span className="text-sm font-medium">{sound.name}</span>
                                        <span className="text-xs text-slate-500">{sound.volume}%</span>
                                    </div>
                                    <Slider
                                        value={[sound.volume]}
                                        max={100}
                                        step={1}
                                        className="h-1.5"
                                        disabled={!sound.active}
                                        onValueChange={(val) => setSounds(sounds.map(s => s.id === sound.id ? { ...s, volume: val[0] } : s))}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

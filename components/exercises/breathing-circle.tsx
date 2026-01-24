"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Play, Pause, RefreshCw, Wind } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface BreathingCircleProps {
  onComplete?: () => void
}

export function BreathingCircle({ onComplete }: BreathingCircleProps) {
  const [isActive, setIsActive] = useState(false)
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale">("inhale")
  const [timeLeft, setTimeLeft] = useState(60) // 1 minute session
  const [instruction, setInstruction] = useState("Ready?")

  // 4-7-8 Technique: Inhale 4s, Hold 7s, Exhale 8s
  useEffect(() => {
    let interval: NodeJS.Timeout
    let phaseTimeout: NodeJS.Timeout

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)

      const runCycle = () => {
        setPhase("inhale")
        setInstruction("Inhale...")
        
        phaseTimeout = setTimeout(() => {
          setPhase("hold")
          setInstruction("Hold...")
          
          phaseTimeout = setTimeout(() => {
            setPhase("exhale")
            setInstruction("Exhale...")
            
            phaseTimeout = setTimeout(() => {
              // Loop handled by useEffect re-trigger or separate recursion if cleaner
              // But strictly mapping directly here for simplicity
              runCycle() 
            }, 8000) // Exhale 8s
          }, 7000) // Hold 7s
        }, 4000) // Inhale 4s
      }

      // Start the first cycle
      if (timeLeft === 60) runCycle()
    } else if (timeLeft === 0) {
      setIsActive(false)
      setInstruction("Session Complete")
      if (onComplete) onComplete()
    }

    return () => {
      clearInterval(interval)
      clearTimeout(phaseTimeout)
    }
  }, [isActive, timeLeft, onComplete])

  const toggleSession = () => {
    setIsActive(!isActive)
    if (!isActive && timeLeft < 60 && timeLeft > 0) {
      // Resume logic simplified, would need precise state tracking for perfect resume
      // For now, let's just resume timer, visuals might be slightly out of sync on immediate resume 
      // which is acceptable for MVP or we reset cycle.
    }
  }

  const resetSession = () => {
    setIsActive(false)
    setTimeLeft(60)
    setPhase("inhale")
    setInstruction("Ready?")
  }

  const variants = {
    inhale: { scale: 1.5, opacity: 1, filter: "brightness(1.2)" },
    hold: { scale: 1.5, opacity: 0.9, rotate: 10 },
    exhale: { scale: 1, opacity: 0.6, rotate: 0 },
  }

  const transition = {
    inhale: { duration: 4, ease: "easeInOut" },
    hold: { duration: 7, ease: "linear" }, // minimal movement
    exhale: { duration: 8, ease: "easeInOut" },
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-12 p-8">
      <div className="relative flex items-center justify-center">
        {/* Outer Glow Ring */}
        <motion.div
          animate={isActive ? phase : "exhale"}
          variants={variants}
          transition={isActive ? transition[phase] : { duration: 0.5 }}
          className={cn(
            "absolute h-64 w-64 rounded-full blur-3xl",
            phase === "inhale" && "bg-blue-400/30",
            phase === "hold" && "bg-purple-400/30",
            phase === "exhale" && "bg-emerald-400/30",
            !isActive && "bg-gray-400/10"
          )}
        />

        {/* Main Breathing Circle */}
        <motion.div
          animate={isActive ? phase : "exhale"}
          variants={variants}
          transition={isActive ? transition[phase] : { duration: 0.5 }}
          className={cn(
            "flex h-48 w-48 items-center justify-center rounded-full border-4 shadow-2xl backdrop-blur-sm",
            phase === "inhale" && "border-blue-500 bg-blue-500/10 text-blue-500",
            phase === "hold" && "border-purple-500 bg-purple-500/10 text-purple-500",
            phase === "exhale" && "border-emerald-500 bg-emerald-500/10 text-emerald-500",
            !isActive && "border-slate-700 bg-slate-800/50 text-slate-400"
          )}
        >
          <div className="text-center">
            <span className="text-sm font-medium uppercase tracking-widest opacity-70">
              {isActive ? phase : "Relax"}
            </span>
          </div>
        </motion.div>

        {/* Text Instruction Overlay */}
        <div className="absolute -bottom-20 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white transition-all duration-500">
            {instruction}
          </h2>
          <p className="mt-2 text-slate-400">
            {isActive ? `${timeLeft}s remaining` : "4-7-8 Breathing Technique"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6 mt-12">
        <Button
          onClick={resetSession}
          variant="outline"
          size="icon"
          className="h-12 w-12 rounded-full border-slate-700 hover:bg-slate-800"
        >
          <RefreshCw className="h-5 w-5" />
        </Button>

        <Button
          onClick={toggleSession}
          size="lg"
          className={cn(
            "h-16 w-16 rounded-full shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95",
            isActive ? "bg-red-500 hover:bg-red-600" : "bg-primary hover:bg-primary/90"
          )}
        >
          {isActive ? (
            <Pause className="h-6 w-6 fill-current" />
          ) : (
            <Play className="h-6 w-6 fill-current ml-1" />
          )}
        </Button>

        <div className="w-12" /> {/* Spacer for balance */}
      </div>
    </div>
  )
}

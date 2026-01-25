"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle, Phone, CheckCircle, Hand, Eye, Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export default function SOSPage() {
    const [step, setStep] = useState(0)

    // 5-4-3-2-1 Grounding Technique
    const steps = [
        {
            count: 5,
            title: "Look Around",
            instruction: "Find 5 things you can see.",
            icon: Eye,
            color: "text-blue-500",
            items: ["", "", "", "", ""]
        },
        {
            count: 4,
            title: "Touch",
            instruction: "Find 4 things you can physically feel.",
            icon: Hand,
            color: "text-emerald-500",
            items: ["", "", "", ""]
        },
        {
            count: 3,
            title: "Listen",
            instruction: "Listen for 3 distinct sounds.",
            icon: Volume2,
            color: "text-purple-500",
            items: ["", "", ""]
        },
        {
            count: 2,
            title: "Smell",
            instruction: "Identify 2 things you can smell.",
            icon: Wind,
            color: "text-orange-500",
            items: ["", ""]
        },
        {
            count: 1,
            title: "Taste",
            instruction: "Name 1 thing you can taste.",
            icon: CheckCircle,
            color: "text-pink-500",
            items: [""]
        }
    ]

    // Helper for icon component in array
    function Wind(props: any) { return <span {...props}>👃</span> } // Temporary fix for missing nose icon

    const currentStep = steps[step]
    const isComplete = step >= steps.length

    const handleNext = () => {
        if (step < steps.length) {
            setStep(step + 1)
        }
    }

    const reset = () => {
        setStep(0)
    }

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Pulse */}
            <div className="absolute inset-0 bg-red-900/10 pointer-events-none animate-pulse" />

            {!isComplete ? (
                <motion.div
                    key={step}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    className="w-full max-w-lg z-10"
                >
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-black text-white mb-2 uppercase tracking-widest">Grounding</h1>
                        <p className="text-slate-400">Step {step + 1} of 5</p>
                    </div>

                    <Card className="p-8 border-slate-800 bg-slate-900 shadow-2xl">
                        <div className="flex flex-col items-center gap-6 text-center">
                            <div className={`p-6 rounded-full bg-slate-800 ${currentStep.color}`}>
                                <currentStep.icon size={48} />
                            </div>

                            <div>
                                <h2 className="text-6xl font-black mb-4">{currentStep.count}</h2>
                                <h3 className="text-2xl font-bold text-white mb-2">{currentStep.title}</h3>
                                <p className="text-lg text-slate-300">{currentStep.instruction}</p>
                            </div>

                            <div className="w-full space-y-3 mt-4">
                                {currentStep.items.map((_, i) => (
                                    <div key={i} className="h-12 border-2 border-dashed border-slate-700 rounded-lg flex items-center px-4 text-slate-500">
                                        Thing {i + 1}...
                                    </div>
                                ))}
                            </div>

                            <Button onClick={handleNext} size="lg" className="w-full text-lg h-14 mt-4 bg-white text-slate-900 hover:bg-slate-200">
                                Done
                            </Button>
                        </div>
                    </Card>
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center z-10"
                >
                    <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6" />
                    <h1 className="text-3xl font-bold text-white mb-4">You did it.</h1>
                    <p className="text-slate-400 mb-8 max-w-md mx-auto">
                        Take a deep breath. You are safe. You are here.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Button onClick={reset} variant="outline">Start Over</Button>
                        <Button asChild className="bg-blue-600 hover:bg-blue-700">
                            <a href="/chat">Talk to EchoWell</a>
                        </Button>
                    </div>
                </motion.div>
            )}

            {/* Emergency Footer */}
            <div className="fixed bottom-8 text-center w-full z-10 space-y-3 px-4">
                <p className="text-slate-500 text-sm">If you are in immediate danger:</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                    <Button variant="destructive" className="gap-2 w-full sm:w-auto">
                        <Phone size={16} /> Call Emergency Services (911)
                    </Button>
                    <Button variant="outline" className="gap-2 w-full sm:w-auto bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800" asChild>
                        <a href="https://google.com">Quick Exit (Google)</a>
                    </Button>
                </div>
            </div>
        </div>
    )
}

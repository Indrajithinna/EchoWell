"use client"

import { BreathingCircle } from "@/components/exercises/breathing-circle"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"

export default function BreathingPage() {
    return (
        <div className="min-h-screen p-8 flex flex-col">
            <div className="mb-8">
                <Button variant="ghost" asChild className="pl-0 hover:bg-transparent hover:text-white">
                    <Link href="/exercises" className="flex items-center gap-2 text-slate-400">
                        <ChevronLeft className="h-4 w-4" /> Back to Studio
                    </Link>
                </Button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Deep Breathing</h1>
                    <p className="text-slate-400 max-w-md mx-auto">
                        Follow the visual guide. Inhale as the circle expands, hold when it steadies, and exhale as it shrinks.
                    </p>
                </div>

                <BreathingCircle />
            </div>
        </div>
    )
}

"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Wind, Mic, Timer, Trophy, ArrowRight, Brain, Sparkles, Activity } from "lucide-react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const tools = [
    {
        title: "Deep Breathing",
        description: "Relax your mind with the 4-7-8 controlled breathing technique.",
        icon: Wind,
        color: "text-blue-500",
        bg: "bg-blue-500/10",
        href: "/exercises/breathing",
        duration: "2 min",
    },
    {
        title: "Focus Timer",
        description: "Boost productivity with ambient soundscapes and timed sessions.",
        icon: Timer,
        color: "text-purple-500",
        bg: "bg-purple-500/10",
        href: "/exercises/focus",
        duration: "25 min",
    },
    {
        title: "Voice Journal",
        description: "Speak your mind. AI analyzes your mood and summarizes your day.",
        icon: Mic,
        color: "text-rose-500",
        bg: "bg-rose-500/10",
        href: "/journal",
        duration: "Any",
    },
]

export default function ExercisesPage() {
    return (
        <div className="space-y-8 p-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Mindfulness Studio</h1>
                <p className="text-slate-400">
                    Tools to help you relax, focus, and reflect on your mental well-being.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {tools.map((tool, index) => (
                    <motion.div
                        key={tool.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card className="group relative overflow-hidden border-slate-800 bg-slate-900/50 transition-all hover:border-slate-700 hover:shadow-lg">
                            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-white/5 opacity-0 transition-opacity group-hover:opacity-100" />

                            <CardHeader>
                                <div className="mb-4 flex items-center justify-between">
                                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${tool.bg}`}>
                                        <tool.icon className={`h-6 w-6 ${tool.color}`} />
                                    </div>
                                    <Badge variant="secondary" className="bg-slate-800 text-slate-300">
                                        {tool.duration}
                                    </Badge>
                                </div>
                                <CardTitle className="bg-gradient-to-br from-white to-slate-400 bg-clip-text text-xl font-bold text-transparent">
                                    {tool.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="text-slate-400">
                                    {tool.description}
                                </CardDescription>
                            </CardContent>
                            <CardFooter>
                                <Button asChild className="w-full bg-secondary/50 hover:bg-secondary">
                                    <Link href={tool.href} className="group-hover:translate-x-1 transition-transform">
                                        Start Session <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Gamification Teaser / Stats area */}
            <div className="mt-12 rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-8">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h2 className="flex items-center gap-2 text-2xl font-bold">
                            <Trophy className="h-6 w-6 text-yellow-500" />
                            Your Wellness Journey
                        </h2>
                        <p className="text-slate-400">Complete exercises to earn points and maintain your streak.</p>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-bold text-white">Level 1</div>
                        <div className="text-sm text-slate-400">Beginner Meditator</div>
                    </div>
                </div>

                <div className="mt-8 grid gap-4 grid-cols-2 lg:grid-cols-4">
                    {/* Placeholder Stats */}
                    {["Current Streak", "Total Minutes", "Sessions", "Mood Score"].map((stat) => (
                        <div key={stat} className="rounded-xl bg-slate-950/50 p-4 border border-slate-800/50">
                            <div className="text-sm text-slate-500">{stat}</div>
                            <div className="text-2xl font-bold text-slate-200">--</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

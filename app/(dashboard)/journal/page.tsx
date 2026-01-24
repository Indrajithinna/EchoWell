"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Mic, Calendar, Book, Activity, ArrowRight } from "lucide-react"

import VoiceRecorder from "@/components/chat/voice-recorder"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function JournalPage() {
    const [isProcessing, setIsProcessing] = useState(false)
    const [entries, setEntries] = useState([
        {
            id: "1",
            date: new Date(2023, 10, 24),
            summary: "Felt anxious about the upcoming presentation but successfully practiced breathing exercises.",
            mood: "Anxious",
            moodColor: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
            transcript: "I'm feeling a bit nervous today..."
        },
        {
            id: "2",
            date: new Date(2023, 10, 23),
            summary: "Had a great conversation with a friend and felt very supported.",
            mood: "Happy",
            moodColor: "bg-green-500/10 text-green-500 border-green-500/20",
            transcript: "Today was actually surprising..."
        }
    ])

    const handleNewEntry = async (audioBlob: Blob) => {
        setIsProcessing(true)

        // Simulate AI Processing and DB Save
        setTimeout(() => {
            const newEntry = {
                id: Math.random().toString(),
                date: new Date(),
                summary: "Just recorded a new reflection. (AI Processing would happen here)",
                mood: "Calm",
                moodColor: "bg-blue-500/10 text-blue-500 border-blue-500/20",
                transcript: "Voice entry processing..."
            }

            setEntries([newEntry, ...entries])
            setIsProcessing(false)
        }, 2000)
    }

    return (
        <div className="space-y-8 p-8 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">Voice Journal</h1>
                    <p className="text-slate-400">
                        Talk to EchoWell. Your personal AI companion will analyze your mood and summarize your day.
                    </p>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Recorder Section */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="border-slate-800 bg-slate-900/50 shadow-xl overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none" />
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Mic className="h-5 w-5 text-blue-500" />
                                New Entry
                            </CardTitle>
                            <CardDescription>
                                Record your thoughts. Max 5 mins.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <VoiceRecorder
                                onSendVoice={handleNewEntry}
                                isProcessing={isProcessing}
                            />
                        </CardContent>
                    </Card>

                    <Card className="border-slate-800 bg-slate-950/30">
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-slate-400">
                                Weekly Insight
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white mb-1">Improving</div>
                            <p className="text-sm text-slate-500">
                                Your sentiment has trended 15% more positive this week.
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Entries List */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Book className="h-5 w-5 text-slate-400" />
                        Recent Entries
                    </h2>

                    <div className="grid gap-4">
                        {entries.map((entry) => (
                            <Card key={entry.id} className="group border-slate-800 bg-slate-900/30 transition-all hover:bg-slate-900/50 hover:border-slate-700">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-3">
                                                <Badge variant="outline" className={`${entry.moodColor} px-2 py-0.5`}>
                                                    {entry.mood}
                                                </Badge>
                                                <span className="text-sm text-slate-400 flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {format(entry.date, "MMM d, yyyy • h:mm a")}
                                                </span>
                                            </div>
                                            <p className="text-slate-200 mt-2 font-medium leading-relaxed">
                                                {entry.summary}
                                            </p>
                                            <p className="text-sm text-slate-500 mt-2 line-clamp-2 italic">
                                                "{entry.transcript}"
                                            </p>
                                        </div>

                                        <Button variant="ghost" size="icon" className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ArrowRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

"use client"

import { useState } from "react"
import { Cloud, Moon, Book } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

export default function DreamJournalPage() {
    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8">
            <div className="flex items-center gap-3">
                <div className="bg-indigo-500/10 p-2 rounded-lg">
                    <Moon className="w-8 h-8 text-indigo-500" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold">Dream Decoder</h1>
                    <p className="text-slate-500">Log your dreams and uncover hidden patterns.</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Logger */}
                <Card className="border-indigo-100 bg-white">
                    <CardHeader>
                        <CardTitle>Last Night's Dream</CardTitle>
                        <CardDescription>Describe what you remember. The AI will analyze themes.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium text-slate-700">Date of Dream</label>
                            <input
                                type="date"
                                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                                defaultValue={new Date().toISOString().split('T')[0]}
                            />
                        </div>
                        <Textarea
                            className="min-h-[200px] border-slate-200"
                            placeholder="I was flying over a city, but my wings felt heavy..."
                        />
                        <Button className="w-full bg-indigo-600 hover:bg-indigo-700">Analyze Dream</Button>
                    </CardContent>
                </Card>

                {/* History / Analysis Mock */}
                <div className="space-y-4">
                    {[
                        { date: "Yesterday", text: "Chased by a shadow in a maze.", themes: ["Anxiety", "feeling trapped"], analysis: "This often represents avoidance of a waking life problem." },
                        { date: "Oct 24", text: "Teeth falling out.", themes: ["Insecurity", "Change"], analysis: "Commonly associated with fear of aging or loss of control." },
                    ].map((dream, i) => (
                        <Card key={i} className="hover:bg-slate-50 transition-colors">
                            <CardContent className="p-5">
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-bold text-slate-700">{dream.date}</span>
                                    <div className="flex gap-2">
                                        {dream.themes.map(t => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)}
                                    </div>
                                </div>
                                <p className="text-slate-600 mb-3 italic">"{dream.text}"</p>
                                <div className="bg-indigo-50 p-3 rounded text-sm text-indigo-900 border border-indigo-100">
                                    <strong>Analysis:</strong> {dream.analysis}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}

"use client"

import { useState } from "react"
import { Brain, ArrowRight, X, AlertCircle, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

export default function CBTToolPage() {
    const [step, setStep] = useState(1)
    const [formData, setFormData] = useState({
        situation: "",
        thought: "",
        distortion: "",
        evidence: "",
        rational: ""
    })

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const nextStep = () => setStep(prev => prev + 1)

    return (
        <div className="p-8 max-w-4xl mx-auto min-h-screen">
            <div className="flex items-center gap-3 mb-8">
                <div className="bg-orange-500/10 p-2 rounded-lg">
                    <Brain className="w-8 h-8 text-orange-500" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold">Thought Challenger</h1>
                    <p className="text-slate-500">Cognitive Behavioral Therapy (CBT) Exercise</p>
                </div>
            </div>

            <div className="grid md:grid-cols-[1fr_300px] gap-8">
                {/* Main interactive form */}
                <div className="space-y-6">
                    {step === 1 && (
                        <Card className="border-l-4 border-l-orange-500">
                            <CardHeader>
                                <CardTitle>1. The Situation</CardTitle>
                                <CardDescription>What happened to trigger this feeling?</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Label>Describe the event</Label>
                                <Textarea
                                    placeholder="e.g., My boss didn't reply to my email immediately."
                                    value={formData.situation}
                                    onChange={(e) => handleChange("situation", e.target.value)}
                                    className="min-h-[120px]"
                                />
                                <Button onClick={nextStep} className="w-full" disabled={!formData.situation}>Next <ArrowRight className="w-4 h-4 ml-2" /></Button>
                            </CardContent>
                        </Card>
                    )}

                    {step === 2 && (
                        <Card className="border-l-4 border-l-red-500">
                            <CardHeader>
                                <CardTitle>2. The Automatic Thought</CardTitle>
                                <CardDescription>What negative thought popped into your head?</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Label>Your Thought</Label>
                                <Input
                                    placeholder="e.g., They hate my work and I'm going to get fired."
                                    value={formData.thought}
                                    onChange={(e) => handleChange("thought", e.target.value)}
                                />
                                <Button onClick={nextStep} className="w-full" disabled={!formData.thought}>Next <ArrowRight className="w-4 h-4 ml-2" /></Button>
                            </CardContent>
                        </Card>
                    )}

                    {step === 3 && (
                        <Card className="border-l-4 border-l-purple-500">
                            <CardHeader>
                                <CardTitle>3. Identify the Distortion</CardTitle>
                                <CardDescription>Is your mind playing tricks on you?</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Label>Cognitive Distortion</Label>
                                <Select onValueChange={(val) => handleChange("distortion", val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a distortion type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="catastrophizing">Catastrophizing (Expecting disaster)</SelectItem>
                                        <SelectItem value="filtering">Filtering (Focusing only on negative)</SelectItem>
                                        <SelectItem value="mind_reading">Mind Reading (Assuming others' thoughts)</SelectItem>
                                        <SelectItem value="all_or_nothing">All-or-Nothing Thinking</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button onClick={nextStep} className="w-full" disabled={!formData.distortion}>Next <ArrowRight className="w-4 h-4 ml-2" /></Button>
                            </CardContent>
                        </Card>
                    )}

                    {step === 4 && (
                        <Card className="border-l-4 border-l-blue-500">
                            <CardHeader>
                                <CardTitle>4. Challenge It</CardTitle>
                                <CardDescription>What is the factual evidence? Is there another explanation?</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Label>Evidence / Alternative</Label>
                                <Textarea
                                    placeholder="e.g., My boss is often busy. They praised my work last week."
                                    value={formData.evidence}
                                    onChange={(e) => handleChange("evidence", e.target.value)}
                                    className="min-h-[120px]"
                                />
                                <Button onClick={nextStep} className="w-full" disabled={!formData.evidence}>Next <ArrowRight className="w-4 h-4 ml-2" /></Button>
                            </CardContent>
                        </Card>
                    )}

                    {step === 5 && (
                        <Card className="border-l-4 border-l-green-500 bg-green-50/10">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-green-500" /> 5. Rational Response</CardTitle>
                                <CardDescription>Write a new, balanced thought based on the evidence.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Label>Balanced Thought</Label>
                                <Textarea
                                    placeholder="e.g., My boss is likely just busy. No reply doesn't mean bad news."
                                    value={formData.rational}
                                    onChange={(e) => handleChange("rational", e.target.value)}
                                    className="min-h-[120px]"
                                />
                                <Button className="w-full bg-green-600 hover:bg-green-700">Save Entry</Button>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Cheat Sheet Sidebar */}
                <div className="space-y-4">
                    <Card className="bg-slate-50 border-slate-200">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Why do this?</CardTitle>
                        </CardHeader>
                        <CardContent className="text-xs text-slate-500">
                            Our thoughts affect our feelings. By challenging irrational thoughts, we can change how we feel.
                        </CardContent>
                    </Card>

                    <div className="text-xs text-slate-400">
                        <h4 className="font-bold text-slate-700 mb-2">Common Distortions</h4>
                        <ul className="space-y-2 list-disc pl-4">
                            <li><strong>All-or-Nothing:</strong> "If I'm not perfect, I'm a failure."</li>
                            <li><strong>Catastrophizing:</strong> Blowing things out of proportion.</li>
                            <li><strong>Should Statements:</strong> Using "should" or "must" creates guilt.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}

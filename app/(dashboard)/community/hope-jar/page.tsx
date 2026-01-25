"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Heart, Send, MessageCircle, AlertTriangle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"


// Mock Data
const MOCK_MESSAGES = [
    { id: 1, text: "It DOES get better. I was in a dark place last year, but today I laughed for real. Hang in there.", likes: 24, theme: "bg-blue-500/10 border-blue-500/20" },
    { id: 2, text: "You are enough just as you are. Productivity does not define your worth.", likes: 12, theme: "bg-purple-500/10 border-purple-500/20" },
    { id: 3, text: "Breathe. Just get through the next 5 minutes. Then the next.", likes: 8, theme: "bg-green-500/10 border-green-500/20" },
]

export default function HopeJarPage() {
    const [messages, setMessages] = useState(MOCK_MESSAGES)
    const [newMessage, setNewMessage] = useState("")

    const handlePost = () => {
        if (!newMessage) return;
        const msg = {
            id: Date.now(),
            text: newMessage,
            likes: 0,
            theme: "bg-pink-500/10 border-pink-500/20"
        }
        setMessages([msg, ...messages])
        setNewMessage("")
        // Trigger confetti?
    }

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8">
            <div className="text-center space-y-2 mb-12">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">The Hope Jar</h1>
                <p className="text-slate-500 max-w-lg mx-auto">
                    A safe, anonymous space to leave a message of encouragement for someone else, or take one when you need it.
                </p>
            </div>

            {/* Input Area */}
            <Card className="max-w-xl mx-auto border-dashed border-2 border-slate-300 shadow-sm">
                <CardContent className="p-6 space-y-4">
                    <Textarea
                        placeholder="Leave a kind message anonymously..."
                        className="resize-none border-0 shadow-none focus-visible:ring-0 text-lg text-center placeholder:text-slate-300"
                        rows={3}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <div className="flex justify-center">
                        <Button onClick={handlePost} disabled={!newMessage} className="rounded-full bg-rose-500 hover:bg-rose-600 px-8">
                            <Send className="w-4 h-4 mr-2" /> Put in Jar
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Messages Grid (Masonry-ish) */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
                {messages.map((msg, i) => (
                    <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <Card className={`h-full hover:shadow-xl transition-all duration-300 border-0 ${msg.theme} hover:-translate-y-1`}>
                            <CardContent className="p-6 flex flex-col justify-between h-full min-h-[180px]">
                                <p className="text-lg font-medium text-slate-700 leading-relaxed font-handwriting italic">
                                    "{msg.text}"
                                </p>
                                <div className="flex items-center justify-between mt-6 pt-4 border-t border-black/5 text-sm text-slate-500">
                                    <span className="text-xs font-semibold uppercase tracking-wider opacity-70">Anonymous</span>
                                    <button className="flex items-center gap-1.5 hover:text-red-500 transition-colors group">
                                        <Heart className="w-4 h-4 group-hover:fill-current" /> {msg.likes}
                                    </button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}

"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Trophy, Flame, Star } from "lucide-react"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

export function UserStatsDisplay() {
    const [stats, setStats] = useState({
        points: 1250,
        streak: 5,
        level: 2
    })

    // Simulated fetch - in production this would fetch from 'user_stats' table
    // const supabase = createClientComponentClient()

    return (
        <div className="flex items-center gap-2 bg-slate-900/50 rounded-full px-3 py-1.5 border border-slate-800">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger>
                        <div className="flex items-center gap-1.5 px-2">
                            <Flame className="h-4 w-4 text-orange-500 fill-orange-500/20" />
                            <span className="text-sm font-bold text-orange-100">{stats.streak}</span>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>5 Day Streak! Keep it up!</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            <div className="h-4 w-px bg-slate-700" />

            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger>
                        <div className="flex items-center gap-1.5 px-2">
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500/20" />
                            <span className="text-sm font-bold text-yellow-100">{stats.points}</span>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>1,250 Wellness Points</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    )
}

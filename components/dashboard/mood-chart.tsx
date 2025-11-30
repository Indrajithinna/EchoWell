'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { formatDate } from '@/lib/utils'

interface MoodLog {
  logged_at: string
  mood_score: number
}

interface MoodChartProps {
  data: MoodLog[]
}

export default function MoodChart({ data }: MoodChartProps) {
  const chartData = data.map(log => ({
    date: formatDate(log.logged_at),
    mood: log.mood_score,
  }))

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-6">
        Mood Trends
      </h3>

      {data.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No mood data yet.</p>
          <p className="text-sm mt-1">Start logging your mood to see trends!</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              stroke="#9ca3af"
            />
            <YAxis 
              domain={[1, 10]} 
              ticks={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
              tick={{ fontSize: 12 }}
              stroke="#9ca3af"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Line
              type="monotone"
              dataKey="mood"
              stroke="url(#moodGradient)"
              strokeWidth={3}
              dot={{ fill: '#0ea5e9', r: 4 }}
              activeDot={{ r: 6 }}
            />
            <defs>
              <linearGradient id="moodGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#0ea5e9" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

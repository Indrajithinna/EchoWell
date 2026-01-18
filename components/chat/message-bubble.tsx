'use client'

import { User, Bot, Clock } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { formatRelativeTime } from '@/lib/utils'

interface MessageBubbleProps {
  message: {
    role: 'user' | 'assistant'
    content: string
    timestamp?: Date
  }
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} animate-fade-in group`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser
          ? 'bg-gradient-to-br from-calm-500 to-zen-500'
          : 'bg-gradient-to-br from-zen-100 to-calm-100'
        }`}>
        {isUser ? (
          <User size={16} className="text-white" />
        ) : (
          <Bot size={16} className="text-zen-600" />
        )}
      </div>

      {/* Message Content */}
      <div className={`flex-1 flex flex-col max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`px-4 py-3 rounded-2xl ${isUser
            ? 'bg-gradient-to-r from-calm-500 to-zen-500 text-white rounded-tr-none'
            : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm'
          }`}>
          {isUser ? (
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          ) : (
            <ReactMarkdown
              className="text-sm prose prose-sm max-w-none prose-p:my-2 prose-ul:my-2"
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                ul: ({ children }) => <ul className="ml-4 space-y-1">{children}</ul>,
                strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>

        {/* Timestamp */}
        {message.timestamp && (
          <div className={`mt-1 flex items-center gap-1 text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity`}>
            <Clock size={10} />
            <span>{formatRelativeTime(message.timestamp)}</span>
          </div>
        )}
      </div>
    </div>
  )
}

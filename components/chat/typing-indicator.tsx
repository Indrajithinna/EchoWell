import { Bot } from 'lucide-react'

export default function TypingIndicator() {
  return (
    <div className="flex gap-3 animate-fade-in" role="status" aria-label="Agent is typing">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-zen-100 to-calm-100 flex items-center justify-center" aria-hidden="true">
        <Bot size={16} className="text-zen-600" />
      </div>

      <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm">
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
        <span className="sr-only">Typing...</span>
      </div>
    </div>
  )
}
  )
}

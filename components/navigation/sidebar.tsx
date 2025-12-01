'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  Brain,
  MessageSquare,
  Music,
  Heart,
  Settings,
  LogOut,
  Target,
  Calendar
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const navigation = [
  { name: 'Overview', href: '/overview', icon: Calendar },
  { name: 'Chat', href: '/chat', icon: MessageSquare },
  { name: 'Mood Tracker', href: '/mood', icon: Heart },
  { name: 'Music Therapy', href: '/music', icon: Music },
  { name: 'Generated Music', href: '/music/generated', icon: Music },
  { name: 'Goals', href: '/goals', icon: Target },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Model Config', href: '/settings/model-config', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <Link href="/chat" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-calm-500 to-zen-500 rounded-xl flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-calm-600 to-zen-600 bg-clip-text text-transparent">
            EchoWell
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1" role="navigation" aria-label="Main Navigation">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                ? 'bg-gradient-to-r from-calm-500 to-zen-500 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
                }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* Sign Out */}
      <div className="p-4 border-t border-gray-200">
        <Button
          onClick={() => signOut({ callbackUrl: '/signin' })}
          variant="ghost"
          className="w-full justify-start text-red-600 hover:bg-red-50"
        >
          <LogOut size={20} className="mr-3" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}

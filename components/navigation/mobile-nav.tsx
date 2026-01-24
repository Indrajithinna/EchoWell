'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MessageSquare, Music, Heart, Settings, Calendar, Wind } from 'lucide-react'

const navigation = [
  { name: 'Overview', href: '/overview', icon: Calendar },
  { name: 'Chat', href: '/chat', icon: MessageSquare },
  { name: 'Mood', href: '/mood', icon: Heart },
  { name: 'Relax', href: '/exercises', icon: Wind },
  { name: 'Music', href: '/music', icon: Music },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export default function MobileNav() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
      <div className="flex justify-around items-center">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all ${isActive
                  ? 'text-calm-600'
                  : 'text-gray-500'
                }`}
            >
              <Icon size={24} />
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

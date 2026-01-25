import {
    Brain,
    MessageSquare,
    Music,
    Heart,
    Settings,
    Target,
    Calendar,
    Wind,
    Book,
    Moon,
    AlertTriangle
} from 'lucide-react'

// Main sidebar navigation
export const SIDEBAR_NAVIGATION = [
    { name: 'Overview', href: '/overview', icon: Calendar },
    { name: 'Chat', href: '/chat', icon: MessageSquare },
    { name: 'Mood Tracker', href: '/mood', icon: Heart },
    { name: 'Music Therapy', href: '/music', icon: Music },
    { name: 'Mindfulness', href: '/exercises', icon: Wind, badge: 'New' },
    { name: 'Voice Journal', href: '/journal', icon: Book, badge: 'New' },
    { name: 'Hope Jar', href: '/community/hope-jar', icon: Heart, badge: 'New' },
    { name: 'Dream Decoder', href: '/tools/dreams', icon: Moon, badge: 'New' },
    { name: 'CBT Tools', href: '/tools/cbt', icon: Brain, badge: 'New' },
    { name: 'SOS Panic', href: '/sos', icon: AlertTriangle, badge: 'Hot' },
    { name: 'Goals', href: '/goals', icon: Target },
    { name: 'Settings', href: '/settings', icon: Settings },
]

// Mobile navigation (bottom tabs)
export const MOBILE_NAVIGATION = [
    { name: 'Overview', href: '/overview', icon: Calendar },
    { name: 'Chat', href: '/chat', icon: MessageSquare },
    { name: 'Mood', href: '/mood', icon: Heart },
    { name: 'Relax', href: '/exercises', icon: Wind },
    { name: 'Music', href: '/music', icon: Music },
    { name: 'Settings', href: '/settings', icon: Settings },
]

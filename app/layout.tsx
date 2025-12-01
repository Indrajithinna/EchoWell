import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import AuthProvider from '@/components/providers/session-provider'
import { AccessibilityProvider } from '@/components/accessibility/accessibility-provider'
import { AudioProvider } from '@/components/accessibility/audio-provider'

import VoiceNavigator from '@/components/accessibility/voice-navigator'
import SkipLink from '@/components/accessibility/skip-link'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'EchoWell - Your AI Mental Wellness Companion',
  description: 'AI-powered mental health support with music therapy',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AccessibilityProvider>
          <AudioProvider>
            <AuthProvider>
              <SkipLink />
              <main id="main-content" className="min-h-screen">
                {children}
              </main>
              <VoiceNavigator />
            </AuthProvider>
          </AudioProvider>
        </AccessibilityProvider>
      </body>
    </html>
  )
}

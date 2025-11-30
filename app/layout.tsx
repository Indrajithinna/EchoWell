import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import AuthProvider from '@/components/providers/session-provider'
import { AccessibilityProvider } from '@/components/accessibility/accessibility-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MindfulAI - Your AI Mental Wellness Companion',
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
          <AuthProvider>{children}</AuthProvider>
        </AccessibilityProvider>
      </body>
    </html>
  )
}

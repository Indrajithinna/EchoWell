'use client'

import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Brain, Sparkles, Music, Heart } from 'lucide-react'

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-calm-50 via-zen-50 to-pink-50">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

      <div className="relative z-10 max-w-md w-full mx-4">
        {/* Logo and Title */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-calm-500 to-zen-500 rounded-3xl mb-4 shadow-lg">
            <Brain className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-calm-600 to-zen-600 bg-clip-text text-transparent mb-2">
            EchoWell
          </h1>
          <p className="text-gray-600">Your AI Mental Wellness Companion</p>
        </div>

        {/* Sign In Card */}
        <div className="bg-white/80 backdrop-blur-lg p-8 rounded-3xl shadow-2xl border border-white/20 animate-slide-in">
          <div className="space-y-6">
            {/* Features */}
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-calm-100 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-calm-600" />
                </div>
                <span>AI-powered emotional support</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-zen-100 rounded-lg flex items-center justify-center">
                  <Music className="w-4 h-4 text-zen-600" />
                </div>
                <span>Personalized music therapy</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                  <Heart className="w-4 h-4 text-pink-600" />
                </div>
                <span>Track your mood & progress</span>
              </div>
            </div>

            {/* Sign In Button */}
            <Button
              onClick={() => signIn('google', { callbackUrl: '/chat' })}
              className="w-full bg-gradient-to-r from-calm-500 to-zen-500 hover:from-calm-600 hover:to-zen-600 text-white py-6 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span>Continue with Google</span>
            </Button>

            {/* Disclaimer */}
            <p className="text-xs text-gray-500 text-center leading-relaxed">
              By continuing, you agree to our Terms of Service and Privacy Policy.
              <span className="block mt-1">EchoWell is not a replacement for professional therapy.</span>
            </p>
          </div>
        </div>

        {/* Crisis Resources */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p className="font-medium mb-1">In Crisis?</p>
          <p>Call 988 (Suicide & Crisis Lifeline)</p>
        </div>
      </div>
    </div>
  )
}

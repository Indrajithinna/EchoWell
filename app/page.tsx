'use client'

import Link from 'next/link'
import { Brain, MessageSquare, Music, Heart, TrendingUp, Shield, Sparkles, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

const features = [
  {
    icon: MessageSquare,
    title: 'AI Companion',
    description: 'Chat with an empathetic AI trained in CBT and DBT techniques for 24/7 emotional support.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Music,
    title: 'Music Therapy',
    description: 'Personalized music recommendations and AI-generated soundscapes based on your emotional state.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Heart,
    title: 'Mood Tracking',
    description: 'Track your emotions daily and discover patterns with beautiful visual insights.',
    color: 'from-red-500 to-orange-500',
  },
  {
    icon: TrendingUp,
    title: 'Progress Tracking',
    description: 'Set therapy goals and monitor your mental wellness journey over time.',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: Shield,
    title: 'Safe & Private',
    description: 'Your conversations and data are encrypted and never shared with third parties.',
    color: 'from-indigo-500 to-purple-500',
  },
  {
    icon: Sparkles,
    title: 'Evidence-Based',
    description: 'Techniques grounded in proven therapeutic approaches like CBT and mindfulness.',
    color: 'from-yellow-500 to-orange-500',
  },
]

const testimonials = [
  {
    name: 'Sarah M.',
    text: 'MindfulAI has been a game-changer for managing my anxiety. The AI companion is so understanding and the music therapy really helps me relax.',
    rating: 5,
  },
  {
    name: 'James K.',
    text: 'I love the mood tracking feature. It helps me see patterns I never noticed before. The insights are genuinely helpful.',
    rating: 5,
  },
  {
    name: 'Emily R.',
    text: 'As someone who struggles with traditional therapy, having 24/7 support has been incredible. The AI never judges and is always there.',
    rating: 5,
  },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-calm-500 to-zen-500 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-calm-600 to-zen-600 bg-clip-text text-transparent">
                MindfulAI
              </span>
            </div>
            <Link href="/signin">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur px-4 py-2 rounded-full border border-gray-200 mb-6">
            <Sparkles className="w-4 h-4 text-zen-500" />
            <span className="text-sm font-medium text-gray-700">AI-Powered Mental Wellness</span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Your Journey to{' '}
            <span className="bg-gradient-to-r from-calm-600 to-zen-600 bg-clip-text text-transparent">
              Mental Wellness
            </span>
            <br />
            Starts Here
          </h1>

          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
            Experience 24/7 emotional support with AI-powered therapy, personalized music therapy,
            and comprehensive mood tracking. Your safe space for mental health.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signin">
              <Button size="lg" className="px-8 py-6 text-lg">
                Start Free Today
                <ArrowRight className="ml-2" size={20} />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="px-8 py-6 text-lg">
              Learn More
            </Button>
          </div>

          <p className="text-sm text-gray-500 mt-6">
            Free forever. No credit card required.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Mental Wellness
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive tools designed to support your emotional wellbeing every day.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-8 border border-gray-200 hover:shadow-lg transition-all hover:-translate-y-1"
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Loved by Thousands
            </h2>
            <p className="text-xl text-gray-600">
              See what our users say about their mental wellness journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-xl">★</span>
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.text}"</p>
                <p className="font-semibold text-gray-900">{testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-calm-500 to-zen-500">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Start Your Wellness Journey?
          </h2>
          <p className="text-xl text-white/90 mb-10">
            Join thousands of people improving their mental health with MindfulAI.
            Start for free today.
          </p>
          <Link href="/signin">
            <Button size="lg" className="bg-white text-calm-600 hover:bg-gray-100 px-8 py-6 text-lg">
              Get Started Free
              <ArrowRight className="ml-2" size={20} />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-calm-500 to-zen-500 rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold">MindfulAI</span>
              </div>
              <p className="text-gray-400 text-sm">
                Your AI-powered mental wellness companion.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">FAQ</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white">Disclaimer</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-gray-400">
                © 2024 MindfulAI. All rights reserved.
              </p>
              <div className="flex gap-4 text-gray-400">
                <a href="#" className="hover:text-white">Twitter</a>
                <a href="#" className="hover:text-white">LinkedIn</a>
                <a href="#" className="hover:text-white">Instagram</a>
              </div>
            </div>
            <p className="text-xs text-gray-500 text-center mt-4">
              Crisis Support: National Suicide Prevention Lifeline - 988 | Crisis Text Line - Text HOME to 741741
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

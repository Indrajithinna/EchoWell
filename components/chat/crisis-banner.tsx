'use client'

import { AlertTriangle, Phone, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function CrisisBanner() {
  return (
    <div className="bg-red-50 border-y border-red-200 p-6 mb-4 animate-slide-in shadow-sm relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 p-8 opacity-5">
        <AlertTriangle size={120} className="text-red-900" />
      </div>

      <div className="flex items-start relative z-10">
        <div className="bg-red-100 p-2 rounded-full mr-4 flex-shrink-0">
          <AlertTriangle className="w-6 h-6 text-red-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-bold text-red-900 mb-1">
            You're Not Alone - Help is Available
          </h3>
          <p className="text-sm text-red-700 mb-4 max-w-2xl">
            If you're going through a tough time, please reach out to these free, confidential resources. People are ready to listen and support you 24/7.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-red-100 shadow-sm">
              <Phone size={18} className="text-red-600" />
              <div>
                <div className="text-xs text-red-500 font-semibold uppercase tracking-wider">Call</div>
                <div className="text-sm font-bold text-red-900">988 (Suicide & Crisis Lifeline)</div>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-red-100 shadow-sm">
              <MessageSquare size={18} className="text-red-600" />
              <div>
                <div className="text-xs text-red-500 font-semibold uppercase tracking-wider">Text</div>
                <div className="text-sm font-bold text-red-900">HOME to 741741</div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-4">
            <Button
              size="sm"
              variant="destructive"
              className="bg-red-600 hover:bg-red-700 shadow-md transition-all active:scale-95"
              onClick={() => window.open('tel:988', '_blank')}
            >
              <Phone size={14} className="mr-2" />
              Call 988 Now
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-red-200 text-red-700 hover:bg-red-100 transition-all active:scale-95 bg-white"
              onClick={() => window.open('sms:741741&body=HOME', '_blank')}
            >
              <MessageSquare size={14} className="mr-2" />
              Text Crisis Line
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-red-600 hover:text-red-800 hover:bg-red-50 underline text-xs"
              onClick={() => window.open('https://findahelpline.com/', '_blank')}
            >
              International Resources
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

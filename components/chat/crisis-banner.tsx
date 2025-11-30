'use client'

import { AlertTriangle, Phone, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function CrisisBanner() {
  return (
    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 animate-slide-in">
      <div className="flex items-start">
        <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-red-800 mb-2">
            Crisis Resources Available 24/7
          </h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Phone size={14} className="text-red-600" />
              <span className="text-red-700">
                <strong>988</strong> - Suicide & Crisis Lifeline
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MessageSquare size={14} className="text-red-600" />
              <span className="text-red-700">
                Text <strong>HOME</strong> to <strong>741741</strong> - Crisis Text Line
              </span>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <Button
              size="sm"
              variant="destructive"
              onClick={() => window.open('tel:988', '_blank')}
            >
              Call 988 Now
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open('sms:741741&body=HOME', '_blank')}
            >
              Text Crisis Line
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

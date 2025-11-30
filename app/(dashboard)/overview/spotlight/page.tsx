'use client'

import { Button } from '@/components/ui/button'
import WeeklySummaryReport from '@/components/analytics/weekly-summary-report'

export default function SpotlightPage() {
  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-purple-50/30 to-pink-50/30">
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              Weekly Spotlight
            </h1>
            <p className="text-gray-600">
              Your comprehensive weekly mental wellness report
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 justify-center">
            <Button variant="outline" size="sm" onClick={() => window.location.href = '/overview'}>
              Overview
            </Button>
            <Button variant="default" size="sm">
              Spotlight
            </Button>
          </div>
        </div>

        {/* Weekly Summary Report */}
        <WeeklySummaryReport />
      </div>
    </div>
  )
}
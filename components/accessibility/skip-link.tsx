'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function SkipLink() {
    const [isFocused, setIsFocused] = useState(false)

    return (
        <a
            href="#main-content"
            className={`fixed top-4 left-4 z-[100] transition-transform duration-200 ${isFocused ? 'translate-y-0' : '-translate-y-24'
                }`}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
        >
            <Button variant="default" className="shadow-xl border-2 border-white">
                Skip to main content
            </Button>
        </a>
    )
}

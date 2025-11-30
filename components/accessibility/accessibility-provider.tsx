'use client'

import { createContext, useContext, useEffect, useState } from 'react'

interface AccessibilityContextType {
    highContrast: boolean
    toggleHighContrast: () => void
    fontSize: 'normal' | 'large' | 'xl'
    setFontSize: (size: 'normal' | 'large' | 'xl') => void
}

const AccessibilityContext = createContext<AccessibilityContextType>({
    highContrast: false,
    toggleHighContrast: () => { },
    fontSize: 'normal',
    setFontSize: () => { },
})

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
    const [highContrast, setHighContrast] = useState(false)
    const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xl'>('normal')

    const toggleHighContrast = () => setHighContrast(!highContrast)

    useEffect(() => {
        if (highContrast) {
            document.documentElement.classList.add('high-contrast')
            // Apply a high contrast filter
            document.documentElement.style.filter = 'contrast(150%) saturate(0%)'
        } else {
            document.documentElement.classList.remove('high-contrast')
            document.documentElement.style.filter = 'none'
        }
    }, [highContrast])

    useEffect(() => {
        const sizeMap = {
            'normal': '100%',
            'large': '125%',
            'xl': '150%'
        }
        document.documentElement.style.fontSize = sizeMap[fontSize]
    }, [fontSize])

    return (
        <AccessibilityContext.Provider value={{ highContrast, toggleHighContrast, fontSize, setFontSize }}>
            {children}
        </AccessibilityContext.Provider>
    )
}

export const useAccessibility = () => useContext(AccessibilityContext)

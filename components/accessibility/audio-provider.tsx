'use client'

import { useEffect } from 'react'
import { useSoundEffects } from '@/hooks/use-sound-effects'

export function AudioProvider({ children }: { children: React.ReactNode }) {
    const { playSound } = useSoundEffects()

    useEffect(() => {
        const handleFocus = (e: FocusEvent) => {
            if (e.target instanceof HTMLElement && (e.target.tagName === 'BUTTON' || e.target.tagName === 'A' || e.target.tagName === 'INPUT')) {
                playSound('focus')
            }
        }

        const handleClick = (e: MouseEvent) => {
            if (e.target instanceof HTMLElement && (e.target.closest('button') || e.target.closest('a'))) {
                playSound('click')
            }
        }

        window.addEventListener('focus', handleFocus, true)
        window.addEventListener('click', handleClick)

        return () => {
            window.removeEventListener('focus', handleFocus, true)
            window.removeEventListener('click', handleClick)
        }
    }, [playSound])

    return <>{children}</>
}

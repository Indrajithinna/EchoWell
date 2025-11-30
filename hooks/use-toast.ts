import { useState, useCallback } from 'react'

export interface Toast {
  id: string
  title?: string
  description?: string
  variant?: 'default' | 'success' | 'error' | 'warning'
}

const toastTimeouts = new Map<string, NodeJS.Timeout>()

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback(
    ({ title, description, variant = 'default' }: Omit<Toast, 'id'>) => {
      const id = Math.random().toString(36).substring(7)
      const newToast: Toast = { id, title, description, variant }

      setToasts((prev) => [...prev, newToast])

      const timeout = setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
        toastTimeouts.delete(id)
      }, 5000)

      toastTimeouts.set(id, timeout)

      return id
    },
    []
  )

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
    const timeout = toastTimeouts.get(id)
    if (timeout) {
      clearTimeout(timeout)
      toastTimeouts.delete(id)
    }
  }, [])

  return { toasts, toast, dismiss }
}

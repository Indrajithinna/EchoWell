'use client'

import { X } from 'lucide-react'
import { Toast } from '@/hooks/use-toast'

interface ToastProps {
  toast: Toast
  onDismiss: (id: string) => void
}

export function ToastComponent({ toast, onDismiss }: ToastProps) {
  const variantStyles = {
    default: 'bg-white border-gray-200',
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
  }

  const iconColors = {
    default: 'text-gray-600',
    success: 'text-green-600',
    error: 'text-red-600',
    warning: 'text-yellow-600',
  }

  return (
    <div
      className={`${variantStyles[toast.variant || 'default']} border rounded-lg shadow-lg p-4 min-w-[300px] max-w-md animate-slide-in`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {toast.title && (
            <h4 className={`font-semibold ${iconColors[toast.variant || 'default']}`}>
              {toast.title}
            </h4>
          )}
          {toast.description && (
            <p className="text-sm text-gray-600 mt-1">{toast.description}</p>
          )}
        </div>
        <button
          onClick={() => onDismiss(toast.id)}
          className="ml-4 text-gray-400 hover:text-gray-600"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}

export function ToastContainer({ toasts, onDismiss }: { 
  toasts: Toast[]
  onDismiss: (id: string) => void 
}) {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <ToastComponent key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

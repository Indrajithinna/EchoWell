import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
  }).format(new Date(date))
}

export function getMoodColor(score: number): string {
  if (score >= 8) return 'text-green-600 bg-green-100'
  if (score >= 6) return 'text-blue-600 bg-blue-100'
  if (score >= 4) return 'text-yellow-600 bg-yellow-100'
  return 'text-red-600 bg-red-100'
}

export function getMoodEmoji(score: number): string {
  if (score >= 9) return '😊'
  if (score >= 7) return '🙂'
  if (score >= 5) return '😐'
  if (score >= 3) return '😔'
  return '😢'
}

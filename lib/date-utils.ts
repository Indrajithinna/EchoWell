/**
 * Date utilities for EchoWell
 * Provides date formatting and manipulation helpers
 */

/**
 * Formats a date to a readable string
 */
export function formatDate(date: Date | string, format: 'short' | 'long' | 'full' = 'short'): string {
    const d = new Date(date)

    switch (format) {
        case 'short':
            return new Intl.DateTimeFormat('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            }).format(d)

        case 'long':
            return new Intl.DateTimeFormat('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
            }).format(d)

        case 'full':
            return new Intl.DateTimeFormat('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
            }).format(d)

        default:
            return d.toLocaleDateString()
    }
}

/**
 * Formats time
 */
export function formatTime(date: Date | string, includeSeconds: boolean = false): string {
    const d = new Date(date)

    return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        ...(includeSeconds && { second: 'numeric' }),
    }).format(d)
}

/**
 * Gets relative time (e.g., "2 hours ago")
 */
export function getRelativeTime(date: Date | string): string {
    const now = new Date()
    const then = new Date(date)
    const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000)

    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)}w ago`
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`
    return `${Math.floor(diffInSeconds / 31536000)}y ago`
}

/**
 * Checks if a date is today
 */
export function isToday(date: Date | string): boolean {
    const d = new Date(date)
    const today = new Date()

    return (
        d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear()
    )
}

/**
 * Checks if a date is yesterday
 */
export function isYesterday(date: Date | string): boolean {
    const d = new Date(date)
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    return (
        d.getDate() === yesterday.getDate() &&
        d.getMonth() === yesterday.getMonth() &&
        d.getFullYear() === yesterday.getFullYear()
    )
}

/**
 * Checks if a date is this week
 */
export function isThisWeek(date: Date | string): boolean {
    const d = new Date(date)
    const now = new Date()

    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - now.getDay())
    weekStart.setHours(0, 0, 0, 0)

    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 7)

    return d >= weekStart && d < weekEnd
}

/**
 * Gets the start of day
 */
export function startOfDay(date: Date | string = new Date()): Date {
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)
    return d
}

/**
 * Gets the end of day
 */
export function endOfDay(date: Date | string = new Date()): Date {
    const d = new Date(date)
    d.setHours(23, 59, 59, 999)
    return d
}

/**
 * Gets the start of week
 */
export function startOfWeek(date: Date | string = new Date()): Date {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day
    return new Date(d.setDate(diff))
}

/**
 * Gets the end of week
 */
export function endOfWeek(date: Date | string = new Date()): Date {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() + (6 - day)
    return endOfDay(new Date(d.setDate(diff)))
}

/**
 * Gets the start of month
 */
export function startOfMonth(date: Date | string = new Date()): Date {
    const d = new Date(date)
    return new Date(d.getFullYear(), d.getMonth(), 1)
}

/**
 * Gets the end of month
 */
export function endOfMonth(date: Date | string = new Date()): Date {
    const d = new Date(date)
    return endOfDay(new Date(d.getFullYear(), d.getMonth() + 1, 0))
}

/**
 * Adds days to a date
 */
export function addDays(date: Date | string, days: number): Date {
    const d = new Date(date)
    d.setDate(d.getDate() + days)
    return d
}

/**
 * Adds hours to a date
 */
export function addHours(date: Date | string, hours: number): Date {
    const d = new Date(date)
    d.setHours(d.getHours() + hours)
    return d
}

/**
 * Adds minutes to a date
 */
export function addMinutes(date: Date | string, minutes: number): Date {
    const d = new Date(date)
    d.setMinutes(d.getMinutes() + minutes)
    return d
}

/**
 * Gets the difference between two dates in days
 */
export function getDaysDifference(date1: Date | string, date2: Date | string): number {
    const d1 = new Date(date1)
    const d2 = new Date(date2)
    const diffTime = Math.abs(d2.getTime() - d1.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Formats duration in milliseconds to readable string
 */
export function formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) {
        return `${hours}h ${minutes % 60}m`
    }
    if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`
    }
    return `${seconds}s`
}

/**
 * Parses ISO date string safely
 */
export function parseDate(dateString: string): Date | null {
    try {
        const date = new Date(dateString)
        return isNaN(date.getTime()) ? null : date
    } catch {
        return null
    }
}

/**
 * Checks if a date is valid
 */
export function isValidDate(date: any): boolean {
    return date instanceof Date && !isNaN(date.getTime())
}

/**
 * Converts a date to a specific timezone
 */
export function toTimezone(date: Date | string, timezone: string): string {
    const d = new Date(date)
    return new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    }).format(d)
}

/**
 * Gets the user's timezone
 */
export function getUserTimezone(): string {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
}

/**
 * Formats a date range
 */
export function formatDateRange(startDate: Date | string, endDate: Date | string): string {
    const start = new Date(startDate)
    const end = new Date(endDate)

    if (isToday(start) && isToday(end)) {
        return `Today, ${formatTime(start)} - ${formatTime(end)}`
    }

    if (start.toDateString() === end.toDateString()) {
        return `${formatDate(start, 'short')}, ${formatTime(start)} - ${formatTime(end)}`
    }

    return `${formatDate(start, 'short')} - ${formatDate(end, 'short')}`
}

/**
 * Gets the week number of the year
 */
export function getWeekNumber(date: Date | string = new Date()): number {
    const d = new Date(date)
    const firstDayOfYear = new Date(d.getFullYear(), 0, 1)
    const pastDaysOfYear = (d.getTime() - firstDayOfYear.getTime()) / 86400000
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
}

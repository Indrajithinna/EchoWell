/**
 * String formatting utilities for EchoWell
 * Provides common string manipulation and formatting functions
 */

/**
 * Capitalizes the first letter of a string
 */
export function capitalize(str: string): string {
    if (!str) return ''
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Capitalizes the first letter of each word
 */
export function titleCase(str: string): string {
    if (!str) return ''
    return str
        .toLowerCase()
        .split(' ')
        .map(word => capitalize(word))
        .join(' ')
}

/**
 * Converts a string to camelCase
 */
export function toCamelCase(str: string): string {
    return str
        .replace(/(?:^\w|[A-Z]|\b\w)/g, (letter, index) =>
            index === 0 ? letter.toLowerCase() : letter.toUpperCase()
        )
        .replace(/\s+/g, '')
}

/**
 * Converts a string to kebab-case
 */
export function toKebabCase(str: string): string {
    return str
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/[\s_]+/g, '-')
        .toLowerCase()
}

/**
 * Converts a string to snake_case
 */
export function toSnakeCase(str: string): string {
    return str
        .replace(/([a-z])([A-Z])/g, '$1_$2')
        .replace(/[\s-]+/g, '_')
        .toLowerCase()
}

/**
 * Truncates a string to a specified length
 */
export function truncate(str: string, length: number, suffix: string = '...'): string {
    if (!str || str.length <= length) return str
    return str.substring(0, length - suffix.length) + suffix
}

/**
 * Removes all whitespace from a string
 */
export function removeWhitespace(str: string): string {
    return str.replace(/\s+/g, '')
}

/**
 * Pluralizes a word based on count
 */
export function pluralize(word: string, count: number, plural?: string): string {
    if (count === 1) return word
    return plural || `${word}s`
}

/**
 * Formats a number with commas
 */
export function formatNumber(num: number): string {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/**
 * Generates initials from a name
 */
export function getInitials(name: string, maxLength: number = 2): string {
    if (!name) return ''

    const parts = name.trim().split(/\s+/)
    const initials = parts
        .map(part => part.charAt(0).toUpperCase())
        .join('')

    return initials.substring(0, maxLength)
}

/**
 * Slugifies a string for URLs
 */
export function slugify(str: string): string {
    return str
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '')
}

/**
 * Escapes HTML special characters
 */
export function escapeHtml(str: string): string {
    const htmlEscapes: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;',
    }

    return str.replace(/[&<>"'/]/g, char => htmlEscapes[char])
}

/**
 * Unescapes HTML special characters
 */
export function unescapeHtml(str: string): string {
    const htmlUnescapes: Record<string, string> = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#x27;': "'",
        '&#x2F;': '/',
    }

    return str.replace(/&(?:amp|lt|gt|quot|#x27|#x2F);/g, entity => htmlUnescapes[entity])
}

/**
 * Checks if a string is a valid URL
 */
export function isUrl(str: string): boolean {
    try {
        new URL(str)
        return true
    } catch {
        return false
    }
}

/**
 * Extracts domain from URL
 */
export function extractDomain(url: string): string | null {
    try {
        const urlObj = new URL(url)
        return urlObj.hostname
    } catch {
        return null
    }
}

/**
 * Masks sensitive information (e.g., email, phone)
 */
export function maskString(str: string, visibleChars: number = 4, maskChar: string = '*'): string {
    if (!str || str.length <= visibleChars) return str

    const visible = str.slice(-visibleChars)
    const masked = maskChar.repeat(str.length - visibleChars)

    return masked + visible
}

/**
 * Generates a random string
 */
export function randomString(length: number = 10): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''

    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
    }

    return result
}

/**
 * Checks if string contains only numbers
 */
export function isNumeric(str: string): boolean {
    return /^\d+$/.test(str)
}

/**
 * Reverses a string
 */
export function reverse(str: string): string {
    return str.split('').reverse().join('')
}

/**
 * Counts words in a string
 */
export function wordCount(str: string): number {
    return str.trim().split(/\s+/).filter(Boolean).length
}

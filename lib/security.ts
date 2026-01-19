/**
 * Security utilities for EchoWell
 * Provides security-related helper functions
 */

/**
 * Sanitizes HTML to prevent XSS attacks
 */
export function sanitizeHtml(html: string): string {
    const map: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;',
    }

    return html.replace(/[&<>"'/]/g, char => map[char])
}

/**
 * Validates and sanitizes user input
 */
export function sanitizeInput(input: string, maxLength: number = 5000): string {
    // Remove null bytes
    let sanitized = input.replace(/\0/g, '')

    // Trim whitespace
    sanitized = sanitized.trim()

    // Limit length
    if (sanitized.length > maxLength) {
        sanitized = sanitized.substring(0, maxLength)
    }

    return sanitized
}

/**
 * Generates a secure random string
 */
export function generateSecureToken(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''

    // Use crypto.getRandomValues if available (browser)
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
        const randomValues = new Uint8Array(length)
        crypto.getRandomValues(randomValues)

        for (let i = 0; i < length; i++) {
            result += chars[randomValues[i] % chars.length]
        }
    } else {
        // Fallback for Node.js
        for (let i = 0; i < length; i++) {
            result += chars[Math.floor(Math.random() * chars.length)]
        }
    }

    return result
}

/**
 * Hashes a string using a simple hash function
 * Note: For production, use a proper cryptographic hash like bcrypt
 */
export function simpleHash(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i)
        hash = (hash << 5) - hash + char
        hash = hash & hash // Convert to 32-bit integer
    }
    return hash.toString(36)
}

/**
 * Validates password strength
 */
export function validatePasswordStrength(password: string): {
    isValid: boolean
    score: number
    feedback: string[]
} {
    const feedback: string[] = []
    let score = 0

    if (password.length < 8) {
        feedback.push('Password should be at least 8 characters long')
    } else {
        score += 1
    }

    if (password.length >= 12) {
        score += 1
    }

    if (/[a-z]/.test(password)) {
        score += 1
    } else {
        feedback.push('Include lowercase letters')
    }

    if (/[A-Z]/.test(password)) {
        score += 1
    } else {
        feedback.push('Include uppercase letters')
    }

    if (/[0-9]/.test(password)) {
        score += 1
    } else {
        feedback.push('Include numbers')
    }

    if (/[^a-zA-Z0-9]/.test(password)) {
        score += 1
    } else {
        feedback.push('Include special characters')
    }

    // Check for common patterns
    const commonPatterns = ['123456', 'password', 'qwerty', 'abc123']
    if (commonPatterns.some(pattern => password.toLowerCase().includes(pattern))) {
        score = Math.max(0, score - 2)
        feedback.push('Avoid common patterns')
    }

    return {
        isValid: score >= 4,
        score,
        feedback,
    }
}

/**
 * Rate limiting helper
 */
export class RateLimiter {
    private requests: Map<string, number[]> = new Map()

    constructor(
        private maxRequests: number = 100,
        private windowMs: number = 60000
    ) { }

    /**
     * Checks if a request should be allowed
     */
    isAllowed(identifier: string): boolean {
        const now = Date.now()
        const requests = this.requests.get(identifier) || []

        // Remove old requests outside the window
        const validRequests = requests.filter(time => now - time < this.windowMs)

        if (validRequests.length >= this.maxRequests) {
            return false
        }

        // Add current request
        validRequests.push(now)
        this.requests.set(identifier, validRequests)

        return true
    }

    /**
     * Gets remaining requests for an identifier
     */
    getRemaining(identifier: string): number {
        const now = Date.now()
        const requests = this.requests.get(identifier) || []
        const validRequests = requests.filter(time => now - time < this.windowMs)

        return Math.max(0, this.maxRequests - validRequests.length)
    }

    /**
     * Resets rate limit for an identifier
     */
    reset(identifier: string): void {
        this.requests.delete(identifier)
    }

    /**
     * Clears all rate limits
     */
    clear(): void {
        this.requests.clear()
    }
}

/**
 * Masks sensitive data for logging
 */
export function maskSensitiveData(data: string, visibleChars: number = 4): string {
    if (data.length <= visibleChars) {
        return '*'.repeat(data.length)
    }

    const visible = data.slice(-visibleChars)
    const masked = '*'.repeat(data.length - visibleChars)

    return masked + visible
}

/**
 * Validates CSRF token
 */
export function validateCsrfToken(token: string, expectedToken: string): boolean {
    if (!token || !expectedToken) {
        return false
    }

    // Constant-time comparison to prevent timing attacks
    if (token.length !== expectedToken.length) {
        return false
    }

    let result = 0
    for (let i = 0; i < token.length; i++) {
        result |= token.charCodeAt(i) ^ expectedToken.charCodeAt(i)
    }

    return result === 0
}

/**
 * Checks if a URL is safe (prevents open redirect vulnerabilities)
 */
export function isSafeUrl(url: string, allowedDomains: string[] = []): boolean {
    try {
        const parsed = new URL(url)

        // Only allow http and https protocols
        if (!['http:', 'https:'].includes(parsed.protocol)) {
            return false
        }

        // If allowed domains specified, check against them
        if (allowedDomains.length > 0) {
            return allowedDomains.some(domain => parsed.hostname.endsWith(domain))
        }

        return true
    } catch {
        return false
    }
}

/**
 * Removes potentially dangerous characters from filenames
 */
export function sanitizeFilename(filename: string): string {
    return filename
        .replace(/[^a-zA-Z0-9._-]/g, '_')
        .replace(/_{2,}/g, '_')
        .substring(0, 255)
}

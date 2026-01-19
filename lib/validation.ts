/**
 * Validation utilities for EchoWell
 * Provides type-safe validation functions for user inputs and data
 */

export interface ValidationResult {
    isValid: boolean
    error?: string
}

/**
 * Validates email format
 */
export function validateEmail(email: string): ValidationResult {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!email || email.trim().length === 0) {
        return { isValid: false, error: 'Email is required' }
    }

    if (!emailRegex.test(email)) {
        return { isValid: false, error: 'Invalid email format' }
    }

    return { isValid: true }
}

/**
 * Validates message content
 */
export function validateMessage(message: string): ValidationResult {
    if (!message || message.trim().length === 0) {
        return { isValid: false, error: 'Message cannot be empty' }
    }

    if (message.length > 5000) {
        return { isValid: false, error: 'Message is too long (max 5000 characters)' }
    }

    return { isValid: true }
}

/**
 * Validates mood score (1-10)
 */
export function validateMoodScore(score: number): ValidationResult {
    if (typeof score !== 'number' || isNaN(score)) {
        return { isValid: false, error: 'Mood score must be a number' }
    }

    if (score < 1 || score > 10) {
        return { isValid: false, error: 'Mood score must be between 1 and 10' }
    }

    return { isValid: true }
}

/**
 * Validates session duration in minutes
 */
export function validateSessionDuration(duration: number): ValidationResult {
    if (typeof duration !== 'number' || isNaN(duration)) {
        return { isValid: false, error: 'Duration must be a number' }
    }

    if (duration < 0) {
        return { isValid: false, error: 'Duration cannot be negative' }
    }

    if (duration > 480) { // 8 hours max
        return { isValid: false, error: 'Session duration too long (max 8 hours)' }
    }

    return { isValid: true }
}

/**
 * Sanitizes user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
    return input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;')
}

/**
 * Validates API key format
 */
export function validateApiKey(key: string, prefix: string): ValidationResult {
    if (!key || key.trim().length === 0) {
        return { isValid: false, error: 'API key is required' }
    }

    if (!key.startsWith(prefix)) {
        return { isValid: false, error: `API key must start with ${prefix}` }
    }

    if (key.length < 20) {
        return { isValid: false, error: 'API key is too short' }
    }

    return { isValid: true }
}

/**
 * Validates password strength
 */
export function validatePassword(password: string): ValidationResult & { strength?: 'weak' | 'medium' | 'strong' } {
    if (!password || password.length === 0) {
        return { isValid: false, error: 'Password is required' }
    }

    if (password.length < 8) {
        return { isValid: false, error: 'Password must be at least 8 characters long' }
    }

    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

    const criteriaMet = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length

    if (criteriaMet < 3) {
        return {
            isValid: false,
            error: 'Password must contain at least 3 of: uppercase, lowercase, numbers, special characters',
            strength: 'weak'
        }
    }

    const strength = criteriaMet === 4 ? 'strong' : 'medium'

    return { isValid: true, strength }
}

/**
 * Validates username format
 */
export function validateUsername(username: string): ValidationResult {
    if (!username || username.trim().length === 0) {
        return { isValid: false, error: 'Username is required' }
    }

    if (username.length < 3) {
        return { isValid: false, error: 'Username must be at least 3 characters long' }
    }

    if (username.length > 30) {
        return { isValid: false, error: 'Username must be less than 30 characters' }
    }

    const usernameRegex = /^[a-zA-Z0-9_-]+$/
    if (!usernameRegex.test(username)) {
        return { isValid: false, error: 'Username can only contain letters, numbers, underscores, and hyphens' }
    }

    return { isValid: true }
}

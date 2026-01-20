/**
 * Type guard utilities for EchoWell
 * Provides runtime type checking for better type safety
 */

/**
 * Checks if value is a non-empty string
 */
export function isNonEmptyString(value: unknown): value is string {
    return typeof value === 'string' && value.trim().length > 0
}

/**
 * Checks if value is a valid number
 */
export function isValidNumber(value: unknown): value is number {
    return typeof value === 'number' && !isNaN(value) && isFinite(value)
}

/**
 * Checks if value is a valid date
 */
export function isValidDate(value: unknown): value is Date {
    return value instanceof Date && !isNaN(value.getTime())
}

/**
 * Checks if value is a valid email
 */
export function isEmail(value: unknown): value is string {
    if (typeof value !== 'string') return false
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(value)
}

/**
 * Checks if value is a valid URL
 */
export function isUrl(value: unknown): value is string {
    if (typeof value !== 'string') return false
    try {
        new URL(value)
        return true
    } catch {
        return false
    }
}

/**
 * Checks if value is an array
 */
export function isArray<T>(value: unknown): value is T[] {
    return Array.isArray(value)
}

/**
 * Checks if value is a non-empty array
 */
export function isNonEmptyArray<T>(value: unknown): value is T[] {
    return Array.isArray(value) && value.length > 0
}

/**
 * Checks if value is a plain object
 */
export function isPlainObject(value: unknown): value is Record<string, any> {
    return (
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value) &&
        !(value instanceof Date)
    )
}

/**
 * Checks if value is null or undefined
 */
export function isNullish(value: unknown): value is null | undefined {
    return value === null || value === undefined
}

/**
 * Checks if value is defined (not null or undefined)
 */
export function isDefined<T>(value: T | null | undefined): value is T {
    return value !== null && value !== undefined
}

/**
 * Checks if value is a function
 */
export function isFunction(value: unknown): value is Function {
    return typeof value === 'function'
}

/**
 * Checks if value is a valid mood score (1-10)
 */
export function isMoodScore(value: unknown): value is number {
    return isValidNumber(value) && value >= 1 && value <= 10
}

/**
 * Checks if value is a valid message role
 */
export function isMessageRole(value: unknown): value is 'user' | 'assistant' {
    return value === 'user' || value === 'assistant'
}

/**
 * Checks if object has required properties
 */
export function hasProperties<T extends string>(
    obj: unknown,
    ...props: T[]
): obj is Record<T, unknown> {
    if (!isPlainObject(obj)) return false
    return props.every(prop => prop in obj)
}

/**
 * Type guard for Error objects
 */
export function isError(value: unknown): value is Error {
    return value instanceof Error
}

/**
 * Checks if value is a valid UUID
 */
export function isUUID(value: unknown): value is string {
    if (typeof value !== 'string') return false
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    return uuidRegex.test(value)
}

/**
 * Checks if value is a valid JSON string
 */
export function isJsonString(value: unknown): value is string {
    if (typeof value !== 'string') return false
    try {
        JSON.parse(value)
        return true
    } catch {
        return false
    }
}

/**
 * Checks if value is a Promise
 */
export function isPromise<T>(value: unknown): value is Promise<T> {
    return (
        value instanceof Promise ||
        (isPlainObject(value) && typeof (value as any).then === 'function')
    )
}

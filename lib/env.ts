/**
 * Environment variable utilities for EchoWell
 * Provides type-safe access to environment variables
 */

import { isNonEmptyString } from './type-guards'

/**
 * Gets a required environment variable
 * Throws an error if the variable is not set
 */
export function getRequiredEnv(key: string): string {
    const value = process.env[key]

    if (!isNonEmptyString(value)) {
        throw new Error(`Required environment variable ${key} is not set`)
    }

    return value
}

/**
 * Gets an optional environment variable with a default value
 */
export function getEnv(key: string, defaultValue: string = ''): string {
    const value = process.env[key]
    return isNonEmptyString(value) ? value : defaultValue
}

/**
 * Gets a boolean environment variable
 */
export function getBooleanEnv(key: string, defaultValue: boolean = false): boolean {
    const value = process.env[key]

    if (!isNonEmptyString(value)) {
        return defaultValue
    }

    return value.toLowerCase() === 'true' || value === '1'
}

/**
 * Gets a number environment variable
 */
export function getNumberEnv(key: string, defaultValue: number = 0): number {
    const value = process.env[key]

    if (!isNonEmptyString(value)) {
        return defaultValue
    }

    const parsed = Number(value)
    return isNaN(parsed) ? defaultValue : parsed
}

/**
 * Gets a JSON environment variable
 */
export function getJsonEnv<T>(key: string, defaultValue: T): T {
    const value = process.env[key]

    if (!isNonEmptyString(value)) {
        return defaultValue
    }

    try {
        return JSON.parse(value) as T
    } catch {
        console.warn(`Failed to parse JSON for ${key}, using default value`)
        return defaultValue
    }
}

/**
 * Validates that all required environment variables are set
 */
export function validateEnv(requiredKeys: string[]): void {
    const missing = requiredKeys.filter(key => !isNonEmptyString(process.env[key]))

    if (missing.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missing.join(', ')}\n` +
            'Please check your .env file and ensure all required variables are set.'
        )
    }
}

/**
 * Gets the current environment (development, production, test)
 */
export function getEnvironment(): 'development' | 'production' | 'test' {
    const env = process.env.NODE_ENV?.toLowerCase()

    if (env === 'production') return 'production'
    if (env === 'test') return 'test'
    return 'development'
}

/**
 * Checks if running in development mode
 */
export function isDevelopment(): boolean {
    return getEnvironment() === 'development'
}

/**
 * Checks if running in production mode
 */
export function isProduction(): boolean {
    return getEnvironment() === 'production'
}

/**
 * Checks if running in test mode
 */
export function isTest(): boolean {
    return getEnvironment() === 'test'
}

// Pre-configured environment variables for EchoWell
export const ENV = {
    // Node Environment
    NODE_ENV: getEnvironment(),
    IS_DEV: isDevelopment(),
    IS_PROD: isProduction(),

    // API Keys
    OPENAI_API_KEY: getEnv('OPENAI_API_KEY'),
    GEMINI_API_KEY: getEnv('GEMINI_API_KEY'),

    // Authentication
    NEXTAUTH_URL: getEnv('NEXTAUTH_URL', 'http://localhost:3000'),
    NEXTAUTH_SECRET: getEnv('NEXTAUTH_SECRET'),
    GOOGLE_CLIENT_ID: getEnv('GOOGLE_CLIENT_ID'),
    GOOGLE_CLIENT_SECRET: getEnv('GOOGLE_CLIENT_SECRET'),

    // Database
    SUPABASE_URL: getEnv('SUPABASE_URL'),
    SUPABASE_ANON_KEY: getEnv('SUPABASE_ANON_KEY'),
    SUPABASE_SERVICE_KEY: getEnv('SUPABASE_SERVICE_KEY'),

    // Optional Services
    SPOTIFY_CLIENT_ID: getEnv('SPOTIFY_CLIENT_ID'),
    SPOTIFY_CLIENT_SECRET: getEnv('SPOTIFY_CLIENT_SECRET'),

    // Feature Flags
    ENABLE_VOICE: getBooleanEnv('ENABLE_VOICE', true),
    ENABLE_MUSIC: getBooleanEnv('ENABLE_MUSIC', true),
    ENABLE_ANALYTICS: getBooleanEnv('ENABLE_ANALYTICS', true),
} as const

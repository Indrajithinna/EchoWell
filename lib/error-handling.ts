/**
 * Error handling utilities for EchoWell
 * Provides consistent error handling and logging across the application
 */

export class AppError extends Error {
    constructor(
        message: string,
        public code: string,
        public statusCode: number = 500,
        public isOperational: boolean = true
    ) {
        super(message)
        this.name = this.constructor.name
        if (typeof (Error as any).captureStackTrace === 'function') {
            (Error as any).captureStackTrace(this, this.constructor)
        }
    }
}

export class ValidationError extends AppError {
    constructor(message: string) {
        super(message, 'VALIDATION_ERROR', 400)
    }
}

export class AuthenticationError extends AppError {
    constructor(message: string = 'Authentication required') {
        super(message, 'AUTH_ERROR', 401)
    }
}

export class NotFoundError extends AppError {
    constructor(resource: string) {
        super(`${resource} not found`, 'NOT_FOUND', 404)
    }
}

export class RateLimitError extends AppError {
    constructor(message: string = 'Too many requests') {
        super(message, 'RATE_LIMIT', 429)
    }
}

export class ExternalServiceError extends AppError {
    constructor(service: string, message?: string) {
        super(
            message || `${service} service is currently unavailable`,
            'EXTERNAL_SERVICE_ERROR',
            503
        )
    }
}

/**
 * Safely handles async operations with error catching
 */
export async function safeAsync<T>(
    promise: Promise<T>,
    errorMessage?: string
): Promise<[T | null, Error | null]> {
    try {
        const data = await promise
        return [data, null]
    } catch (error) {
        const err = error instanceof Error ? error : new Error(errorMessage || 'Unknown error')
        return [null, err]
    }
}

/**
 * Logs errors with context
 */
export function logError(error: Error, context?: Record<string, any>) {
    console.error('Error occurred:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        context,
        timestamp: new Date().toISOString(),
    })
}

/**
 * Formats error for client response
 */
export function formatErrorResponse(error: Error) {
    if (error instanceof AppError) {
        return {
            error: {
                message: error.message,
                code: error.code,
                statusCode: error.statusCode,
            },
        }
    }

    // Don't expose internal errors to client
    return {
        error: {
            message: 'An unexpected error occurred',
            code: 'INTERNAL_ERROR',
            statusCode: 500,
        },
    }
}

/**
 * Retry logic for failed operations
 */
export async function retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delayMs: number = 1000
): Promise<T> {
    let lastError: Error

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await operation()
        } catch (error) {
            lastError = error instanceof Error ? error : new Error('Unknown error')

            if (attempt < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, delayMs * attempt))
            }
        }
    }

    throw lastError!
}

/**
 * Rate limiting utilities for EchoWell
 * Provides in-memory rate limiting for API endpoints
 */

interface RateLimitEntry {
    count: number
    resetTime: number
}

export class RateLimiter {
    private requests: Map<string, RateLimitEntry> = new Map()
    private maxRequests: number
    private windowMs: number

    constructor(maxRequests: number = 100, windowMs: number = 60000) {
        this.maxRequests = maxRequests
        this.windowMs = windowMs
    }

    /**
     * Checks if a request should be allowed
     */
    check(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
        const now = Date.now()
        const entry = this.requests.get(identifier)

        // Clean up expired entries
        if (entry && now > entry.resetTime) {
            this.requests.delete(identifier)
        }

        const current = this.requests.get(identifier)

        if (!current) {
            // First request
            this.requests.set(identifier, {
                count: 1,
                resetTime: now + this.windowMs,
            })

            return {
                allowed: true,
                remaining: this.maxRequests - 1,
                resetTime: now + this.windowMs,
            }
        }

        if (current.count >= this.maxRequests) {
            return {
                allowed: false,
                remaining: 0,
                resetTime: current.resetTime,
            }
        }

        // Increment count
        current.count++

        return {
            allowed: true,
            remaining: this.maxRequests - current.count,
            resetTime: current.resetTime,
        }
    }

    /**
     * Resets the rate limit for a specific identifier
     */
    reset(identifier: string): void {
        this.requests.delete(identifier)
    }

    /**
     * Clears all rate limit entries
     */
    clear(): void {
        this.requests.clear()
    }

    /**
     * Cleans up expired entries
     */
    cleanup(): void {
        const now = Date.now()
        const keysToDelete: string[] = []

        this.requests.forEach((entry, key) => {
            if (now > entry.resetTime) {
                keysToDelete.push(key)
            }
        })

        keysToDelete.forEach(key => this.requests.delete(key))
    }
}

// Export singleton instances for different use cases
export const apiRateLimiter = new RateLimiter(100, 60000) // 100 requests per minute
export const authRateLimiter = new RateLimiter(5, 300000) // 5 requests per 5 minutes
export const aiRateLimiter = new RateLimiter(20, 60000) // 20 AI requests per minute

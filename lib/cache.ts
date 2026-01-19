/**
 * Caching utilities for EchoWell
 * Provides in-memory caching with TTL support
 */

interface CacheEntry<T> {
    value: T
    expiresAt: number
}

export class Cache<T = any> {
    private store: Map<string, CacheEntry<T>> = new Map()
    private defaultTTL: number

    constructor(defaultTTL: number = 300000) { // 5 minutes default
        this.defaultTTL = defaultTTL
    }

    /**
     * Sets a value in the cache
     */
    set(key: string, value: T, ttl?: number): void {
        const expiresAt = Date.now() + (ttl || this.defaultTTL)
        this.store.set(key, { value, expiresAt })
    }

    /**
     * Gets a value from the cache
     */
    get(key: string): T | null {
        const entry = this.store.get(key)

        if (!entry) {
            return null
        }

        if (Date.now() > entry.expiresAt) {
            this.store.delete(key)
            return null
        }

        return entry.value
    }

    /**
     * Checks if a key exists and is not expired
     */
    has(key: string): boolean {
        return this.get(key) !== null
    }

    /**
     * Deletes a key from the cache
     */
    delete(key: string): boolean {
        return this.store.delete(key)
    }

    /**
     * Clears all entries from the cache
     */
    clear(): void {
        this.store.clear()
    }

    /**
     * Gets or sets a value using a factory function
     */
    async getOrSet(
        key: string,
        factory: () => Promise<T>,
        ttl?: number
    ): Promise<T> {
        const cached = this.get(key)

        if (cached !== null) {
            return cached
        }

        const value = await factory()
        this.set(key, value, ttl)
        return value
    }

    /**
     * Removes expired entries
     */
    cleanup(): void {
        const now = Date.now()
        const keysToDelete: string[] = []

        this.store.forEach((entry, key) => {
            if (now > entry.expiresAt) {
                keysToDelete.push(key)
            }
        })

        keysToDelete.forEach(key => this.store.delete(key))
    }

    /**
     * Gets the number of entries in the cache
     */
    size(): number {
        this.cleanup()
        return this.store.size
    }

    /**
     * Gets all keys in the cache
     */
    keys(): string[] {
        this.cleanup()
        return Array.from(this.store.keys())
    }
}

// Export singleton instances for different use cases
export const apiCache = new Cache(300000) // 5 minutes
export const userCache = new Cache(600000) // 10 minutes
export const sessionCache = new Cache(1800000) // 30 minutes

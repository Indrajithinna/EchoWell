/**
 * Performance monitoring utilities for EchoWell
 * Provides tools to measure and track application performance
 */

interface PerformanceMetric {
    name: string
    duration: number
    timestamp: number
    metadata?: Record<string, any>
}

class PerformanceMonitor {
    private metrics: PerformanceMetric[] = []
    private timers: Map<string, number> = new Map()
    private maxMetrics: number = 1000

    /**
     * Starts a performance timer
     */
    start(name: string): void {
        this.timers.set(name, performance.now())
    }

    /**
     * Ends a performance timer and records the metric
     */
    end(name: string, metadata?: Record<string, any>): number | null {
        const startTime = this.timers.get(name)

        if (!startTime) {
            console.warn(`Performance timer "${name}" was not started`)
            return null
        }

        const duration = performance.now() - startTime
        this.timers.delete(name)

        this.recordMetric({
            name,
            duration,
            timestamp: Date.now(),
            metadata,
        })

        return duration
    }

    /**
     * Measures an async operation
     */
    async measure<T>(
        name: string,
        operation: () => Promise<T>,
        metadata?: Record<string, any>
    ): Promise<T> {
        this.start(name)
        try {
            const result = await operation()
            this.end(name, metadata)
            return result
        } catch (error) {
            this.end(name, { ...metadata, error: true })
            throw error
        }
    }

    /**
     * Measures a synchronous operation
     */
    measureSync<T>(
        name: string,
        operation: () => T,
        metadata?: Record<string, any>
    ): T {
        this.start(name)
        try {
            const result = operation()
            this.end(name, metadata)
            return result
        } catch (error) {
            this.end(name, { ...metadata, error: true })
            throw error
        }
    }

    /**
     * Records a metric manually
     */
    private recordMetric(metric: PerformanceMetric): void {
        this.metrics.push(metric)

        // Keep only the most recent metrics
        if (this.metrics.length > this.maxMetrics) {
            this.metrics.shift()
        }
    }

    /**
     * Gets all recorded metrics
     */
    getMetrics(name?: string): PerformanceMetric[] {
        if (name) {
            return this.metrics.filter(m => m.name === name)
        }
        return [...this.metrics]
    }

    /**
     * Gets average duration for a metric
     */
    getAverage(name: string): number | null {
        const metrics = this.getMetrics(name)

        if (metrics.length === 0) {
            return null
        }

        const total = metrics.reduce((sum, m) => sum + m.duration, 0)
        return total / metrics.length
    }

    /**
     * Gets the slowest metric
     */
    getSlowest(name?: string): PerformanceMetric | null {
        const metrics = name ? this.getMetrics(name) : this.metrics

        if (metrics.length === 0) {
            return null
        }

        return metrics.reduce((slowest, current) =>
            current.duration > slowest.duration ? current : slowest
        )
    }

    /**
     * Gets performance summary
     */
    getSummary(name?: string): {
        count: number
        average: number
        min: number
        max: number
    } | null {
        const metrics = name ? this.getMetrics(name) : this.metrics

        if (metrics.length === 0) {
            return null
        }

        const durations = metrics.map(m => m.duration)

        return {
            count: metrics.length,
            average: durations.reduce((a, b) => a + b, 0) / durations.length,
            min: Math.min(...durations),
            max: Math.max(...durations),
        }
    }

    /**
     * Clears all metrics
     */
    clear(): void {
        this.metrics = []
        this.timers.clear()
    }

    /**
     * Logs performance summary to console
     */
    logSummary(name?: string): void {
        const summary = this.getSummary(name)

        if (!summary) {
            console.log('No performance metrics recorded')
            return
        }

        console.group(`Performance Summary${name ? ` - ${name}` : ''}`)
        console.log(`Count: ${summary.count}`)
        console.log(`Average: ${summary.average.toFixed(2)}ms`)
        console.log(`Min: ${summary.min.toFixed(2)}ms`)
        console.log(`Max: ${summary.max.toFixed(2)}ms`)
        console.groupEnd()
    }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor()

// Export convenience functions
export const perf = {
    start: (name: string) => performanceMonitor.start(name),
    end: (name: string, metadata?: Record<string, any>) => performanceMonitor.end(name, metadata),
    measure: <T>(name: string, operation: () => Promise<T>, metadata?: Record<string, any>) =>
        performanceMonitor.measure(name, operation, metadata),
    measureSync: <T>(name: string, operation: () => T, metadata?: Record<string, any>) =>
        performanceMonitor.measureSync(name, operation, metadata),
    getSummary: (name?: string) => performanceMonitor.getSummary(name),
    logSummary: (name?: string) => performanceMonitor.logSummary(name),
}

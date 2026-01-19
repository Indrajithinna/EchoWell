/**
 * Logging utility for EchoWell
 * Provides structured logging with different levels
 */

import { isDevelopment, isProduction } from './env'

export enum LogLevel {
    DEBUG = 'DEBUG',
    INFO = 'INFO',
    WARN = 'WARN',
    ERROR = 'ERROR',
}

interface LogEntry {
    level: LogLevel
    message: string
    timestamp: string
    context?: Record<string, any>
    error?: Error
}

class Logger {
    private minLevel: LogLevel

    constructor() {
        this.minLevel = isProduction() ? LogLevel.INFO : LogLevel.DEBUG
    }

    /**
     * Sets the minimum log level
     */
    setMinLevel(level: LogLevel): void {
        this.minLevel = level
    }

    /**
     * Checks if a log level should be logged
     */
    private shouldLog(level: LogLevel): boolean {
        const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR]
        return levels.indexOf(level) >= levels.indexOf(this.minLevel)
    }

    /**
     * Formats a log entry
     */
    private formatLog(entry: LogEntry): string {
        const { level, message, timestamp, context } = entry
        let log = `[${timestamp}] ${level}: ${message}`

        if (context && Object.keys(context).length > 0) {
            log += `\nContext: ${JSON.stringify(context, null, 2)}`
        }

        if (entry.error) {
            log += `\nError: ${entry.error.message}\nStack: ${entry.error.stack}`
        }

        return log
    }

    /**
     * Creates a log entry
     */
    private createEntry(
        level: LogLevel,
        message: string,
        context?: Record<string, any>,
        error?: Error
    ): LogEntry {
        return {
            level,
            message,
            timestamp: new Date().toISOString(),
            context,
            error,
        }
    }

    /**
     * Logs a message
     */
    private log(
        level: LogLevel,
        message: string,
        context?: Record<string, any>,
        error?: Error
    ): void {
        if (!this.shouldLog(level)) return

        const entry = this.createEntry(level, message, context, error)
        const formatted = this.formatLog(entry)

        switch (level) {
            case LogLevel.DEBUG:
                console.debug(formatted)
                break
            case LogLevel.INFO:
                console.info(formatted)
                break
            case LogLevel.WARN:
                console.warn(formatted)
                break
            case LogLevel.ERROR:
                console.error(formatted)
                break
        }

        // In production, you might want to send logs to a service
        if (isProduction() && level === LogLevel.ERROR) {
            this.sendToErrorTracking(entry)
        }
    }

    /**
     * Sends error logs to tracking service (placeholder)
     */
    private sendToErrorTracking(entry: LogEntry): void {
        // TODO: Implement error tracking service integration (e.g., Sentry)
        // For now, just ensure it's logged
    }

    /**
     * Debug level logging
     */
    debug(message: string, context?: Record<string, any>): void {
        this.log(LogLevel.DEBUG, message, context)
    }

    /**
     * Info level logging
     */
    info(message: string, context?: Record<string, any>): void {
        this.log(LogLevel.INFO, message, context)
    }

    /**
     * Warning level logging
     */
    warn(message: string, context?: Record<string, any>): void {
        this.log(LogLevel.WARN, message, context)
    }

    /**
     * Error level logging
     */
    error(message: string, error?: Error, context?: Record<string, any>): void {
        this.log(LogLevel.ERROR, message, context, error)
    }

    /**
     * Logs API requests
     */
    logRequest(method: string, url: string, context?: Record<string, any>): void {
        this.info(`API Request: ${method} ${url}`, context)
    }

    /**
     * Logs API responses
     */
    logResponse(
        method: string,
        url: string,
        statusCode: number,
        duration: number
    ): void {
        this.info(`API Response: ${method} ${url}`, {
            statusCode,
            duration: `${duration}ms`,
        })
    }

    /**
     * Logs database queries (development only)
     */
    logQuery(query: string, params?: any[]): void {
        if (isDevelopment()) {
            this.debug('Database Query', { query, params })
        }
    }

    /**
     * Logs user actions
     */
    logUserAction(userId: string, action: string, context?: Record<string, any>): void {
        this.info(`User Action: ${action}`, { userId, ...context })
    }

    /**
     * Logs performance metrics
     */
    logPerformance(operation: string, duration: number, context?: Record<string, any>): void {
        const level = duration > 1000 ? LogLevel.WARN : LogLevel.DEBUG
        this.log(level, `Performance: ${operation}`, {
            duration: `${duration}ms`,
            ...context,
        })
    }
}

// Export singleton instance
export const logger = new Logger()

// Export convenience functions
export const log = {
    debug: (message: string, context?: Record<string, any>) => logger.debug(message, context),
    info: (message: string, context?: Record<string, any>) => logger.info(message, context),
    warn: (message: string, context?: Record<string, any>) => logger.warn(message, context),
    error: (message: string, error?: Error, context?: Record<string, any>) =>
        logger.error(message, error, context),
    request: (method: string, url: string, context?: Record<string, any>) =>
        logger.logRequest(method, url, context),
    response: (method: string, url: string, statusCode: number, duration: number) =>
        logger.logResponse(method, url, statusCode, duration),
    query: (query: string, params?: any[]) => logger.logQuery(query, params),
    userAction: (userId: string, action: string, context?: Record<string, any>) =>
        logger.logUserAction(userId, action, context),
    performance: (operation: string, duration: number, context?: Record<string, any>) =>
        logger.logPerformance(operation, duration, context),
}

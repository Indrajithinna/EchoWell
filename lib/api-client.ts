/**
 * API client utilities for EchoWell
 * Provides a consistent interface for making API requests
 */

import { logger } from './logger'
import { retryOperation } from './error-handling'
import type { ApiResponse } from '@/types/api'

export interface RequestOptions extends RequestInit {
    timeout?: number
    retry?: boolean
    maxRetries?: number
}

export type RequestInterceptor = (config: RequestOptions) => RequestOptions | Promise<RequestOptions>
export type ResponseInterceptor = <T>(response: ApiResponse<T>) => ApiResponse<T> | Promise<ApiResponse<T>>

export class ApiClient {
    private baseUrl: string
    private defaultHeaders: HeadersInit
    private requestInterceptors: RequestInterceptor[] = []
    private responseInterceptors: ResponseInterceptor[] = []

    constructor(baseUrl: string = '', defaultHeaders: HeadersInit = {}) {
        this.baseUrl = baseUrl
        this.defaultHeaders = {
            'Content-Type': 'application/json',
            ...defaultHeaders,
        }
    }

    /**
     * Adds a request interceptor
     */
    addRequestInterceptor(interceptor: RequestInterceptor): void {
        this.requestInterceptors.push(interceptor)
    }

    /**
     * Adds a response interceptor
     */
    addResponseInterceptor(interceptor: ResponseInterceptor): void {
        this.responseInterceptors.push(interceptor)
    }

    /**
     * Makes an HTTP request with timeout and retry support
     */
    private async request<T>(
        endpoint: string,
        options: RequestOptions = {}
    ): Promise<ApiResponse<T>> {
        // Apply request interceptors
        let processedOptions = options
        for (const interceptor of this.requestInterceptors) {
            processedOptions = await interceptor(processedOptions)
        }

        const {
            timeout = 30000,
            retry = false,
            maxRetries = 3,
            headers,
            ...fetchOptions
        } = processedOptions

        const url = `${this.baseUrl}${endpoint}`
        const startTime = Date.now()

        const makeRequest = async (): Promise<ApiResponse<T>> => {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), timeout)

            try {
                logger.logRequest(fetchOptions.method || 'GET', url)

                const response = await fetch(url, {
                    ...fetchOptions,
                    headers: {
                        ...this.defaultHeaders,
                        ...headers,
                    },
                    signal: controller.signal,
                })

                clearTimeout(timeoutId)

                const duration = Date.now() - startTime
                logger.logResponse(fetchOptions.method || 'GET', url, response.status, duration)

                const data = await response.json()

                let result: ApiResponse<T>

                if (!response.ok) {
                    result = {
                        success: false,
                        error: {
                            code: data.code || 'API_ERROR',
                            message: data.message || 'An error occurred',
                            statusCode: response.status,
                        },
                    }
                } else {
                    result = {
                        success: true,
                        data: data.data || data,
                        metadata: {
                            timestamp: new Date().toISOString(),
                        },
                    }
                }

                // Apply response interceptors
                for (const interceptor of this.responseInterceptors) {
                    result = await interceptor(result)
                }

                return result
            } catch (error) {
                clearTimeout(timeoutId)

                if (error instanceof Error) {
                    logger.error('API request failed', error, { url, method: fetchOptions.method })

                    let result: ApiResponse<T> = {
                        success: false,
                        error: {
                            code: 'NETWORK_ERROR',
                            message: error.message,
                            statusCode: 0,
                        },
                    }

                    // Apply response interceptors even for errors
                    for (const interceptor of this.responseInterceptors) {
                        result = await interceptor(result)
                    }

                    return result
                }

                throw error
            }
        }

        if (retry) {
            return retryOperation(makeRequest, maxRetries)
        }

        return makeRequest()
    }

    /**
     * GET request
     */
    async get<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'GET',
        })
    }

    /**
     * POST request
     */
    async post<T>(
        endpoint: string,
        data?: any,
        options?: RequestOptions
    ): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'POST',
            body: JSON.stringify(data),
        })
    }

    /**
     * PUT request
     */
    async put<T>(
        endpoint: string,
        data?: any,
        options?: RequestOptions
    ): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(data),
        })
    }

    /**
     * PATCH request
     */
    async patch<T>(
        endpoint: string,
        data?: any,
        options?: RequestOptions
    ): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'PATCH',
            body: JSON.stringify(data),
        })
    }

    /**
     * DELETE request
     */
    async delete<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'DELETE',
        })
    }

    /**
     * Upload file
     */
    async upload<T>(
        endpoint: string,
        file: File,
        additionalData?: Record<string, any>
    ): Promise<ApiResponse<T>> {
        const formData = new FormData()
        formData.append('file', file)

        if (additionalData) {
            Object.entries(additionalData).forEach(([key, value]) => {
                formData.append(key, String(value))
            })
        }

        return this.request<T>(endpoint, {
            method: 'POST',
            body: formData,
            headers: {
                // Don't set Content-Type for FormData, browser will set it with boundary
            },
        })
    }

    /**
     * Sets authorization header
     */
    setAuthToken(token: string): void {
        this.defaultHeaders = {
            ...this.defaultHeaders,
            Authorization: `Bearer ${token}`,
        }
    }

    /**
     * Removes authorization header
     */
    clearAuthToken(): void {
        const { Authorization, ...rest } = this.defaultHeaders as any
        this.defaultHeaders = rest
    }
}

// Export singleton instance for internal API
export const apiClient = new ApiClient('/api')

// Export convenience functions
export const api = {
    get: <T>(endpoint: string, options?: RequestOptions) =>
        apiClient.get<T>(endpoint, options),
    post: <T>(endpoint: string, data?: any, options?: RequestOptions) =>
        apiClient.post<T>(endpoint, data, options),
    put: <T>(endpoint: string, data?: any, options?: RequestOptions) =>
        apiClient.put<T>(endpoint, data, options),
    patch: <T>(endpoint: string, data?: any, options?: RequestOptions) =>
        apiClient.patch<T>(endpoint, data, options),
    delete: <T>(endpoint: string, options?: RequestOptions) =>
        apiClient.delete<T>(endpoint, options),
    upload: <T>(endpoint: string, file: File, additionalData?: Record<string, any>) =>
        apiClient.upload<T>(endpoint, file, additionalData),
}

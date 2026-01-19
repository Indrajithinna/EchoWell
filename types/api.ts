/**
 * API response type definitions for EchoWell
 */

export interface ApiResponse<T = any> {
    success: boolean
    data?: T
    error?: ApiError
    metadata?: ResponseMetadata
}

export interface ApiError {
    code: string
    message: string
    details?: Record<string, any>
    statusCode?: number
}

export interface ResponseMetadata {
    timestamp: string
    requestId?: string
    version?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination: {
        page: number
        pageSize: number
        total: number
        totalPages: number
        hasNext: boolean
        hasPrevious: boolean
    }
}

// Chat API Types
export interface ChatMessage {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
    metadata?: {
        emotionalTone?: string
        confidence?: number
        voiceAnalysis?: VoiceAnalysisData
    }
}

export interface VoiceAnalysisData {
    pitch: number
    energy: number
    speechRate: number
    emotionalState: string
    confidence: number
}

export interface ChatRequest {
    message: string
    conversationId?: string
    userId: string
    voiceData?: {
        audioBlob: Blob
        duration: number
    }
}

export interface ChatResponse extends ApiResponse<ChatMessage> {
    suggestions?: string[]
    emotionalInsight?: EmotionalInsight
}

export interface EmotionalInsight {
    currentMood: number
    trend: 'improving' | 'stable' | 'declining'
    recommendations: string[]
}

// Session Types
export interface SessionData {
    id: string
    userId: string
    startTime: Date
    endTime?: Date
    duration: number
    messageCount: number
    averageMood: number
    topics: string[]
}

export interface SessionSummary {
    totalSessions: number
    totalDuration: number
    averageMood: number
    moodTrend: Array<{ date: string; score: number }>
    topTopics: Array<{ topic: string; count: number }>
}

// User Types
export interface UserProfile {
    id: string
    email: string
    name?: string
    avatar?: string
    preferences: UserPreferences
    createdAt: Date
    lastActive: Date
}

export interface UserPreferences {
    theme: 'light' | 'dark' | 'auto'
    voiceEnabled: boolean
    musicTherapy: boolean
    notifications: boolean
    language: string
}

// Analytics Types
export interface AnalyticsData {
    userId: string
    period: 'day' | 'week' | 'month' | 'year'
    moodHistory: Array<{ date: string; score: number }>
    sessionStats: {
        total: number
        averageDuration: number
        totalMessages: number
    }
    insights: string[]
}

// Music Therapy Types
export interface MusicRecommendation {
    id: string
    title: string
    artist: string
    url: string
    mood: string
    duration: number
    thumbnail?: string
}

export interface MusicTherapySession {
    id: string
    userId: string
    playlist: MusicRecommendation[]
    targetMood: string
    startTime: Date
    duration: number
}

// Crisis Detection Types
export interface CrisisAlert {
    id: string
    userId: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    detectedAt: Date
    message: string
    keywords: string[]
    resources: CrisisResource[]
}

export interface CrisisResource {
    name: string
    type: 'phone' | 'text' | 'url'
    contact: string
    description: string
    availability: string
}

// Webhook Types
export interface WebhookPayload {
    event: string
    timestamp: Date
    data: Record<string, any>
    signature?: string
}

// Health Check Types
export interface HealthCheckResponse {
    status: 'healthy' | 'degraded' | 'unhealthy'
    timestamp: Date
    services: {
        database: ServiceStatus
        ai: ServiceStatus
        storage: ServiceStatus
    }
    version: string
}

export interface ServiceStatus {
    status: 'up' | 'down'
    responseTime?: number
    lastCheck: Date
    error?: string
}

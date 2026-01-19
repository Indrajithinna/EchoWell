/**
 * Application-wide constants for EchoWell
 */

// API Configuration
export const API_CONFIG = {
    MAX_RETRIES: 3,
    TIMEOUT_MS: 30000,
    RATE_LIMIT_REQUESTS: 100,
    RATE_LIMIT_WINDOW_MS: 60000,
} as const

// Message Limits
export const MESSAGE_LIMITS = {
    MIN_LENGTH: 1,
    MAX_LENGTH: 5000,
    MAX_HISTORY: 50,
} as const

// Session Configuration
export const SESSION_CONFIG = {
    MAX_DURATION_MINUTES: 480, // 8 hours
    IDLE_TIMEOUT_MINUTES: 30,
    AUTO_SAVE_INTERVAL_MS: 60000, // 1 minute
} as const

// Mood Score Ranges
export const MOOD_RANGES = {
    EXCELLENT: { min: 9, max: 10, color: 'green', emoji: '😊' },
    GOOD: { min: 7, max: 8, color: 'blue', emoji: '🙂' },
    NEUTRAL: { min: 5, max: 6, color: 'yellow', emoji: '😐' },
    LOW: { min: 3, max: 4, color: 'orange', emoji: '😔' },
    CRITICAL: { min: 1, max: 2, color: 'red', emoji: '😢' },
} as const

// Voice Analysis
export const VOICE_CONFIG = {
    SAMPLE_RATE: 16000,
    CHANNELS: 1,
    BIT_DEPTH: 16,
    MIN_RECORDING_MS: 1000,
    MAX_RECORDING_MS: 300000, // 5 minutes
} as const

// Crisis Detection
export const CRISIS_KEYWORDS = [
    'suicide',
    'kill myself',
    'end my life',
    'want to die',
    'no reason to live',
    'better off dead',
    'self harm',
    'hurt myself',
] as const

export const CRISIS_RESOURCES = {
    NATIONAL_SUICIDE_PREVENTION: {
        name: 'National Suicide Prevention Lifeline',
        phone: '988',
        url: 'https://988lifeline.org/',
    },
    CRISIS_TEXT_LINE: {
        name: 'Crisis Text Line',
        text: 'HOME to 741741',
        url: 'https://www.crisistextline.org/',
    },
    INTERNATIONAL_ASSOCIATION: {
        name: 'International Association for Suicide Prevention',
        url: 'https://www.iasp.info/resources/Crisis_Centres/',
    },
} as const

// AI Model Configuration
export const AI_MODELS = {
    GEMINI: {
        name: 'gemini-pro',
        maxTokens: 2048,
        temperature: 0.7,
    },
    WHISPER: {
        name: 'whisper-1',
        language: 'en',
    },
    TTS: {
        model: 'tts-1',
        voice: 'nova',
        speed: 1.0,
    },
} as const

// UI Constants
export const UI_CONSTANTS = {
    ANIMATION_DURATION_MS: 300,
    TOAST_DURATION_MS: 3000,
    DEBOUNCE_MS: 300,
    THROTTLE_MS: 1000,
} as const

// Storage Keys
export const STORAGE_KEYS = {
    USER_PREFERENCES: 'echowell_preferences',
    THEME: 'echowell_theme',
    LAST_SESSION: 'echowell_last_session',
    DRAFT_MESSAGE: 'echowell_draft',
} as const

// Error Messages
export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Network connection error. Please check your internet connection.',
    AUTH_REQUIRED: 'Please sign in to continue.',
    SESSION_EXPIRED: 'Your session has expired. Please sign in again.',
    RATE_LIMIT: 'Too many requests. Please try again later.',
    INVALID_INPUT: 'Invalid input. Please check your data and try again.',
    SERVER_ERROR: 'An unexpected error occurred. Please try again.',
} as const

// Feature Flags
export const FEATURES = {
    VOICE_ENABLED: true,
    MUSIC_THERAPY: true,
    ANALYTICS: true,
    CRISIS_DETECTION: true,
    MULTI_LANGUAGE: false,
} as const

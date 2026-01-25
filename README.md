# 🧠 EchoWell

<div align="center">

> **The Future of Personalized Mental Health Support**
>
> An empathetic, voice-first AI companion that adapts to your emotional state in real-time.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Real--time-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)


</div>

---

## 📖 About The Project

**EchoWell** is a comprehensive mental wellness platform designed to bridge the gap in accessible mental health care. Unlike standard chatbots, EchoWell utilizes advanced voice analysis to detect emotional nuances (pitch, tone, speech rate) and adapts its responses accordingly.

It combines **Google Gemini Pro** for logical reasoning with **OpenAI Whisper** for voice processing to create a truly conversational and empathetic experience.

### Key Features

* **🎭 Tone-Adaptive AI:** Detects user emotions (anxiety, sadness, stress) via Web Audio API and adjusts the AI's persona in real-time.
* **🗣️ Natural Voice Interface:** Full duplex voice-to-voice interaction using Whisper (STT) and OpenAI TTS.
* **🧘 Mindfulness Studio:** 4-7-8 Breathing exercises and Focus Timers with ambient soundscapes.
* **🧠 CBT & Tools:** Interactive Cognitive Behavioral Therapy thought challenger, Dream Journal, and Grounding techniques.
* **🏆 Gamification:** Streak tracking, points system, and achievements to encourage daily wellness.
* **🏺 Hope Jar:** A community feature to share anonymous messages of hope and support.
* **🎵 Dynamic Music Therapy:** Integrates with Spotify and custom AI models to generate therapeutic soundscapes based on current mood.
* **📊 Wellness Analytics:** Tracks mental health patterns over time using Supabase to visualize progress and emotional trends.
* **🔐 Secure & Private:** Authenticated via NextAuth.js with data privacy at the core.

---

## 🛠️ Tech Stack

### Frontend
* **Framework:** Next.js 14 (App Router)
* **Language:** TypeScript
* **Styling:** Tailwind CSS, Shadcn/UI
* **State Management:** React Hooks / Context API

### Backend & AI
* **LLM:** Google Gemini Pro
* **Voice Processing:** OpenAI Whisper (STT) & OpenAI TTS
* **Database:** Supabase (PostgreSQL)
* **Auth:** NextAuth.js
* **APIs:** Spotify Web API, Web Audio API

---

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

* Node.js (v18 or higher)
* npm or yarn
* Git

### Installation

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/Indrajithinna/Echowell.git]
    cd EchoWell
    ```

2.  **Install dependencies**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Configure Environment Variables**
    Create a `.env.local` file in the root directory and add the following keys:

    ```env
    # AI Services
    OPENAI_API_KEY=sk-...
    GEMINI_API_KEY=AIza...

    # Authentication (NextAuth)
    NEXTAUTH_URL=http://localhost:3000
    NEXTAUTH_SECRET=your_generated_secret_here
    GOOGLE_CLIENT_ID=your_google_id
    GOOGLE_CLIENT_SECRET=your_google_secret

    # Database (Supabase)
    SUPABASE_URL=[https://your-project.supabase.co](https://your-project.supabase.co)
    SUPABASE_ANON_KEY=your_anon_key

    # Optional: Spotify Integration
    SPOTIFY_CLIENT_ID=your_spotify_id
    SPOTIFY_CLIENT_SECRET=your_spotify_secret
    ```

4.  **Run the development server**
    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 📚 Utility Libraries

EchoWell includes a comprehensive set of utility libraries to streamline development:

### Core Utilities

* **`lib/api-client.ts`** - HTTP client with retry logic, timeout support, and request/response interceptors
* **`lib/error-handling.ts`** - Custom error classes and error handling utilities
* **`lib/validation.ts`** - Input validation functions for emails, passwords, messages, and more
* **`lib/logger.ts`** - Structured logging with different log levels

### Performance & Optimization

* **`lib/cache.ts`** - In-memory caching with TTL support
* **`lib/rate-limiter.ts`** - Rate limiting for API protection
* **`lib/performance.ts`** - Performance monitoring and metrics tracking

### Data Formatting

* **`lib/date-utils.ts`** - Date formatting, timezone conversion, and relative time utilities
* **`lib/string-utils.ts`** - String manipulation (slugify, truncate, case conversion, etc.)

### Example Usage

```typescript
import { api } from '@/lib/api-client'
import { formatDate, getRelativeTime } from '@/lib/date-utils'
import { validateEmail } from '@/lib/validation'
import { apiCache } from '@/lib/cache'

// Make API calls with automatic retry
const response = await api.get('/users', { retry: true })

// Format dates
const formatted = formatDate(new Date(), 'long')
const relative = getRelativeTime(someDate)

// Validate inputs
const emailValidation = validateEmail('user@example.com')

// Cache expensive operations
const data = await apiCache.getOrSet('users', async () => {
  return await fetchUsers()
})
```

---

## 🗺️ Roadmap

- [x] **Core Platform:** Emotional Intelligence engine & Voice Analysis.
- [x] **Music Therapy:** Basic Spotify integration.
- [ ] **Multi-language Support:** Add support for Spanish, French, and Hindi.
- [ ] **Mobile App:** React Native wrapper for iOS/Android.
- [ ] **Wearable Integration:** Apple Health/Fitbit data sync for biometric stress tracking.
- [ ] **B2B API:** Expose endpoints for healthcare providers.
---

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 🙏 Acknowledgments

* **Google AI** for the Gemini Pro API.
* **OpenAI** for Whisper and TTS capabilities.
* **Supabase** for making backend infrastructure seamless.
* **Vercel** for hosting and deployment.

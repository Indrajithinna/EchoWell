# Environment Variables Setup

Add these environment variables to your `.env.local` file:

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# AI Configuration
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key

# Spotify Configuration
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret


# ElevenLabs Configuration (Text-to-Music/Sound)
ELEVENLABS_API_KEY=your_elevenlabs_api_key


## Text-to-Music/Sound Generation (ElevenLabs)

The API endpoint `/api/music/generate-from-text` is now integrated with ElevenLabs Sound Generation API.

### Required Environment Variables:
- `ELEVENLABS_API_KEY`: Your ElevenLabs API key.

### API Usage:
```javascript
const response = await fetch('/api/music/generate-from-text', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: 'Create a calming ambient track for meditation',
    duration: 15, // Seconds (max ~22s)
    prompt_influence: 0.5 // 0.0 to 1.0
  })
})
```

### Expected Response Format:
```json
{
  "success": true,
  "audioUrl": "data:audio/mpeg;base64,...",
  "audioBase64": "...",
  "duration": 15,
  "prompt": "original-prompt",
  "metadata": {
    "provider": "elevenlabs",
    "generatedAt": "2023-..."
  }
}
```

import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface VoiceToneResult {
  tone: 'calm' | 'anxious' | 'sad' | 'happy' | 'stressed' | 'angry' | 'neutral'
  confidence: number
  pitch: number
  speechRate: number
  energyLevel: 'low' | 'medium' | 'high'
  emotionalState: {
    valence: number // -1 (negative) to 1 (positive)
    arousal: number // 0 (calm) to 1 (excited)
    dominance: number // 0 (submissive) to 1 (dominant)
  }
  recommendations: string[]
}

// Analyze voice tone from audio blob
export async function analyzeVoiceTone(audioBlob: Blob): Promise<VoiceToneResult> {
  try {
    // Step 1: Transcribe with Whisper (includes some prosody info)
    const transcription = await openai.audio.transcriptions.create({
      file: new File([audioBlob], 'audio.wav'),
      model: 'whisper-1',
      response_format: 'verbose_json',
    })

    // Step 2: Analyze transcription for emotional content
    const emotionAnalysis = await analyzeEmotionalContent(transcription.text)

    // Step 3: Basic audio feature extraction (simplified)
    const audioFeatures = await extractAudioFeatures(audioBlob)

    // Step 4: Combine analysis
    const toneResult = combineAnalysis(emotionAnalysis, audioFeatures)

    return toneResult
  } catch (error) {
    console.error('Voice tone analysis error:', error)
    return getDefaultToneResult()
  }
}

// Analyze emotional content from text
async function analyzeEmotionalContent(text: string) {
  const prompt = `Analyze the emotional tone of this speech transcription. Return a JSON object with:
  - tone: one of [calm, anxious, sad, happy, stressed, angry, neutral]
  - confidence: 0-1
  - valence: -1 to 1 (negative to positive)
  - arousal: 0 to 1 (calm to excited)
  - dominance: 0 to 1 (submissive to dominant)
  - indicators: array of emotional indicators found
  
  Text: "${text}"
  
  Respond ONLY with valid JSON.`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  })

  return JSON.parse(response.choices[0].message.content || '{}')
}

// Extract basic audio features (simplified version)
async function extractAudioFeatures(audioBlob: Blob) {
  // In a real implementation, you'd use Web Audio API for feature extraction
  // For now, we'll return estimated values based on audio duration and size
  
  const duration = audioBlob.size / 16000 // Rough estimate
  const speechRate = duration > 0 ? 100 / duration : 150 // words per minute estimate
  
  return {
    pitch: 150, // Average human pitch in Hz (would need actual analysis)
    speechRate: speechRate,
    energyLevel: speechRate > 160 ? 'high' : speechRate > 120 ? 'medium' : 'low',
    duration: duration,
  }
}

// Combine analyses into final result
function combineAnalysis(emotionData: any, audioData: any): VoiceToneResult {
  const recommendations = generateRecommendations(emotionData.tone, emotionData.valence)

  return {
    tone: emotionData.tone || 'neutral',
    confidence: emotionData.confidence || 0.7,
    pitch: audioData.pitch,
    speechRate: audioData.speechRate,
    energyLevel: audioData.energyLevel,
    emotionalState: {
      valence: emotionData.valence || 0,
      arousal: emotionData.arousal || 0.5,
      dominance: emotionData.dominance || 0.5,
    },
    recommendations,
  }
}

// Generate response recommendations based on tone
function generateRecommendations(tone: string, valence: number): string[] {
  const recommendations: Record<string, string[]> = {
    anxious: [
      'Use calming language and reassurance',
      'Suggest breathing exercises',
      'Speak slowly and clearly',
      'Acknowledge their feelings',
    ],
    sad: [
      'Express empathy and validation',
      'Use gentle, supportive tone',
      'Avoid toxic positivity',
      'Offer comfort and understanding',
    ],
    stressed: [
      'Provide grounding techniques',
      'Break down problems into steps',
      'Suggest relaxation methods',
      'Be patient and supportive',
    ],
    angry: [
      'Stay calm and non-defensive',
      'Validate their frustration',
      'Use de-escalation techniques',
      'Give them space to express',
    ],
    happy: [
      'Match their positive energy',
      'Celebrate their mood',
      'Encourage positive momentum',
      'Build on optimism',
    ],
    calm: [
      'Maintain peaceful atmosphere',
      'Encourage reflection',
      'Support current state',
      'Explore deeper topics',
    ],
  }

  return recommendations[tone] || [
    'Respond with empathy and understanding',
    'Be supportive and non-judgmental',
    'Listen actively',
  ]
}

function getDefaultToneResult(): VoiceToneResult {
  return {
    tone: 'neutral',
    confidence: 0.5,
    pitch: 150,
    speechRate: 140,
    energyLevel: 'medium',
    emotionalState: {
      valence: 0,
      arousal: 0.5,
      dominance: 0.5,
    },
    recommendations: ['Respond naturally and empathetically'],
  }
}

// Generate AI response adjusted for detected tone
export function adjustResponseForTone(
  originalResponse: string,
  toneResult: VoiceToneResult
): string {
  const toneAdjustments: Record<string, string> = {
    anxious: '(Speaking in a calm, reassuring tone) ',
    sad: '(Speaking gently and compassionately) ',
    stressed: '(Speaking slowly and supportively) ',
    angry: '(Speaking calmly and non-defensively) ',
    happy: '(Matching your positive energy) ',
    calm: '(Speaking peacefully) ',
  }

  const prefix = toneAdjustments[toneResult.tone] || ''
  return prefix + originalResponse
}

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
  audioFeatures: {
    averageVolume: number
    volumeVariation: number
    pauseFrequency: number
    jitter: number // Voice instability
    shimmer: number // Amplitude variation
  }
}

export interface AudioAnalysisFeatures {
  pitch: number
  speechRate: number
  energyLevel: 'low' | 'medium' | 'high'
  averageVolume: number
  volumeVariation: number
  pauseFrequency: number
  jitter: number
  shimmer: number
  duration: number
}

// Enhanced voice tone analysis with Web Audio API
export async function analyzeVoiceToneEnhanced(audioBlob: Blob): Promise<VoiceToneResult> {
  try {
    // Step 1: Transcribe with Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: new File([audioBlob], 'audio.wav'),
      model: 'whisper-1',
      response_format: 'verbose_json',
    })

    // Step 2: Analyze transcription for emotional content
    const emotionAnalysis = await analyzeEmotionalContent(transcription.text)

    // Step 3: Extract detailed audio features using Web Audio API
    const audioFeatures = await extractDetailedAudioFeatures(audioBlob)

    // Step 4: Combine analysis
    const toneResult = combineEnhancedAnalysis(emotionAnalysis, audioFeatures, transcription.text)

    return toneResult
  } catch (error) {
    console.error('Enhanced voice tone analysis error:', error)
    return getDefaultToneResultEnhanced()
  }
}

// Analyze emotional content from text with more sophisticated prompts
async function analyzeEmotionalContent(text: string) {
  const prompt = `As a mental health AI assistant, analyze the emotional tone of this speech transcription. Consider:
  1. Word choice and emotional language
  2. Sentence structure and flow
  3. Implied emotional states
  4. Therapeutic context
  
  Return a JSON object with:
  - tone: one of [calm, anxious, sad, happy, stressed, angry, neutral]
  - confidence: 0-1 (how certain you are)
  - valence: -1 to 1 (negative to positive emotional state)
  - arousal: 0 to 1 (calm to excited energy level)
  - dominance: 0 to 1 (submissive to dominant emotional position)
  - indicators: array of specific emotional indicators found
  - urgency: 0-1 (how urgent/immediate the emotional need seems)
  
  Text: "${text}"
  
  Respond ONLY with valid JSON.`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  })

  return JSON.parse(response.choices[0].message.content || '{}')
}

// Extract detailed audio features using Web Audio API
async function extractDetailedAudioFeatures(audioBlob: Blob): Promise<AudioAnalysisFeatures> {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const arrayBuffer = await audioBlob.arrayBuffer()
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
    
    const channelData = audioBuffer.getChannelData(0)
    const sampleRate = audioBuffer.sampleRate
    const duration = audioBuffer.duration
    
    // Calculate basic features
    const averageVolume = calculateAverageVolume(channelData)
    const volumeVariation = calculateVolumeVariation(channelData)
    const pauseFrequency = calculatePauseFrequency(channelData, sampleRate)
    const speechRate = calculateSpeechRate(channelData, duration)
    
    // Calculate advanced features
    const pitch = await calculatePitch(channelData, sampleRate)
    const jitter = calculateJitter(channelData, sampleRate)
    const shimmer = calculateShimmer(channelData, sampleRate)
    
    // Determine energy level
    const energyLevel = determineEnergyLevel(averageVolume, volumeVariation, speechRate)
    
    await audioContext.close()
    
    return {
      pitch,
      speechRate,
      energyLevel,
      averageVolume,
      volumeVariation,
      pauseFrequency,
      jitter,
      shimmer,
      duration,
    }
  } catch (error) {
    console.error('Audio feature extraction error:', error)
    return getDefaultAudioFeatures()
  }
}

// Calculate average volume (RMS)
function calculateAverageVolume(channelData: Float32Array): number {
  let sum = 0
  for (let i = 0; i < channelData.length; i++) {
    sum += channelData[i] * channelData[i]
  }
  return Math.sqrt(sum / channelData.length)
}

// Calculate volume variation (standard deviation)
function calculateVolumeVariation(channelData: Float32Array): number {
  const mean = calculateAverageVolume(channelData)
  let sum = 0
  for (let i = 0; i < channelData.length; i++) {
    sum += Math.pow(channelData[i] - mean, 2)
  }
  return Math.sqrt(sum / channelData.length)
}

// Calculate pause frequency (silent periods)
function calculatePauseFrequency(channelData: Float32Array, sampleRate: number): number {
  const threshold = 0.01 // Silence threshold
  let pauseCount = 0
  let inPause = false
  let pauseDuration = 0
  
  for (let i = 0; i < channelData.length; i++) {
    if (Math.abs(channelData[i]) < threshold) {
      if (!inPause) {
        inPause = true
        pauseDuration = 0
      }
      pauseDuration++
    } else {
      if (inPause && pauseDuration > sampleRate * 0.1) { // Pause longer than 100ms
        pauseCount++
      }
      inPause = false
    }
  }
  
  return pauseCount
}

// Calculate speech rate (approximate)
function calculateSpeechRate(channelData: Float32Array, duration: number): number {
  // This is a simplified calculation
  // In practice, you'd need more sophisticated speech detection
  const speechActivity = channelData.filter(sample => Math.abs(sample) > 0.01).length
  const speechRatio = speechActivity / channelData.length
  return (speechRatio * 200) / duration // Approximate words per minute
}

// Calculate pitch using autocorrelation (simplified)
async function calculatePitch(channelData: Float32Array, sampleRate: number): Promise<number> {
  // Simplified pitch detection using autocorrelation
  const minPeriod = Math.floor(sampleRate / 400) // 400 Hz max
  const maxPeriod = Math.floor(sampleRate / 80)  // 80 Hz min
  
  let bestPeriod = 0
  let bestCorrelation = 0
  
  for (let period = minPeriod; period < maxPeriod; period++) {
    let correlation = 0
    for (let i = 0; i < channelData.length - period; i++) {
      correlation += channelData[i] * channelData[i + period]
    }
    
    if (correlation > bestCorrelation) {
      bestCorrelation = correlation
      bestPeriod = period
    }
  }
  
  return bestPeriod > 0 ? sampleRate / bestPeriod : 150 // Default to 150 Hz
}

// Calculate jitter (pitch period variation)
function calculateJitter(channelData: Float32Array, sampleRate: number): number {
  // Simplified jitter calculation
  const windowSize = Math.floor(sampleRate * 0.02) // 20ms windows
  const variations: number[] = []
  
  for (let i = 0; i < channelData.length - windowSize; i += windowSize) {
    const window = channelData.slice(i, i + windowSize)
    const rms = Math.sqrt(window.reduce((sum, val) => sum + val * val, 0) / window.length)
    variations.push(rms)
  }
  
  // Calculate coefficient of variation
  const mean = variations.reduce((sum, val) => sum + val, 0) / variations.length
  const variance = variations.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / variations.length
  return Math.sqrt(variance) / mean
}

// Calculate shimmer (amplitude variation)
function calculateShimmer(channelData: Float32Array, sampleRate: number): number {
  // Similar to jitter but for amplitude
  const windowSize = Math.floor(sampleRate * 0.02) // 20ms windows
  const amplitudes: number[] = []
  
  for (let i = 0; i < channelData.length - windowSize; i += windowSize) {
    const window = channelData.slice(i, i + windowSize)
    const amplitude = window.reduce((max, val) => Math.max(max, Math.abs(val)), 0)
    amplitudes.push(amplitude)
  }
  
  const mean = amplitudes.reduce((sum, val) => sum + val, 0) / amplitudes.length
  const variance = amplitudes.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / amplitudes.length
  return Math.sqrt(variance) / mean
}

// Determine energy level based on multiple factors
function determineEnergyLevel(volume: number, variation: number, speechRate: number): 'low' | 'medium' | 'high' {
  const energyScore = (volume * 0.4) + (variation * 0.3) + (speechRate / 200 * 0.3)
  
  if (energyScore > 0.7) return 'high'
  if (energyScore > 0.4) return 'medium'
  return 'low'
}

// Combine enhanced analysis
function combineEnhancedAnalysis(emotionData: any, audioData: AudioAnalysisFeatures, text: string): VoiceToneResult {
  const recommendations = generateEnhancedRecommendations(emotionData, audioData)
  
  return {
    tone: emotionData.tone || 'neutral',
    confidence: calculateConfidence(emotionData, audioData),
    pitch: audioData.pitch,
    speechRate: audioData.speechRate,
    energyLevel: audioData.energyLevel,
    emotionalState: {
      valence: emotionData.valence || 0,
      arousal: emotionData.arousal || 0.5,
      dominance: emotionData.dominance || 0.5,
    },
    recommendations,
    audioFeatures: {
      averageVolume: audioData.averageVolume,
      volumeVariation: audioData.volumeVariation,
      pauseFrequency: audioData.pauseFrequency,
      jitter: audioData.jitter,
      shimmer: audioData.shimmer,
    },
  }
}

// Calculate confidence based on multiple factors
function calculateConfidence(emotionData: any, audioData: AudioAnalysisFeatures): number {
  let confidence = emotionData.confidence || 0.7
  
  // Adjust confidence based on audio features consistency
  if (audioData.jitter > 0.1 || audioData.shimmer > 0.2) {
    confidence *= 0.9 // Reduce confidence for unstable voice
  }
  
  if (audioData.pauseFrequency > 10) {
    confidence *= 0.95 // Slight reduction for many pauses
  }
  
  return Math.min(confidence, 1.0)
}

// Generate enhanced recommendations
function generateEnhancedRecommendations(emotionData: any, audioData: AudioAnalysisFeatures): string[] {
  const baseRecommendations = generateRecommendations(emotionData.tone, emotionData.valence)
  const audioRecommendations: string[] = []
  
  // Add audio-specific recommendations
  if (audioData.jitter > 0.15) {
    audioRecommendations.push('Voice shows stress indicators - use extra calming techniques')
  }
  
  if (audioData.pauseFrequency > 15) {
    audioRecommendations.push('Frequent pauses suggest hesitation - be patient and encouraging')
  }
  
  if (audioData.energyLevel === 'low' && emotionData.tone !== 'calm') {
    audioRecommendations.push('Low energy detected - consider gentle encouragement')
  }
  
  if (audioData.speechRate > 180) {
    audioRecommendations.push('Fast speech rate - suggest slowing down for clarity')
  }
  
  return [...baseRecommendations, ...audioRecommendations]
}

function getDefaultToneResultEnhanced(): VoiceToneResult {
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
    audioFeatures: {
      averageVolume: 0.1,
      volumeVariation: 0.05,
      pauseFrequency: 5,
      jitter: 0.05,
      shimmer: 0.1,
    },
  }
}

function getDefaultAudioFeatures(): AudioAnalysisFeatures {
  return {
    pitch: 150,
    speechRate: 140,
    energyLevel: 'medium',
    averageVolume: 0.1,
    volumeVariation: 0.05,
    pauseFrequency: 5,
    jitter: 0.05,
    shimmer: 0.1,
    duration: 10,
  }
}

// Generate AI response adjusted for detected tone (enhanced version)
export function adjustResponseForToneEnhanced(
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
  
  // Add specific adjustments based on audio features
  let additionalContext = ''
  if (toneResult.audioFeatures.jitter > 0.15) {
    additionalContext += ' (Using extra gentle, steady voice)'
  }
  if (toneResult.audioFeatures.pauseFrequency > 15) {
    additionalContext += ' (Speaking slowly to match your pace)'
  }
  
  return prefix + originalResponse + additionalContext
}

// Generate recommendations based on tone (from original file)
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

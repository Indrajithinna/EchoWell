import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

// Candidate model names in preferred order; we will try each on failure
const CANDIDATE_MODELS = [
  'gemini-1.5-flash-latest',
  'gemini-1.5-flash',
  'gemini-1.5-pro-latest',
  'gemini-1.5-pro',
  'gemini-pro',
  'gemini-1.0-pro'
]

export function getSystemPromptForTone(tone?: string, toneConfidence?: number): string {
  const basePrompt = `You are EchoWell, a compassionate AI mental health companion. Your role is to provide emotional support and guidance.

Core Principles:
- ALWAYS be polite, kind, and understanding
- Listen empathetically without judgment
- Validate emotions before offering solutions
- Use evidence-based techniques from CBT and DBT
- Recognize your limitations - you're not a replacement for therapy
- Be warm, supportive, and conversational

Response Guidelines:
- Keep responses concise (2-4 paragraphs)
- Ask ONE thoughtful question at a time
- Use "I" statements for empathy
- Offer coping strategies when appropriate
- Encourage professional help for serious issues

Crisis Detection:
- If you detect suicide, self-harm, or crisis keywords, immediately provide crisis resources
- National Suicide Prevention Lifeline: 988
- Crisis Text Line: Text HOME to 741741

Remember: You provide support, not diagnosis or treatment.`

  if (!tone || !toneConfidence || toneConfidence < 0.6) {
    return basePrompt + `\n\nRespond naturally with empathy and care.`
  }

  const toneSpecificGuidelines: Record<string, string> = {
    anxious: `

DETECTED TONE: Anxious (${(toneConfidence * 100).toFixed(0)}% confidence)

Adjust your response:
- Use calm, reassuring language
- Speak slowly and clearly (short sentences)
- Offer grounding techniques immediately if severe
- Validate their anxiety: "It's completely understandable to feel anxious about this"
- Suggest breathing exercises: "Let's take a moment to breathe together"
- Avoid overwhelming them with too much information
- Be a stable, calming presence`,

    sad: `

DETECTED TONE: Sad (${(toneConfidence * 100).toFixed(0)}% confidence)

Adjust your response:
- Express genuine empathy and compassion
- Use gentle, supportive language
- Avoid toxic positivity or minimizing feelings
- Validate their pain: "I hear how much you're hurting right now"
- Sit with them in their sadness - don't rush to fix it
- Offer comfort and understanding
- Remind them that feelings are temporary`,

    stressed: `

DETECTED TONE: Stressed (${(toneConfidence * 100).toFixed(0)}% confidence)

Adjust your response:
- Help them break down overwhelming situations
- Speak clearly and provide structure
- Offer practical coping strategies
- Suggest stress-relief techniques (breathing, progressive relaxation)
- Encourage prioritization: "Let's identify what's most urgent"
- Be patient and supportive
- Help them regain sense of control`,

    angry: `

DETECTED TONE: Angry (${(toneConfidence * 100).toFixed(0)}% confidence)

Adjust your response:
- Stay calm and non-defensive
- Validate their frustration without judgment
- Give them space to express fully
- Use de-escalation techniques
- Acknowledge: "I can hear how frustrated you are, and that's valid"
- Don't take it personally or argue
- Help them process the anger constructively`,

    happy: `

DETECTED TONE: Happy (${(toneConfidence * 100).toFixed(0)}% confidence)

Adjust your response:
- Match their positive energy appropriately
- Celebrate their good mood with them
- Encourage this positive momentum
- Ask what's contributing to their happiness
- Help them savor positive moments
- Build on their optimism
- Still be ready to support if mood shifts`,

    calm: `

DETECTED TONE: Calm (${(toneConfidence * 100).toFixed(0)}% confidence)

Adjust your response:
- Maintain the peaceful atmosphere
- Encourage deeper reflection and insight
- Explore topics more thoroughly
- Support their current balanced state
- This is a good time for goal-setting or processing past events
- Use their calmness productively`,
  }

  return basePrompt + (toneSpecificGuidelines[tone] || '')
}

export async function getChatResponse(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  tone?: string,
  toneConfidence?: number
): Promise<string> {
  try {
    // Convert messages to Gemini format
    const lastUserMessage = messages[messages.length - 1]
    if (!lastUserMessage || lastUserMessage.role !== 'user') {
      throw new Error('No user message found')
    }

    // Create conversation history for context
    const conversationHistory = messages.slice(-10).map(msg => {
      if (msg.role === 'user') {
        return `User: ${msg.content}`
      } else {
        return `Assistant: ${msg.content}`
      }
    }).join('\n')

    const systemPrompt = getSystemPromptForTone(tone, toneConfidence)

    const prompt = `${systemPrompt}

Conversation History:
${conversationHistory}

Please respond as the compassionate AI mental health companion. Keep your response supportive, empathetic, and helpful.`

    // Try candidate models in order until one succeeds
    for (const modelName of CANDIDATE_MODELS) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName })
        const result = await model.generateContent(prompt)
        const response = await result.response
        const text = response.text()
        if (text && text.trim().length > 0) {
          return text
        }
      } catch (modelErr) {
        const msg = modelErr instanceof Error ? modelErr.message : String(modelErr)
        // Continue to next model on 404/unsupported/not found messages
        if (/not found|unsupported|404/i.test(msg)) {
          console.log(`Model ${modelName} unavailable, trying next...`)
          continue
        }
        // For other errors, log and try next as well
        console.warn(`Model ${modelName} error:`, modelErr)
        continue
      }
    }

    // If all models failed, fall through to fallback below
    return getFallbackResponse(lastUserMessage.content)
  } catch (error) {
    console.error('Gemini API error:', error)

    // If it's a model not found error, try with fallback responses
    if (error instanceof Error && error.message.includes('not found')) {
      console.log('Model not found, using fallback responses')
      const lastMessage = messages[messages.length - 1]
      if (lastMessage?.role === 'user') {
        return getFallbackResponse(lastMessage.content)
      }
    }

    // Fallback responses when Gemini is unavailable
    const lastMessage = messages[messages.length - 1]
    if (lastMessage?.role === 'user') {
      return getFallbackResponse(lastMessage.content)
    }

    throw new Error('Failed to get AI response')
  }
}

// Crisis keyword detection
export function detectCrisis(message: string): boolean {
  const crisisKeywords = [
    'suicide', 'suicidal', 'kill myself', 'end my life', 'want to die',
    'better off dead', 'no reason to live', 'self harm', 'hurt myself',
    'cut myself', 'overdose', 'end it all'
  ]

  const lowerMessage = message.toLowerCase()
  return crisisKeywords.some(keyword => lowerMessage.includes(keyword))
}

// Mood extraction from conversation
export function extractMoodFromMessage(message: string): number {
  const positiveWords = ['happy', 'good', 'great', 'better', 'excited', 'joy', 'wonderful']
  const negativeWords = ['sad', 'depressed', 'anxious', 'worried', 'terrible', 'awful', 'bad']

  const lowerMessage = message.toLowerCase()
  let score = 5 // Neutral baseline

  positiveWords.forEach(word => {
    if (lowerMessage.includes(word)) score += 1
  })

  negativeWords.forEach(word => {
    if (lowerMessage.includes(word)) score -= 1
  })

  return Math.max(1, Math.min(10, score))
}

// Fallback responses when OpenAI API is unavailable
function getFallbackResponse(userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase()

  // Crisis detection
  if (detectCrisis(userMessage)) {
    return `I'm really concerned about what you're sharing. Your safety is the most important thing right now. 🆘 **Please reach out for immediate help:**\n\n- **National Suicide Prevention Lifeline:** Call or text 988\n- **Crisis Text Line:** Text HOME to 741741\n\nThese services are available 24/7 with trained professionals who care about you. I'm here to support you, but I want to make sure you have access to immediate professional help.`
  }

  // Emotional support responses
  if (lowerMessage.includes('overwhelmed') || lowerMessage.includes('stress')) {
    return `I hear that you're feeling overwhelmed. That's a completely valid feeling, and I want you to know that you're not alone in this. \n\nHere are some gentle coping strategies that might help:\n\n• Take slow, deep breaths - try the 4-7-8 technique\n• Break tasks into smaller, manageable steps\n• Practice self-compassion - you're doing your best\n• Consider talking to a trusted friend or professional\n\nRemember, it's okay to ask for help when you need it. What's one small thing you could do right now to take care of yourself?`
  }

  if (lowerMessage.includes('sad') || lowerMessage.includes('depressed')) {
    return `I can hear the sadness in your message, and I want you to know that your feelings are completely valid. Feeling sad is a natural part of being human, even though it can be incredibly difficult.\n\nSome gentle suggestions:\n\n• Allow yourself to feel these emotions without judgment\n• Try to maintain basic self-care routines\n• Connect with people who care about you\n• Consider speaking with a mental health professional\n\nYou don't have to go through this alone. Is there someone in your life you could reach out to today?`
  }

  if (lowerMessage.includes('anxious') || lowerMessage.includes('worried')) {
    return `I understand that anxiety can feel overwhelming and exhausting. You're not alone in experiencing these feelings.\n\nHere are some calming techniques you might try:\n\n• Ground yourself with the 5-4-3-2-1 technique\n• Practice mindful breathing\n• Try progressive muscle relaxation\n• Challenge anxious thoughts with gentle questioning\n\nRemember, anxiety doesn't define you, and these feelings will pass. What's one thing that usually helps you feel more grounded?`
  }

  if (lowerMessage.includes('happy') || lowerMessage.includes('good')) {
    return `That's wonderful to hear! I'm genuinely happy that you're experiencing positive feelings right now. It's important to acknowledge and celebrate these moments.\n\nTo help maintain this positive energy:\n\n• Take note of what contributed to these good feelings\n• Practice gratitude for the positive aspects of your day\n• Share your joy with others if you feel comfortable\n• Remember this feeling when you face challenges later\n\nWhat's something specific that's bringing you joy today?`
  }

  // Default supportive response
  return `Thank you for sharing with me. I want you to know that I'm here to listen and support you. Your feelings are valid, and it takes courage to reach out.\n\nWhile I'm currently experiencing some technical limitations, I still want to offer you some gentle support:\n\n• Your feelings matter and are completely valid\n• It's okay to not have all the answers right now\n• Consider reaching out to trusted friends, family, or professionals\n• Practice self-compassion - you're doing the best you can\n\nIs there a specific way you'd like to be supported right now? I'm here to listen.`
}

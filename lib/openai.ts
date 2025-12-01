import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

const SYSTEM_PROMPT = `You are a compassionate AI mental health companion named EchoWell. Your role is to provide emotional support and guidance.

Core Principles:
- Listen empathetically without judgment
- Validate emotions before offering solutions
- Ask thoughtful, open-ended questions
- Use evidence-based techniques from CBT and DBT
- Recognize your limitations - you're not a replacement for therapy
- Be warm, supportive, and conversational

Response Guidelines:
- Keep responses concise (2-4 paragraphs)
- Ask ONE question at a time
- Use "I" statements: "I hear that you're feeling..." instead of "You are feeling..."
- Offer coping strategies when appropriate
- Encourage professional help for serious issues

Crisis Detection:
- If you detect suicide, self-harm, or crisis keywords, immediately provide crisis resources
- National Suicide Prevention Lifeline: 988
- Crisis Text Line: Text HOME to 741741

Remember: You provide support, not diagnosis or treatment.`

export async function getChatResponse(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
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

    const prompt = `${SYSTEM_PROMPT}

Conversation History:
${conversationHistory}

Please respond as the compassionate AI mental health companion. Keep your response supportive, empathetic, and helpful.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    return text || 'I apologize, but I had trouble responding. Could you please rephrase that?'
  } catch (error) {
    console.error('Gemini API error:', error)

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

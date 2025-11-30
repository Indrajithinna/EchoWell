import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { getChatResponse, detectCrisis } from '@/lib/ai'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { messages, conversationId } = await req.json()

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Invalid messages' }, { status: 400 })
    }

    // Get the last user message
    const lastMessage = messages[messages.length - 1]
    
    // Check for crisis situation
    if (lastMessage.role === 'user' && detectCrisis(lastMessage.content)) {
      const crisisResponse = `I'm really concerned about what you're sharing. Your safety is the most important thing right now.

🆘 **Please reach out for immediate help:**

- **National Suicide Prevention Lifeline:** Call or text 988
- **Crisis Text Line:** Text HOME to 741741
- **International Association for Suicide Prevention:** https://www.iasp.info/resources/Crisis_Centres/

These services are available 24/7 with trained professionals who care about you.

I'm here to support you, but I want to make sure you have access to immediate professional help. Would you like me to help you find other resources?`

      // Save crisis flag to database
      if (conversationId) {
        await supabase
          .from('messages')
          .insert([
            {
              conversation_id: conversationId,
              role: 'user',
              content: lastMessage.content,
            },
            {
              conversation_id: conversationId,
              role: 'assistant',
              content: crisisResponse,
            }
          ])
      }

      return NextResponse.json({ 
        message: crisisResponse,
        crisis: true 
      })
    }

    // Get AI response
    const aiResponse = await getChatResponse(messages)

    // Save conversation to database
    if (conversationId) {
      try {
        await saveMessages(conversationId, lastMessage.content, aiResponse)
        
        // Log conversation metrics
        await logConversationMetrics(
          session.user.id,
          conversationId,
          [...messages, { role: 'user', content: lastMessage.content }, { role: 'assistant', content: aiResponse }]
        ).catch(console.error)
      } catch (e) {
        console.warn('Failed to save messages, continuing without persistence:', e)
      }
    } else {
      // Create new conversation (best-effort)
      try {
        const newConversationId = await createConversation(
          session.user.id,
          lastMessage.content,
          aiResponse
        )
        
        // Log conversation metrics
        await logConversationMetrics(
          session.user.id,
          newConversationId,
          [...messages, { role: 'user', content: lastMessage.content }, { role: 'assistant', content: aiResponse }]
        ).catch(console.error)
        
        return NextResponse.json({ 
          message: aiResponse,
          conversationId: newConversationId 
        })
      } catch (e) {
        console.warn('Failed to create conversation, returning response without persistence:', e)
        return NextResponse.json({ message: aiResponse })
      }
    }

    return NextResponse.json({ message: aiResponse })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    )
  }
}

async function createConversation(
  userId: string,
  userMessage: string,
  aiMessage: string
): Promise<string> {
  // Create conversation
  const { data: conversation, error: convError } = await supabase
    .from('conversations')
    .insert({
      user_id: userId,
      title: userMessage.slice(0, 50) + '...',
    })
    .select()
    .single()

  if (convError || !conversation) {
    throw new Error('Failed to create conversation')
  }

  // Insert messages
  await supabase
    .from('messages')
    .insert([
      {
        conversation_id: conversation.id,
        role: 'user',
        content: userMessage,
      },
      {
        conversation_id: conversation.id,
        role: 'assistant',
        content: aiMessage,
      }
    ])

  return conversation.id
}

async function saveMessages(
  conversationId: string,
  userMessage: string,
  aiMessage: string
): Promise<void> {
  await supabase
    .from('messages')
    .insert([
      {
        conversation_id: conversationId,
        role: 'user',
        content: userMessage,
      },
      {
        conversation_id: conversationId,
        role: 'assistant',
        content: aiMessage,
      }
    ])

  // Update conversation timestamp
  await supabase
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', conversationId)
}

async function logConversationMetrics(
  userId: string,
  conversationId: string,
  messages: any[]
) {
  try {
    // Extract topics using simple keyword extraction
    const userMessages = messages.filter(m => m.role === 'user').map(m => m.content).join(' ')
    const topics = extractTopics(userMessages)

    // Calculate depth score (based on message length and complexity)
    const userMessageCount = messages.filter(m => m.role === 'user').length
    const avgMessageLength = userMessageCount > 0 ? userMessages.length / userMessageCount : 0
    const depthScore = Math.min(10, Math.floor(avgMessageLength / 50) + messages.length)

    // Calculate engagement score
    const engagementScore = Math.min(10, messages.length)

    await supabase.from('conversation_metrics').insert({
      user_id: userId,
      conversation_id: conversationId,
      duration_seconds: 0, // Would need to track actual time
      message_count: messages.length,
      avg_response_time: 0, // Would need to track response times
      topics_covered: topics,
      depth_score: depthScore,
      engagement_score: engagementScore,
    })
  } catch (error) {
    console.error('Error logging metrics:', error)
  }
}

function extractTopics(text: string): string[] {
  const commonTopics = [
    'anxiety', 'depression', 'stress', 'sleep', 'work', 'relationships',
    'family', 'health', 'goals', 'meditation', 'exercise', 'therapy',
    'emotions', 'feelings', 'worry', 'sadness', 'happiness', 'anger'
  ]

  const lowerText = text.toLowerCase()
  return commonTopics.filter(topic => lowerText.includes(topic))
}

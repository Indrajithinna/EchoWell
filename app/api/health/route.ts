import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Check if required environment variables are set
    const envCheck = {
      OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
      GEMINI_API_KEY: !!process.env.GEMINI_API_KEY,
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
      GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
      SUPABASE_URL: !!process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY,
    }

    const allEnvSet = Object.values(envCheck).every(Boolean)

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV,
        allRequiredEnvSet: allEnvSet,
        envCheck,
      },
      services: {
        api: 'operational',
        database: 'checking...', // Could add actual DB health check here
      }
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

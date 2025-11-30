-- MindfulAI Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  image TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New Conversation',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create mood_logs table
CREATE TABLE IF NOT EXISTS public.mood_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  mood_score INTEGER NOT NULL CHECK (mood_score >= 1 AND mood_score <= 10),
  emotions TEXT[] DEFAULT '{}',
  notes TEXT,
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create music_sessions table
CREATE TABLE IF NOT EXISTS public.music_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  mood_before INTEGER CHECK (mood_before >= 1 AND mood_before <= 10),
  mood_after INTEGER CHECK (mood_after >= 1 AND mood_after <= 10),
  track_ids TEXT[] DEFAULT '{}',
  duration INTEGER DEFAULT 0,
  session_type TEXT NOT NULL DEFAULT 'listening',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create therapy_goals table
CREATE TABLE IF NOT EXISTS public.therapy_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  goal_text TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.music_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.therapy_goals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid()::text = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid()::text = id);

-- Create RLS policies for conversations table
CREATE POLICY "Users can view own conversations" ON public.conversations
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create own conversations" ON public.conversations
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own conversations" ON public.conversations
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own conversations" ON public.conversations
  FOR DELETE USING (auth.uid()::text = user_id);

-- Create RLS policies for messages table
CREATE POLICY "Users can view own messages" ON public.messages
  FOR SELECT USING (
    conversation_id IN (
      SELECT id FROM public.conversations WHERE user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can create messages in own conversations" ON public.messages
  FOR INSERT WITH CHECK (
    conversation_id IN (
      SELECT id FROM public.conversations WHERE user_id = auth.uid()::text
    )
  );

-- Create RLS policies for mood_logs table
CREATE POLICY "Users can view own mood logs" ON public.mood_logs
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create own mood logs" ON public.mood_logs
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own mood logs" ON public.mood_logs
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own mood logs" ON public.mood_logs
  FOR DELETE USING (auth.uid()::text = user_id);

-- Create RLS policies for music_sessions table
CREATE POLICY "Users can view own music sessions" ON public.music_sessions
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create own music sessions" ON public.music_sessions
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own music sessions" ON public.music_sessions
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own music sessions" ON public.music_sessions
  FOR DELETE USING (auth.uid()::text = user_id);

-- Create RLS policies for therapy_goals table
CREATE POLICY "Users can view own therapy goals" ON public.therapy_goals
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create own therapy goals" ON public.therapy_goals
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own therapy goals" ON public.therapy_goals
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own therapy goals" ON public.therapy_goals
  FOR DELETE USING (auth.uid()::text = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_mood_logs_user_id ON public.mood_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_mood_logs_logged_at ON public.mood_logs(logged_at);
CREATE INDEX IF NOT EXISTS idx_music_sessions_user_id ON public.music_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_therapy_goals_user_id ON public.therapy_goals(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON public.conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

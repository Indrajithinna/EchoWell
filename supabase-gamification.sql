-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USER STATS (Gamification)
create table user_stats (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null unique,
  points integer default 0,
  current_streak integer default 0,
  longest_streak integer default 0,
  last_activity_date date,
  total_journal_entries integer default 0,
  total_breathing_minutes integer default 0,
  level integer default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. ACHIEVEMENTS
create table achievements (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text not null,
  icon text, -- Lucide icon name or emoji
  points_reward integer default 50,
  condition_type text not null, -- e.g., 'STREAK', 'journal_entries', 'BREATHING_TIME'
  condition_value integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table user_achievements (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  achievement_id uuid references achievements not null,
  unlocked_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, achievement_id)
);

-- 3. JOURNAL ENTRIES
create table journal_entries (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  audio_url text, -- Path to storage bucket
  transcript text,
  summary text, -- AI Generated summary
  mood_analysis jsonb, -- AI Generated mood breakdown { "primary": "Happy", "intensity": 0.8 }
  tags text[],
  is_voice_entry boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. MINDFULNESS SESSIONS
create table mindfulness_sessions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  type text not null, -- 'BREATHING', 'FOCUS', 'MEDITATION'
  duration_seconds integer not null,
  completed_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS POLICIES

-- User Stats
alter table user_stats enable row level security;
create policy "Users can view own stats" on user_stats for select using (auth.uid() = user_id);
create policy "Users can update own stats" on user_stats for update using (auth.uid() = user_id);
-- Trigger to create user_stats on new user signup would be ideal here, but simpler to handle in app logic for now if not existing.

-- Journal Entries
alter table journal_entries enable row level security;
create policy "Users can view own journal" on journal_entries for select using (auth.uid() = user_id);
create policy "Users can insert own journal" on journal_entries for insert with check (auth.uid() = user_id);
create policy "Users can update own journal" on journal_entries for update using (auth.uid() = user_id);
create policy "Users can delete own journal" on journal_entries for delete using (auth.uid() = user_id);

-- Mindfulness Sessions
alter table mindfulness_sessions enable row level security;
create policy "Users can view own sessions" on mindfulness_sessions for select using (auth.uid() = user_id);
create policy "Users can insert own sessions" on mindfulness_sessions for insert with check (auth.uid() = user_id);

-- Achievements
alter table achievements enable row level security;
create policy "Public read achievements" on achievements for select using (true); 

alter table user_achievements enable row level security;
create policy "Users can view own achievements" on user_achievements for select using (auth.uid() = user_id);
create policy "Users can insert own achievements" on user_achievements for insert with check (auth.uid() = user_id);

-- Insert Default Achievements
insert into achievements (name, description, icon, points_reward, condition_type, condition_value) values
('First Step', 'Complete your first journal entry', 'BookCreate', 50, 'TOTAL_JOURNAL_ENTRIES', 1),
('Zen Master', 'Complete 10 minutes of breathing exercises', 'Wind', 100, 'TOTAL_BREATHING_MINUTES', 10),
('Consistency is Key', 'Maintain a 3-day streak', 'Flame', 200, 'STREAK', 3),
('Deep Diver', 'Complete 10 journal entries', 'PenTool', 300, 'TOTAL_JOURNAL_ENTRIES', 10);

-- EXTENDED FEATURES SCHEMA

-- 1. CBT ENTRIES (Cognitive Behavioral Therapy)
create table cbt_entries (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  trigger_situation text not null,
  negative_thought text not null,
  distortion_type text, -- 'Catastrophizing', 'Filtering', etc.
  challenge_evidence text, -- Evidence against the thought
  rational_response text not null, -- The balanced thought
  emotion_before_intensity integer, -- 1-10
  emotion_after_intensity integer, -- 1-10
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. DREAM JOURNAL
create table dream_journals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  description text not null,
  emotion text,
  interpretation text, -- AI Generated Interpretation
  themes text[], -- ['Flying', 'Chase', 'Water']
  lucid boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. HOPE JAR (Anonymous Community)
create table hope_messages (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null, -- Author (kept private)
  message text not null,
  category text default 'General', -- 'Anxiety', 'Depression', 'General'
  likes integer default 0,
  is_approved boolean default true, -- Simple moderation flag
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. FUTURE CAPSULES
create table future_capsules (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  message text,
  audio_url text,
  unlock_at timestamp with time zone not null,
  is_unlocked boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. DAILY AFFIRMATIONS (Personalized)
create table user_affirmations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  text text not null,
  shown_at date default current_date, -- Shown on this specific date
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. SLEEP LOGS
create table sleep_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  duration_minutes integer not null,
  quality_rating integer, -- 1-5
  date date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, date)
);

-- RLS POLICIES

-- CBT
alter table cbt_entries enable row level security;
create policy "Users manage own CBT" on cbt_entries for all using (auth.uid() = user_id);

-- Dreams
alter table dream_journals enable row level security;
create policy "Users manage own dreams" on dream_journals for all using (auth.uid() = user_id);

-- Hope Jar
alter table hope_messages enable row level security;
create policy "Users can read all approved" on hope_messages for select using (is_approved = true);
create policy "Users can insert own hope" on hope_messages for insert with check (auth.uid() = user_id);

-- Future Capsules
alter table future_capsules enable row level security;
create policy "Users manage own capsules" on future_capsules for all using (auth.uid() = user_id);

-- Affirmations
alter table user_affirmations enable row level security;
create policy "Users view own affirmations" on user_affirmations for select using (auth.uid() = user_id);

-- Sleep
alter table sleep_logs enable row level security;
create policy "Users manage own sleep" on sleep_logs for all using (auth.uid() = user_id);

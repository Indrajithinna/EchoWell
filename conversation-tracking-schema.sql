-- Daily conversation summaries
CREATE TABLE daily_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  conversation_count INTEGER DEFAULT 0,
  total_messages INTEGER DEFAULT 0,
  avg_mood_score DECIMAL(3,1),
  dominant_emotions JSONB,
  topics_discussed TEXT[],
  conversation_quality TEXT, -- 'short', 'moderate', 'deep'
  path TEXT,
  voice_tone_analysis JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE INDEX idx_daily_summaries_user_date ON daily_summaries(user_id, date DESC);

-- Voice tone records
CREATE TABLE voice_tone_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  tone_detected TEXT, -- 'calm', 'anxious', 'sad', 'happy', 'stressed'
  confidence_score DECIMAL(3,2),
  pitch_average DECIMAL(5,2),
  speech_rate DECIMAL(5,2),
  energy_level TEXT, -- 'low', 'medium', 'high'
  emotional_state JSONB,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_voice_tone_user ON voice_tone_logs(user_id, recorded_at DESC);

-- Conversation quality metrics
CREATE TABLE conversation_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  duration_seconds INTEGER,
  message_count INTEGER,
  avg_response_time INTEGER,
  topics_covered TEXT[],
  depth_score INTEGER, -- 1-10 scale
  engagement_score INTEGER, -- 1-10 scale
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_conversation_metrics_user ON conversation_metrics(user_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE daily_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_tone_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own summaries" ON daily_summaries FOR ALL USING (auth.uid()::text = user_id);
CREATE POLICY "Users can view own voice logs" ON voice_tone_logs FOR ALL USING (auth.uid()::text = user_id);
CREATE POLICY "Users can view own metrics" ON conversation_metrics FOR ALL USING (auth.uid()::text = user_id);

-- Functions for automated summary generation
CREATE OR REPLACE FUNCTION generate_daily_summary(target_date DATE, target_user_id TEXT)
RETURNS daily_summaries AS $$
DECLARE
  summary_record daily_summaries%ROWTYPE;
  conv_count INTEGER;
  msg_count INTEGER;
  avg_mood DECIMAL(3,1);
  dominant_emotions_data JSONB;
  topics_data TEXT[];
  quality_level TEXT;
  insights_data TEXT;
  tone_analysis JSONB;
BEGIN
  -- Get conversation count for the day
  SELECT COUNT(*) INTO conv_count
  FROM conversations
  WHERE user_id = target_user_id
    AND DATE(created_at) = target_date;
  
  -- Get total messages for the day
  SELECT COUNT(*) INTO msg_count
  FROM messages m
  JOIN conversations c ON m.conversation_id = c.id
  WHERE c.user_id = target_user_id
    AND DATE(c.created_at) = target_date;
  
  -- Get average mood for the day
  SELECT AVG(mood_score) INTO avg_mood
  FROM mood_logs
  WHERE user_id = target_user_id
    AND DATE(logged_at) = target_date;
  
  -- Analyze dominant emotions
  SELECT jsonb_object_agg(emotion, frequency) INTO dominant_emotions_data
  FROM (
    SELECT unnest(emotions) as emotion, COUNT(*) as frequency
    FROM mood_logs
    WHERE user_id = target_user_id
      AND DATE(logged_at) = target_date
    GROUP BY emotion
    ORDER BY frequency DESC
    LIMIT 5
  ) emotion_analysis;
  
  -- Extract topics from conversations
  SELECT ARRAY_AGG(DISTINCT topic) INTO topics_data
  FROM (
    SELECT unnest(string_to_array(lower(content), ' ')) as topic
    FROM messages m
    JOIN conversations c ON m.conversation_id = c.id
    WHERE c.user_id = target_user_id
      AND DATE(c.created_at) = target_date
      AND m.role = 'user'
      AND length(unnest(string_to_array(lower(content), ' '))) > 4
  ) topic_extraction
  WHERE topic IN ('anxiety', 'stress', 'depression', 'happiness', 'work', 'family', 'relationship', 'therapy', 'meditation', 'exercise');
  
  -- Determine conversation quality
  IF msg_count < 10 THEN
    quality_level := 'short';
  ELSIF msg_count < 30 THEN
    quality_level := 'moderate';
  ELSE
    quality_level := 'deep';
  END IF;
  
  -- Generate AI insights
  insights_data := CASE
    WHEN avg_mood > 7 THEN 'You had a positive day with good emotional well-being. Keep up the great work!'
    WHEN avg_mood BETWEEN 4 AND 7 THEN 'You had a balanced day with mixed emotions. Consider what helped you feel better.'
    ELSE 'You experienced some challenges today. Remember that seeking support is a sign of strength.'
  END;
  
  -- Analyze voice tone (placeholder for now)
  tone_analysis := jsonb_build_object(
    'avg_tone', 'neutral',
    'tone_variations', jsonb_build_object('calm', 0.6, 'anxious', 0.2, 'happy', 0.2),
    'emotional_stability', 0.7
  );
  
  -- Insert or update summary
  INSERT INTO daily_summaries (
    user_id, date, conversation_count, total_messages, avg_mood_score,
    dominant_emotions, topics_discussed, conversation_quality, ai_insights, voice_tone_analysis
  ) VALUES (
    target_user_id, target_date, conv_count, msg_count, avg_mood,
    dominant_emotions_data, topics_data, quality_level, insights_data, tone_analysis
  )
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    conversation_count = EXCLUDED.conversation_count,
    total_messages = EXCLUDED.total_messages,
    avg_mood_score = EXCLUDED.avg_mood_score,
    dominant_emotions = EXCLUDED.dominant_emotions,
    topics_discussed = EXCLUDED.topics_discussed,
    conversation_quality = EXCLUDED.conversation_quality,
    ai_insights = EXCLUDED.ai_insights,
    voice_tone_analysis = EXCLUDED.voice_tone_analysis,
    updated_at = NOW()
  RETURNING * INTO summary_record;
  
  RETURN summary_record;
END;
$$ LANGUAGE plpgsql;

-- Function to log voice tone analysis
CREATE OR REPLACE FUNCTION log_voice_tone(
  p_user_id TEXT,
  p_conversation_id UUID,
  p_tone_detected TEXT,
  p_confidence_score DECIMAL(3,2),
  p_pitch_average DECIMAL(5,2),
  p_speech_rate DECIMAL(5,2),
  p_energy_level TEXT,
  p_emotional_state JSONB DEFAULT '{}'::jsonb
)
RETURNS voice_tone_logs AS $$
DECLARE
  tone_record voice_tone_logs%ROWTYPE;
BEGIN
  INSERT INTO voice_tone_logs (
    user_id, conversation_id, tone_detected, confidence_score,
    pitch_average, speech_rate, energy_level, emotional_state
  ) VALUES (
    p_user_id, p_conversation_id, p_tone_detected, p_confidence_score,
    p_pitch_average, p_speech_rate, p_energy_level, p_emotional_state
  ) RETURNING * INTO tone_record;
  
  RETURN tone_record;
END;
$$ LANGUAGE plpgsql;

-- Function to log conversation metrics
CREATE OR REPLACE FUNCTION log_conversation_metrics(
  p_user_id TEXT,
  p_conversation_id UUID,
  p_duration_seconds INTEGER,
  p_message_count INTEGER,
  p_avg_response_time INTEGER,
  p_topics_covered TEXT[],
  p_depth_score INTEGER,
  p_engagement_score INTEGER
)
RETURNS conversation_metrics AS $$
DECLARE
  metrics_record conversation_metrics%ROWTYPE;
BEGIN
  INSERT INTO conversation_metrics (
    user_id, conversation_id, duration_seconds, message_count,
    avg_response_time, topics_covered, depth_score, engagement_score
  ) VALUES (
    p_user_id, p_conversation_id, p_duration_seconds, p_message_count,
    p_avg_response_time, p_topics_covered, p_depth_score, p_engagement_score
  ) RETURNING * INTO metrics_record;
  
  RETURN metrics_record;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically generate daily summaries
CREATE OR REPLACE FUNCTION trigger_daily_summary()
RETURNS TRIGGER AS $$
BEGIN
  -- Generate summary for the current date
  PERFORM generate_daily_summary(CURRENT_DATE, NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for mood logs
DROP TRIGGER IF EXISTS mood_log_daily_summary_trigger ON mood_logs;
CREATE TRIGGER mood_log_daily_summary_trigger
  AFTER INSERT ON mood_logs
  FOR EACH ROW
  EXECUTE FUNCTION trigger_daily_summary();

-- Create trigger for conversations
DROP TRIGGER IF EXISTS conversation_daily_summary_trigger ON conversations;
CREATE TRIGGER conversation_daily_summary_trigger
  AFTER INSERT ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION trigger_daily_summary();

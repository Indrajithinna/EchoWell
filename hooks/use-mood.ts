// Mood tracking hook
'use client';

import { useState, useEffect, useCallback } from 'react';
import { createMoodEntry, getMoodHistory, MoodEntry } from '@/lib/db-helpers';

export function useMood() {
  const [currentMood, setCurrentMood] = useState<number | null>(null);
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const logMood = useCallback(async (mood: number, note?: string) => {
    setLoading(true);
    try {
      const entry = await createMoodEntry(mood, note);
      if (entry) {
        setMoodHistory(prev => [entry, ...prev]);
        setCurrentMood(mood);
      }
    } catch (error) {
      console.error('Error logging mood:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMoodHistory = useCallback(async () => {
    setLoading(true);
    try {
      const history = await getMoodHistory();
      setMoodHistory(history);
    } catch (error) {
      console.error('Error fetching mood history:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMoodHistory();
  }, [fetchMoodHistory]);

  return {
    currentMood,
    moodHistory,
    loading,
    logMood,
    fetchMoodHistory,
  };
}

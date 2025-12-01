// Database helper functions
import { supabaseAdmin as supabase } from './supabase';

export interface MoodEntry {
  id: string;
  user_id: string;
  mood: number;
  note?: string;
  created_at: string;
}

export async function createMoodEntry(mood: number, note?: string): Promise<MoodEntry | null> {
  try {
    const { data, error } = await supabase
      .from('mood_entries')
      .insert({ mood, note })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating mood entry:', error);
    return null;
  }
}

export async function getMoodHistory(): Promise<MoodEntry[]> {
  try {
    const { data, error } = await supabase
      .from('mood_entries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching mood history:', error);
    return [];
  }
}

// Music player hook
'use client';

import { useState, useCallback, useRef } from 'react';
import { SpotifyTrack } from '@/types/music';

export function useMusic() {
  const [currentTrack, setCurrentTrack] = useState<SpotifyTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playTrack = useCallback((track: SpotifyTrack) => {
    if (audioRef.current) {
      audioRef.current.src = track.preview_url || '';
      setCurrentTrack(track);
      setIsPlaying(true);
      audioRef.current.play();
    }
  }, []);

  const pauseTrack = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const resumeTrack = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, []);

  const stopTrack = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, []);

  const setTrackVolume = useCallback((newVolume: number) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  }, []);

  return {
    currentTrack,
    isPlaying,
    volume,
    currentTime,
    audioRef,
    playTrack,
    pauseTrack,
    resumeTrack,
    stopTrack,
    setTrackVolume,
  };
}

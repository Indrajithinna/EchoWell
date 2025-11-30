// Music-related type definitions
export interface SpotifyTrack {
  id: string;
  name: string;
  artists: SpotifyArtist[];
  album: SpotifyAlbum;
  duration_ms: number;
  preview_url?: string;
  external_urls: {
    spotify: string;
  };
}

export interface SpotifyArtist {
  id: string;
  name: string;
  external_urls: {
    spotify: string;
  };
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  images: SpotifyImage[];
  external_urls: {
    spotify: string;
  };
}

export interface SpotifyImage {
  url: string;
  height: number;
  width: number;
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  tracks: {
    total: number;
  };
  images: SpotifyImage[];
  owner: {
    display_name: string;
  };
}

export interface MusicGenerationRequest {
  mood: string;
  genre: string;
  duration: number;
  tempo?: number;
  key?: string;
}

export interface GeneratedMusic {
  id: string;
  title: string;
  url: string;
  duration: number;
  mood: string;
  created_at: string;
}

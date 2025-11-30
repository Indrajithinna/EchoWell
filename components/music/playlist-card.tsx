'use client'

import { Music, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Playlist {
  id: string
  name: string
  description: string
  images: Array<{ url: string }>
  external_urls: {
    spotify: string
  }
}

interface PlaylistCardProps {
  playlist: Playlist
  onPlay?: () => void
}

export default function PlaylistCard({ playlist, onPlay }: PlaylistCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all overflow-hidden group">
      {/* Playlist Image */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-calm-100 to-zen-100">
        {playlist.images[0]?.url ? (
          <img
            src={playlist.images[0].url}
            alt={playlist.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Music className="w-16 h-16 text-gray-300" />
          </div>
        )}

        {/* Play Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button
            size="lg"
            onClick={onPlay}
            className="rounded-full bg-calm-500 hover:bg-calm-600 shadow-lg transform scale-90 group-hover:scale-100 transition-transform"
          >
            <Play size={24} className="ml-1" />
          </Button>
        </div>
      </div>

      {/* Playlist Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
          {playlist.name}
        </h3>
        <p className="text-xs text-gray-600 line-clamp-2 mb-3">
          {playlist.description}
        </p>

        <a
          href={playlist.external_urls.spotify}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-calm-600 hover:text-calm-700 font-medium flex items-center gap-1"
        >
          Open in Spotify →
        </a>
      </div>
    </div>
  )
}

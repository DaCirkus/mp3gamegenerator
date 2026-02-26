'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { listGames, type GameData } from '@/lib/supabase'

const PAGE_SIZE = 12

// Extracts a human-readable song name from the Supabase MP3 URL
function songNameFromUrl(mp3Url: string): string {
  try {
    const decoded = decodeURIComponent(mp3Url)
    // Filename sits after the last slash, formatted as "{timestamp}-{name}.mp3"
    const filename = decoded.split('/').pop() ?? ''
    // Strip the leading timestamp prefix and the .mp3 extension
    const withoutTimestamp = filename.replace(/^\d+-/, '')
    const withoutExt = withoutTimestamp.replace(/\.mp3$/i, '')
    // Replace underscores with spaces for readability
    return withoutExt.replace(/_/g, ' ') || 'Untitled'
  } catch {
    return 'Untitled'
  }
}

// Picks a card accent colour from the game's visual customization or falls back to a default
function accentColor(game: GameData): string {
  const bg = game.visual_customization?.background
  if (bg?.type === 'color' && bg.color) return bg.color
  if (bg?.type === 'gradient' && bg.gradientColors?.length) return bg.gradientColors[0]
  return '#239063'
}

export default function GameBrowser() {
  const router = useRouter()
  const [games, setGames] = useState<GameData[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetches one page of games from Supabase
  const fetchGames = useCallback(async (targetPage: number) => {
    setLoading(true)
    setError(null)
    try {
      const result = await listGames(targetPage, PAGE_SIZE)
      setGames(result.games)
      setTotal(result.total)
      setPage(targetPage)
    } catch (err) {
      console.error('Failed to load games:', err)
      setError(err instanceof Error ? err.message : 'Failed to load games')
    } finally {
      setLoading(false)
    }
  }, [])

  // Load the first page on mount
  useEffect(() => {
    fetchGames(0)
  }, [fetchGames])

  const totalPages = Math.ceil(total / PAGE_SIZE)
  const hasNextPage = page < totalPages - 1
  const hasPrevPage = page > 0

  // Nothing to show yet and still loading
  if (loading && games.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-8 h-8 border-2 border-gray-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs text-gray-500">Loading games...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-6 text-xs text-red-400">
        {error}
      </div>
    )
  }

  if (games.length === 0) {
    return (
      <div className="text-center py-6 text-xs text-gray-500">
        No games yet — be the first to create one!
      </div>
    )
  }

  // Deduplicate by song name, keeping only the most recent (already sorted newest-first)
  const dedupedGames = games.reduce<GameData[]>((unique, game) => {
    const name = songNameFromUrl(game.mp3_url).toLowerCase()
    const alreadySeen = unique.some(
      existing => songNameFromUrl(existing.mp3_url).toLowerCase() === name
    )
    if (!alreadySeen) unique.push(game)
    return unique
  }, [])

  return (
    <div>
      {/* Pagination controls above the grid — only shown when there are multiple pages */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mb-3 text-xs text-gray-400">
          <button
            onClick={() => fetchGames(page - 1)}
            disabled={!hasPrevPage || loading}
            className="px-3 py-1 bg-gray-800 rounded hover:bg-gray-700 disabled:opacity-30 
              disabled:cursor-not-allowed transition-colors"
          >
            ← Prev
          </button>
          <span>{page + 1} / {totalPages}</span>
          <button
            onClick={() => fetchGames(page + 1)}
            disabled={!hasNextPage || loading}
            className="px-3 py-1 bg-gray-800 rounded hover:bg-gray-700 disabled:opacity-30 
              disabled:cursor-not-allowed transition-colors"
          >
            Next →
          </button>
        </div>
      )}

      {/* Game card grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {dedupedGames.map(game => {
          const name = songNameFromUrl(game.mp3_url)
          const accent = accentColor(game)
          const noteCount = game.midi_data?.notes?.length ?? 0
          const tempo = Math.round(game.midi_data?.tempo ?? 120)
          const dateLabel = new Date(game.created_at).toLocaleDateString()

          return (
            <button
              key={game.id}
              onClick={() => router.push(`/game/${game.id}`)}
              className="group relative bg-gray-800 hover:bg-gray-750 border border-gray-700 
                hover:border-gray-600 rounded-lg p-3 text-left transition-all duration-200 
                hover:scale-[1.02] hover:shadow-lg focus:outline-none focus:ring-1 focus:ring-gray-500"
            >
              {/* Colour accent bar along the top */}
              <div
                className="absolute top-0 left-0 right-0 h-1 rounded-t-lg"
                style={{ backgroundColor: accent }}
              />

              {/* Song name */}
              <p className="text-sm font-medium text-gray-200 truncate mt-1" title={name}>
                {name}
              </p>

              {/* Stats row */}
              <div className="flex items-center gap-2 mt-2 text-[10px] text-gray-500">
                <span>{tempo} BPM</span>
                <span>·</span>
                <span>{noteCount} notes</span>
              </div>

              {/* Date */}
              <p className="text-[10px] text-gray-600 mt-1">{dateLabel}</p>

              {/* Play hint on hover */}
              <div className="absolute inset-0 flex items-center justify-center rounded-lg
                bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-sm font-medium">Play ▶</span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

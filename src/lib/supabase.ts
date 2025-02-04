import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing environment variables for Supabase')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// Types for our game data
export interface GameData {
  id: string
  mp3_url: string
  midi_data: {
    notes: Array<{
      time: number
      midi: number
      duration: number
      velocity: number
    }>
    tempo: number
  }
  created_at: string
}

// Storage bucket names
export const STORAGE_BUCKETS = {
  MP3: 'mp3-files'
} as const

// Table names
export const TABLES = {
  GAMES: 'rhythmGames'
} as const

function sanitizeFilename(filename: string): string {
  // Remove special characters and replace spaces with underscores
  return filename
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special chars with underscore
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
}

// Helper functions
export async function uploadFile(file: File, bucket: keyof typeof STORAGE_BUCKETS) {
  const timestamp = Date.now()
  const sanitizedName = sanitizeFilename(file.name)
  const fileName = `${timestamp}-${sanitizedName}`
  
  console.log('Uploading file:', fileName, 'type:', file.type)
  
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKETS[bucket])
    .upload(fileName, file, {
      contentType: file.type,
      cacheControl: '3600',
      upsert: false
    })
  
  if (error) {
    console.error('Upload error:', error)
    throw error
  }
  
  const { data: { publicUrl } } = supabase.storage
    .from(STORAGE_BUCKETS[bucket])
    .getPublicUrl(fileName)
  
  return publicUrl
}

export async function createGame(mp3Url: string, midiData: GameData['midi_data']) {
  const { data, error } = await supabase
    .from(TABLES.GAMES)
    .insert([{ mp3_url: mp3Url, midi_data: midiData }])
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function getGame(id: string) {
  const { data, error } = await supabase
    .from(TABLES.GAMES)
    .select()
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data
} 
'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function GameRedirect() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const gameId = searchParams.get('id')

  useEffect(() => {
    if (gameId) {
      router.replace(`/game/${gameId}`)
    } else {
      router.replace('/')
    }
  }, [gameId, router])

  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <div className="p-8 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 text-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xl font-medium text-primary-200">Redirecting...</p>
      </div>
    </div>
  )
} 
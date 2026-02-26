'use client';

import FileUpload from '@/components/FileUpload'
import GameBrowser from '@/components/GameBrowser'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 max-w-screen-md">
        {/* Header */}
        <header className="text-center mb-6">
          <h1 className="text-2xl font-bold" style={{ color: '#ffffff' }}>
            MP3 to Rhythm Game
          </h1>
          <p className="text-sm text-gray-400">
            Transform your music into a playable rhythm game
          </p>
        </header>

        {/* Main Content */}
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {/* Upload Box */}
          <div className="p-4 md:p-6 md:mx-auto md:max-w-[500px] lg:max-w-[600px]">
            <FileUpload />
          </div>
          
          {/* Features */}
          <div className="bg-gray-850 border-t border-gray-700 p-4">
            <h2 className="text-sm font-medium mb-3 text-gray-300">Features</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { icon: '🎵', text: 'Upload MP3' },
                { icon: '🎮', text: 'Generate Game' },
                { icon: '⌨️', text: 'Play with Keys' },
                { icon: '🔗', text: 'Share' }
              ].map((feature) => (
                <div 
                  key={feature.text}
                  className="bg-gray-800 p-2 rounded flex items-center gap-2"
                >
                  <span className="text-xs">{feature.icon}</span>
                  <span className="text-xs">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Community Games */}
        <section className="mt-8">
          <h2 className="text-lg font-semibold mb-3 text-gray-200">Community Games</h2>
          <GameBrowser />
        </section>
        
        {/* Footer */}
        <footer className="mt-6 text-center text-xs text-gray-500">
          <p>Create and share rhythm games from your favorite music</p>
        </footer>
      </div>
    </main>
  )
}

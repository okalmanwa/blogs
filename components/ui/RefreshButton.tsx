'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from './Button'

export function RefreshButton() {
  const router = useRouter()
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  const handleRefresh = () => {
    setIsRefreshing(true)
    router.refresh()
    setLastRefreshed(new Date())
    
    // Reset refreshing state after a short delay
    setTimeout(() => {
      setIsRefreshing(false)
    }, 500)
  }

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
    if (seconds < 10) return 'just now'
    if (seconds < 60) return `${seconds} seconds ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes === 1) return '1 minute ago'
    return `${minutes} minutes ago`
  }
  
  return (
    <div className="relative group">
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="flex items-center gap-2"
      >
        <svg
          className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        {isRefreshing ? 'Refreshing...' : 'Refresh'}
      </Button>
      {lastRefreshed && (
        <div className="absolute right-0 mt-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
          Last refreshed {formatTimeAgo(lastRefreshed)}
        </div>
      )}
    </div>
  )
}

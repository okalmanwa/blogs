'use client'

import { useEffect, useState, useRef } from 'react'
import { usePathname } from 'next/navigation'

export function NavigationLoading() {
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(false)
  const pathnameRef = useRef(pathname)

  useEffect(() => {
    // Listen for link clicks
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest('a[href]')
      if (link) {
        const href = link.getAttribute('href')
        // Only show loading for internal links
        if (href && (href.startsWith('/') || href.startsWith(window.location.origin))) {
          setIsLoading(true)
        }
      }
    }

    document.addEventListener('click', handleClick, true)

    return () => {
      document.removeEventListener('click', handleClick, true)
    }
  }, [])

  useEffect(() => {
    // Hide loading when pathname changes (navigation complete)
    if (pathnameRef.current !== pathname) {
      pathnameRef.current = pathname
      // Small delay to ensure smooth transition
      const timer = setTimeout(() => {
        setIsLoading(false)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [pathname])

  if (!isLoading) return null

  return (
    <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 z-[9999]">
      <div 
        className="h-full bg-cornell-red transition-all duration-300 ease-out"
        style={{ 
          width: '70%',
          animation: 'pulse 1.5s ease-in-out infinite'
        }} 
      />
    </div>
  )
}

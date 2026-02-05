'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface MobileNavProps {
  isAuthenticated: boolean
  isAdmin: boolean
}

export function MobileNav({ isAuthenticated, isAdmin }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/login">
          <button className="px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50">
            Login
          </button>
        </Link>
      </div>
    )
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <>
      {/* Hamburger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-700 hover:text-cornell-red transition-colors flex-shrink-0"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[60]"
          style={{ top: '56px' }}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile menu drawer */}
      {isOpen && (
        <div
          className="fixed left-0 right-0 bg-white border-b-2 border-cornell-red shadow-lg z-[100] max-h-[calc(100vh-56px)] overflow-y-auto"
          style={{ top: '56px' }}
        >
          <nav className="max-w-7xl mx-auto px-4 py-4 space-y-1 font-serif">
          {isAdmin ? (
            <>
              <Link
                href="/admin/dashboard"
                className="block px-4 py-3 text-base font-medium text-gray-700 hover:text-cornell-red hover:bg-gray-50 rounded-md transition-colors"
              >
                Create Project
              </Link>
              <Link
                href="/"
                className="block px-4 py-3 text-base font-medium text-gray-700 hover:text-cornell-red hover:bg-gray-50 rounded-md transition-colors"
              >
                Blogs
              </Link>
              <Link
                href="/admin/moderation"
                className="block px-4 py-3 text-base font-medium text-gray-700 hover:text-cornell-red hover:bg-gray-50 rounded-md transition-colors"
              >
                Moderation
              </Link>
              <div className="pt-2 border-t border-gray-200 mt-2 px-4">
                <button
                  onClick={async () => {
                    const supabase = createClient()
                    await supabase.auth.signOut()
                    window.location.href = '/'
                  }}
                  className="w-full px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:border-gray-400 transition-colors text-left"
                >
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                href="/"
                className="block px-4 py-3 text-base font-medium text-gray-700 hover:text-cornell-red hover:bg-gray-50 rounded-md transition-colors"
              >
                Blogs
              </Link>
              <Link
                href="/student/dashboard"
                className="block px-4 py-3 text-base font-medium text-gray-700 hover:text-cornell-red hover:bg-gray-50 rounded-md transition-colors"
              >
                Dashboard
              </Link>
              <div className="pt-2 border-t border-gray-200 mt-2 px-4">
                <button
                  onClick={async () => {
                    const supabase = createClient()
                    await supabase.auth.signOut()
                    window.location.href = '/'
                  }}
                  className="w-full px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:border-gray-400 transition-colors text-left"
                >
                  Sign Out
                </button>
              </div>
            </>
          )}
          </nav>
        </div>
      )}
    </>
  )
}

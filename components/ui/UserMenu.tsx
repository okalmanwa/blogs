'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from './Button'
import { Profile } from '@/types'

interface UserMenuProps {
  user: { id: string; email?: string }
  profile: Profile
}

export function UserMenu({ user, profile }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    // Sign out from Supabase
    await supabase.auth.signOut()
    
    // Redirect
    window.location.href = '/'
  }

  const dashboardPath = profile.role === 'admin' 
    ? '/admin/dashboard' 
    : '/student/dashboard'

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-cornell-dark-gray hover:text-cornell-red transition-colors"
      >
        <span className="hidden md:block font-medium">{profile.username || user.email}</span>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="py-1">
              <Link
                href={dashboardPath}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setIsOpen(false)}
              >
                Dashboard
              </Link>
              {profile.role === 'admin' && (
                <Link
                  href="/admin/projects"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsOpen(false)}
                >
                  Manage Projects
                </Link>
              )}
              <button
                onClick={handleSignOut}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              >
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

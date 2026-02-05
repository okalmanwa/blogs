'use client'

import { createClient } from '@/lib/supabase/client'

export function SignOutButton() {
  const supabase = createClient()

  const handleSignOut = async () => {
    // Sign out from Supabase
    await supabase.auth.signOut()
    
    // Redirect
    window.location.href = '/'
  }

  return (
    <button
      onClick={handleSignOut}
      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:border-gray-400 transition-colors"
    >
      Sign Out
    </button>
  )
}

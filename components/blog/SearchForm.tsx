'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'

interface SearchFormProps {
  currentSearch?: string
}

export function SearchForm({ currentSearch }: SearchFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(currentSearch || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    if (search.trim()) {
      params.set('search', search.trim())
    } else {
      params.delete('search')
    }
    router.push(`?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSubmit} className="relative flex-1 min-w-0">
      <input
        type="text"
        name="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search posts..."
        className="w-full pl-10 pr-3 py-2 sm:pl-11 sm:pr-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cornell-red focus:border-cornell-red transition-all duration-200 text-sm sm:text-base text-gray-900 placeholder-gray-400 bg-white shadow-sm hover:shadow-md"
      />
      <svg 
        className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </form>
  )
}

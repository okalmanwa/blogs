'use client'

import { Button } from '@/components/ui/Button'

type FilterType = 'all' | 'open' | 'closed'

interface ProjectFilterProps {
  value: FilterType
  onChange: (filter: FilterType) => void
  counts: {
    all: number
    open: number
    closed: number
  }
}

export function ProjectFilter({ value, onChange, counts }: ProjectFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600 mr-2">Show:</span>
      <div className="inline-flex rounded-lg border border-gray-300 p-1 bg-white">
        <button
          onClick={() => onChange('all')}
          className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
            value === 'all'
              ? 'bg-cornell-red text-white'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <span className="font-medium">All</span>
          <span className={`ml-2 ${value === 'all' ? 'opacity-90' : 'text-gray-500'}`}>
            {counts.all}
          </span>
        </button>
        <button
          onClick={() => onChange('open')}
          className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
            value === 'open'
              ? 'bg-cornell-red text-white'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <span className="font-medium">Open</span>
          <span className={`ml-2 ${value === 'open' ? 'opacity-90' : 'text-gray-500'}`}>
            {counts.open}
          </span>
        </button>
        <button
          onClick={() => onChange('closed')}
          className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
            value === 'closed'
              ? 'bg-cornell-red text-white'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <span className="font-medium">Closed</span>
          <span className={`ml-2 ${value === 'closed' ? 'opacity-90' : 'text-gray-500'}`}>
            {counts.closed}
          </span>
        </button>
      </div>
    </div>
  )
}

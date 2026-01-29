'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ProjectForm } from './ProjectForm'

export function CreateProjectButton() {
  const [isOpen, setIsOpen] = useState(false)

  if (!isOpen) {
    return (
      <div className="bg-white rounded-xl shadow-lg border-2 border-dashed border-gray-300 hover:border-cornell-red transition-all duration-200 cursor-pointer group" onClick={() => setIsOpen(true)}>
        <div className="text-center py-10 px-6">
          <div className="mb-5">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-cornell-red/10 to-cornell-red/5 rounded-full flex items-center justify-center group-hover:from-cornell-red/20 group-hover:to-cornell-red/10 transition-all">
              <svg
                className="w-8 h-8 text-cornell-red"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-cornell-red transition-colors">
            Create New Project
          </h2>
          <p className="text-gray-600 mb-6 text-sm max-w-md mx-auto">
            Start a new academic year or initiative to organize student submissions
          </p>
          <Button variant="primary" size="lg" onClick={(e) => { e.stopPropagation(); setIsOpen(true); }}>
            Create Project
          </Button>
        </div>
      </div>
    )
  }

  return (
    <ProjectForm onSuccess={() => setIsOpen(false)} onCancel={() => setIsOpen(false)} />
  )
}

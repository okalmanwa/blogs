import { Card } from '@/components/ui/Card'

export function EmptyProjectsState() {
  return (
    <Card className="text-center py-12 px-6">
      <div className="max-w-md mx-auto">
        <div className="mb-4">
          <svg
            className="w-16 h-16 mx-auto text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No projects yet
        </h3>
        <p className="text-gray-600 mb-1">
          Projects organize submissions by academic year or initiative.
        </p>
        <p className="text-sm text-gray-500">
          Create your first project to start accepting student submissions.
        </p>
      </div>
    </Card>
  )
}

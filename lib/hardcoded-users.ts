// Hardcoded users for development/testing
// These users will be created automatically if they don't exist

export const HARDCODED_USERS = {
  admin: {
    email: 'admin@cornell.edu',
    password: 'admin123',
    username: 'admin',
    full_name: 'Admin User',
    role: 'admin' as const,
  },
  student: {
    email: 'student@cornell.edu',
    password: 'student123',
    username: 'student',
    full_name: 'Student User',
    role: 'student' as const,
  },
  viewer: {
    email: 'viewer@cornell.edu',
    password: 'viewer123',
    username: 'viewer',
    full_name: 'Viewer User',
    role: 'viewer' as const,
  },
}

type HardcodedUser = typeof HARDCODED_USERS.admin | typeof HARDCODED_USERS.student | typeof HARDCODED_USERS.viewer

export function isHardcodedUser(email: string, password: string): { user: HardcodedUser; role: 'admin' | 'student' | 'viewer' } | null {
  if (email === HARDCODED_USERS.admin.email && password === HARDCODED_USERS.admin.password) {
    return { user: HARDCODED_USERS.admin, role: 'admin' }
  }
  if (email === HARDCODED_USERS.student.email && password === HARDCODED_USERS.student.password) {
    return { user: HARDCODED_USERS.student, role: 'student' }
  }
  if (email === HARDCODED_USERS.viewer.email && password === HARDCODED_USERS.viewer.password) {
    return { user: HARDCODED_USERS.viewer, role: 'viewer' }
  }
  return null
}

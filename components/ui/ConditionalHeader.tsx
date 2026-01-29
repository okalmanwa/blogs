import { headers } from 'next/headers'
import { Header } from './Header'

export async function ConditionalHeader() {
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || headersList.get('referer') || ''
  
  // Don't show header on admin pages (they have their own layout)
  if (pathname.includes('/admin')) {
    return null
  }
  
  return <Header />
}

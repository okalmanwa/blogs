import { redirect } from 'next/navigation'

export default async function BlogsPage() {
  // Redirect /blogs to homepage since blogs is now the landing page
  redirect('/')
}

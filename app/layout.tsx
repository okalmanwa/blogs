import type { Metadata } from 'next'
import { Source_Serif_4, Source_Sans_3 } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/ui/Header'
import { Footer } from '@/components/ui/Footer'
import { NavigationLoading } from '@/components/ui/NavigationLoading'

const sourceSerif = Source_Serif_4({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-serif',
  display: 'swap',
})

const sourceSans = Source_Sans_3({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Cornell SC Johnson College of Business - Student Blog',
  description: 'A platform for students to share their experiences and projects',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${sourceSerif.variable} ${sourceSans.variable}`}>
      <body className={sourceSans.className}>
        <NavigationLoading />
        <div className="flex flex-col min-h-screen">
          <div id="main-header">
            <Header />
          </div>
          <main className="flex-grow">
            {children}
          </main>
          <div id="main-footer">
            <Footer />
          </div>
        </div>
      </body>
    </html>
  )
}

import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Web3Provider } from '@/providers/Web3Provider'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: '.arc Identity Hub',
  description: 'Mint, resolve and manage your .arc domain on Arc Network',
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: '.arc Identity Hub',
    description: 'Your decentralized identity on Arc Network',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <Web3Provider>
          {children}
        </Web3Provider>
      </body>
    </html>
  )
}

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

const siteUrl = 'https://arc-identity-hub.vercel.app'

export const metadata: Metadata = {
  title: {
    default: '.arc Identity Hub — Mint Your Domain on Arc Network',
    template: '%s | .arc Identity Hub',
  },
  description:
    'Register, search and manage your .arc domain name on Arc Network. Mint a decentralized identity directly on-chain — no redirect, no external mint page.',
  keywords: [
    'arc network',
    'arc domain',
    '.arc',
    'ZNS Connect',
    'domain name',
    'web3 identity',
    'decentralized identity',
    'mint domain',
    'arc testnet',
  ],
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: '.arc Identity Hub',
    description:
      'Mint and manage your .arc domain on Arc Network. Your decentralized identity, on-chain.',
    url: siteUrl,
    siteName: '.arc Identity Hub',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: '.arc Identity Hub',
    description:
      'Mint and manage your .arc domain on Arc Network. Your decentralized identity, on-chain.',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.ico',
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

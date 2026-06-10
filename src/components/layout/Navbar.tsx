'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const links = [
  { href: '/', label: 'Home' },
  { href: '/search', label: 'Search' },
  { href: '/register', label: 'Register' },
  { href: '/profile', label: 'Profile' },
]

export function Navbar() {
  const pathname = usePathname()

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="mx-auto max-w-6xl px-4 py-4">
        <div className="flex items-center justify-between rounded-2xl border border-[rgba(99,102,241,0.18)] bg-[rgba(5,5,8,0.85)] px-5 py-3 backdrop-blur-xl shadow-[0_4px_32px_rgba(0,0,0,0.4)]">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 shadow-[0_0_12px_rgba(99,102,241,0.5)]">
              <span className="text-sm font-bold text-white">.arc</span>
            </div>
            <span className="hidden font-semibold text-white sm:block">
              Identity Hub
            </span>
          </Link>

          {/* Nav links */}
          <nav className="hidden items-center gap-1 md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                  pathname === link.href
                    ? 'bg-[rgba(99,102,241,0.18)] text-indigo-300'
                    : 'text-[rgba(160,160,200,0.7)] hover:bg-[rgba(99,102,241,0.08)] hover:text-white'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Connect button */}
          <ConnectButton
            showBalance={false}
            accountStatus="avatar"
            chainStatus="icon"
          />
        </div>
      </div>
    </motion.header>
  )
}

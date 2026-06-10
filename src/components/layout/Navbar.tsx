'use client'

import { useState } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const links = [
  { href: '/', label: 'Home' },
  { href: '/search', label: 'Search' },
  { href: '/register', label: 'Register' },
  { href: '/profile', label: 'Profile' },
]

export function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-x-0 top-0 z-50"
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6">
        <div className="relative rounded-2xl border border-[rgba(99,102,241,0.18)] bg-[rgba(5,5,8,0.86)] px-4 py-3 backdrop-blur-xl shadow-[0_8px_36px_rgba(0,0,0,0.42)] sm:px-5">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            {/* Logo */}
            <Link href="/" className="flex min-w-0 items-center gap-2" onClick={() => setOpen(false)}>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 shadow-[0_0_16px_rgba(99,102,241,0.55)]">
                <span className="text-sm font-bold text-white">.arc</span>
              </div>
              <span className="hidden truncate font-semibold text-white sm:block">
                Identity Hub
              </span>
            </Link>

            {/* Desktop nav links */}
            <nav className="hidden items-center gap-2 md:flex">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'rounded-xl px-3.5 py-2 text-sm font-medium transition-all',
                    pathname === link.href
                      ? 'bg-[rgba(99,102,241,0.2)] text-indigo-200 shadow-[0_0_16px_rgba(99,102,241,0.08)]'
                      : 'text-slate-300 hover:bg-[rgba(99,102,241,0.1)] hover:text-white'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Mobile nav toggle */}
            <button
              type="button"
              onClick={() => setOpen(v => !v)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[rgba(99,102,241,0.18)] bg-[rgba(15,15,30,0.55)] text-slate-300 transition-colors hover:text-white md:hidden"
              aria-label="Toggle navigation"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>

            {/* Connect button */}
            <div className="flex justify-end">
              <ConnectButton
                showBalance={false}
                accountStatus="avatar"
                chainStatus="icon"
              />
            </div>
          </div>

          <AnimatePresence>
            {open && (
              <motion.nav
                initial={{ opacity: 0, height: 0, y: -6 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="overflow-hidden md:hidden"
              >
                <div className="mt-3 grid grid-cols-2 gap-2 border-t border-[rgba(99,102,241,0.12)] pt-3">
                  {links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        'rounded-xl px-3.5 py-2.5 text-center text-sm font-medium transition-all',
                        pathname === link.href
                          ? 'bg-[rgba(99,102,241,0.2)] text-indigo-200'
                          : 'bg-[rgba(15,15,30,0.45)] text-slate-300 hover:bg-[rgba(99,102,241,0.1)] hover:text-white'
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </motion.nav>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.header>
  )
}

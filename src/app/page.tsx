'use client'

import { motion } from 'framer-motion'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Navbar } from '@/components/layout/Navbar'
import { Badge } from '@/components/ui/Badge'
import { Search, Wallet } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  const { isConnected } = useAccount()

  return (
    <div className="relative min-h-screen">
      <Navbar />

      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Badge variant="success" className="mb-8 text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
            Live on Arc Testnet
          </Badge>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="mb-5 text-center text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl"
        >
          Your{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-300 bg-clip-text text-transparent">
            .arc
          </span>{' '}
          identity
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-12 max-w-md text-center text-lg text-slate-400 leading-relaxed"
        >
          Mint and manage your decentralized domain on Arc Network.
        </motion.p>

        {/* CTA buttons — order matches navbar: Search → Register */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex flex-col gap-4 sm:flex-row"
        >
          <Link
            href="/search"
            className="inline-flex items-center justify-center gap-2.5 rounded-2xl border border-[rgba(99,102,241,0.24)] bg-[rgba(15,15,30,0.58)] px-7 py-3.5 text-sm font-semibold text-indigo-200 transition-all hover:border-indigo-400/45 hover:bg-[rgba(99,102,241,0.12)]"
          >
            <Search className="h-4 w-4" /> Search identity
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-indigo-600 px-7 py-3.5 text-sm font-semibold text-white shadow-[0_0_28px_rgba(99,102,241,0.35)] transition-all hover:bg-indigo-500 active:scale-[0.98]"
          >
            <Wallet className="h-4 w-4" /> Register .arc name
          </Link>
        </motion.div>

        {/* Connect wallet — centered, not just in navbar corner */}
        {!isConnected && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="mt-10 flex flex-col items-center gap-3"
          >
            <p className="text-sm text-slate-500">Connect wallet to get started</p>
            <ConnectButton />
          </motion.div>
        )}

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="absolute bottom-8 text-center text-xs text-slate-600"
        >
          Powered by{' '}
          <a href="https://arc.network" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-400">Arc Network</a>
          {' '}·{' '}
          <a href="https://znsconnect.io" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-400">ZNS Connect</a>
        </motion.p>
      </main>
    </div>
  )
}

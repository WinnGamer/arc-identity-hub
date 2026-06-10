'use client'

import { motion } from 'framer-motion'
import { Navbar } from '@/components/layout/Navbar'
import { HeroSearch } from '@/components/home/HeroSearch'
import { ConnectedIdentity } from '@/components/home/ConnectedIdentity'
import { Badge } from '@/components/ui/Badge'
import { Zap, Search, Globe, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const features = [
  {
    icon: Search,
    title: 'Resolve Identities',
    desc: 'Look up any .arc name or reverse-resolve a wallet address instantly.',
    href: '/search',
  },
  {
    icon: Globe,
    title: 'Register a Name',
    desc: 'Mint your .arc domain on Arc Testnet. Your on-chain identity.',
    href: '/register',
  },
  {
    icon: Zap,
    title: 'Manage Profile',
    desc: 'Set your primary name, avatar, bio, and social links in one place.',
    href: '/profile',
  },
]

export default function HomePage() {
  return (
    <div className="relative min-h-screen">
      <Navbar />

      {/* Hero */}
      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 pt-24 pb-16">
        {/* Live badge */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Badge variant="success" className="mb-6 text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
            Live on Arc Testnet · Chain ID 5042002
          </Badge>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="mb-4 text-center text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl"
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
          className="mb-10 max-w-lg text-center text-base text-[rgba(160,160,200,0.65)] sm:text-lg"
        >
          Mint, resolve, and manage your decentralized domain on Arc Network.
          One name for your entire on-chain identity.
        </motion.p>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="w-full max-w-2xl"
        >
          <HeroSearch />
        </motion.div>

        {/* Connected identity widget */}
        <ConnectedIdentity />

        {/* Feature cards */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mt-16 grid w-full max-w-4xl gap-4 sm:grid-cols-3"
        >
          {features.map((f) => (
            <Link key={f.href} href={f.href} className="group block">
              <div className="h-full rounded-2xl border border-[rgba(99,102,241,0.15)] bg-[rgba(15,15,30,0.6)] p-5 backdrop-blur-sm transition-all duration-200 hover:border-[rgba(99,102,241,0.35)] hover:bg-[rgba(15,15,30,0.85)] hover:shadow-[0_0_24px_rgba(99,102,241,0.1)]">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600/20">
                  <f.icon className="h-4.5 w-4.5 text-indigo-400" />
                </div>
                <h3 className="mb-1.5 font-semibold text-white">{f.title}</h3>
                <p className="text-sm text-[rgba(160,160,200,0.6)] leading-relaxed">{f.desc}</p>
                <div className="mt-3 flex items-center gap-1 text-xs font-medium text-indigo-400 opacity-0 transition-opacity group-hover:opacity-100">
                  Open <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            </Link>
          ))}
        </motion.div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center text-xs text-[rgba(160,160,200,0.3)]"
        >
          Powered by{' '}
          <a href="https://arc.network" target="_blank" rel="noopener noreferrer" className="underline hover:text-[rgba(160,160,200,0.6)]">Arc Network</a>
          {' '}&{' '}
          <a href="https://znsconnect.io" target="_blank" rel="noopener noreferrer" className="underline hover:text-[rgba(160,160,200,0.6)]">ZNS Connect</a>
        </motion.p>
      </main>
    </div>
  )
}

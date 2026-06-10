'use client'

import { useState, useEffect, Suspense } from 'react'
import { motion } from 'framer-motion'
import { useSearchParams } from 'next/navigation'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Navbar } from '@/components/layout/Navbar'
import { GlowCard } from '@/components/ui/GlowCard'
import { Badge } from '@/components/ui/Badge'
import { resolveDomain, formatDomain } from '@/lib/zns'
import { cn } from '@/lib/utils'
import {
  Search, CheckCircle, XCircle, Loader2, ExternalLink,
  AlertCircle, Wallet
} from 'lucide-react'

type AvailabilityStatus = 'idle' | 'checking' | 'available' | 'taken'

function RegisterContent() {
  const searchParams = useSearchParams()
  const { isConnected } = useAccount()
  const [name, setName] = useState(searchParams.get('name') || '')
  const [status, setStatus] = useState<AvailabilityStatus>('idle')
  const [debounceTimer, setDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null)

  const isValidName = (n: string) => /^[a-zA-Z0-9_-]{3,32}$/.test(n)

  const checkAvailability = async (n: string) => {
    if (!isValidName(n)) { setStatus('idle'); return }
    setStatus('checking')
    const data = await resolveDomain(n)
    const isTaken = !!(data?.address && data.address !== '0x0000000000000000000000000000000000000000')
    setStatus(isTaken ? 'taken' : 'available')
  }

  useEffect(() => {
    if (debounceTimer) clearTimeout(debounceTimer)
    if (!name) { setStatus('idle'); return }
    const timer = setTimeout(() => checkAvailability(name), 600)
    setDebounceTimer(timer)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name])

  const statusColor = {
    idle: 'border-[rgba(99,102,241,0.25)]',
    checking: 'border-[rgba(99,102,241,0.4)]',
    available: 'border-emerald-500/50 shadow-[0_0_20px_rgba(34,197,94,0.08)]',
    taken: 'border-red-500/40',
  }

  return (
    <div className="space-y-6">
      {/* Name input */}
      <GlowCard>
        <label className="mb-3 block text-sm font-medium text-[rgba(160,160,200,0.7)]">
          Choose your .arc name
        </label>
        <div className={cn(
          'flex items-center rounded-xl border bg-[rgba(8,8,18,0.8)] transition-all duration-200',
          statusColor[status]
        )}>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
            placeholder="yourname"
            maxLength={32}
            className="flex-1 bg-transparent px-4 py-3.5 text-white placeholder-[rgba(160,160,200,0.35)] outline-none font-mono"
          />
          <span className="mr-4 font-medium text-indigo-400">.arc</span>
          <div className="mr-4 flex h-5 w-5 items-center justify-center">
            {status === 'checking' && <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />}
            {status === 'available' && <CheckCircle className="h-4 w-4 text-emerald-400" />}
            {status === 'taken' && <XCircle className="h-4 w-4 text-red-400" />}
          </div>
        </div>

        {/* Status messages */}
        {status === 'available' && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 text-sm text-emerald-400">
            ✓ {formatDomain(name)} is available!
          </motion.p>
        )}
        {status === 'taken' && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 text-sm text-red-400">
            ✗ {formatDomain(name)} is already taken
          </motion.p>
        )}
        {!isValidName(name) && name.length > 0 && (
          <p className="mt-2 text-xs text-[rgba(160,160,200,0.5)]">
            3–32 characters, letters, numbers, - and _ only
          </p>
        )}
      </GlowCard>

      {/* Registration info */}
      {status === 'available' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <GlowCard glow>
            <h3 className="mb-4 font-semibold text-white">Register {formatDomain(name)}</h3>

            <div className="space-y-3 rounded-xl border border-[rgba(99,102,241,0.12)] bg-[rgba(8,8,18,0.5)] p-4">
              <div className="flex justify-between text-sm">
                <span className="text-[rgba(160,160,200,0.6)]">Network</span>
                <span className="font-medium text-white">Arc Testnet</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[rgba(160,160,200,0.6)]">Registration</span>
                <span className="font-medium text-white">Via ZNS Connect</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[rgba(160,160,200,0.6)]">Gas token</span>
                <span className="font-medium text-white">USDC</span>
              </div>
            </div>

            {!isConnected ? (
              <div className="mt-4 flex flex-col items-center gap-3">
                <p className="text-sm text-[rgba(160,160,200,0.55)]">Connect your wallet to register</p>
                <ConnectButton />
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                <a
                  href={`https://zns.bio?chain=5042002`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-semibold text-white hover:bg-indigo-500 active:scale-[0.98] transition-all shadow-[0_0_24px_rgba(99,102,241,0.3)]"
                >
                  Register on ZNS.bio
                  <ExternalLink className="h-4 w-4" />
                </a>
                <p className="text-center text-xs text-[rgba(160,160,200,0.4)]">
                  You'll be redirected to ZNS.bio to complete the registration on Arc Network
                </p>
              </div>
            )}
          </GlowCard>
        </motion.div>
      )}

      {/* Info note */}
      <div className="flex items-start gap-3 rounded-xl border border-[rgba(99,102,241,0.12)] bg-[rgba(15,15,30,0.5)] p-4">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400" />
        <div className="text-xs text-[rgba(160,160,200,0.55)] leading-relaxed">
          <strong className="text-[rgba(160,160,200,0.8)]">.arc domains</strong> are powered by ZNS Connect on Arc Network (Chain ID 5042002).
          Registration happens on-chain. You'll need USDC on Arc Testnet for gas.{' '}
          <a href="https://faucet.circle.com" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">
            Get testnet USDC →
          </a>
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <div className="relative min-h-screen">
      <Navbar />
      <main className="relative z-10 mx-auto max-w-lg px-4 pt-32 pb-24">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-6">
            <Badge variant="purple" className="mb-3">
              <Wallet className="h-3 w-3" /> Arc Testnet
            </Badge>
            <h1 className="text-3xl font-bold text-white">Register</h1>
            <p className="mt-1 text-sm text-[rgba(160,160,200,0.55)]">
              Claim your .arc name on Arc Network
            </p>
          </div>
          <Suspense fallback={null}>
            <RegisterContent />
          </Suspense>
        </motion.div>
      </main>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Navbar } from '@/components/layout/Navbar'
import { GlowCard } from '@/components/ui/GlowCard'
import { Badge } from '@/components/ui/Badge'
import { resolveAddress, formatDomain, shortenAddress } from '@/lib/zns'
import {
  User, ExternalLink, Copy, CheckCheck, Globe,
  Twitter, Github, Star
} from 'lucide-react'

export default function ProfilePage() {
  const { address, isConnected } = useAccount()
  const [primaryDomain, setPrimaryDomain] = useState<string | null>(null)
  const [domains, setDomains] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!address) { setPrimaryDomain(null); setDomains([]); return }
    setLoading(true)
    resolveAddress(address).then(data => {
      if (data) {
        setPrimaryDomain(data.primaryDomain ? formatDomain(data.primaryDomain) : null)
        setDomains(data.userOwnedDomains?.map(formatDomain) || [])
      }
      setLoading(false)
    })
  }, [address])

  const copyAddress = async () => {
    if (!address) return
    await navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!isConnected) {
    return (
      <div className="relative min-h-screen">
        <Navbar />
        <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-6 text-center"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600/20 border border-indigo-500/20">
              <User className="h-8 w-8 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Your Profile</h1>
              <p className="mt-2 text-sm text-[rgba(160,160,200,0.55)]">
                Connect your wallet to view your .arc identity
              </p>
            </div>
            <ConnectButton />
          </motion.div>
        </main>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen">
      <Navbar />
      <main className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center px-4 py-28">
        <div className="w-full max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white">Profile</h1>
            <p className="mt-2 text-sm text-[rgba(160,160,200,0.58)]">Your connected wallet identity on Arc Network</p>
          </div>

          {/* Identity card */}
          <GlowCard glow>
            <div className="flex items-start gap-4">
              {/* Avatar placeholder */}
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600/40 to-violet-600/40 border border-indigo-500/20 text-2xl">
                {primaryDomain ? primaryDomain[0].toUpperCase() : '?'}
              </div>
              <div className="flex-1 min-w-0">
                {loading ? (
                  <div className="space-y-2">
                    <div className="h-5 w-36 animate-pulse rounded bg-white/10" />
                    <div className="h-3 w-48 animate-pulse rounded bg-white/10" />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 flex-wrap">
                      {primaryDomain ? (
                        <h2 className="text-xl font-bold text-white">{primaryDomain}</h2>
                      ) : (
                        <h2 className="text-sm text-[rgba(160,160,200,0.5)]">No primary name set</h2>
                      )}
                      <Badge variant="success">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block" />
                        Connected
                      </Badge>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="font-mono text-xs text-[rgba(160,160,200,0.5)]">
                        {shortenAddress(address!, 8)}
                      </span>
                      <button
                        onClick={copyAddress}
                        className="text-[rgba(160,160,200,0.4)] hover:text-white transition-colors"
                        title="Copy address"
                      >
                        {copied ? <CheckCheck className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </>
                )}
              </div>
              <a
                href={`https://testnet.arcscan.app/address/${address}`}
                target="_blank" rel="noopener noreferrer"
                className="shrink-0 text-[rgba(160,160,200,0.4)] hover:text-white transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </GlowCard>

          {/* Owned domains */}
          {domains.length > 0 && (
            <GlowCard>
              <div className="mb-3 flex items-center gap-2">
                <Star className="h-4 w-4 text-indigo-400" />
                <h3 className="font-semibold text-white">Your .arc Domains</h3>
                <span className="rounded-full bg-indigo-600/20 px-2 py-0.5 text-xs text-indigo-300">{domains.length}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {domains.map(d => (
                  <div
                    key={d}
                    className={`rounded-xl border p-3 transition-colors ${
                      d === primaryDomain
                        ? 'border-indigo-500/40 bg-indigo-600/10'
                        : 'border-[rgba(99,102,241,0.12)] bg-[rgba(8,8,18,0.5)]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-white truncate">{d}</span>
                      {d === primaryDomain && (
                        <span className="shrink-0 rounded-full bg-indigo-600/30 px-1.5 py-0.5 text-[10px] font-medium text-indigo-300 ml-1">
                          PRIMARY
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </GlowCard>
          )}

          {/* Social links (placeholder for future) */}
          <GlowCard>
            <h3 className="mb-4 font-semibold text-white">Links</h3>
            <div className="space-y-2">
              {[
                { icon: Globe, label: 'Website', placeholder: 'https://yoursite.com' },
                { icon: Twitter, label: 'Twitter / X', placeholder: '@yourhandle' },
                { icon: Github, label: 'GitHub', placeholder: 'yourusername' },
              ].map(({ icon: Icon, label, placeholder }) => (
                <div key={label} className="flex items-center gap-3 rounded-xl border border-[rgba(99,102,241,0.12)] bg-[rgba(8,8,18,0.5)] px-4 py-3">
                  <Icon className="h-4 w-4 shrink-0 text-[rgba(99,102,241,0.5)]" />
                  <input
                    type="text"
                    placeholder={placeholder}
                    disabled
                    className="flex-1 bg-transparent text-sm text-[rgba(160,160,200,0.4)] placeholder-[rgba(160,160,200,0.25)] outline-none cursor-not-allowed"
                  />
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-[rgba(160,160,200,0.3)]">
              On-chain profile records — coming in next update
            </p>
          </GlowCard>

          {/* No domains CTA */}
          {!loading && domains.length === 0 && (
            <GlowCard>
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <p className="text-sm text-[rgba(160,160,200,0.55)]">You don't have any .arc domains yet</p>
                <a
                  href="/register"
                  className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
                >
                  Get your .arc name
                </a>
              </div>
            </GlowCard>
          )}
        </motion.div>
        </div>
      </main>
    </div>
  )
}

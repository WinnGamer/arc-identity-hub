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
  User, ExternalLink, Copy, CheckCheck,
  Star,
} from 'lucide-react'

/* ── Brand SVG icons ──────────────────────────────────────────────────────── */
function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  )
}

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1569 2.4189z" />
    </svg>
  )
}

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
              <p className="mt-2 text-sm text-slate-400">
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
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white">Profile</h1>
            <p className="mt-3 text-base text-slate-400">Your connected wallet identity on Arc Network</p>
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
                        <h2 className="text-sm text-slate-400">No primary name set</h2>
                      )}
                      <Badge variant="success">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block" />
                        Connected
                      </Badge>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="font-mono text-xs text-slate-400">
                        {shortenAddress(address!, 8)}
                      </span>
                      <button
                        onClick={copyAddress}
                        className="text-slate-500 hover:text-white transition-colors"
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
                className="shrink-0 text-slate-500 hover:text-white transition-colors"
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
            <div className="space-y-3">
              {[
                { icon: XIcon, label: 'X', placeholder: '@yourhandle' },
                { icon: TelegramIcon, label: 'Telegram', placeholder: '@yourusername' },
                { icon: DiscordIcon, label: 'Discord', placeholder: 'yourusername#0000' },
              ].map(({ icon: Icon, label, placeholder }) => (
                <div key={label} className="flex items-center gap-3 rounded-xl border border-[rgba(99,102,241,0.12)] bg-[rgba(8,8,18,0.5)] px-4 py-3.5">
                  <Icon className="h-4 w-4 shrink-0 text-slate-400" />
                  <span className="text-sm font-medium text-slate-300 w-20">{label}</span>
                  <input
                    type="text"
                    placeholder={placeholder}
                    disabled
                    className="flex-1 bg-transparent text-sm text-slate-500 placeholder-slate-600 outline-none cursor-not-allowed"
                  />
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-slate-500">
              On-chain profile records — coming in next update
            </p>
          </GlowCard>

          {/* No domains CTA */}
          {!loading && domains.length === 0 && (
            <GlowCard>
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <p className="text-sm text-slate-400">You don't have any .arc domains yet</p>
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

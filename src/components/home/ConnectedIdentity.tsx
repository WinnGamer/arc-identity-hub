'use client'

import { useAccount } from 'wagmi'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { resolveAddress, formatDomain, shortenAddress } from '@/lib/zns'
import { GlowCard } from '@/components/ui/GlowCard'
import { Badge } from '@/components/ui/Badge'
import { User, ExternalLink, Globe } from 'lucide-react'
import Link from 'next/link'

export function ConnectedIdentity() {
  const { address, isConnected } = useAccount()
  const [primaryDomain, setPrimaryDomain] = useState<string | null>(null)
  const [domains, setDomains] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!address) {
      setPrimaryDomain(null)
      setDomains([])
      return
    }
    setLoading(true)
    resolveAddress(address).then((data) => {
      if (data) {
        setPrimaryDomain(data.primaryDomain ? formatDomain(data.primaryDomain) : null)
        setDomains(data.userOwnedDomains?.map(formatDomain) || [])
      }
      setLoading(false)
    })
  }, [address])

  if (!isConnected) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mt-6"
    >
      <GlowCard glow>
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-600/20 border border-indigo-500/20">
            <User className="h-6 w-6 text-indigo-400" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {loading ? (
                <div className="h-5 w-32 animate-pulse rounded-md bg-white/10" />
              ) : primaryDomain ? (
                <h3 className="text-lg font-semibold text-white">{primaryDomain}</h3>
              ) : (
                <h3 className="text-sm text-[rgba(160,160,200,0.6)]">No .arc name set</h3>
              )}
              <Badge variant="success">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block" />
                Connected
              </Badge>
            </div>

            <p className="mt-0.5 font-mono text-xs text-[rgba(160,160,200,0.5)]">
              {address ? shortenAddress(address, 6) : ''}
            </p>

            {/* Owned domains */}
            {domains.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {domains.slice(0, 5).map((d) => (
                  <span
                    key={d}
                    className="rounded-lg border border-[rgba(99,102,241,0.2)] bg-[rgba(99,102,241,0.08)] px-2 py-0.5 text-xs text-indigo-300"
                  >
                    {d}
                  </span>
                ))}
                {domains.length > 5 && (
                  <span className="text-xs text-[rgba(160,160,200,0.5)] self-center">+{domains.length - 5} more</span>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 shrink-0">
            <Link
              href="/profile"
              className="flex items-center gap-1.5 rounded-lg border border-[rgba(99,102,241,0.25)] px-3 py-1.5 text-xs font-medium text-indigo-300 hover:bg-[rgba(99,102,241,0.12)] transition-colors"
            >
              <Globe className="h-3 w-3" /> Profile
            </Link>
            {address && (
              <a
                href={`https://testnet.arcscan.app/address/${address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg border border-[rgba(99,102,241,0.12)] px-3 py-1.5 text-xs text-[rgba(160,160,200,0.6)] hover:text-white transition-colors"
              >
                <ExternalLink className="h-3 w-3" /> Explorer
              </a>
            )}
          </div>
        </div>
      </GlowCard>
    </motion.div>
  )
}

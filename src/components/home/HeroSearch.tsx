'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ArrowRight, Loader2, CheckCircle, XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { resolveDomain, resolveAddress, formatDomain, shortenAddress } from '@/lib/zns'
import { cn } from '@/lib/utils'

type ResultType = 'domain' | 'address' | null

interface SearchResult {
  type: ResultType
  found: boolean
  value: string
  resolved: string
  domains?: string[]
}

export function HeroSearch() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SearchResult | null>(null)

  const isAddress = (q: string) => /^0x[0-9a-fA-F]{40}$/.test(q.trim())
  const isDomain = (q: string) => /^[a-zA-Z0-9_-]+(\.(arc))?$/.test(q.trim())

  const handleSearch = async () => {
    const q = query.trim()
    if (!q) return
    setLoading(true)
    setResult(null)

    try {
      if (isAddress(q)) {
        const data = await resolveAddress(q)
        setResult({
          type: 'address',
          found: !!(data?.primaryDomain),
          value: q,
          resolved: data?.primaryDomain ? formatDomain(data.primaryDomain) : '',
          domains: data?.userOwnedDomains?.map(formatDomain) || [],
        })
      } else if (isDomain(q)) {
        const data = await resolveDomain(q)
        const hasAddress = !!(data?.address && data.address !== '0x0000000000000000000000000000000000000000')
        setResult({
          type: 'domain',
          found: hasAddress,
          value: formatDomain(q),
          resolved: hasAddress ? data!.address : '',
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
  }

  return (
    <div className="w-full max-w-2xl">
      {/* Search input */}
      <div className="relative">
        <div className={cn(
          'flex items-center rounded-2xl border bg-[rgba(15,15,30,0.9)] backdrop-blur-md transition-all duration-200',
          'border-[rgba(99,102,241,0.25)] focus-within:border-[rgba(99,102,241,0.6)] focus-within:shadow-[0_0_30px_rgba(99,102,241,0.15)]'
        )}>
          <Search className="ml-4 h-5 w-5 shrink-0 text-[rgba(99,102,241,0.6)]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search domain or paste address..."
            className="flex-1 bg-transparent px-4 py-4 text-white placeholder-slate-600 outline-none"
          />
          <button
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            className={cn(
              'mr-2 flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-medium transition-all',
              'bg-indigo-600 text-white hover:bg-indigo-500 active:scale-95',
              'disabled:cursor-not-allowed disabled:opacity-40'
            )}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <span className="hidden sm:block">Search</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>

        {/* Hint text */}
        <p className="mt-2 text-center text-xs text-slate-500">
          Enter a .arc name or wallet address (0x...)
        </p>
      </div>

      {/* Result */}
      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="mt-4 rounded-2xl border border-[rgba(99,102,241,0.18)] bg-[rgba(15,15,30,0.85)] p-4 backdrop-blur-md"
          >
            {result.found ? (
              <div className="flex items-start gap-3">
                <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                <div className="flex-1 min-w-0">
                  {result.type === 'domain' ? (
                    <>
                      <p className="text-sm text-slate-300">
                        <span className="font-medium text-white">{result.value}</span> resolves to:
                      </p>
                      <p className="mt-1 font-mono text-sm text-indigo-300 break-all">{result.resolved}</p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-slate-300">
                        Primary name for <span className="font-mono text-indigo-300">{shortenAddress(result.value)}</span>:
                      </p>
                      <p className="mt-1 text-lg font-semibold text-white">{result.resolved}</p>
                      {result.domains && result.domains.length > 1 && (
                        <p className="mt-1.5 text-xs text-slate-400">
                          Also owns: {result.domains.slice(1, 4).join(', ')}
                          {result.domains.length > 4 && ` +${result.domains.length - 4} more`}
                        </p>
                      )}
                    </>
                  )}
                  <button
                    onClick={() => router.push(result.type === 'domain' ? `/name/${encodeURIComponent(result.value)}` : `/address/${result.value}`)}
                    className="mt-3 text-xs font-medium text-indigo-400 hover:text-indigo-300 underline underline-offset-2"
                  >
                    View full profile →
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-300">
                    {result.type === 'domain'
                      ? `${result.value} is not registered yet`
                      : 'No .arc name found for this address'}
                  </p>
                  {result.type === 'domain' && (
                    <button
                      onClick={() => router.push(`/register?name=${encodeURIComponent(result.value.replace('.arc', ''))}`)}
                      className="mt-2 inline-flex items-center gap-1 rounded-lg bg-indigo-600/20 px-3 py-1.5 text-xs font-medium text-indigo-300 hover:bg-indigo-600/30 transition-colors"
                    >
                      Register {result.value} <ArrowRight className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

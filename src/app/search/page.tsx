'use client'

import { useState, useEffect, Suspense } from 'react'
import { motion } from 'framer-motion'
import { Search, Loader2, CheckCircle, XCircle, ExternalLink, ArrowRight } from 'lucide-react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { GlowCard } from '@/components/ui/GlowCard'
import { resolveDomain, resolveAddress, formatDomain, shortenAddress } from '@/lib/zns'
import { cn } from '@/lib/utils'
import Link from 'next/link'

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const isAddress = (q: string) => /^0x[0-9a-fA-F]{40}$/.test(q.trim())

  const doSearch = async (q: string) => {
    if (!q.trim()) return
    setLoading(true)
    setResult(null)
    router.replace(`/search?q=${encodeURIComponent(q.trim())}`, { scroll: false })

    try {
      if (isAddress(q.trim())) {
        const data = await resolveAddress(q.trim())
        setResult({ type: 'address', data, query: q.trim() })
      } else {
        const data = await resolveDomain(q.trim())
        setResult({ type: 'domain', data, query: formatDomain(q.trim()) })
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const q = searchParams.get('q')
    if (q) doSearch(q)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div>
      {/* Search bar */}
      <div className={cn(
        'flex items-center rounded-2xl border bg-[rgba(15,15,30,0.9)] backdrop-blur-md transition-all',
        'border-[rgba(99,102,241,0.25)] focus-within:border-[rgba(99,102,241,0.6)] focus-within:shadow-[0_0_30px_rgba(99,102,241,0.12)]'
      )}>
        <Search className="ml-4 h-5 w-5 shrink-0 text-[rgba(99,102,241,0.6)]" />
        <input
          autoFocus
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && doSearch(query)}
          placeholder="Enter .arc name or 0x address..."
          className="flex-1 bg-transparent px-4 py-4 text-white placeholder-slate-600 outline-none"
        />
        <button
          onClick={() => doSearch(query)}
          disabled={loading || !query.trim()}
          className="mr-2 flex h-10 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><span>Search</span><ArrowRight className="h-4 w-4" /></>}
        </button>
      </div>

      {/* Result */}
      {result && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6"
        >
          {result.type === 'domain' ? (
            <GlowCard>
              <div className="flex items-start gap-3">
                {result.data?.address && result.data.address !== '0x0000000000000000000000000000000000000000' ? (
                  <>
                    <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                    <div>
                      <p className="font-semibold text-white text-lg">{result.query}</p>
                      <p className="mt-1 text-sm text-slate-400">Resolves to:</p>
                      <p className="font-mono text-sm text-indigo-300 mt-0.5 break-all">{result.data.address}</p>
                      <div className="mt-4 flex gap-3 flex-wrap">
                        <a
                          href={`https://testnet.arcscan.app/address/${result.data.address}`}
                          target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                        >
                          <ExternalLink className="h-3 w-3" /> View on ArcScan
                        </a>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" />
                    <div>
                      <p className="font-semibold text-white">{result.query}</p>
                      <p className="mt-1 text-sm text-slate-400">This name is not registered yet</p>
                      <Link
                        href={`/register?name=${encodeURIComponent(result.query.replace('.arc',''))}`}
                        className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600/20 px-3 py-1.5 text-xs font-medium text-indigo-300 hover:bg-indigo-600/30 transition-colors"
                      >
                        Register this name <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </GlowCard>
          ) : (
            <GlowCard>
              <div className="flex items-start gap-3">
                {result.data?.primaryDomain ? (
                  <>
                    <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-400">Wallet</p>
                      <p className="font-mono text-xs text-indigo-300 break-all">{result.query}</p>
                      <p className="mt-3 text-sm text-slate-400">Primary .arc name</p>
                      <p className="text-xl font-bold text-white">{formatDomain(result.data.primaryDomain)}</p>
                      {result.data.userOwnedDomains?.length > 1 && (
                        <div className="mt-3">
                          <p className="text-xs text-slate-400 mb-2">All owned domains:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {result.data.userOwnedDomains.map((d: string) => (
                              <span key={d} className="rounded-lg border border-[rgba(99,102,241,0.2)] bg-[rgba(99,102,241,0.08)] px-2 py-0.5 text-xs text-indigo-300">
                                {formatDomain(d)}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      <a
                        href={`https://testnet.arcscan.app/address/${result.query}`}
                        target="_blank" rel="noopener noreferrer"
                        className="mt-4 flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors w-fit"
                      >
                        <ExternalLink className="h-3 w-3" /> View on ArcScan
                      </a>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" />
                    <div>
                      <p className="text-sm text-slate-400">No .arc name found for:</p>
                      <p className="font-mono text-xs text-indigo-300 break-all mt-1">{result.query}</p>
                      <Link href="/register" className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600/20 px-3 py-1.5 text-xs font-medium text-indigo-300 hover:bg-indigo-600/30 transition-colors">
                        Get your .arc name <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </GlowCard>
          )}
        </motion.div>
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <div className="relative min-h-screen">
      <Navbar />
      <main className="relative z-10 flex min-h-screen items-center justify-center px-4 py-28">
        <div className="w-full max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-8 flex flex-col items-center text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white">Search</h1>
            <p className="mt-2 max-w-md text-center text-base text-slate-400">
              Resolve any .arc domain or look up a wallet address
            </p>
          </div>
          <Suspense fallback={null}>
            <SearchContent />
          </Suspense>
        </motion.div>
        </div>
      </main>
    </div>
  )
}

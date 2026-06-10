'use client'

import { useState, useEffect, Suspense } from 'react'
import { motion } from 'framer-motion'
import { Search, Loader2, CheckCircle, XCircle, ExternalLink, ArrowRight } from 'lucide-react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { GlowCard } from '@/components/ui/GlowCard'
import { resolveDomain, resolveAddress, formatDomain, shortenAddress } from '@/lib/zns'
import { loadProfileLinks, type ProfileLinks } from '@/lib/profile-links'
import { cn } from '@/lib/utils'
import Link from 'next/link'

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

/* ── Social links display ─────────────────────────────────────────────────── */
function SocialLinksDisplay({ links }: { links: ProfileLinks }) {
  const hasAny = links.x || links.telegram || links.discord
  if (!hasAny) return null

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {links.x && (
        <a
          href={`https://x.com/${links.x.replace('@', '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-lg border border-[rgba(99,102,241,0.15)] bg-[rgba(99,102,241,0.06)] px-2.5 py-1.5 text-xs text-slate-300 hover:text-white hover:border-indigo-400/30 transition-all"
        >
          <XIcon className="h-3 w-3" /> {links.x}
        </a>
      )}
      {links.telegram && (
        <a
          href={`https://t.me/${links.telegram.replace('@', '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-lg border border-[rgba(99,102,241,0.15)] bg-[rgba(99,102,241,0.06)] px-2.5 py-1.5 text-xs text-slate-300 hover:text-white hover:border-indigo-400/30 transition-all"
        >
          <TelegramIcon className="h-3 w-3" /> {links.telegram}
        </a>
      )}
      {links.discord && (
        <span className="flex items-center gap-1.5 rounded-lg border border-[rgba(99,102,241,0.15)] bg-[rgba(99,102,241,0.06)] px-2.5 py-1.5 text-xs text-slate-300">
          <DiscordIcon className="h-3 w-3" /> {links.discord}
        </span>
      )}
    </div>
  )
}

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [profileLinks, setProfileLinks] = useState<ProfileLinks | null>(null)

  const isAddress = (q: string) => /^0x[0-9a-fA-F]{40}$/.test(q.trim())

  const doSearch = async (q: string) => {
    if (!q.trim()) return
    setLoading(true)
    setResult(null)
    setProfileLinks(null)
    router.replace(`/search?q=${encodeURIComponent(q.trim())}`, { scroll: false })

    try {
      if (isAddress(q.trim())) {
        const data = await resolveAddress(q.trim())
        setResult({ type: 'address', data, query: q.trim() })
        // Load profile links for this address
        const pl = await loadProfileLinks(q.trim())
        setProfileLinks(pl)
      } else {
        const data = await resolveDomain(q.trim())
        setResult({ type: 'domain', data, query: formatDomain(q.trim()) })
        // If domain resolves to an address, load their profile links
        if (data?.address && data.address !== '0x0000000000000000000000000000000000000000') {
          const pl = await loadProfileLinks(data.address)
          setProfileLinks(pl)
        }
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

                      {/* Social links from Supabase */}
                      {profileLinks && <SocialLinksDisplay links={profileLinks} />}

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

                      {/* Social links from Supabase */}
                      {profileLinks && <SocialLinksDisplay links={profileLinks} />}

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

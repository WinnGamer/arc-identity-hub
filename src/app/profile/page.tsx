'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useSwitchChain } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Navbar } from '@/components/layout/Navbar'
import { GlowCard } from '@/components/ui/GlowCard'
import { Badge } from '@/components/ui/Badge'
import { resolveAddress, formatDomain, shortenAddress } from '@/lib/zns'
import { ZNS_CONTRACT_ADDRESS, ZNS_ABI, formatUsdc } from '@/lib/zns-contract'
import { cn } from '@/lib/utils'
import {
  User, ExternalLink, Copy, CheckCheck,
  Star, Loader2, RefreshCw, Send, ArrowRight,
  Save, Calendar,
} from 'lucide-react'

const ARC_CHAIN_ID = 5042002

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

/* ── localStorage helpers for social links ────────────────────────────────── */
interface SocialLinks {
  x: string
  telegram: string
  discord: string
}

function loadLinks(address: string): SocialLinks {
  if (typeof window === 'undefined') return { x: '', telegram: '', discord: '' }
  try {
    const raw = localStorage.getItem(`arc-links-${address.toLowerCase()}`)
    if (!raw) return { x: '', telegram: '', discord: '' }
    return JSON.parse(raw)
  } catch {
    return { x: '', telegram: '', discord: '' }
  }
}

function saveLinks(address: string, links: SocialLinks) {
  localStorage.setItem(`arc-links-${address.toLowerCase()}`, JSON.stringify(links))
}

/* ── Domain card with renew/transfer ──────────────────────────────────────── */
function DomainCard({
  domainName,
  isPrimary,
  address,
}: {
  domainName: string
  isPrimary: boolean
  address: `0x${string}`
}) {
  const cleanName = domainName.replace(/\.arc$/i, '')

  // ─── On-chain lookup for expiration + tokenId ──────────────────────────
  const { data: registryData } = useReadContract({
    address: ZNS_CONTRACT_ADDRESS,
    abi: ZNS_ABI,
    functionName: 'registryLookupByName',
    args: [cleanName],
    chainId: ARC_CHAIN_ID,
  })

  const { data: tokenId } = useReadContract({
    address: ZNS_CONTRACT_ADDRESS,
    abi: ZNS_ABI,
    functionName: 'domainLookup',
    args: [cleanName],
    chainId: ARC_CHAIN_ID,
  })

  const nameLen = cleanName.length as number
  const { data: renewPriceWei } = useReadContract({
    address: ZNS_CONTRACT_ADDRESS,
    abi: ZNS_ABI,
    functionName: 'priceToRenew',
    args: [nameLen as unknown as never],
    chainId: ARC_CHAIN_ID,
  })

  const expirationDate = registryData
    ? new Date(Number(registryData.expirationDate) * 1000)
    : null

  // ─── UI state ──────────────────────────────────────────────────────────
  const [activePanel, setActivePanel] = useState<'none' | 'renew' | 'transfer'>('none')
  const [renewYears, setRenewYears] = useState(1)
  const [transferTo, setTransferTo] = useState('')
  const [txStatus, setTxStatus] = useState<'idle' | 'confirm' | 'pending' | 'success' | 'error'>('idle')
  const [txError, setTxError] = useState('')
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>()

  const { switchChainAsync } = useSwitchChain()
  const { chainId } = useAccount()
  const { writeContractAsync, isPending, reset: resetWrite } = useWriteContract()
  const { isSuccess: txConfirmed, isError: txFailed } = useWaitForTransactionReceipt({
    hash: txHash,
    chainId: ARC_CHAIN_ID,
  })

  useEffect(() => {
    if (txConfirmed) setTxStatus('success')
    if (txFailed) { setTxStatus('error'); setTxError('Transaction reverted.') }
  }, [txConfirmed, txFailed])

  const renewPrice = renewPriceWei != null
    ? (renewPriceWei as bigint) * BigInt(renewYears)
    : undefined

  // ─── Renew handler ─────────────────────────────────────────────────────
  const handleRenew = async () => {
    if (tokenId == null || renewPrice == null) return
    setTxError('')
    try {
      if (chainId !== ARC_CHAIN_ID) {
        setTxStatus('confirm')
        await switchChainAsync({ chainId: ARC_CHAIN_ID })
      }
      setTxStatus('confirm')
      const hash = await writeContractAsync({
        address: ZNS_CONTRACT_ADDRESS,
        abi: ZNS_ABI,
        functionName: 'renewDomain',
        args: [tokenId as bigint, BigInt(renewYears)],
        value: renewPrice,
        chainId: ARC_CHAIN_ID,
      })
      setTxHash(hash)
      setTxStatus('pending')
    } catch (err: unknown) {
      const msg = (err as { shortMessage?: string; message?: string })?.shortMessage || (err as { message?: string })?.message || 'Failed'
      if (msg.toLowerCase().includes('rejected') || msg.toLowerCase().includes('denied')) {
        setTxStatus('idle')
      } else {
        setTxStatus('error'); setTxError(msg)
      }
      resetWrite()
    }
  }

  // ─── Transfer handler ──────────────────────────────────────────────────
  const handleTransfer = async () => {
    if (tokenId == null || !transferTo || !/^0x[0-9a-fA-F]{40}$/.test(transferTo)) return
    setTxError('')
    try {
      if (chainId !== ARC_CHAIN_ID) {
        setTxStatus('confirm')
        await switchChainAsync({ chainId: ARC_CHAIN_ID })
      }
      setTxStatus('confirm')
      const hash = await writeContractAsync({
        address: ZNS_CONTRACT_ADDRESS,
        abi: ZNS_ABI,
        functionName: 'transferFrom',
        args: [address, transferTo as `0x${string}`, tokenId as bigint],
        chainId: ARC_CHAIN_ID,
      })
      setTxHash(hash)
      setTxStatus('pending')
    } catch (err: unknown) {
      const msg = (err as { shortMessage?: string; message?: string })?.shortMessage || (err as { message?: string })?.message || 'Failed'
      if (msg.toLowerCase().includes('rejected') || msg.toLowerCase().includes('denied')) {
        setTxStatus('idle')
      } else {
        setTxStatus('error'); setTxError(msg)
      }
      resetWrite()
    }
  }

  const isBusy = isPending || txStatus === 'confirm' || txStatus === 'pending'

  const handleReset = () => {
    setActivePanel('none')
    setTxStatus('idle')
    setTxHash(undefined)
    setTxError('')
    setTransferTo('')
    setRenewYears(1)
    resetWrite()
  }

  return (
    <div className="rounded-xl border border-[rgba(99,102,241,0.15)] bg-[rgba(8,8,18,0.5)] p-4 space-y-3">
      {/* Domain header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-semibold text-white truncate">{formatDomain(cleanName)}</span>
          {isPrimary && (
            <span className="shrink-0 rounded-full bg-indigo-600/30 px-2 py-0.5 text-[10px] font-medium text-indigo-300">
              PRIMARY
            </span>
          )}
        </div>
        {expirationDate && (
          <div className="flex items-center gap-1.5 shrink-0">
            <Calendar className="h-3 w-3 text-slate-500" />
            <span className="text-xs text-slate-400">
              {expirationDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        )}
      </div>

      {/* Action buttons */}
      {txStatus === 'success' ? (
        <div className="flex items-center justify-between rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2.5">
          <span className="text-sm text-emerald-400 font-medium">
            {activePanel === 'renew' ? '✓ Renewed!' : '✓ Transferred!'}
          </span>
          <div className="flex items-center gap-2">
            {txHash && (
              <a
                href={`https://testnet.arcscan.app/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-indigo-400 hover:underline flex items-center gap-1"
              >
                Tx <ExternalLink className="h-3 w-3" />
              </a>
            )}
            <button onClick={handleReset} className="text-xs text-slate-400 hover:text-white">
              Done
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex gap-2">
            <button
              onClick={() => { handleReset(); setActivePanel(activePanel === 'renew' ? 'none' : 'renew') }}
              disabled={isBusy}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all',
                activePanel === 'renew'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'bg-[rgba(15,15,30,0.55)] text-slate-400 border border-[rgba(99,102,241,0.12)] hover:text-white hover:border-indigo-400/30',
                isBusy && 'opacity-50 cursor-not-allowed'
              )}
            >
              <RefreshCw className="h-3 w-3" /> Renew
            </button>
            <button
              onClick={() => { handleReset(); setActivePanel(activePanel === 'transfer' ? 'none' : 'transfer') }}
              disabled={isBusy}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all',
                activePanel === 'transfer'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'bg-[rgba(15,15,30,0.55)] text-slate-400 border border-[rgba(99,102,241,0.12)] hover:text-white hover:border-indigo-400/30',
                isBusy && 'opacity-50 cursor-not-allowed'
              )}
            >
              <Send className="h-3 w-3" /> Transfer
            </button>
          </div>

          {/* Renew panel */}
          <AnimatePresence>
            {activePanel === 'renew' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="space-y-3 pt-1">
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 5].map(y => (
                      <button
                        key={y}
                        onClick={() => setRenewYears(y)}
                        disabled={isBusy}
                        className={cn(
                          'rounded-lg border px-2 py-2 text-xs font-semibold transition-all',
                          renewYears === y
                            ? 'border-indigo-400 bg-indigo-500/20 text-white'
                            : 'border-[rgba(99,102,241,0.2)] bg-[rgba(15,15,30,0.55)] text-slate-400 hover:text-white'
                        )}
                      >
                        {y}y
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Cost</span>
                    <span className="font-medium text-emerald-400">
                      {renewPrice != null ? formatUsdc(renewPrice) : '...'}
                    </span>
                  </div>

                  {txError && (
                    <p className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2 border border-red-500/20">{txError}</p>
                  )}

                  <button
                    onClick={handleRenew}
                    disabled={isBusy || renewPrice == null}
                    className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isBusy ? (
                      <><Loader2 className="h-3 w-3 animate-spin" /> {txStatus === 'confirm' ? 'Confirm in wallet…' : 'Waiting…'}</>
                    ) : (
                      <>Renew {renewYears}y · {renewPrice != null ? formatUsdc(renewPrice) : '...'}</>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Transfer panel */}
          <AnimatePresence>
            {activePanel === 'transfer' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="space-y-3 pt-1">
                  <input
                    type="text"
                    value={transferTo}
                    onChange={e => setTransferTo(e.target.value.trim())}
                    placeholder="0x... recipient address"
                    disabled={isBusy}
                    className="w-full rounded-lg border border-[rgba(99,102,241,0.2)] bg-[rgba(8,8,18,0.8)] px-3 py-2.5 text-sm text-white font-mono placeholder-slate-600 outline-none focus:border-indigo-400/50 disabled:opacity-50"
                  />

                  {transferTo && !/^0x[0-9a-fA-F]{40}$/.test(transferTo) && (
                    <p className="text-xs text-amber-400">Enter a valid Ethereum address</p>
                  )}

                  {txError && (
                    <p className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2 border border-red-500/20">{txError}</p>
                  )}

                  <button
                    onClick={handleTransfer}
                    disabled={isBusy || !transferTo || !/^0x[0-9a-fA-F]{40}$/.test(transferTo)}
                    className="w-full flex items-center justify-center gap-2 rounded-lg bg-amber-600 px-3 py-2.5 text-xs font-semibold text-white hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isBusy ? (
                      <><Loader2 className="h-3 w-3 animate-spin" /> {txStatus === 'confirm' ? 'Confirm in wallet…' : 'Waiting…'}</>
                    ) : (
                      <><Send className="h-3 w-3" /> Transfer domain</>
                    )}
                  </button>

                  <p className="text-[11px] text-slate-500 text-center">
                    ⚠️ This action is irreversible. The domain will be owned by the recipient.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  )
}

/* ── Main Profile page ────────────────────────────────────────────────────── */
export default function ProfilePage() {
  const { address, isConnected } = useAccount()
  const [primaryDomain, setPrimaryDomain] = useState<string | null>(null)
  const [domains, setDomains] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  // Social links state
  const [links, setLinks] = useState<SocialLinks>({ x: '', telegram: '', discord: '' })
  const [linksSaved, setLinksSaved] = useState(false)

  const fetchDomains = useCallback(async (addr: string) => {
    setLoading(true)
    const data = await resolveAddress(addr)
    if (data) {
      setPrimaryDomain(data.primaryDomain ? formatDomain(data.primaryDomain) : null)
      setDomains(data.userOwnedDomains?.map(formatDomain) || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!address) { setPrimaryDomain(null); setDomains([]); return }
    fetchDomains(address)
    setLinks(loadLinks(address))
  }, [address, fetchDomains])

  const handleSaveLinks = () => {
    if (!address) return
    saveLinks(address, links)
    setLinksSaved(true)
    setTimeout(() => setLinksSaved(false), 2000)
  }

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
          <div className="flex flex-col items-center text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white">Profile</h1>
            <p className="mt-3 text-center text-base text-slate-400">Your connected wallet identity on Arc Network</p>
          </div>

          {/* Identity card */}
          <GlowCard glow>
            <div className="flex items-start gap-4">
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

          {/* Owned domains with Renew / Transfer */}
          {domains.length > 0 && (
            <GlowCard>
              <div className="mb-4 flex items-center gap-2">
                <Star className="h-4 w-4 text-indigo-400" />
                <h3 className="font-semibold text-white">Your .arc Domains</h3>
                <span className="rounded-full bg-indigo-600/20 px-2 py-0.5 text-xs text-indigo-300">{domains.length}</span>
              </div>
              <div className="space-y-3">
                {domains.map(d => (
                  <DomainCard
                    key={d}
                    domainName={d}
                    isPrimary={d === primaryDomain}
                    address={address!}
                  />
                ))}
              </div>
            </GlowCard>
          )}

          {/* Social links — editable with localStorage */}
          <GlowCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">Links</h3>
              <button
                onClick={handleSaveLinks}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
                  linksSaved
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-[rgba(99,102,241,0.12)] text-indigo-300 border border-[rgba(99,102,241,0.2)] hover:bg-[rgba(99,102,241,0.2)]'
                )}
              >
                {linksSaved ? <><CheckCheck className="h-3 w-3" /> Saved</> : <><Save className="h-3 w-3" /> Save</>}
              </button>
            </div>
            <div className="space-y-3">
              {[
                { icon: XIcon, key: 'x' as const, label: 'X', placeholder: '@yourhandle' },
                { icon: TelegramIcon, key: 'telegram' as const, label: 'Telegram', placeholder: '@yourusername' },
                { icon: DiscordIcon, key: 'discord' as const, label: 'Discord', placeholder: 'yourusername' },
              ].map(({ icon: Icon, key, label, placeholder }) => (
                <div key={key} className="flex items-center gap-3 rounded-xl border border-[rgba(99,102,241,0.12)] bg-[rgba(8,8,18,0.5)] px-4 py-3">
                  <Icon className="h-4 w-4 shrink-0 text-slate-400" />
                  <span className="text-sm font-medium text-slate-300 w-20 shrink-0">{label}</span>
                  <input
                    type="text"
                    value={links[key]}
                    onChange={e => setLinks(prev => ({ ...prev, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="flex-1 bg-transparent text-sm text-white placeholder-slate-600 outline-none"
                  />
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-slate-500">
              Saved locally in your browser. On-chain profile records coming soon.
            </p>
          </GlowCard>

          {/* No domains CTA */}
          {!loading && domains.length === 0 && (
            <GlowCard>
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <p className="text-sm text-slate-400">You don&apos;t have any .arc domains yet</p>
                <a
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
                >
                  Get your .arc name <ArrowRight className="h-4 w-4" />
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

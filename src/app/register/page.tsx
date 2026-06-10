'use client'

import { useState, useEffect, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearchParams } from 'next/navigation'
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useSwitchChain,
} from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Navbar } from '@/components/layout/Navbar'
import { GlowCard } from '@/components/ui/GlowCard'
import { Badge } from '@/components/ui/Badge'
import { resolveDomain, formatDomain } from '@/lib/zns'
import {
  ZNS_CONTRACT_ADDRESS,
  ZNS_ABI,
  ZERO_ADDRESS,
  buildExpiry,
  formatUsdc,
} from '@/lib/zns-contract'
import { cn } from '@/lib/utils'
import {
  Search, CheckCircle, XCircle, Loader2, ExternalLink,
  AlertCircle, Wallet, ArrowRight, PartyPopper, RefreshCw,
} from 'lucide-react'

const ARC_CHAIN_ID = 5042002

type AvailabilityStatus = 'idle' | 'checking' | 'available' | 'taken'
type TxStatus = 'idle' | 'confirm' | 'pending' | 'success' | 'error'

function RegisterContent() {
  const searchParams = useSearchParams()
  const { isConnected, address, chainId } = useAccount()
  const { switchChainAsync } = useSwitchChain()

  const [name, setName] = useState(searchParams.get('name') || '')
  const [availability, setAvailability] = useState<AvailabilityStatus>('idle')
  const [debounceTimer, setDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null)
  const [txStatus, setTxStatus] = useState<TxStatus>('idle')
  const [txErrorMsg, setTxErrorMsg] = useState('')
  const [years, setYears] = useState(1)

  // ─── On-chain price read ───────────────────────────────────────────────────
  const nameLen = name.length as number
  const { data: priceWei, isLoading: priceLoading } = useReadContract({
    address: ZNS_CONTRACT_ADDRESS,
    abi: ZNS_ABI,
    functionName: 'priceToRegister',
    args: [nameLen as unknown as never],
    chainId: ARC_CHAIN_ID,
    query: { enabled: availability === 'available' && nameLen >= 3 },
  })

  // ─── Write contract ────────────────────────────────────────────────────────
  const {
    writeContractAsync,
    isPending: writeIsPending,
    reset: resetWrite,
  } = useWriteContract()

  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined)

  const { isLoading: txConfirming, isSuccess: txConfirmed, isError: txFailed } =
    useWaitForTransactionReceipt({ hash: txHash, chainId: ARC_CHAIN_ID })

  useEffect(() => {
    if (txConfirmed) setTxStatus('success')
    if (txFailed) {
      setTxStatus('error')
      setTxErrorMsg('Transaction reverted on-chain.')
    }
  }, [txConfirmed, txFailed])

  // ─── Availability check ────────────────────────────────────────────────────
  const isValidName = (n: string) => /^[a-zA-Z0-9_-]{3,32}$/.test(n)

  const checkAvailability = async (n: string) => {
    if (!isValidName(n)) { setAvailability('idle'); return }
    setAvailability('checking')
    const data = await resolveDomain(n)
    const isTaken = !!(
      data?.address && data.address !== '0x0000000000000000000000000000000000000000'
    )
    setAvailability(isTaken ? 'taken' : 'available')
  }

  useEffect(() => {
    if (debounceTimer) clearTimeout(debounceTimer)
    if (!name) { setAvailability('idle'); return }
    const timer = setTimeout(() => checkAvailability(name), 600)
    setDebounceTimer(timer)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name])

  // ─── Register handler ──────────────────────────────────────────────────────
  const handleRegister = async () => {
    if (!address || !priceWei) return
    setTxErrorMsg('')

    try {
      // Switch to Arc Testnet if needed
      if (chainId !== ARC_CHAIN_ID) {
        setTxStatus('confirm')
        await switchChainAsync({ chainId: ARC_CHAIN_ID })
      }

      setTxStatus('confirm')
      const expiry = buildExpiry(years)
      const totalPriceWei = (priceWei as bigint) * BigInt(years)

      const hash = await writeContractAsync({
        address: ZNS_CONTRACT_ADDRESS,
        abi: ZNS_ABI,
        functionName: 'registerDomains',
        args: [
          [address],
          [name],
          [expiry],
          ZERO_ADDRESS,
          0n,
        ],
        value: totalPriceWei,
        chainId: ARC_CHAIN_ID,
      })

      setTxHash(hash)
      setTxStatus('pending')
    } catch (err: unknown) {
      const msg = (err as { shortMessage?: string; message?: string })?.shortMessage
        || (err as { message?: string })?.message
        || 'Transaction failed'
      if (msg.toLowerCase().includes('user rejected') || msg.toLowerCase().includes('denied')) {
        setTxStatus('idle')
      } else {
        setTxStatus('error')
        setTxErrorMsg(msg)
      }
      resetWrite()
    }
  }

  const handleReset = () => {
    setName('')
    setYears(1)
    setAvailability('idle')
    setTxStatus('idle')
    setTxHash(undefined)
    setTxErrorMsg('')
    resetWrite()
  }

  // ─── Derived state ─────────────────────────────────────────────────────────
  const isWrongChain = isConnected && chainId !== ARC_CHAIN_ID
  const isBusy = writeIsPending || txConfirming || txStatus === 'confirm' || txStatus === 'pending'
  const annualPriceWei = priceWei as bigint | undefined
  const totalPriceWei = annualPriceWei != null ? annualPriceWei * BigInt(years) : undefined
  const priceLabel = totalPriceWei != null
    ? formatUsdc(totalPriceWei)
    : priceLoading ? '...' : '—'

  const statusBorder = {
    idle: 'border-[rgba(99,102,241,0.25)]',
    checking: 'border-[rgba(99,102,241,0.4)]',
    available: 'border-emerald-500/50 shadow-[0_0_20px_rgba(34,197,94,0.08)]',
    taken: 'border-red-500/40',
  }

  // ─── Success screen ────────────────────────────────────────────────────────
  if (txStatus === 'success') {
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <GlowCard glow className="text-center">
          <div className="mb-5 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 ring-2 ring-emerald-500/30">
              <PartyPopper className="h-8 w-8 text-emerald-400" />
            </div>
          </div>
          <h2 className="mb-3 text-2xl font-bold text-white">
            {formatDomain(name)} registered!
          </h2>
          <p className="mb-6 text-sm text-slate-400">
            Your .arc domain is now live on Arc Testnet.
          </p>

          <div className="mb-6 divide-y divide-[rgba(99,102,241,0.15)] rounded-xl border border-[rgba(99,102,241,0.15)] bg-[rgba(8,8,18,0.5)] px-5 py-1">
            <div className="flex justify-between py-3.5 text-sm">
              <span className="text-slate-400">Domain</span>
              <span className="font-mono font-semibold text-indigo-300">{formatDomain(name)}</span>
            </div>
            <div className="flex justify-between py-3.5 text-sm">
              <span className="text-slate-400">Duration</span>
              <span className="font-medium text-white">{years} {years === 1 ? 'year' : 'years'}</span>
            </div>
            <div className="flex justify-between py-3.5 text-sm">
              <span className="text-slate-400">Tx hash</span>
              <a
                href={`https://testnet.arcscan.app/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 font-mono text-indigo-400 hover:text-indigo-300 text-xs"
              >
                {txHash?.slice(0, 10)}…{txHash?.slice(-6)}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <a
              href={`https://testnet.arcscan.app/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-500/40 bg-indigo-600/10 px-5 py-3 text-sm font-semibold text-indigo-300 hover:bg-indigo-600/20 transition-all"
            >
              View on ArcScan <ExternalLink className="h-4 w-4" />
            </a>
            <button
              onClick={handleReset}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[rgba(15,15,30,0.6)] px-5 py-3 text-sm text-slate-400 hover:text-white transition-all"
            >
              <RefreshCw className="h-4 w-4" /> Register another
            </button>
          </div>
        </GlowCard>
      </motion.div>
    )
  }

  // ─── Main form ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* Domain input */}
      <GlowCard>
        <label className="mb-3 block text-sm font-medium text-slate-300">
          Choose your .arc name
        </label>
        <div className={cn(
          'flex items-center rounded-xl border bg-[rgba(8,8,18,0.8)] transition-all duration-200',
          statusBorder[availability]
        )}>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
            placeholder="yourname"
            maxLength={32}
            disabled={isBusy}
            className="flex-1 bg-transparent px-4 py-3.5 text-white placeholder-slate-600 outline-none font-mono disabled:opacity-50"
          />
          <span className="mr-4 font-medium text-indigo-400">.arc</span>
          <div className="mr-4 flex h-5 w-5 items-center justify-center">
            {availability === 'checking' && <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />}
            {availability === 'available' && <CheckCircle className="h-4 w-4 text-emerald-400" />}
            {availability === 'taken' && <XCircle className="h-4 w-4 text-red-400" />}
          </div>
        </div>

        <AnimatePresence>
          {availability === 'available' && (
            <motion.p
              key="avail"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-2.5 text-sm font-medium text-emerald-400"
            >
              ✓ {formatDomain(name)} is available!
            </motion.p>
          )}
          {availability === 'taken' && (
            <motion.p
              key="taken"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-2.5 text-sm font-medium text-red-400"
            >
              ✗ {formatDomain(name)} is already taken
            </motion.p>
          )}
        </AnimatePresence>

        {!isValidName(name) && name.length > 0 && (
          <p className="mt-2.5 text-xs text-slate-500">
            3–32 characters, letters, numbers, - and _ only
          </p>
        )}
      </GlowCard>

      {/* Registration card — shown when name is available */}
      <AnimatePresence>
        {availability === 'available' && (
          <motion.div
            key="reg-card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
          >
            <GlowCard glow>
              <h3 className="mb-5 text-lg font-semibold text-white">
                Register {formatDomain(name)}
              </h3>

              {/* Price table — with dividers for clear separation */}
              <div className="mb-5 divide-y divide-[rgba(99,102,241,0.15)] rounded-xl border border-[rgba(99,102,241,0.15)] bg-[rgba(8,8,18,0.5)] px-5 py-1">
                {/* Network */}
                <div className="flex justify-between py-3.5 text-sm">
                  <span className="text-slate-400">Network</span>
                  <span className="font-medium text-white">Arc Testnet</span>
                </div>

                {/* Duration */}
                <div className="py-4">
                  <div className="flex justify-between text-sm mb-3">
                    <span className="text-slate-400">Duration</span>
                    <span className="font-medium text-white">
                      {years} {years === 1 ? 'year' : 'years'}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 5].map(option => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setYears(option)}
                        disabled={isBusy}
                        className={cn(
                          'rounded-lg border px-3 py-2.5 text-sm font-semibold transition-all',
                          years === option
                            ? 'border-indigo-400 bg-indigo-500/20 text-white shadow-[0_0_18px_rgba(99,102,241,0.25)]'
                            : 'border-[rgba(99,102,241,0.2)] bg-[rgba(15,15,30,0.55)] text-slate-400 hover:border-indigo-400/45 hover:text-white',
                          isBusy && 'cursor-not-allowed opacity-60'
                        )}
                      >
                        {option}y
                      </button>
                    ))}
                  </div>
                </div>

                {/* Annual price (if multi-year) */}
                {annualPriceWei != null && years > 1 && (
                  <div className="flex justify-between py-3.5 text-sm">
                    <span className="text-slate-400">Annual price</span>
                    <span className="font-medium text-slate-300">{formatUsdc(annualPriceWei)} / year</span>
                  </div>
                )}

                {/* Total price */}
                <div className="flex justify-between py-3.5 text-sm">
                  <span className="font-medium text-slate-300">Total price</span>
                  <span className={cn(
                    'font-bold text-base',
                    priceLoading ? 'text-slate-500' : 'text-emerald-400'
                  )}>
                    {priceLoading ? (
                      <span className="flex items-center gap-1.5">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> loading…
                      </span>
                    ) : priceLabel}
                  </span>
                </div>

                {/* Gas token */}
                <div className="flex justify-between py-3.5 text-sm">
                  <span className="text-slate-400">Gas token</span>
                  <span className="font-medium text-white">USDC (native)</span>
                </div>
              </div>

              {/* Wrong chain warning */}
              {isWrongChain && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mb-4 flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300"
                >
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  Wrong network — click Register to auto-switch to Arc Testnet
                </motion.div>
              )}

              {/* Tx error */}
              {txStatus === 'error' && txErrorMsg && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
                >
                  {txErrorMsg}
                </motion.div>
              )}

              {/* CTA */}
              {!isConnected ? (
                <div className="flex flex-col items-center gap-3">
                  <p className="text-sm text-slate-400">
                    Connect your wallet to register
                  </p>
                  <ConnectButton />
                </div>
              ) : (
                <button
                  onClick={handleRegister}
                  disabled={isBusy || priceLoading || priceWei == null}
                  className={cn(
                    'relative flex w-full items-center justify-center gap-2 rounded-xl px-5 py-4 text-sm font-semibold text-white transition-all duration-200',
                    'bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98]',
                    'shadow-[0_0_28px_rgba(99,102,241,0.35)]',
                    'disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none'
                  )}
                >
                  {isBusy ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {txStatus === 'confirm' && 'Confirm in wallet…'}
                      {txStatus === 'pending' && 'Waiting for block…'}
                      {!['confirm', 'pending'].includes(txStatus) && 'Processing…'}
                    </>
                  ) : (
                    <>
                      Register for {years} {years === 1 ? 'year' : 'years'} · {priceLabel}
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              )}

              {/* Tx pending link */}
              {txHash && txStatus === 'pending' && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-3 text-center text-xs text-slate-500"
                >
                  Tx:{' '}
                  <a
                    href={`https://testnet.arcscan.app/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-400 hover:underline"
                  >
                    {txHash.slice(0, 12)}… <ExternalLink className="inline h-3 w-3" />
                  </a>
                </motion.p>
              )}
            </GlowCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info */}
      <div className="flex items-start gap-3 rounded-xl border border-[rgba(99,102,241,0.15)] bg-[rgba(15,15,30,0.5)] p-5">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400" />
        <div className="text-sm text-slate-400 leading-relaxed">
          <strong className="text-slate-300">.arc domains</strong> are minted directly on-chain via ZNS Connect
          on Arc Network (Chain ID 5042002). Choose 1, 2, 3, or 5 years before signing. You need USDC on Arc Testnet for the registration fee.{' '}
          <a
            href="https://faucet.circle.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:underline"
          >
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
      <main className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center px-4 py-28">
        <div className="w-full max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-8 text-center">
            <Badge variant="purple" className="mb-4">
              <Wallet className="h-3 w-3" /> Arc Testnet
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-white">Register your .arc name</h1>
            <p className="mx-auto mt-3 max-w-md text-base text-slate-400">
              Claim a username directly on Arc Network — no redirect, no external mint page.
            </p>
          </div>
          <Suspense fallback={null}>
            <RegisterContent />
          </Suspense>
        </motion.div>
        </div>
      </main>
    </div>
  )
}

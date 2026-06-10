// ZNS Registry — Arc Testnet
// Contract: 0xf180136DdC9e4F8c9b5A9FE59e2b1f07265C5D4D (verified "ZNS Connect", symbol ".arc")
// Source: ArcScan verified at https://testnet.arcscan.app/address/0xf180136DdC9e4F8c9b5A9FE59e2b1f07265C5D4D
//
// Key insight from source:
//   The `expiry` parameter in registerDomains is the NUMBER OF YEARS, NOT a timestamp!
//   total = priceToRegister(len) + priceToRenew(len) * (years - 1)
//   USDC is the native gas token on Arc — no ERC-20 approve needed.

export const ZNS_CONTRACT_ADDRESS =
  '0xf180136DdC9e4F8c9b5A9FE59e2b1f07265C5D4D' as const

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000' as const

// Minimal ABI — only the functions we use
export const ZNS_ABI = [
  // ─── Price reads ────────────────────────────────────────────────────────
  {
    name: 'priceToRegister',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ internalType: 'uint16', name: 'len', type: 'uint16' }],
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
  },
  {
    name: 'priceToRenew',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ internalType: 'uint16', name: 'len', type: 'uint16' }],
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
  },

  // ─── Registration ──────────────────────────────────────────────────────
  {
    name: 'registerDomains',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      { internalType: 'address[]', name: 'owners', type: 'address[]' },
      { internalType: 'string[]', name: 'domainNames', type: 'string[]' },
      { internalType: 'uint256[]', name: 'expiries', type: 'uint256[]' },
      { internalType: 'address', name: 'referral', type: 'address' },
      { internalType: 'uint256', name: 'credits', type: 'uint256' },
    ],
    outputs: [],
  },

  // ─── Renewal ───────────────────────────────────────────────────────────
  {
    name: 'renewDomain',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      { internalType: 'uint256', name: '_tokenId', type: 'uint256' },
      { internalType: 'uint256', name: '_years', type: 'uint256' },
    ],
    outputs: [],
  },

  // ─── ERC-721 Transfer ──────────────────────────────────────────────────
  {
    name: 'transferFrom',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { internalType: 'address', name: 'from', type: 'address' },
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
    ],
    outputs: [],
  },

  // ─── Lookups ───────────────────────────────────────────────────────────
  {
    name: 'registryLookupByName',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ internalType: 'string', name: 'domainName', type: 'string' }],
    outputs: [
      {
        components: [
          { internalType: 'address', name: 'owner', type: 'address' },
          { internalType: 'string', name: 'domainName', type: 'string' },
          { internalType: 'uint16', name: 'lengthOfDomain', type: 'uint16' },
          { internalType: 'uint256', name: 'expirationDate', type: 'uint256' },
        ],
        internalType: 'struct ZNSRegistry.RegistryData',
        name: '',
        type: 'tuple',
      },
    ],
  },
  {
    name: 'domainLookup',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ internalType: 'string', name: '', type: 'string' }],
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
  },
] as const

/** Format a wei USDC value (18 decimals) to human-readable string */
export function formatUsdc(wei: bigint): string {
  const usdc = Number(wei) / 1e18
  if (usdc === 0) return '0 USDC'
  if (usdc < 0.0001) return '< 0.0001 USDC'
  return `${usdc.toFixed(4).replace(/\.?0+$/, '')} USDC`
}

/**
 * Calculate total price from contract values.
 *   total = priceToRegister + priceToRenew * (years - 1)
 */
export function calcTotalPrice(
  registerPrice: bigint,
  renewPrice: bigint,
  years: number,
): bigint {
  if (years <= 1) return registerPrice
  return registerPrice + renewPrice * BigInt(years - 1)
}

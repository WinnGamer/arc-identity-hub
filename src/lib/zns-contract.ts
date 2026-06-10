// ZNS Registry — Arc Testnet
// Contract: 0xf180136DdC9e4F8c9b5A9FE59e2b1f07265C5D4D (verified "ZNS Connect", symbol ".arc")
// Source: ArcScan verified ABI at https://testnet.arcscan.app/address/0xf180136DdC9e4F8c9b5A9FE59e2b1f07265C5D4D
// USDC is the native gas token on Arc — no ERC-20 approve needed.

export const ZNS_CONTRACT_ADDRESS =
  '0xf180136DdC9e4F8c9b5A9FE59e2b1f07265C5D4D' as const

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000' as const

// Minimal ABI — only the functions we use
export const ZNS_ABI = [
  {
    name: 'priceToRegister',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ internalType: 'uint16', name: 'len', type: 'uint16' }],
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
  },
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

/** 1 year in seconds */
export const ONE_YEAR_SECONDS = 31_536_000n

/** Build expiry timestamp = now + N years */
export function buildExpiry(years = 1): bigint {
  return BigInt(Math.floor(Date.now() / 1000)) + (ONE_YEAR_SECONDS * BigInt(years))
}

/** Format a wei USDC value (18 decimals) to human-readable string */
export function formatUsdc(wei: bigint): string {
  const usdc = Number(wei) / 1e18
  if (usdc === 0) return '0 USDC'
  if (usdc < 0.0001) return '< 0.0001 USDC'
  return `${usdc.toFixed(4).replace(/\.?0+$/, '')} USDC`
}

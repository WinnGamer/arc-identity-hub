// ZNS Registrar Contract — Arc Testnet
// Contract: 0xFdd4FAB233d9aaA78Be2f799DED2DE449d3e7333
// Reverse-engineered from ZNS.bio JS bundle (chunk 5646-88b0b0d78b903dd4.js)
// USDC is the native gas token on Arc — no ERC-20 approve needed.

export const ZNS_CONTRACT_ADDRESS =
  '0xFdd4FAB233d9aaA78Be2f799DED2DE449d3e7333' as const

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

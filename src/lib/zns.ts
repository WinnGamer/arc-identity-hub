// ZNS Connect API integration for Arc Network
// Docs: https://docs.znsconnect.io/developer-guide/zns-api
// Arc Network Chain ID: 5042002

const ZNS_API_BASE = 'https://zns.bio/api'
const ARC_CHAIN_ID = 5042002

export interface ZNSResolveAddressResponse {
  code: number
  primaryDomain: string
  userOwnedDomains: string[]
}

export interface ZNSResolveDomainResponse {
  code: number
  address: string
}

/**
 * Reverse resolution: address → .arc domain name(s)
 */
export async function resolveAddress(address: string): Promise<ZNSResolveAddressResponse | null> {
  try {
    const res = await fetch(
      `${ZNS_API_BASE}/resolveAddress?chain=${ARC_CHAIN_ID}&address=${address}`,
      { next: { revalidate: 30 } }
    )
    if (!res.ok) return null
    const data = await res.json()
    if (data.code !== 200) return null
    return data
  } catch {
    return null
  }
}

/**
 * Forward resolution: .arc domain name → address
 */
export async function resolveDomain(domain: string): Promise<ZNSResolveDomainResponse | null> {
  // Strip .arc suffix if present
  const name = domain.replace(/\.arc$/i, '').replace(/^\./, '')
  if (!name) return null

  try {
    const res = await fetch(
      `${ZNS_API_BASE}/resolveDomain?chain=${ARC_CHAIN_ID}&domain=${encodeURIComponent(name)}`,
      { next: { revalidate: 30 } }
    )
    if (!res.ok) return null
    const data = await res.json()
    if (data.code !== 200) return null
    return data
  } catch {
    return null
  }
}

/**
 * Format domain name for display (always shows with .arc suffix)
 */
export function formatDomain(domain: string): string {
  if (!domain) return ''
  const clean = domain.replace(/\.arc$/i, '')
  return `${clean}.arc`
}

/**
 * Shorten Ethereum address for display
 */
export function shortenAddress(address: string, chars = 4): string {
  if (!address) return ''
  return `${address.slice(0, 2 + chars)}...${address.slice(-chars)}`
}

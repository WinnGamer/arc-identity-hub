import { supabase } from './supabase'

export interface ProfileLinks {
  x: string
  telegram: string
  discord: string
}

const EMPTY: ProfileLinks = { x: '', telegram: '', discord: '' }

/**
 * Load profile links for a wallet address from Supabase.
 * Returns empty strings if no profile exists.
 */
export async function loadProfileLinks(walletAddress: string): Promise<ProfileLinks> {
  try {
    const { data, error } = await supabase
      .from('profile_links')
      .select('x_handle, telegram_handle, discord_handle')
      .eq('wallet_address', walletAddress.toLowerCase())
      .single()

    if (error || !data) return EMPTY

    return {
      x: data.x_handle || '',
      telegram: data.telegram_handle || '',
      discord: data.discord_handle || '',
    }
  } catch {
    return EMPTY
  }
}

/**
 * Save profile links for a wallet address to Supabase.
 * Uses upsert — creates if not exists, updates if exists.
 */
export async function saveProfileLinks(
  walletAddress: string,
  links: ProfileLinks,
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('profile_links')
      .upsert(
        {
          wallet_address: walletAddress.toLowerCase(),
          x_handle: links.x,
          telegram_handle: links.telegram,
          discord_handle: links.discord,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'wallet_address' },
      )

    return !error
  } catch {
    return false
  }
}

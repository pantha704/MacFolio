import { featuredSpotify } from '../data/music'
import { safeSave, safeStorage } from '../utils/storage'
import { spotifySource, type SpotifySource } from './sources'

export const collectionKey = 'macfolio-music-collection'
export type MusicCollection = { items: SpotifySource[]; selected: string }

/** Store bookmarks, never Spotify audio, credentials or transient blob URLs. */
export function cleanCollection(value: unknown): MusicCollection {
  const data =
    value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
  const seen = new Set(featuredSpotify.map((item) => item.url))
  const items: SpotifySource[] = []
  for (const entry of Array.isArray(data.items)
    ? data.items.slice(0, 100)
    : []) {
    if (!entry || typeof entry !== 'object' || typeof entry.url !== 'string')
      continue
    const entity = spotifySource(entry.url)
    if (!entity || seen.has(entity.url)) continue
    seen.add(entity.url)
    items.push({
      url: entity.url,
      title:
        typeof entry.title === 'string' && entry.title.trim()
          ? entry.title.trim().slice(0, 80)
          : `My Spotify ${entity.kind}`,
    })
  }
  const selected =
    typeof data.selected === 'string'
      ? spotifySource(data.selected)?.url
      : undefined
  return {
    items,
    selected:
      selected && seen.has(selected) ? selected : featuredSpotify[0].url,
  }
}

export function readCollection(): MusicCollection {
  try {
    const saved = safeStorage.getItem(collectionKey)
    if (saved) return cleanCollection(JSON.parse(saved))
    const legacy = JSON.parse(
      safeStorage.getItem('macfolio-music-spotify') ?? 'null',
    )
    return cleanCollection({
      items: legacy ? [legacy] : [],
      selected: legacy?.url,
    })
  } catch {
    return cleanCollection(null)
  }
}

export function saveCollection(value: MusicCollection) {
  return safeSave(collectionKey, JSON.stringify({ version: 1, ...value }))
}

import type { AudioTrack, SpotifySource } from '../music/sources'

// The owner's selections appear for every visitor. Leave empty until supplied.
// Add an ordinary public Spotify playlist/album/track URL; no API key is needed.
export const featuredSpotify: SpotifySource | null = null
// Put your own audio in public/music and use a same-origin /music/filename.mp3 URL.
export const featuredTracks: AudioTrack[] = []

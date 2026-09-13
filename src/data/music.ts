import type { AudioTrack, SpotifySource } from '../music/sources'

// Public Spotify links only. Playback belongs to Spotify; no audio is downloaded.
export const featuredSpotify: SpotifySource[] = [
  {
    title: 'Mondstadt Nighttime',
    artist: 'Chewie Melodies',
    url: 'https://open.spotify.com/track/12sYej7eevoDbZc2JNc77B',
  },
  {
    title: 'Choral Chambers',
    artist: 'Christopher Larkin',
    url: 'https://open.spotify.com/track/5CCGtH9xGsace3C5sb6jC7',
  },
  {
    title: 'in the sea',
    artist: 'kensuke ushio',
    url: 'https://open.spotify.com/track/3pFPWe9ZYmOFzSKBbSBUVD',
  },
]
// Put your own audio in public/music and use a same-origin /music/filename.mp3 URL.
export const featuredTracks: AudioTrack[] = []

import dawn from '../assets/gallery/clouds.jpg'
import day from '../assets/gallery/scenery5.jpg'
import evening from '../assets/gallery/scenery0.jpg'
import night from '../assets/gallery/night.jpg'
import type { Phase } from '../utils/ambience'

export type SceneId =
  'living' | 'landscape' | 'abstract' | 'slideshow' | 'photo'
export type WallpaperScene = {
  id: SceneId
  name: string
  description: string
  phases: Record<Phase, string>
}

export const landscapePhases: Record<Phase, string> = {
  dawn,
  day,
  evening,
  night,
}
const abstractPhases: Record<Phase, string> = {
  dawn: '/images/wallpaper.png',
  day: '/images/wallpaper.png',
  evening: '/images/wallpaper.png',
  night: '/images/wallpaper.png',
}

export const wallpaperScenes: WallpaperScene[] = [
  {
    id: 'living',
    name: 'Stillwater',
    description: 'A living landscape. Light follows your local clock.',
    phases: landscapePhases,
  },
  {
    id: 'landscape',
    name: 'Day cycle',
    description: 'A new landscape for dawn, day, evening, and night.',
    phases: landscapePhases,
  },
  {
    id: 'abstract',
    name: 'MacFolio blue',
    description: 'The original abstract blue desktop.',
    phases: abstractPhases,
  },
  {
    id: 'slideshow',
    name: 'Slow shuffle',
    description: 'Moves through the day-cycle collection every five minutes.',
    phases: landscapePhases,
  },
  {
    id: 'photo',
    name: 'My photo',
    description: 'The picture selected in Photos.',
    phases: abstractPhases,
  },
]

export function sceneSource(
  scene: SceneId,
  phase: Phase,
  photo: string,
  date: Date,
): string {
  if (scene === 'photo') return photo || '/images/wallpaper.png'
  if (scene === 'abstract') return '/images/wallpaper.png'
  if (scene === 'slideshow') {
    const values = Object.values(landscapePhases)
    return values[Math.floor(date.getTime() / 300_000) % values.length]
  }
  return landscapePhases[phase]
}

export type Phase = 'dawn' | 'day' | 'evening' | 'night'
export function phaseAt(hour: number): Phase { return hour >= 5 && hour < 8 ? 'dawn' : hour >= 8 && hour < 17 ? 'day' : hour >= 17 && hour < 20 ? 'evening' : 'night' }
export function seasonAt(month: number, south: boolean) { return ['winter', 'spring', 'summer', 'autumn'][(Math.floor(((month + 1) % 12) / 3) + (south ? 2 : 0)) % 4] }

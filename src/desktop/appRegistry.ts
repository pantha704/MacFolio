import type { ComponentType } from 'react'
import { FolderOpen, Gamepad2, Image, Mail, Settings, Terminal } from 'lucide-react'
import type { WindowKey } from '../store/useWindowStore'

export type AppDefinition = {
  id: WindowKey
  name: string
  description: string
  icon?: string
  desktopIcon?: ComponentType<{ size?: number }>
  defaultSize: { width: number; height: number }
  dock?: boolean
  desktop?: boolean
  searchable?: boolean
}

export const appRegistry: Record<WindowKey, AppDefinition> = {
  finder: { id: 'finder', name: 'Finder', description: 'Projects, about me, and files', icon: 'finder.png', desktopIcon: FolderOpen, defaultSize: { width: 980, height: 650 }, dock: true, desktop: true, searchable: true },
  safari: { id: 'safari', name: 'Safari', description: 'GitHub and bookmarks', icon: 'safari.png', defaultSize: { width: 980, height: 650 }, dock: true, searchable: true },
  photos: { id: 'photos', name: 'Photos', description: 'Photos, favorites, and wallpapers', icon: 'photos.png', desktopIcon: Image, defaultSize: { width: 980, height: 680 }, dock: true, desktop: true, searchable: true },
  terminal: { id: 'terminal', name: 'Terminal', description: 'A real browser-hosted Node shell', icon: 'terminal.png', desktopIcon: Terminal, defaultSize: { width: 980, height: 640 }, dock: true, desktop: true, searchable: true },
  arcade: { id: 'arcade', name: 'Arcade', description: 'Pinball, paddle ball, and Midnight Ride', desktopIcon: Gamepad2, defaultSize: { width: 760, height: 720 }, dock: true, desktop: true, searchable: true },
  settings: { id: 'settings', name: 'Settings', description: 'Wallpaper, motion, and local data', desktopIcon: Settings, defaultSize: { width: 760, height: 660 }, dock: true, desktop: true, searchable: true },
  contact: { id: 'contact', name: 'Contact', description: 'Email and social links', icon: 'contact.png', desktopIcon: Mail, defaultSize: { width: 580, height: 650 }, dock: true, desktop: true, searchable: true },
  resume: { id: 'resume', name: 'Résumé', description: 'View or download my résumé', icon: 'pdf.png', defaultSize: { width: 900, height: 680 }, searchable: true },
  txtfile: { id: 'txtfile', name: 'Text preview', description: 'Document preview', defaultSize: { width: 720, height: 580 } },
  imgfile: { id: 'imgfile', name: 'Image preview', description: 'Image preview', defaultSize: { width: 820, height: 650 } },
}

export const dockApps = Object.values(appRegistry).filter(app => app.dock)
export const desktopApps = Object.values(appRegistry).filter(app => app.desktop)
export const searchableApps = Object.values(appRegistry).filter(app => app.searchable)

import { ArrowUpRight, Moon, Sun } from 'lucide-react'
import { useWindowStore } from '#store/useWindowStore'
import DesktopMusic from './DesktopMusic'
import { profile } from '../data/portfolio'
import { useLocalClock } from '../hooks/useLocalClock'
export default function Welcome() {
  const open = useWindowStore((s) => s.openWindow),
    now = useLocalClock()
  const night = now.getHours() < 6 || now.getHours() >= 20
  return (
    <section className="studio-desktop" id="portfolio" aria-label="Desktop">
      <div className="desktop-clock">
        <span>
          {night ? <Moon size={14} /> : <Sun size={14} />} YOUR LOCAL TIME
        </span>
        <time dateTime={now.toISOString()}>
          {now.toLocaleTimeString(undefined, {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          })}
        </time>
        <p>
          {now.toLocaleDateString(undefined, {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>
      <div className="desktop-greeting">
        <span>THE PERSONAL SPACE OF</span>
        <h1>
          {profile.firstName}
          <em>Jaiswal.</em>
        </h1>
        <p>Developer. Builder. Curious human.</p>
        <div className="desktop-actions">
          <button onClick={() => open('finder')}>
            Selected work <ArrowUpRight size={16} />
          </button>
          <button onClick={() => open('contact')}>
            Say hello <ArrowUpRight size={16} />
          </button>
        </div>
      </div>
      <DesktopMusic />
      <div className="desktop-colophon">
        <span>MADE TO BE EXPLORED</span>
        <span>⌘ / Ctrl K to search · Alt W to close</span>
      </div>
    </section>
  )
}

import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

const renderText = (text: string, className: string) => (
  [...text].map((char, index) => (
    <span key={index} className={className} aria-hidden="true">
      {char === ' ' ? '\u00a0' : char}
    </span>
  ))
)

const setupTextHover = (container: HTMLElement | null) => {
  if (!container || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {}

  const letters = container.querySelectorAll('span')

  const handleMouseMove = (event: MouseEvent) => {
    letters.forEach((letter) => {
      const rect = letter.getBoundingClientRect()
      const distance = Math.hypot(
        event.clientX - (rect.left + rect.width / 2),
        event.clientY - (rect.top + rect.height / 2),
      )
      const intensity = Math.exp(-(distance ** 2) / 7000)

      gsap.to(letter, {
        y: -8 * intensity,
        scale: 1 + 0.12 * intensity,
        duration: 0.2,
        ease: 'power2.out',
        transformOrigin: 'center bottom',
      })
    })
  }

  const handleMouseLeave = () => {
    gsap.to(letters, { y: 0, scale: 1, duration: 0.3, ease: 'power2.out' })
  }

  container.addEventListener('mousemove', handleMouseMove)
  container.addEventListener('mouseleave', handleMouseLeave)

  return () => {
    container.removeEventListener('mousemove', handleMouseMove)
    container.removeEventListener('mouseleave', handleMouseLeave)
  }
}

const Welcome = () => {
  const titleRef = useRef<HTMLHeadingElement>(null)

  useGSAP(() => setupTextHover(titleRef.current), [])

  return (
    <section id="welcome" aria-labelledby="welcome-title">
      <p className="mb-4 rounded-full border border-white/15 bg-black/15 px-3 py-1 text-[10px] sm:text-xs font-semibold tracking-[0.18em] text-white/75 backdrop-blur-xl">
        FULL-STACK · WEB3 · AI / AUTOMATION
      </p>

      <p className="text-sm sm:text-lg md:text-xl font-medium text-white/75 drop-shadow-lg">
        Hey, I’m Pratham Jaiswal.
      </p>

      <h1
        id="welcome-title"
        ref={titleRef}
        aria-label="I build systems that ship."
        className="mt-2 flex flex-wrap justify-center cursor-default text-center font-georama text-[clamp(3.2rem,8.6vw,8rem)] leading-[0.92] font-bold tracking-[-0.055em] text-white/95 drop-shadow-2xl"
      >
        {renderText('I build systems that ship.', 'inline-block')}
      </h1>

      <p className="mt-6 max-w-xl px-6 text-center text-xs sm:text-sm leading-6 text-white/65">
        An interactive portfolio disguised as a Mac. Open Finder or press
        <kbd className="mx-1.5 rounded-md border border-white/15 bg-black/20 px-1.5 py-0.5 text-[10px] text-white/80">⌘ / Ctrl K</kbd>
        to explore.
      </p>
    </section>
  )
}

export default Welcome

import { useRef } from 'react'
import gsap from "gsap"
import { useGSAP } from "@gsap/react"

const FONT_WEIGHT = {
  subtitle: {min: 100, max: 400, default: 100},
  title: {min: 400, max: 900, default: 400},
}

const renderText = (text: string, className: string, baseWeight = 400) => {
  return [...text].map((char, i) => (
    <span
      key={i}
      className={className}
      style={{ fontVariationSettings: `'wght' ${baseWeight}` }}
    >
      {char === " " ? "\u00a0" : char}
    </span>
  ))
}

const setupTextHover = (container: HTMLElement | null, type: keyof typeof FONT_WEIGHT) => {
  if (!container) return () => {}

  const letters = container.querySelectorAll("span")
  const { min, max, default: base } = FONT_WEIGHT[type]

  const animateLetter = (letter: Element, weight: number, duration = 0.25) => {
    gsap.to(letter, {
      duration,
      ease: "power2.out",
      fontVariationSettings: `'wght' ${weight}`,
    })
  }

  const handleMouseMove = (e: MouseEvent) => {
    const { clientX, clientY } = e
    const { left, top } = container.getBoundingClientRect()
    const mouseX = clientX - left
    const mouseY = clientY - top

    letters.forEach((letter) => {
        const {left:l, width:w, top:t, height:h} = letter.getBoundingClientRect()

        const letterCenterX = l - left + w / 2
        const letterCenterY = t - top + h / 2
        const distance = Math.sqrt(Math.pow(mouseX - letterCenterX, 2) + Math.pow(mouseY - letterCenterY, 2))

        const intensity = Math.exp(-(distance ** 2) / 20000)

        animateLetter(letter, min + (max - min) * intensity)
    })
  }

  const handleMouseLeave = () => {
    letters.forEach(letter => animateLetter(letter, base, 0.3))
  }

  container.addEventListener("mousemove", handleMouseMove)
  container.addEventListener("mouseleave", handleMouseLeave)

  return () => {
    container.removeEventListener("mousemove", handleMouseMove)
    container.removeEventListener("mouseleave", handleMouseLeave)
  }
}

const Welcome = () => {
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)

  useGSAP(() => {
    const titleCleanup = setupTextHover(titleRef.current, "title")
    const subtitleCleanup = setupTextHover(subtitleRef.current, "subtitle")

    return () => {
      subtitleCleanup()
      titleCleanup()
    }
  }, [])

  return (
    <section id="welcome">
      <p ref={subtitleRef} className="cursor-default w-fit mx-auto">{renderText("Welcome to my", "text-3xl", 100)}</p>
      <h1 ref={titleRef} className='mt-7 cursor-default w-fit mx-auto'>{renderText("portfolio", "text-9xl italic font-georama")}</h1>

      <div className='small-screen'>
        <p>This Portfolio is designed for desktop/tablet screens only :(</p>
      </div>
    </section>
  )
}

export default Welcome

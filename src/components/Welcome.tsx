import { useRef } from 'react'
import gsap from "gsap"
import { useGSAP } from "@gsap/react"

const ANIMATION_CONFIG = {
  subtitle: {
    weight: { min: 100, max: 400, default: 100 },
    scale: { min: 1, max: 1.5, default: 1 },
  },
  title: {
    weight: { min: 400, max: 900, default: 400 },
    scale: { min: 1, max: 1, default: 1 },
  },
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

const setupTextHover = (container: HTMLElement | null, type: keyof typeof ANIMATION_CONFIG) => {
  if (!container) return () => {}

  const letters = container.querySelectorAll("span")
  const { weight: weightConfig, scale: scaleConfig } = ANIMATION_CONFIG[type]

  const animateLetter = (letter: Element, weight: number, scale: number, duration = 0.25) => {
    gsap.to(letter, {
      duration,
      ease: "power2.out",
      fontVariationSettings: `'wght' ${weight}`,
      scale: scale,
      transformOrigin: "center center",
    })
  }

  const handleMouseMove = (e: MouseEvent) => {
    const { clientX, clientY } = e
    const { left, top } = container.getBoundingClientRect()
    const mouseX = clientX - left
    const mouseY = clientY - top

    letters.forEach((letter) => {
        const {
          left: letterLeft,
          width: letterWidth,
          top: letterTop,
          height: letterHeight,
        } = letter.getBoundingClientRect();

        const letterCenterX = letterLeft - left + letterWidth / 2;
        const letterCenterY = letterTop - top + letterHeight / 2;
        const distance = Math.sqrt(Math.pow(mouseX - letterCenterX, 2) + Math.pow(mouseY - letterCenterY, 2))

        const intensity = Math.exp(-(distance ** 2) / 10000)

        const newWeight = weightConfig.min + (weightConfig.max - weightConfig.min) * intensity
        const newScale = scaleConfig.min + (scaleConfig.max - scaleConfig.min) * intensity

        animateLetter(letter, newWeight, newScale)
    })
  }

  const handleMouseLeave = () => {
    letters.forEach(letter => animateLetter(letter, weightConfig.default, scaleConfig.default, 0.3))
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
      <p ref={subtitleRef} className="cursor-default w-fit mx-auto">{renderText("Hey, I'm Pratham! Welcome to my", "text-3xl font-georama", 100)}</p>
      <h1 ref={titleRef} className='mt-7 cursor-default w-fit mx-auto'>{renderText("portfolio", "text-9xl italic font-georama")}</h1>

      <div className='small-screen'>
        <p>This Portfolio is designed for desktop/tablet screens only :(</p>
      </div>
    </section>
  )
}

export default Welcome

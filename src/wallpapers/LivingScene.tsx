import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { daylightAt, localHour } from '../utils/daylight'
import { meteorAt, type Season } from './atmosphere'
import { createSeasonalParticles } from './SeasonalParticles'
import { coastalFragment } from './coastalShader'
export type LivingOptions = {
  hour: number | null
  motion: boolean
  lowData: boolean
  season: Season | null
  particles: Season | null
  flipHorizontal?: boolean
}
export default function LivingScene({
  options,
  onReady,
  onFailure,
}: {
  options: LivingOptions
  onReady: () => void
  onFailure: () => void
}) {
  const host = useRef<HTMLDivElement>(null),
    current = useRef(options),
    refresh = useRef<(() => void) | null>(null)
  useEffect(() => {
    current.current = options
    refresh.current?.()
  }, [options])
  useEffect(() => {
    if (!host.current) return
    const container = host.current
    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: false,
        powerPreference: 'low-power',
      })
    } catch {
      onFailure()
      return
    }
    container.appendChild(renderer.domElement)
    const scene = new THREE.Scene(),
      camera = new THREE.Camera(),
      geometry = new THREE.PlaneGeometry(2, 2)
    const initial = daylightAt(current.current.hour ?? localHour(new Date()))
    const uniforms = {
      sky: {
        value: new THREE.Color().fromArray(initial.sky).convertSRGBToLinear(),
      },
      horizon: {
        value: new THREE.Color()
          .fromArray(initial.horizon)
          .convertSRGBToLinear(),
      },
      land: {
        value: new THREE.Color().fromArray(initial.land).convertSRGBToLinear(),
      },
      sunlight: { value: initial.sun },
      time: { value: 0 },
      aspect: { value: 1 },
      season: { value: 0 },
      viewport: { value: new THREE.Vector2(1, 1) },
      meteor: { value: new THREE.Vector4() },
      meteorOpacity: { value: 0 },
      mirror: { value: current.current.flipHorizontal ?? true },
    }
    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader:
        'varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position,1.);}',
      fragmentShader: coastalFragment,
    })
    renderer.debug.onShaderError = onFailure
    scene.add(new THREE.Mesh(geometry, material))
    const particles = createSeasonalParticles()
    scene.add(particles.mesh)
    let frame = 0,
      last = 0,
      elapsed = 0,
      ratio = 0,
      disposed = false,
      timer: ReturnType<typeof setTimeout> | undefined
    const reduced = matchMedia('(prefers-reduced-motion: reduce)'),
      color = new THREE.Color()
    const resize = () => {
      const w = Math.max(1, container.clientWidth),
        h = Math.max(1, container.clientHeight)
      renderer.setSize(w, h)
      uniforms.aspect.value = w / h
      uniforms.viewport.value.set(w, h)
      particles.resize(w, h)
    }
    const observer = new ResizeObserver(() => {
      resize()
      refresh.current?.()
    })
    observer.observe(container)
    const draw = (stamp: number) => {
      if (disposed) return
      const prefs = current.current,
        moving = prefs.motion && !prefs.lowData && !reduced.matches
      if (
        !document.hidden &&
        (!last || stamp - last >= (moving ? 1000 / 60 - 0.5 : 1000))
      ) {
        const dt = last ? Math.min((stamp - last) / 1000, 1) : 0
        last = stamp
        const nextRatio = Math.min(
          devicePixelRatio,
          prefs.lowData ? 0.75 : 1.25,
        )
        if (ratio !== nextRatio) {
          ratio = nextRatio
          renderer.setPixelRatio(ratio)
          resize()
        }
        const lighting = daylightAt(prefs.hour ?? localHour(new Date())),
          blend = moving ? 1 - Math.exp(-dt * 3) : 1
        for (const key of ['sky', 'horizon', 'land'] as const)
          uniforms[key].value.lerp(
            color.fromArray(lighting[key]).convertSRGBToLinear(),
            blend,
          )
        uniforms.sunlight.value +=
          (lighting.sun - uniforms.sunlight.value) * blend
        // Never jump particles or a meteor across the screen after a stalled frame.
        if (moving) elapsed += Math.min(dt, 0.05)
        uniforms.time.value = elapsed
        uniforms.mirror.value = prefs.flipHorizontal ?? true
        const seasonalTint =
          prefs.season === 'autumn' ? 1 : prefs.season === 'winter' ? -1 : 0
        uniforms.season.value += (seasonalTint - uniforms.season.value) * blend
        const shooting = moving
          ? meteorAt(elapsed, uniforms.aspect.value)
          : null
        uniforms.meteorOpacity.value = shooting?.opacity ?? 0
        if (shooting)
          uniforms.meteor.value.set(
            shooting.head[0],
            shooting.head[1],
            shooting.tail[0],
            shooting.tail[1],
          )
        particles.update(
          elapsed,
          prefs.particles,
          uniforms.sunlight.value,
          moving ? dt : 10,
          prefs.lowData,
        )
        renderer.render(scene, camera)
      }
      if (!document.hidden) {
        if (moving) frame = requestAnimationFrame(draw)
        else timer = setTimeout(() => draw(performance.now()), 1000)
      }
    }
    const lost = (event: Event) => {
      event.preventDefault()
      onFailure()
    }
    renderer.domElement.addEventListener('webglcontextlost', lost)
    const visibility = () => {
      cancelAnimationFrame(frame)
      clearTimeout(timer)
      last = 0
      if (!document.hidden) draw(performance.now())
    }
    refresh.current = visibility
    document.addEventListener('visibilitychange', visibility)
    reduced.addEventListener('change', visibility)
    resize()
    draw(performance.now())
    onReady()
    return () => {
      disposed = true
      refresh.current = null
      cancelAnimationFrame(frame)
      clearTimeout(timer)
      document.removeEventListener('visibilitychange', visibility)
      reduced.removeEventListener('change', visibility)
      observer.disconnect()
      renderer.domElement.removeEventListener('webglcontextlost', lost)
      geometry.dispose()
      material.dispose()
      particles.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
      renderer.domElement.remove()
    }
  }, [onReady, onFailure])
  return <div className="living-scene" ref={host} />
}

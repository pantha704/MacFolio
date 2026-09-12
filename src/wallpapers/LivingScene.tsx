import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { daylightAt, localHour } from '../utils/daylight'
export type LivingOptions = {
  hour: number | null
  motion: boolean
  lowData: boolean
  season: string | null
}
const fragment = /* glsl */ `
varying vec2 vUv;
uniform vec3 sky; uniform vec3 horizon; uniform vec3 land;
uniform float time; uniform float sunlight; uniform float aspect; uniform float season;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p); f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
float hill(float x,float seed){return .06*sin(x*2.5+seed)+.028*sin(x*6.4+seed)+.011*sin(x*15.+seed);}
void main(){
 vec2 uv=vUv; float x=(uv.x-.5)*aspect;
 vec3 col=mix(horizon,sky,smoothstep(.35,1.,uv.y));
 float clouds=noise(vec2(x*2.+time*.006,uv.y*7.));
 col+=.06*clouds*smoothstep(.6,.9,uv.y)*sunlight;
 vec2 sunPos=vec2(.42,.56+sunlight*.19);
 float d=length(vec2(x,uv.y)-sunPos);
 col+=vec3(1.,.78,.46)*exp(-d*9.)*.12*sunlight;
 col=mix(col,vec3(1.,.91,.74), (1.-smoothstep(.019,.023,d))*sunlight);
 vec2 starGrid=vec2(x,uv.y)*330.;float star=step(.9985,hash(floor(starGrid)))*(1.-smoothstep(.0,.18,length(fract(starGrid)-.5)));
 col+=star*(1.-sunlight)*smoothstep(.5,.9,uv.y)*.65;
 if(uv.y<.45){float ripple=sin(uv.y*320.+noise(vec2(x*20.,uv.y*40.))*4.+time*.4); col=mix(land*.55,horizon*.7,uv.y/.45)+ripple*.007;col+=vec3(.16,.1,.045)*exp(-abs(x-sunPos.x)*15.)*sunlight*max(0.,ripple);}
 for(int i=0;i<4;i++){
  float f=float(i);float height=.46-f*.079+hill(x*(1.+f*.2),f*1.8);
  height-=exp(-pow((x-.25)*1.8,2.))*(.08+f*.026);
  vec3 tint=mix(horizon*.63,land, .35+f*.21);
  tint=mix(tint,vec3(.37,.23,.12)*(sunlight*.65+.15),max(season,0.)*.23);
  tint=mix(tint,vec3(.55,.66,.69)*(sunlight*.6+.2),max(-season,0.)*.28);
  col=mix(col,tint,1.-smoothstep(height-.001,height+.001,uv.y));
 }
 col+= (hash(gl_FragCoord.xy)-.5)/280.; gl_FragColor=vec4(col,1.);
 #include <colorspace_fragment>
}`
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
    current = useRef(options)
  useEffect(() => {
    current.current = options
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
      sky: { value: new THREE.Color().fromArray(initial.sky) },
      horizon: { value: new THREE.Color().fromArray(initial.horizon) },
      land: { value: new THREE.Color().fromArray(initial.land) },
      sunlight: { value: initial.sun },
      time: { value: 0 },
      aspect: { value: 1 },
      season: { value: 0 },
    }
    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader:
        'varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position,1.);}',
      fragmentShader: fragment,
    })
    renderer.debug.onShaderError = onFailure
    scene.add(new THREE.Mesh(geometry, material))
    let frame = 0,
      last = 0,
      elapsed = 0,
      ratio = 0,
      disposed = false,
      timer: ReturnType<typeof setTimeout> | undefined
    const reduced = matchMedia('(prefers-reduced-motion: reduce)'),
      color = new THREE.Color()
    const resize = () => {
      const w = container.clientWidth,
        h = container.clientHeight
      renderer.setSize(w, h)
      uniforms.aspect.value = w / Math.max(1, h)
    }
    const observer = new ResizeObserver(resize)
    observer.observe(container)
    const draw = (stamp: number) => {
      if (disposed) return
      const prefs = current.current,
        moving = prefs.motion && !prefs.lowData && !reduced.matches
      if (
        !document.hidden &&
        (!last || stamp - last >= (moving ? 1000 / 30 : 1000))
      ) {
        const dt = last ? Math.min((stamp - last) / 1000, 1) : 1
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
          blend = 1 - Math.exp(-dt * 3)
        for (const key of ['sky', 'horizon', 'land'] as const)
          uniforms[key].value.lerp(color.fromArray(lighting[key]), blend)
        uniforms.sunlight.value +=
          (lighting.sun - uniforms.sunlight.value) * blend
        if (moving) elapsed += dt
        uniforms.time.value = elapsed
        uniforms.season.value =
          prefs.season === 'autumn' ? 1 : prefs.season === 'winter' ? -1 : 0
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
    document.addEventListener('visibilitychange', visibility)
    resize()
    draw(performance.now())
    onReady()
    return () => {
      disposed = true
      cancelAnimationFrame(frame)
      clearTimeout(timer)
      document.removeEventListener('visibilitychange', visibility)
      observer.disconnect()
      renderer.domElement.removeEventListener('webglcontextlost', lost)
      geometry.dispose()
      material.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
      renderer.domElement.remove()
    }
  }, [onReady, onFailure])
  return <div className="living-scene" ref={host} />
}

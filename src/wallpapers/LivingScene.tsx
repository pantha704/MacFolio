import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { daylightAt, localHour } from '../utils/daylight'
import { meteorAt, type Season } from './atmosphere'
import { createSeasonalParticles } from './SeasonalParticles'
export type LivingOptions = {
  hour: number | null
  motion: boolean
  lowData: boolean
  season: Season | null
  particles: Season | null
}
const fragment = /* glsl */ `
varying vec2 vUv;
uniform vec3 sky; uniform vec3 horizon; uniform vec3 land;
uniform float time; uniform float sunlight; uniform float aspect; uniform float season;
uniform vec2 viewport; uniform vec4 meteor; uniform float meteorOpacity;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p); f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
float hill(float x,float seed){return .06*sin(x*2.5+seed)+.028*sin(x*6.4+seed)+.011*sin(x*15.+seed);}
vec3 stars(vec2 p,float scale,float density){
 vec2 grid=p*scale,cell=floor(grid);float seed=hash(cell);
 if(seed<1.-density)return vec3(0.);
 vec2 offset=.18+.64*vec2(hash(cell+17.3),hash(cell+41.9));
 float d=length(fract(grid)-offset)*viewport.y/scale;
 float radius=mix(.45,1.05,hash(cell+8.));
 float point=exp(-d*d/(radius*radius));
 float halo=exp(-d*d/(radius*radius*8.))*.045;
 float twinkle=.88+.12*sin(time*(.55+hash(cell+3.))+seed*190.);
 vec3 tint=mix(vec3(.64,.77,1.),vec3(1.,.88,.69),hash(cell+9.));
 return tint*(point+halo)*mix(.12,.65,hash(cell+12.))*twinkle;
}
vec3 shootingStar(vec2 p){
 vec2 segment=meteor.xy-meteor.zw;
 float along=clamp(dot(p-meteor.zw,segment)/max(dot(segment,segment),.000001),0.,1.);
 float distance=length(p-meteor.zw-segment*along)*viewport.y;
 float taper=pow(along,2.2),core=exp(-distance*distance/1.2);
 float glow=exp(-distance*distance/12.)*.16;
 float head=exp(-pow(length(p-meteor.xy)*viewport.y,2.)/3.);
 return mix(vec3(.48,.66,1.),vec3(1.,.95,.86),along)*((core+glow)*taper+head*.5)*meteorOpacity;
}
void main(){
 vec2 uv=vUv; float x=(uv.x-.5)*aspect;
 vec3 col=mix(horizon,sky,smoothstep(.35,1.,uv.y));
 float clouds=noise(vec2(x*2.+time*.006,uv.y*7.));
 col+=.06*clouds*smoothstep(.6,.9,uv.y)*sunlight;
 vec2 sunPos=vec2(.42,.56+sunlight*.19);
 float d=length(vec2(x,uv.y)-sunPos);
 col+=vec3(1.,.78,.46)*exp(-d*9.)*.12*sunlight;
 col=mix(col,vec3(1.,.91,.74), (1.-smoothstep(.019,.023,d))*sunlight);
 float night=1.-smoothstep(.02,.42,sunlight);
 if(night>.001){
  vec2 p=vec2(x,uv.y);
  float bandDistance=(x*.3+uv.y-.95)*5.;
  float band=exp(-bandDistance*bandDistance);
  col+=vec3(.002,.0025,.006)*band*noise(p*13.)*night;
  col+=(stars(p,140.,.027)+stars(p+7.1,65.,.017)+shootingStar(p))*night*smoothstep(.42,.69,uv.y);
 }
 if(uv.y<.45){float ripple=sin(uv.y*320.+noise(vec2(x*20.,uv.y*40.))*4.+time*.4); col=mix(land*.55,horizon*.7,uv.y/.45)+ripple*.007;col+=vec3(.16,.1,.045)*exp(-abs(x-sunPos.x)*15.)*sunlight*max(0.,ripple);}
 for(int i=0;i<4;i++){
  float f=float(i);float height=.46-f*.079+hill(x*(1.+f*.2),f*1.8);
  float valley=(x-.25)*1.8;
  height-=exp(-valley*valley)*(.08+f*.026);
  vec3 tint=mix(horizon*.63,land, .35+f*.21);
  tint=mix(tint,vec3(.37,.23,.12)*(sunlight*.65+.15),max(season,0.)*.23);
  tint=mix(tint,vec3(.55,.66,.69)*(sunlight*.6+.2),max(-season,0.)*.28);
  col=mix(col,tint,1.-smoothstep(height-.001,height+.001,uv.y));
 }
 col=max(vec3(0.),col+(hash(gl_FragCoord.xy)-.5)/1800.); gl_FragColor=vec4(col,1.);
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
    }
    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader:
        'varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position,1.);}',
      fragmentShader: fragment,
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

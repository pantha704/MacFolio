import * as THREE from 'three'
import { driftAt, particleSeeds, seasons, type Season } from './atmosphere'

// One instanced draw for all the particles. Shapes, veins and soft edges live on the GPU;
// no downloaded sprites, full-screen transparent textures, or per-particle DOM elements.
export function createSeasonalParticles() {
  const count = 72,
    seeds = particleSeeds(count),
    plane = new THREE.PlaneGeometry(1, 1)
  const geometry = new THREE.InstancedBufferGeometry()
  geometry.index = plane.index
  geometry.attributes = plane.attributes
  geometry.instanceCount = count
  const offsets = new THREE.InstancedBufferAttribute(
    new Float32Array(count * 4),
    4,
  ).setUsage(THREE.DynamicDrawUsage)
  const detail = new THREE.InstancedBufferAttribute(
    new Float32Array(count * 4),
    4,
  ).setUsage(THREE.DynamicDrawUsage)
  geometry.setAttribute('aOffset', offsets)
  geometry.setAttribute('aDetail', detail)
  const weights = new THREE.Vector4(),
    target = new THREE.Vector4()
  const uniforms = {
    viewport: { value: new THREE.Vector2(1440, 900) },
    weights: { value: weights },
    daylight: { value: 0 },
    time: { value: 0 },
  }
  const material = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    vertexShader: /* glsl */ `
  attribute vec4 aOffset; attribute vec4 aDetail;
  uniform vec2 viewport; uniform float time;
  varying vec2 vUv; varying float alpha; varying float variation;
  void main(){
   vUv=uv;alpha=aDetail.x;variation=aDetail.y;
   float angle=aOffset.w,c=cos(angle),s=sin(angle);
   vec2 p=position.xy; p.x*=.45+.55*abs(cos(time*(1.+variation)+variation*20.));
   p=mat2(c,-s,s,c)*p;
   vec2 centre=aOffset.xy*2.-1.;
   gl_Position=vec4(centre+p*aOffset.z/viewport*2.,0.,1.);
  }
 `,
    fragmentShader: /* glsl */ `
  uniform vec4 weights; uniform float daylight;
  varying vec2 vUv; varying float alpha; varying float variation;
  void main(){
   vec2 p=(vUv-.5)*2.;float aa=max(fwidth(p.x),.025);
   float petalY=(p.y+.02)/.83;
   float petalWidth=sqrt(max(0.,1.-petalY*petalY))*(.59+.12*p.y);
   float petal=(1.-smoothstep(petalWidth-aa,petalWidth+aa,abs(p.x)))*(1.-smoothstep(.8,.86,abs(p.y)));
   petal*=smoothstep(.11,.11+aa,length(p-vec2(0.,.78)));
   vec3 pink=mix(vec3(.95,.56,.67),vec3(1.,.86,.85),clamp(-p.y*.6+.25,0.,1.));
   pink*=.86+.14*variation;
   float oakY=(p.y-.03)/.80;
   float bodyWidth=sqrt(max(0.,1.-oakY*oakY))*(.47+.13*cos((p.y+.65)*18.));
   float oak=(1.-smoothstep(bodyWidth-aa,bodyWidth+aa,abs(p.x)))*(1.-smoothstep(.76,.84,abs(p.y)));
   float stem=(1.-smoothstep(.018,.045,abs(p.x)))*(1.-smoothstep(.93,1.,abs(p.y)));
   oak=max(oak,stem*.8);
   float vein=1.-smoothstep(.01,.03,abs(p.x));
   float branches=1.-smoothstep(.015,.04,abs(fract((p.y-abs(p.x)*.7)*3.5+.5)-.5));
   vec3 brown=mix(vec3(.48,.18,.055),vec3(.78,.43,.14),variation);
   brown*=1.-vein*.24-branches*.10;
   float pollen=1.-smoothstep(.03,.22,length(p));
   float snow=1.-smoothstep(.04,.18,length(p));
   float opacity=petal*weights.x+pollen*weights.y+oak*weights.z+snow*weights.w;
   if(opacity<.002)discard;
   vec3 colour=(pink*petal*weights.x+vec3(.94,.86,.57)*pollen*weights.y+brown*oak*weights.z+vec3(.80,.88,.96)*snow*weights.w)/max(opacity,.001);
   gl_FragColor=sRGBTransferEOTF(vec4(colour,opacity*alpha*daylight));
   #include <colorspace_fragment>
  }
 `,
  })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.frustumCulled = false
  mesh.renderOrder = 1
  const seed = [0, 0, 0, 0]
  return {
    mesh,
    resize(width: number, height: number) {
      uniforms.viewport.value.set(width, height)
    },
    update(
      time: number,
      season: Season | null,
      light: number,
      dt: number,
      lowPower: boolean,
    ) {
      target.set(0, 0, 0, 0)
      if (season) target.setComponent(seasons.indexOf(season), 1)
      weights.lerp(target, 1 - Math.exp(-dt * 2.3))
      uniforms.daylight.value = THREE.MathUtils.smoothstep(light, 0.025, 0.5)
      uniforms.time.value = time
      geometry.instanceCount = lowPower ? 32 : count
      for (let i = 0; i < geometry.instanceCount; i++) {
        for (let j = 0; j < 4; j++) seed[j] = seeds[i * 4 + j]
        const p = driftAt(seed, time)
        offsets.setXYZW(i, p.x, p.y, p.size, p.angle)
        detail.setXYZW(i, p.opacity, seed[3], 0, 0)
      }
      offsets.needsUpdate = true
      detail.needsUpdate = true
      mesh.visible =
        uniforms.daylight.value > 0.002 && weights.lengthSq() > 0.0001
    },
    dispose() {
      geometry.dispose()
      plane.dispose()
      material.dispose()
    },
  }
}

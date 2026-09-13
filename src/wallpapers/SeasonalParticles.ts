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
  const weights = new THREE.Vector4(0, 0, 0, 0),
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
  uniform vec2 viewport; uniform float time; uniform vec4 weights;
  varying vec2 vUv; varying float alpha; varying float variation;
  void main(){
   vUv=uv;alpha=aDetail.x;variation=aDetail.y;
   float butterfly=weights.y*step(.87,variation);
   float angle=mix(aOffset.w,sin(time*1.3+variation*20.)*.25,butterfly),c=cos(angle),s=sin(angle);
   vec2 p=position.xy;
   float flutter=.42+.58*abs(cos(time*(1.+variation)+variation*20.));
   flutter=mix(flutter,.25+.75*abs(sin(time*9.+variation*30.)),butterfly);
   p.x*=mix(flutter,1.,weights.w);
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
   // Summer has veined green leaves and an occasional little butterfly.
   float leafWidth=.54*pow(max(0.,1.-abs(p.y)/.87),.72);
   float leaf=(1.-smoothstep(leafWidth-aa,leafWidth+aa,abs(p.x)))*(1.-smoothstep(.84,.90,abs(p.y)));
   vec3 green=mix(vec3(.37,.65,.24),vec3(.66,.79,.37),variation);
   green*=1.-vein*.20-branches*.09;
   vec2 wing=vec2(abs(p.x),p.y);
   float upper=1.-smoothstep(.85,1.,length((wing-vec2(.39,.28))/vec2(.43,.49)));
   float lower=1.-smoothstep(.85,1.,length((wing-vec2(.29,-.32))/vec2(.30,.34)));
   float wings=max(upper,lower);
   float body=(1.-smoothstep(.035,.065,abs(p.x)))*(1.-smoothstep(.43,.62,abs(p.y)));
   vec3 wingColour=mix(vec3(.98,.80,.39),vec3(.99,.94,.79),variation);
   wingColour=mix(wingColour,vec3(.24,.22,.15),body);
   float summer=mix(leaf,max(wings,body),step(.87,variation));
   vec3 summerColour=mix(green,wingColour,step(.87,variation));
   // Six delicate arms plus a few softer flakes: snow reads as snow at screen size.
   float radius=length(p),angle=atan(p.y,p.x);
   float sector=mod(angle+3.141593/6.,3.141593/3.)-3.141593/6.;
   vec2 ray=vec2(cos(sector),sin(sector))*radius;
   float arms=(1.-smoothstep(.025,.025+aa,abs(ray.y)))*(1.-smoothstep(.64,.70,ray.x));
   float twig=abs(abs(ray.y)-(ray.x-.29)*.65);
   float twigs=(1.-smoothstep(.024,.024+aa,twig))*smoothstep(.27,.32,ray.x)*(1.-smoothstep(.48,.55,ray.x));
   float crystal=max(arms,twigs);
   float soft=1.-smoothstep(.12,.42,radius);
   float snow=mix(crystal,soft,step(.65,variation));
   float opacity=petal*weights.x+summer*weights.y+oak*weights.z+snow*weights.w;
   if(opacity<.002)discard;
   vec3 colour=(pink*petal*weights.x+summerColour*summer*weights.y+brown*oak*weights.z+vec3(.95,.98,1.)*snow*weights.w)/max(opacity,.001);
   float visibility=mix(daylight,max(.38,daylight),weights.w);
   gl_FragColor=sRGBTransferEOTF(vec4(colour,opacity*min(.88,alpha*(1.+weights.w*.5))*visibility));
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
        const butterfly = seed[3] > 0.87 ? weights.y : 0
        const flutterX =
          -0.08 +
          ((seed[2] + time * 0.013) % 1) * 1.16 +
          Math.sin(time * 0.8 + seed[0] * 20) * 0.012
        const flutterY =
          -0.12 +
          ((seed[0] + time * 0.008) % 1) * 1.24 +
          Math.sin(time * 0.65 + seed[1] * 20) * 0.02
        offsets.setXYZW(
          i,
          THREE.MathUtils.lerp(p.x, flutterX, butterfly),
          THREE.MathUtils.lerp(p.y, flutterY, butterfly),
          p.size * (1 + weights.w * 0.18 + butterfly * 0.45),
          p.angle,
        )
        detail.setXYZW(i, p.opacity, seed[3], 0, 0)
      }
      offsets.needsUpdate = true
      detail.needsUpdate = true
      mesh.visible =
        (uniforms.daylight.value > 0.002 || weights.w > 0.002) &&
        weights.lengthSq() > 0.0001
    },
    dispose() {
      geometry.dispose()
      plane.dispose()
      material.dispose()
    },
  }
}

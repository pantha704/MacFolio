import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { bumpers, flipperSegment, type GameId, type GameState } from './engine'

export function createArcadeRenderer(
  host: HTMLElement,
  game: GameId,
  onFailure: () => void,
) {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: 'high-performance',
  })
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5))
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.2
  renderer.domElement.setAttribute('aria-label', `${game} 3D playfield`)
  renderer.domElement.setAttribute('role', 'img')
  host.appendChild(renderer.domElement)
  renderer.debug.onShaderError = onFailure
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(game === 'racer' ? '#182331' : '#141d24')
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 260)
  const pmrem = new THREE.PMREMGenerator(renderer),
    room = new RoomEnvironment(),
    env = pmrem.fromScene(room, 0.04)
  scene.environment = env.texture
  room.dispose()
  pmrem.dispose()
  scene.add(new THREE.HemisphereLight('#d9efff', '#111a22', 2))
  const key = new THREE.DirectionalLight('#fff3dc', 3)
  key.position.set(-4, 12, -3)
  scene.add(key)
  const geometries = new Set<THREE.BufferGeometry>(),
    materials = new Set<THREE.Material>()
  const geo = <T extends THREE.BufferGeometry>(g: T) => {
    geometries.add(g)
    return g
  }
  const mat = (
    color: string,
    metalness = 0.2,
    roughness = 0.4,
    emissive?: string,
  ) => {
    const m = new THREE.MeshStandardMaterial({
      color,
      metalness,
      roughness,
      emissive: emissive ?? '#000000',
      emissiveIntensity: 0.8,
    })
    materials.add(m)
    return m
  }
  const slate = mat('#243b42'),
    edge = mat('#6d8990', 0.75, 0.2),
    mint = mat('#95ecd0', 0.45, 0.24, '#2f6757'),
    amber = mat('#f3b780', 0.35, 0.28, '#7b421b'),
    chrome = mat('#e9f6fa', 1, 0.1),
    pink = mat('#e2a2b7', 0.35, 0.27)
  const box = (
    w: number,
    h: number,
    d: number,
    m: THREE.Material,
    x = 0,
    y = 0,
    z = 0,
    parent: THREE.Object3D = scene,
  ) => {
    const mesh = new THREE.Mesh(
      geo(new RoundedBoxGeometry(w, h, d, 2, Math.min(0.16, h / 3))),
      m,
    )
    mesh.position.set(x, y, z)
    parent.add(mesh)
    return mesh
  }
  const sphere = geo(new THREE.SphereGeometry(0.22, 20, 12)),
    ball = new THREE.Mesh(sphere, chrome)
  ball.position.y = 0.45
  scene.add(ball)
  const trails = Array.from({ length: 8 }, () => {
    const mesh = new THREE.Mesh(sphere, mint)
    scene.add(mesh)
    return mesh
  })
  const flippers: THREE.Group[] = [],
    paddles: THREE.Mesh[] = [],
    bumperRings: THREE.Mesh[] = []
  let playerBike: THREE.Group | undefined,
    traffic: THREE.Group[] = []
  let road: THREE.InstancedMesh | undefined,
    markers: THREE.InstancedMesh | undefined,
    trees: THREE.InstancedMesh | undefined,
    posts: THREE.InstancedMesh | undefined
  const dummy = new THREE.Object3D(),
    roadX = (z: number, distance: number) =>
      Math.sin((distance - z) * 0.007) * 10 - Math.sin(distance * 0.007) * 10
  function instance(g: THREE.BufferGeometry, m: THREE.Material, count: number) {
    const mesh = new THREE.InstancedMesh(geo(g), m, count)
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    mesh.frustumCulled = false
    scene.add(mesh)
    return mesh
  }
  if (game !== 'racer') {
    box(8.6, 0.7, 14.2, slate, 0, -0.5)
    box(0.25, 0.42, 13.8, edge, -4, 0)
    box(0.25, 0.42, 13.8, edge, 4, 0)
    box(8.2, 0.42, 0.25, edge, 0, 0, -6.85)
    box(0.055, 0.04, 13.5, mint, -3.84, 0.18)
    box(0.055, 0.04, 13.5, mint, 3.84, 0.18)
    if (game === 'pinball') {
      bumpers.forEach((b) => {
        const base = new THREE.Mesh(
          geo(new THREE.CylinderGeometry(0.69, 0.78, 0.34, 32)),
          edge,
        )
        base.position.set(b.x, 0.07, b.z)
        scene.add(base)
        const cap = new THREE.Mesh(
          geo(new THREE.CylinderGeometry(0.57, 0.63, 0.22, 32)),
          mint,
        )
        cap.position.set(b.x, 0.36, b.z)
        scene.add(cap)
        const ring = new THREE.Mesh(
          geo(new THREE.TorusGeometry(0.73, 0.045, 8, 40)),
          amber,
        )
        ring.rotation.x = Math.PI / 2
        ring.position.set(b.x, 0.29, b.z)
        scene.add(ring)
        bumperRings.push(ring)
      })
      for (let i = 0; i < 2; i++) {
        const group = new THREE.Group()
        const dir = i === 0 ? 1 : -1
        group.position.set(-dir * 2.55, 0.18, 4.8)
        box(2.05, 0.28, 0.32, mint, dir * 1.025, 0, 0, group)
        const pivot = new THREE.Mesh(
          geo(new THREE.CylinderGeometry(0.24, 0.24, 0.34, 24)),
          chrome,
        )
        group.add(pivot)
        scene.add(group)
        flippers.push(group)
      }
      for (const dir of [-1, 1]) {
        const rail = box(0.15, 0.25, 2.67, amber, dir * 3.175, 0.1, 3.25)
        rail.rotation.y = -dir * 0.363
      }
      for (let i = 0; i < 5; i++)
        box(0.34, 0.15, 0.14, amber, -1.4 + i * 0.7, 0.02, -5.3)
      const orbit = new THREE.Mesh(
        geo(new THREE.TorusGeometry(2.8, 0.015, 4, 80)),
        edge,
      )
      orbit.rotation.x = Math.PI / 2
      orbit.position.set(0, -0.12, -1.8)
      scene.add(orbit)
    } else {
      paddles.push(
        box(2.05, 0.32, 0.3, mint, 0, 0.15, 5.6),
        box(2.05, 0.32, 0.3, pink, 0, 0.15, -5.6),
      )
      for (let i = -3; i <= 3; i++) box(0.5, 0.015, 0.035, edge, i, -0.13, 0)
      const ring = new THREE.Mesh(
        geo(new THREE.TorusGeometry(1.6, 0.018, 4, 64)),
        edge,
      )
      ring.rotation.x = Math.PI / 2
      ring.position.y = -0.13
      scene.add(ring)
    }
  } else {
    ball.visible = false
    trails.forEach((t) => (t.visible = false))
    scene.fog = new THREE.Fog('#293442', 28, 145)
    box(230, 0.1, 240, mat('#283936', 0.05, 0.95), 0, -0.3, -85)
    road = instance(
      new THREE.BoxGeometry(8, 0.08, 3.1),
      mat('#303b42', 0.1, 0.85),
      60,
    )
    markers = instance(new THREE.BoxGeometry(0.06, 0.025, 1.6), amber, 80)
    posts = instance(new THREE.BoxGeometry(0.08, 0.75, 0.08), mint, 80)
    trees = instance(
      new THREE.ConeGeometry(1.7, 7, 6),
      mat('#1c3533', 0.05, 0.95),
      80,
    )
    const sun = new THREE.Mesh(
      geo(new THREE.SphereGeometry(9, 32, 20)),
      mat('#f9b577', 0, 1, '#d88e58'),
    )
    sun.position.set(-26, 15, -130)
    scene.add(sun)
    const rubber = mat('#11191e', 0.1, 0.7),
      rider = mat('#29343f', 0.15, 0.65)
    const wheelGeo = geo(new THREE.TorusGeometry(0.35, 0.12, 8, 18)),
      hubGeo = geo(new THREE.CylinderGeometry(0.22, 0.22, 0.15, 12)),
      helmetGeo = geo(new THREE.SphereGeometry(0.28, 16, 12))
    const bike = (paint: THREE.Material) => {
      const group = new THREE.Group()
      for (const z of [-0.61, 0.61]) {
        const wheel = new THREE.Mesh(wheelGeo, rubber)
        wheel.rotation.y = Math.PI / 2
        wheel.position.set(0, 0.45, z)
        group.add(wheel)
        const hub = new THREE.Mesh(hubGeo, chrome)
        hub.rotation.z = Math.PI / 2
        hub.position.copy(wheel.position)
        group.add(hub)
      }
      box(0.38, 0.38, 1.05, paint, 0, 0.84, 0, group)
      box(0.3, 0.12, 0.48, rider, 0, 1.08, 0.2, group)
      const torso = box(0.46, 0.56, 0.34, rider, 0, 1.34, 0.07, group)
      torso.rotation.x = -0.3
      const helmet = new THREE.Mesh(helmetGeo, paint)
      helmet.position.set(0, 1.75, -0.12)
      group.add(helmet)
      box(0.67, 0.06, 0.07, chrome, 0, 1.12, -0.55, group)
      box(0.23, 0.1, 0.045, amber, 0, 0.9, -0.67, group)
      box(0.22, 0.07, 0.045, pink, 0, 0.92, 0.64, group)
      scene.add(group)
      return group
    }
    playerBike = bike(mint)
    traffic = Array.from({ length: 7 }, (_, i) => bike(i % 2 ? pink : amber))
  }
  const resize = () => {
    const w = host.clientWidth,
      h = host.clientHeight
    renderer.setSize(w, h)
    camera.aspect = w / Math.max(h, 1)
    if (game === 'racer') {
      camera.position.set(0, 5, 11)
      camera.lookAt(0, 0.5, -17)
    } else {
      camera.position.set(
        0,
        camera.aspect < 0.7 ? 25 : 20,
        camera.aspect < 0.7 ? 12 : 9,
      )
      camera.lookAt(0, 0, 0)
    }
    camera.updateProjectionMatrix()
  }
  const observer = new ResizeObserver(resize)
  observer.observe(host)
  resize()
  let frameCount = 0,
    previousX = 0
  function draw(s: GameState) {
    if (game === 'racer' && playerBike && road && markers && trees && posts) {
      playerBike.position.set(s.player, 0, 3)
      playerBike.rotation.z = THREE.MathUtils.lerp(
        playerBike.rotation.z,
        -(s.player - previousX) * 1.8,
        0.2,
      )
      previousX = s.player
      playerBike.visible =
        !s.invulnerable || Math.floor(s.invulnerable * 9) % 2 === 0
      traffic.forEach((bike, i) => {
        const car = s.traffic[i]
        bike.position.set(car.x + roadX(car.z, s.distance), 0, car.z)
      })
      for (let i = 0; i < 60; i++) {
        const z = 12 - i * 3
        dummy.position.set(roadX(z, s.distance), -0.15, z)
        dummy.rotation.set(
          0,
          Math.atan(0.07 * Math.cos((s.distance - z) * 0.007)),
          0,
        )
        dummy.scale.set(1, 1, 1)
        dummy.updateMatrix()
        road.setMatrixAt(i, dummy.matrix)
      }
      road.instanceMatrix.needsUpdate = true
      for (let i = 0; i < 80; i++) {
        const z = 12 - ((i % 40) * 4.5 - (s.distance % 4.5) + 4.5)
        dummy.position.set(
          roadX(z, s.distance) + (i < 40 ? -1.32 : 1.32),
          -0.08,
          z,
        )
        dummy.rotation.set(0, 0, 0)
        dummy.updateMatrix()
        markers.setMatrixAt(i, dummy.matrix)
        dummy.position.x = roadX(z, s.distance) + (i < 40 ? -4.2 : 4.2)
        dummy.position.y = 0.25
        posts.setMatrixAt(i, (dummy.updateMatrix(), dummy.matrix))
        const tz = 12 - ((i % 40) * 4.5 - (s.distance % 4.5) + 4.5)
        dummy.position.set(
          roadX(tz, s.distance) + (i < 40 ? -1 : 1) * (8 + ((i * 17) % 13)),
          2.7,
          tz,
        )
        const scale = 0.8 + ((i * 13) % 9) / 10
        dummy.scale.setScalar(scale)
        dummy.updateMatrix()
        trees.setMatrixAt(i, dummy.matrix)
        dummy.scale.setScalar(1)
      }
      markers.instanceMatrix.needsUpdate = true
      posts.instanceMatrix.needsUpdate = true
      trees.instanceMatrix.needsUpdate = true
    } else {
      for (let i = trails.length - 1; i > 0; i--)
        trails[i].position.copy(trails[i - 1].position)
      trails[0].position.copy(ball.position)
      trails.forEach((mesh, i) => {
        mesh.scale.setScalar((1 - i / trails.length) * 0.5)
        mesh.visible = s.phase === 'playing' && s.cooldown <= 0
      })
      ball.position.set(s.ball.x, 0.37, s.ball.z)
      flippers.forEach((group, i) => {
        const a = flipperSegment(i, s.flippers[i])
        group.rotation.y =
          -Math.atan2(a.endZ - a.z, (i === 0 ? 1 : -1) * (a.endX - a.x)) *
          (i === 0 ? 1 : -1)
      })
      if (paddles.length) {
        paddles[0].position.x = s.player
        paddles[1].position.x = s.enemy
      }
      bumperRings.forEach((ring, i) =>
        ring.scale.setScalar(
          i === s.lastBumper ? 1 + Math.sin(s.elapsed * 7) * 0.04 : 1,
        ),
      )
    }
    renderer.render(scene, camera)
    if (++frameCount % 15 === 0)
      renderer.domElement.dataset.frames = String(frameCount)
  }
  const lost = (event: Event) => {
    event.preventDefault()
    onFailure()
  }
  renderer.domElement.addEventListener('webglcontextlost', lost)
  return {
    draw,
    dispose() {
      observer.disconnect()
      renderer.domElement.removeEventListener('webglcontextlost', lost)
      geometries.forEach((g) => g.dispose())
      materials.forEach((m) => m.dispose())
      env.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
      renderer.domElement.remove()
    },
  }
}

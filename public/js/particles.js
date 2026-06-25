const DOT_THRESHOLD = 1.0
const PIXEL_THRESHOLD = 5.0
const BELT_COLOR = 0x8B7355
const RING_COLOR = 0xC8B896
const ANGULAR_SPEED = 0.00005

export function createParticles(PIXI, ringLayer) {
  const belts = []
  let ringContainer = null

  function initBelt(body, centerX, centerY) {
    const count = body.id === 'kuiper-belt' ? 400 : 200
    const particles = []

    for (let i = 0; i < count; i++) {
      const angulo = Math.random() * 2 * Math.PI
      const raio = body.beltInnerRadius + Math.random() * (body.beltOuterRadius - body.beltInnerRadius)
      const g = new PIXI.Graphics()
      g.x = centerX + Math.cos(angulo) * raio
      g.y = centerY + Math.sin(angulo) * raio
      ringLayer.addChild(g)
      particles.push({
        graphic: g,
        angulo,
        raio,
        centerX,
        centerY,
        alpha: 0.4 + Math.random() * 0.6,
        lastMode: null,
        grainDots: null,
        asteroidVerts: null,
        asteroidRotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() * 0.00008 + 0.00002) * (Math.random() < 0.5 ? 1 : -1),
        vx: (Math.random() - 0.5) * 0.04,
        vy: (Math.random() - 0.5) * 0.04,
        beltInner: body.beltInnerRadius,
        beltOuter: body.beltOuterRadius
      })
    }
    belts.push(particles)
  }

  function initRings(saturn) {
    if (ringContainer) {
      ringContainer.destroy({ children: true })
    }
    ringContainer = new PIXI.Container()
    ringLayer.addChild(ringContainer)

    const sz = saturn.size
    const bandCount = 14
    const rMin = 1.5 * sz
    const rMax = 4.0 * sz
    const particlesPerBand = 160

    for (let bi = 0; bi < bandCount; bi++) {
      const t = bi / (bandCount - 1)
      const radius = rMin + t * (rMax - rMin)
      const ecc = 0.15 + Math.abs(t - 0.5) * 0.70

      for (let pi = 0; pi < particlesPerBand; pi++) {
        const angle = (pi / particlesPerBand) * 2 * Math.PI
        const g = new PIXI.Graphics()
        const pixelSize = 0.4 + Math.random() * 0.4
        g.beginFill(RING_COLOR, 0.5 + Math.random() * 0.5)
        g.drawRect(-pixelSize / 2, -pixelSize / 2, pixelSize, pixelSize)
        g.endFill()
        g.x = Math.cos(angle) * radius
        g.y = Math.sin(angle) * radius * Math.sqrt(1 - ecc * ecc)
        ringContainer.addChild(g)
      }
    }
  }

  function updateBelts(scale) {
    for (const particles of belts) {
      const mode = scale < DOT_THRESHOLD ? 'dot' : scale < PIXEL_THRESHOLD ? 'pixel' : 'arcade'
      const doOrbit = scale >= DOT_THRESHOLD

      for (const p of particles) {
        const g = p.graphic

        if (doOrbit && mode !== 'arcade') {
          p.angulo -= ANGULAR_SPEED
          g.x = p.centerX + Math.cos(p.angulo) * p.raio
          g.y = p.centerY + Math.sin(p.angulo) * p.raio
        }

        if (mode !== p.lastMode) {
          g.clear()
          p.lastMode = mode
          p.grainDots = null
          p.asteroidVerts = null
        }

        if (mode === 'dot') {
          const sz = Math.max(1, 1.5 / scale)
          g.clear()
          g.beginFill(BELT_COLOR, 1)
          g.drawRect(-sz / 2, -sz / 2, sz, sz)
          g.endFill()
        } else if (mode === 'pixel') {
          const grainCount = 2 + Math.floor((scale - 1.0) * 3)
          if (!p.grainDots || p.grainDots !== grainCount) {
            p.grainDots = grainCount
          }
          g.clear()
          for (let i = 0; i < grainCount; i++) {
            const ox = (Math.random() - 0.5) * 2
            const oy = (Math.random() - 0.5) * 2
            const sz = 0.3 + Math.random() * 0.5
            const a = 0.3 + Math.random() * 0.7
            g.beginFill(BELT_COLOR, a)
            g.drawRect(ox, oy, sz, sz)
            g.endFill()
          }
        } else {
          if (!p.asteroidVerts) {
            const vertCount = 6 + Math.floor(Math.random() * 4)
            const verts = []
            for (let i = 0; i < vertCount; i++) {
              const a = (i / vertCount) * 2 * Math.PI
              const r = 0.5 + Math.random() * 1.5
              verts.push({ x: Math.cos(a) * r, y: Math.sin(a) * r })
            }
            p.asteroidVerts = verts
          }
          p.asteroidRotation += p.rotSpeed
          p.vx *= 0.9999
          p.vy *= 0.9999
          g.x += p.vx
          g.y += p.vy

          const dist = Math.sqrt((g.x - p.centerX) ** 2 + (g.y - p.centerY) ** 2)
          if (dist < p.beltInner || dist > p.beltOuter) {
            p.angulo = Math.atan2(g.y - p.centerY, g.x - p.centerX)
            p.raio = p.beltInner + Math.random() * (p.beltOuter - p.beltInner)
            g.x = p.centerX + Math.cos(p.angulo) * p.raio
            g.y = p.centerY + Math.sin(p.angulo) * p.raio
            p.vx = (Math.random() - 0.5) * 0.04
            p.vy = (Math.random() - 0.5) * 0.04
          }

          g.clear()
          g.lineStyle(0.6, BELT_COLOR, p.alpha)
          const verts = p.asteroidVerts
          const cos = Math.cos(p.asteroidRotation)
          const sin = Math.sin(p.asteroidRotation)
          g.moveTo(
            verts[0].x * cos - verts[0].y * sin,
            verts[0].x * sin + verts[0].y * cos
          )
          for (let i = 1; i < verts.length; i++) {
            g.lineTo(
              verts[i].x * cos - verts[i].y * sin,
              verts[i].x * sin + verts[i].y * cos
            )
          }
          g.closePath()
        }
      }
    }
  }

  function updateRings(saturnWorldX, saturnWorldY) {
    if (!ringContainer) return
    ringContainer.x = saturnWorldX
    ringContainer.y = saturnWorldY
  }

  return { initBelt, initRings, updateBelts, updateRings }
}

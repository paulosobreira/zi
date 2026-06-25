import * as PIXI from '/js/pixi.mjs'
import { createCamera } from '/js/camera.js'
import { createInput } from '/js/input.js'
import { createContextMenu } from '/js/contextMenu.js'
import { createParticles } from '/js/particles.js'
import { createNameplates } from '/js/nameplates.js'
import { createRenderer } from '/js/renderer.js'

const WS_URL = `ws://${location.hostname}:3001`
const SESSION_KEY = 'zeus_session_id'

const app = new PIXI.Application({
  resizeTo: window,
  backgroundColor: 0x0A0A1A,
  antialias: true
})

const gameEl = document.getElementById('game')
gameEl.appendChild(app.view || app.canvas)

const camera = createCamera()
const contextMenu = createContextMenu(document.getElementById('contextMenu'))
const renderer = createRenderer(PIXI, app)
const particles = createParticles(PIXI, renderer.ringLayer)

let nameplates = null
let ws = null
let playerId = null
let systemData = null
let bodies = []
let bodyMap = {}
let positions = {}
let fleet = null
let movement = null
let centerX = 0
let centerY = 0

let lastSimulatedTime = 0
let lastWallTime = performance.now()

// ──── Login UI ────────────────────────────────────────────────────────────────

const loginOverlay = document.getElementById('loginOverlay')
const btnStart = document.getElementById('btnStart')
const selectBody = document.getElementById('startingBody')
const reconnectMsg = document.getElementById('reconnectMsg')
const btnBar = document.getElementById('btnBar')
const btnCenter = document.getElementById('btnCenter')
const btnLogoff = document.getElementById('btnLogoff')
const statusBar = document.getElementById('statusBar')

function showLogin() {
  const existingSession = localStorage.getItem(SESSION_KEY)
  if (existingSession) {
    selectBody.style.display = 'none'
    loginOverlay.querySelector('p').style.display = 'none'
    reconnectMsg.style.display = 'block'
    btnStart.disabled = true
    connect(existingSession, null)
  } else {
    btnStart.addEventListener('click', () => {
      const sessionId = 'session-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8)
      localStorage.setItem(SESSION_KEY, sessionId)
      connect(sessionId, selectBody.value)
    })
  }
}

function hideLogin() {
  loginOverlay.style.display = 'none'
  btnBar.style.display = 'flex'
}

// ──── WebSocket ───────────────────────────────────────────────────────────────

function connect(sessionId, startingBody) {
  ws = new WebSocket(WS_URL)

  ws.onopen = () => {
    ws.send(JSON.stringify({
      type: 'COMMAND',
      action: 'HELLO',
      payload: { sessionId, startingBody }
    }))
  }

  ws.onmessage = (e) => {
    const msg = JSON.parse(e.data)
    handleMessage(msg, sessionId, startingBody)
  }

  ws.onclose = () => {
    statusBar.textContent = 'Reconectando...'
    setTimeout(() => connect(sessionId, startingBody), 2000)
  }

  ws.onerror = () => {}
}

function handleMessage(msg, sessionId, startingBody) {
  switch (msg.type) {
    case 'WELCOME':
      playerId = msg.playerId
      break

    case 'SYSTEM_DATA': {
      systemData = msg.payload.system
      centerX = systemData.centerX
      centerY = systemData.centerY
      bodies = systemData.orbitalBodies
      bodyMap = {}
      for (const b of bodies) bodyMap[b.id] = b

      camera.fitSystem(systemData.roomSize, systemData.roomSize, window.innerWidth, window.innerHeight)

      if (nameplates) nameplates.destroy()
      nameplates = createNameplates(PIXI, app, bodies)

      for (const body of bodies) {
        if (body.type === 'ASTEROID_BELT') {
          particles.initBelt(body, centerX, centerY)
        }
      }

      const saturn = bodies.find(b => b.id === 'saturn')
      if (saturn) particles.initRings(saturn)

      hideLogin()
      break
    }

    case 'FLEET_DATA':
      fleet = {
        ...msg.payload,
        state: msg.payload.state || 'ORBIT',
        orbitRadius: msg.payload.orbitRadius,
        orbitPeriod: msg.payload.orbitPeriod,
        orbitPhase: msg.payload.orbitPhase,
        orbitX: msg.payload.orbitX,
        orbitY: msg.payload.orbitY
      }
      break

    case 'STATE_UPDATE': {
      const p = msg.payload
      lastSimulatedTime = p.simulatedTime
      lastWallTime = performance.now()
      positions = p.orbitalBodies

      if (fleet && p.fleets[playerId]) {
        const fd = p.fleets[playerId]
        fleet.state = fd.state
        fleet.locationId = fd.locationId
        fleet.orbitRadius = fd.orbitRadius
        fleet.orbitPeriod = fd.orbitPeriod
        fleet.orbitPhase = fd.orbitPhase
        fleet.orbitX = fd.orbitX
        fleet.orbitY = fd.orbitY
      }

      if (p.movements && p.movements.length > 0) {
        const myMov = p.movements.find(m => m.fleetId === playerId)
        if (myMov) {
          movement = { ...myMov, centerX, centerY }
          if (fleet) fleet.movement = movement
        } else {
          movement = null
          if (fleet) fleet.movement = null
        }
      } else {
        movement = null
        if (fleet) fleet.movement = null
      }

      statusBar.textContent = `tick ${p.tick} | simTime ${Math.floor(p.simulatedTime / 1000)}s`
      break
    }

    case 'FLEET_ARRIVED':
      if (fleet) {
        fleet.state = 'ORBIT'
        fleet.locationId = msg.payload.destination.bodyId
        fleet.movement = null
        movement = null
      }
      break

    case 'MOVE_STARTED':
      break
  }
}

// ──── Input & hit-test ────────────────────────────────────────────────────────

createInput(gameEl, camera, (worldX, worldY, screenX, screenY) => {
  if (!bodies.length) return

  const hit = hitTest(worldX, worldY)
  if (hit) {
    contextMenu.show(screenX, screenY, hit, fleet, (action, body) => {
      if (action === 'travel') sendMoveFleet(body, worldX, worldY)
    })
  }
})

function hitTest(worldX, worldY) {
  for (const body of bodies) {
    if (body.type === 'RING_SYSTEM') continue
    const pos = positions[body.id]
    if (!pos) continue

    if (body.type === 'ASTEROID_BELT') {
      const dist = Math.sqrt((worldX - centerX) ** 2 + (worldY - centerY) ** 2)
      if (dist >= body.beltInnerRadius && dist <= body.beltOuterRadius) return body
      continue
    }

    const dist = Math.sqrt((worldX - pos.x) ** 2 + (worldY - pos.y) ** 2)
    const hitRadius = body.type === 'STAR' ? body.size + 5 : body.size + 15
    if (dist <= hitRadius) return body
  }
  return null
}

function sendMoveFleet(body, worldX, worldY) {
  if (!ws || ws.readyState !== 1) return
  const payload = {
    destination: { type: 'ORBITAL_BODY', bodyId: body.id }
  }
  if (body.type === 'ASTEROID_BELT') {
    payload.arrivalPosition = { x: worldX, y: worldY }
  }
  ws.send(JSON.stringify({ type: 'COMMAND', action: 'MOVE_FLEET', payload }))
}

// ──── Botões ──────────────────────────────────────────────────────────────────

btnCenter.addEventListener('click', () => {
  if (!fleet || !positions) return
  let fx, fy
  if (fleet.orbitX != null) {
    fx = fleet.orbitX; fy = fleet.orbitY
  } else {
    const pos = positions[fleet.locationId]
    if (pos) { fx = pos.x; fy = pos.y }
  }
  if (fx != null) camera.centerOn(fx, fy)
})

btnLogoff.addEventListener('click', () => {
  localStorage.removeItem(SESSION_KEY)
  if (ws) ws.onclose = null
  if (ws) ws.close()
  location.reload()
})

// ──── Ticker 60fps ────────────────────────────────────────────────────────────

app.ticker.add(() => {
  if (!systemData) return

  const simTime = lastSimulatedTime + (performance.now() - lastWallTime)

  camera.update()
  renderer.applyCamera(camera)
  renderer.redrawOrbits(bodies, positions, centerX, centerY)
  renderer.redrawBodies(bodies, positions)
  renderer.redrawFleet(fleet, positions, bodies, simTime)

  if (movement) {
    renderer.redrawTrajectory(movement)
  }

  const saturnPos = positions['saturn']
  if (saturnPos) {
    particles.updateRings(saturnPos.x, saturnPos.y)
  }

  particles.updateBelts(camera.state.scale)

  if (nameplates) nameplates.update(positions, camera)
})

// ──── Init ────────────────────────────────────────────────────────────────────

showLogin()

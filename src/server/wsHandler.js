import { sim } from './sim.js'

function send(ws, obj) {
  ws.send(JSON.stringify(obj))
}

function buildSystemData() {
  return {
    type: 'SYSTEM_DATA',
    payload: {
      system: {
        id: sim.system.id,
        centerX: sim.system.centerX,
        centerY: sim.system.centerY,
        roomSize: sim.system.roomSize,
        orbitalBodies: sim.system.orbitalBodies.map(b => ({
          id: b.id,
          name: b.name,
          type: b.type,
          planetType: b.planetType,
          parentId: b.parentId,
          semiMajorAxis: b.semiMajorAxis,
          eccentricity: b.eccentricity,
          orbitalPeriod: b.orbitalPeriod,
          orbitalPhase: b.orbitalPhase,
          size: b.size,
          color: b.color,
          beltInnerRadius: b.beltInnerRadius,
          beltOuterRadius: b.beltOuterRadius
        }))
      }
    }
  }
}

function buildFleetData(playerId) {
  const fleet = sim.fleets[playerId]
  return {
    type: 'FLEET_DATA',
    payload: {
      fleetId: fleet.id,
      state: fleet.state,
      locationId: fleet.locationId,
      orbitRadius: fleet.orbitRadius,
      orbitPeriod: fleet.orbitPeriod,
      orbitPhase: fleet.orbitPhase,
      orbitX: fleet.orbitX,
      orbitY: fleet.orbitY
    }
  }
}

function createFleet(playerId, startingBodyId) {
  const body = sim.system.orbitalBodies.find(b => b.id === startingBodyId)
  const orbitRadius = (body?.size ?? 8) + 5
  sim.fleets[playerId] = {
    id: playerId,
    playerId,
    state: 'ORBIT',
    locationId: startingBodyId,
    orbitRadius,
    orbitPeriod: 15000,
    orbitPhase: Math.random() * 2 * Math.PI,
    orbitX: null,
    orbitY: null
  }
}

function handleHello(ws, payload) {
  const { sessionId, startingBody } = payload
  let playerId = sim.sessions[sessionId]

  if (!playerId) {
    playerId = `player-${sim.nextPlayerId++}`
    sim.sessions[sessionId] = playerId
    sim.players[playerId] = { id: playerId, createdAt: Date.now() }
    createFleet(playerId, startingBody || 'earth')
  }

  ws.playerId = playerId

  const existing = sim.clients.find(c => c.playerId === playerId)
  if (existing) {
    sim.clients = sim.clients.filter(c => c.playerId !== playerId)
  }
  sim.clients.push({ ws, playerId })

  send(ws, { type: 'WELCOME', playerId })
  send(ws, buildSystemData())
  send(ws, buildFleetData(playerId))
}

function handleMoveFleet(ws, payload) {
  const playerId = ws.playerId
  if (!playerId) return

  const fleet = sim.fleets[playerId]
  if (!fleet) return

  if (fleet.state === 'TRAVEL') {
    send(ws, { type: 'ERROR', code: 'FLEET_BUSY', message: 'Frota já está em viagem' })
    return
  }

  const { destination, arrivalPosition } = payload
  const destBodyId = destination.bodyId
  const destBody = sim.system.orbitalBodies.find(b => b.id === destBodyId)
  if (!destBody) {
    send(ws, { type: 'ERROR', code: 'INVALID_DESTINATION', message: 'Destino inválido' })
    return
  }
  if (destBody.type === 'STAR') {
    send(ws, { type: 'ERROR', code: 'INVALID_DESTINATION', message: 'Não é possível viajar para a órbita do Sol' })
    return
  }

  const { centerX, centerY } = sim.system
  const originPos = sim.bodies[fleet.locationId] || { x: centerX, y: centerY }

  let destX, destY
  if (destBody.type === 'ASTEROID_BELT' && arrivalPosition) {
    const angle = Math.atan2(arrivalPosition.y - centerY, arrivalPosition.x - centerX)
    const midRadius = (destBody.beltInnerRadius + destBody.beltOuterRadius) / 2
    destX = centerX + Math.cos(angle) * midRadius
    destY = centerY + Math.sin(angle) * midRadius
  } else {
    const pos = sim.bodies[destBodyId]
    destX = pos?.x ?? centerX
    destY = pos?.y ?? centerY
  }

  const dx = destX - originPos.x
  const dy = destY - originPos.y
  const distance = Math.sqrt(dx * dx + dy * dy)
  const fleetSpeed = 6
  const travelSimulatedTime = (distance / fleetSpeed) * 1000

  const mov = {
    id: `move-${Date.now()}`,
    fleetId: playerId,
    originId: fleet.locationId,
    destinationId: destBodyId,
    originX: originPos.x,
    originY: originPos.y,
    destX,
    destY,
    departureSimulatedTime: sim.simulatedTime,
    arrivalSimulatedTime: sim.simulatedTime + travelSimulatedTime,
    progress: 0,
    x: originPos.x,
    y: originPos.y
  }

  sim.movements[playerId] = mov
  fleet.state = 'TRAVEL'

  send(ws, {
    type: 'MOVE_STARTED',
    payload: {
      fleetId: fleet.id,
      arrivalSimulatedTime: mov.arrivalSimulatedTime
    }
  })
}

export function handleConnect(ws) {
  console.log('Client connected')
}

export function handleDisconnect(ws) {
  sim.clients = sim.clients.filter(c => c.ws !== ws)
  console.log('Client disconnected')
}

export function handleMessage(ws, msg) {
  if (msg.type !== 'COMMAND') return
  switch (msg.action) {
    case 'HELLO':
      handleHello(ws, msg.payload)
      break
    case 'MOVE_FLEET':
      handleMoveFleet(ws, msg.payload)
      break
    case 'PONG':
      break
    default:
      send(ws, { type: 'ERROR', code: 'INVALID_ACTION', message: 'Ação inválida' })
  }
}

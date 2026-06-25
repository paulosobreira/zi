import { sim } from './sim.js'
import { calculatePosition, bezierPoint, bezierControlPoint } from './physics.js'

function broadcastStateUpdate() {
  const { centerX, centerY } = sim.system

  const fleetsPayload = {}
  for (const [playerId, fleet] of Object.entries(sim.fleets)) {
    fleetsPayload[playerId] = {
      state: fleet.state,
      locationId: fleet.locationId,
      orbitRadius: fleet.orbitRadius,
      orbitPeriod: fleet.orbitPeriod,
      orbitPhase: fleet.orbitPhase,
      orbitX: fleet.orbitX,
      orbitY: fleet.orbitY
    }
  }

  const movementsPayload = []
  for (const mov of Object.values(sim.movements)) {
    movementsPayload.push({
      id: mov.id,
      fleetId: mov.fleetId,
      originId: mov.originId,
      destinationId: mov.destinationId,
      originX: mov.originX,
      originY: mov.originY,
      destX: mov.destX,
      destY: mov.destY,
      departureSimulatedTime: mov.departureSimulatedTime,
      arrivalSimulatedTime: mov.arrivalSimulatedTime,
      progress: mov.progress
    })
  }

  const msg = JSON.stringify({
    type: 'STATE_UPDATE',
    payload: {
      tick: sim.tick,
      simulatedTime: sim.simulatedTime,
      centerX,
      centerY,
      orbitalBodies: sim.bodies,
      fleets: fleetsPayload,
      movements: movementsPayload
    }
  })

  for (const client of sim.clients) {
    if (client.ws.readyState === 1) {
      client.ws.send(msg)
    }
  }
}

export function startTick() {
  setInterval(() => {
    sim.simulatedTime += 1000
    sim.tick++

    const { centerX, centerY } = sim.system

    for (const body of sim.system.orbitalBodies) {
      sim.bodies[body.id] = calculatePosition(body, sim.simulatedTime, centerX, centerY)
    }

    for (const [playerId, mov] of Object.entries(sim.movements)) {
      const duration = mov.arrivalSimulatedTime - mov.departureSimulatedTime
      const elapsed = sim.simulatedTime - mov.departureSimulatedTime
      const progress = Math.min(1, elapsed / duration)

      const origin = { x: mov.originX, y: mov.originY }
      const dest = { x: mov.destX, y: mov.destY }
      const cp = bezierControlPoint(origin, dest, centerX, centerY)
      const pos = bezierPoint(origin, cp, dest, progress)

      mov.progress = progress
      mov.x = pos.x
      mov.y = pos.y

      if (sim.simulatedTime >= mov.arrivalSimulatedTime) {
        const fleet = sim.fleets[playerId]
        fleet.state = 'ORBIT'
        fleet.locationId = mov.destinationId

        const destBody = sim.system.orbitalBodies.find(b => b.id === mov.destinationId)
        if (destBody?.type === 'ASTEROID_BELT') {
          fleet.orbitX = mov.destX
          fleet.orbitY = mov.destY
        } else {
          fleet.orbitX = null
          fleet.orbitY = null
        }

        delete sim.movements[playerId]

        const client = sim.clients.find(c => c.playerId === playerId)
        if (client?.ws.readyState === 1) {
          client.ws.send(JSON.stringify({
            type: 'FLEET_ARRIVED',
            payload: {
              fleetId: fleet.id,
              destination: { type: 'ORBITAL_BODY', bodyId: mov.destinationId }
            }
          }))
        }
      }
    }

    broadcastStateUpdate()
  }, 1000)
}

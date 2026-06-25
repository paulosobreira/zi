export function createRenderer(PIXI, app) {
  const worldContainer = new PIXI.Container()
  app.stage.addChild(worldContainer)

  const orbitLayer = new PIXI.Graphics()
  const bodyLayer = new PIXI.Graphics()
  const ringLayer = new PIXI.Container()
  const fleetLayer = new PIXI.Graphics()
  worldContainer.addChild(orbitLayer, bodyLayer, ringLayer, fleetLayer)

  let _onFleetPosition = null

  function applyCamera(camera) {
    worldContainer.x = camera.state.x
    worldContainer.y = camera.state.y
    worldContainer.scale.set(camera.state.scale)
  }

  function redrawOrbits(bodies, positions, centerX, centerY) {
    orbitLayer.clear()

    for (const body of bodies) {
      if (body.type === 'RING_SYSTEM') continue

      if (body.type === 'ASTEROID_BELT') {
        const midRadius = (body.beltInnerRadius + body.beltOuterRadius) / 2
        orbitLayer.lineStyle(1.5, parseInt(body.color.replace('#', ''), 16), 0.3)
        orbitLayer.drawCircle(centerX, centerY, midRadius)
        continue
      }

      if (body.orbitalPeriod === 0) continue

      const a = body.semiMajorAxis
      const e = body.eccentricity
      const b = a * Math.sqrt(1 - e * e)
      const cx = centerX - a * e

      orbitLayer.lineStyle(1.5, 0x2A2A4A, 0.5)
      orbitLayer.drawEllipse(cx, centerY, a, b)
    }
  }

  function redrawBodies(bodies, positions) {
    bodyLayer.clear()

    for (const body of bodies) {
      if (body.type === 'RING_SYSTEM' || body.type === 'ASTEROID_BELT') continue
      const pos = positions[body.id]
      if (!pos) continue

      const color = parseInt(body.color.replace('#', ''), 16)
      bodyLayer.beginFill(color)
      bodyLayer.drawCircle(pos.x, pos.y, body.size)
      bodyLayer.endFill()
    }
  }

  function redrawFleet(fleet, positions, bodies, simTime) {
    fleetLayer.clear()
    if (!fleet) return

    let fx, fy

    if (fleet.state === 'ORBIT') {
      if (fleet.orbitX != null && fleet.orbitY != null) {
        fx = fleet.orbitX
        fy = fleet.orbitY
      } else {
        const bodyPos = positions[fleet.locationId]
        if (!bodyPos) return
        const angle = fleet.orbitPhase + (simTime / fleet.orbitPeriod) * 2 * Math.PI
        fx = bodyPos.x + Math.cos(angle) * fleet.orbitRadius
        fy = bodyPos.y + Math.sin(angle) * fleet.orbitRadius
      }
    } else if (fleet.state === 'TRAVEL' && fleet.movement) {
      const mov = fleet.movement
      const duration = mov.arrivalSimulatedTime - mov.departureSimulatedTime
      const elapsed = simTime - mov.departureSimulatedTime
      const progress = Math.max(0, Math.min(1, elapsed / duration))

      const origin = { x: mov.originX, y: mov.originY }
      const dest = { x: mov.destX, y: mov.destY }
      const cp = bezierControlPoint(origin, dest, mov.centerX, mov.centerY)
      const pos = bezierPoint(origin, cp, dest, progress)
      fx = pos.x
      fy = pos.y
    } else {
      return
    }

    if (_onFleetPosition) _onFleetPosition(fx, fy)

    fleetLayer.beginFill(0x00FF88)
    fleetLayer.moveTo(fx, fy - 3)
    fleetLayer.lineTo(fx + 2.6, fy + 2)
    fleetLayer.lineTo(fx - 2.6, fy + 2)
    fleetLayer.closePath()
    fleetLayer.endFill()
  }

  function redrawTrajectory(movement) {
    if (!movement) return

    const origin = { x: movement.originX, y: movement.originY }
    const dest = { x: movement.destX, y: movement.destY }
    const cp = bezierControlPoint(origin, dest, movement.centerX, movement.centerY)

    orbitLayer.lineStyle(1, 0x00FF88, 0.5)
    orbitLayer.moveTo(origin.x, origin.y)
    orbitLayer.quadraticCurveTo(cp.x, cp.y, dest.x, dest.y)
  }

  return {
    worldContainer,
    ringLayer,
    applyCamera,
    redrawOrbits,
    redrawBodies,
    redrawFleet,
    redrawTrajectory,
    get onFleetPosition() { return _onFleetPosition },
    set onFleetPosition(fn) { _onFleetPosition = fn }
  }
}

function bezierPoint(p0, p1, p2, t) {
  const mt = 1 - t
  return {
    x: mt * mt * p0.x + 2 * mt * t * p1.x + t * t * p2.x,
    y: mt * mt * p0.y + 2 * mt * t * p1.y + t * t * p2.y
  }
}

function bezierControlPoint(origin, dest, centerX, centerY) {
  const mid = { x: (origin.x + dest.x) / 2, y: (origin.y + dest.y) / 2 }
  const dx = mid.x - centerX
  const dy = mid.y - centerY
  const len = Math.sqrt(dx * dx + dy * dy) || 1
  const push = Math.sqrt((origin.x - centerX) ** 2 + (origin.y - centerY) ** 2) * 0.8
  return {
    x: mid.x + (dx / len) * push,
    y: mid.y + (dy / len) * push
  }
}

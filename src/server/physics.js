export function calculatePosition(body, simulatedTime, centerX, centerY) {
  if (body.orbitalPeriod === 0) return { x: centerX, y: centerY }
  const theta = (2 * Math.PI * simulatedTime / (body.orbitalPeriod * 86400) + body.orbitalPhase) % (2 * Math.PI)
  const r = body.semiMajorAxis * (1 - body.eccentricity ** 2) / (1 + body.eccentricity * Math.cos(theta))
  return {
    x: centerX + r * Math.cos(theta),
    y: centerY + r * Math.sin(theta)
  }
}

export function bezierPoint(p0, p1, p2, t) {
  const mt = 1 - t
  return {
    x: mt * mt * p0.x + 2 * mt * t * p1.x + t * t * p2.x,
    y: mt * mt * p0.y + 2 * mt * t * p1.y + t * t * p2.y
  }
}

export function bezierControlPoint(origin, dest, centerX, centerY) {
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

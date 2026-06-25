export function createCamera() {
  const state = { x: 0, y: 0, scale: 1, targetX: 0, targetY: 0, isMoving: false }

  return {
    state,

    fitSystem(worldW, worldH, screenW, screenH) {
      const s = Math.min(screenW / worldW, screenH / worldH) * 0.85
      state.scale = s
      state.x = (screenW - worldW * s) / 2
      state.y = (screenH - worldH * s) / 2
      state.targetX = state.x
      state.targetY = state.y
    },

    centerOn(wx, wy) {
      const screenW = window.innerWidth
      const screenH = window.innerHeight
      state.targetX = -wx * state.scale + screenW / 2
      state.targetY = -wy * state.scale + screenH / 2
      state.isMoving = true
    },

    worldToScreen(wx, wy) {
      return {
        x: wx * state.scale + state.x,
        y: wy * state.scale + state.y
      }
    },

    screenToWorld(sx, sy) {
      return {
        x: (sx - state.x) / state.scale,
        y: (sy - state.y) / state.scale
      }
    },

    applyZoom(step, worldX, worldY) {
      const oldScale = state.scale
      const factor = 1 + 0.1 * step
      const newScale = Math.max(0.1, Math.min(8.0, oldScale * factor))
      state.scale = newScale
      state.x += worldX * (oldScale - newScale)
      state.y += worldY * (oldScale - newScale)
      state.targetX = state.x
      state.targetY = state.y
    },

    applyPan(dx, dy) {
      state.x += dx
      state.y += dy
      state.targetX = state.x
      state.targetY = state.y
    },

    update() {
      if (!state.isMoving) return
      const lerpFactor = 0.15
      const dx = state.targetX - state.x
      const dy = state.targetY - state.y
      state.x += dx * lerpFactor
      state.y += dy * lerpFactor
      if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) {
        state.x = state.targetX
        state.y = state.targetY
        state.isMoving = false
      }
    }
  }
}

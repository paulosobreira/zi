export function createInput(gameEl, camera, onBodyClick) {
  let isPanning = false
  let panStartX = 0
  let panStartY = 0
  let didPan = false

  gameEl.addEventListener('mousedown', (e) => {
    const isRightBtn = e.button === 2
    const isMiddleBtn = e.button === 1
    const isCtrlLeft = e.button === 0 && e.ctrlKey
    if (isRightBtn || isMiddleBtn || isCtrlLeft) {
      isPanning = true
      didPan = false
      panStartX = e.clientX
      panStartY = e.clientY
      e.preventDefault()
    }
  })

  gameEl.addEventListener('mousemove', (e) => {
    if (!isPanning) return
    const dx = e.clientX - panStartX
    const dy = e.clientY - panStartY
    camera.applyPan(dx, dy)
    panStartX = e.clientX
    panStartY = e.clientY
    didPan = true
  })

  gameEl.addEventListener('mouseup', (e) => {
    if (isPanning) {
      isPanning = false
      return
    }
    if (e.button === 0 && !didPan) {
      const rect = gameEl.getBoundingClientRect()
      const sx = e.clientX - rect.left
      const sy = e.clientY - rect.top
      const world = camera.screenToWorld(sx, sy)
      onBodyClick(world.x, world.y, e.clientX, e.clientY)
    }
    didPan = false
  })

  gameEl.addEventListener('wheel', (e) => {
    e.preventDefault()
    const rect = gameEl.getBoundingClientRect()
    const sx = e.clientX - rect.left
    const sy = e.clientY - rect.top
    const world = camera.screenToWorld(sx, sy)
    const step = e.deltaY > 0 ? -1 : 1
    camera.applyZoom(step, world.x, world.y)
  }, { passive: false })

  gameEl.addEventListener('contextmenu', (e) => e.preventDefault())
}

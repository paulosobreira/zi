export function createNameplates(PIXI, app, bodies) {
  const plates = {}

  for (const body of bodies) {
    if (body.type === 'RING_SYSTEM') continue

    const np = new PIXI.Text(body.name, {
      fontFamily: 'monospace',
      fontSize: 10,
      fill: 0xCCCCCC,
      stroke: 0x000000,
      strokeThickness: 2
    })
    np.anchor.set(0.5, 0)
    app.stage.addChild(np)
    plates[body.id] = { text: np, body }
  }

  function update(positions, camera) {
    for (const [id, plate] of Object.entries(plates)) {
      const pos = positions[id]
      if (!pos) continue
      const { body, text } = plate

      let wx = pos.x
      let wy = pos.y

      if (body.type === 'ASTEROID_BELT') {
        const midRadius = (body.beltInnerRadius + body.beltOuterRadius) / 2
        wx = pos.x + midRadius
      }

      const s = camera.worldToScreen(wx, wy)
      const displaySize = body.type === 'ASTEROID_BELT' ? 6 : body.size
      text.x = s.x
      text.y = s.y + displaySize * camera.state.scale + 4
    }
  }

  function destroy() {
    for (const { text } of Object.values(plates)) {
      app.stage.removeChild(text)
      text.destroy()
    }
  }

  return { update, destroy }
}

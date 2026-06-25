export function createContextMenu(el) {
  let justShown = false
  let currentAction = null

  document.addEventListener('click', () => {
    if (justShown) return
    hide()
  })

  function hide() {
    el.style.display = 'none'
    currentAction = null
  }

  function show(screenX, screenY, body, fleet, onAction) {
    currentAction = onAction
    const vw = window.innerWidth
    const vh = window.innerHeight

    const items = buildItems(body, fleet)
    el.innerHTML = `<div class="menu-title">${body.name}</div>` +
      items.map(item =>
        `<div class="menu-item ${item.cls || ''}" data-action="${item.action}">${item.label}</div>`
      ).join('')

    el.style.display = 'block'
    el.style.left = '0'
    el.style.top = '0'

    const w = el.offsetWidth
    const h = el.offsetHeight
    el.style.left = Math.min(screenX, vw - w - 4) + 'px'
    el.style.top = Math.min(screenY, vh - h - 4) + 'px'

    el.querySelectorAll('.menu-item:not(.disabled)').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation()
        const action = item.dataset.action
        const savedAction = currentAction
        hide()
        if (action !== 'cancel' && savedAction) savedAction(action, body)
      })
    })

    justShown = true
    setTimeout(() => { justShown = false }, 0)
  }

  function buildItems(body, fleet) {
    const items = []
    const isHere = fleet && fleet.locationId === body.id
    const isTraveling = fleet && fleet.state === 'TRAVEL'

    if (isTraveling) {
      items.push({ label: 'Frota em viagem...', action: 'noop', cls: 'disabled' })
    } else if (!isHere) {
      items.push({ label: 'Viajar para órbita', action: 'travel' })
    } else {
      if (body.type === 'PLANET' && body.planetType === 'SOLID') {
        items.push({ label: 'Minerar planeta (em breve)', action: 'mine', cls: 'disabled' })
      } else if (body.type === 'PLANET' && body.planetType === 'GAS') {
        items.push({ label: 'Minerar asteroides (em breve)', action: 'mine', cls: 'disabled' })
      } else if (body.type === 'ASTEROID_BELT') {
        items.push({ label: 'Iniciar mineração (em breve)', action: 'mine', cls: 'disabled' })
      }
    }

    items.push({ label: 'Cancelar', action: 'cancel', cls: 'cancel' })
    return items
  }

  return { show, hide }
}

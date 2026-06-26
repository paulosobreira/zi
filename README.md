# Zeus Interestelar

Jogo multiplayer assíncrono de exploração e expansão espacial. Jogadores controlam frotas em um universo persistente que continua evoluindo mesmo quando offline — planetas orbitam, frotas viajam, eventos acontecem.

## Stack

- **Backend**: Node.js + `ws` (WebSocket server, porta 3001)
- **Frontend**: ES modules nativos + PixiJS 7 vendorizado (porta 3000, sem bundler)
- **Persistência**: em memória (POC) — reinício do servidor limpa o estado

## Rodando localmente

Dois processos em paralelo:

```bash
# Backend
node --watch src/server/index.js

# Frontend
node --watch serve.js
```

Abra `http://localhost:3000` no browser.

> PixiJS 7 está vendorizado em `public/js/pixi.mjs`. Não importe de CDN.

## Arquitetura

### Backend (`src/server/`)

O servidor é autoritativo: o cliente só envia intenções, nunca decide resultados.

O tick engine roda a cada 1s real e avança `simulatedTime += 1000` (fator 1000×, tornando órbitas lentas visíveis). A cada tick: recalcula posições orbitais com física elíptica, avança movimentos de frota em suas curvas Bézier e faz broadcast de `STATE_UPDATE` para todos os clientes.

| Arquivo | Responsabilidade |
|---------|-----------------|
| `index.js` | Entry point, WebSocket server |
| `wsHandler.js` | Protocolo de mensagens |
| `tickEngine.js` | Loop de simulação (1s) |
| `sim.js` | Estado em memória (sessions, players, fleets, movements, bodies) |
| `physics.js` | Cálculo de posição orbital elíptica |
| `solarSystemData.js` | Dados do sistema solar (corpos, órbitas) |

### Frontend (`public/`)

| Módulo | Responsabilidade |
|--------|-----------------|
| `main.js` | WebSocket lifecycle, login flow, ticker, orquestra os demais |
| `renderer.js` | Camadas PixiJS: orbitLayer → bodyLayer → ringLayer → fleetLayer |
| `camera.js` | Pan, zoom-to-cursor, centerOn, fitSystem |
| `input.js` | Mouse events, hit-detection, pan drag |
| `contextMenu.js` | Menu de contexto HTML sobreposto ao canvas |
| `particles.js` | Partículas dos cinturões (3 modos por zoom) + anéis de Saturno (2240 partículas) |
| `nameplates.js` | Labels dos planetas em screen space (fora do container da câmera) |

### Protocolo WebSocket

Todas as mensagens são JSON.

- **Cliente → Servidor**: `{ type: "COMMAND", action, payload }`
- **Servidor → Cliente**: `{ type, payload }`

Fluxo de conexão: `HELLO` → `WELCOME` + `SYSTEM_DATA` + `FLEET_DATA` → ticks de `STATE_UPDATE`. O cliente envia `MOVE_FLEET` para mover frotas; o servidor responde com `MOVE_STARTED`.

## Milestones

| # | Título | Status |
|---|--------|--------|
| 1 | Sistema Solar Sandbox | Concluído (POC) |
| 2 | Mineração Planetária | Planejado |
| 3 | Mineração de Asteroides | Planejado |
| 4 | Galáxia Multiplayer | Planejado |
| 5 | Encontros e Combate | Planejado |

Documentação de design em `docs/`.

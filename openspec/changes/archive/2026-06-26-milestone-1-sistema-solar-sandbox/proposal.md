## Why

Zeus Interestelar precisa de uma base jogável antes de qualquer mecânica de progressão. O milestone 1 estabelece a fundação: um Sistema Solar vivo com simulação orbital, navegação de frota e renderização multiplayer em tempo real — tudo necessário para validar o loop central antes de adicionar mineração, economia e combate.

## What Changes

- Criação do servidor WebSocket autoritativo com tick engine (1s real = 1000s simulado)
- Simulação de física orbital elíptica para todos os corpos do Sistema Solar
- Renderização 2D top-down com PixiJS 7 (sem bundler, PixiJS vendorizado)
- Sistema de sessão persistente via `sessionId` em `localStorage`
- Navegação de frota: seleção de destino via menu de contexto + viagem em curva Bézier
- Câmera com zoom-to-cursor, pan e centralização suave na frota
- Partículas progressivas para cinturões de asteroides (3 modos por zoom)
- Anéis de Saturno com 2240 partículas em 14 bandas elípticas
- Nameplates de planetas em screen space (tamanho fixo, independente do zoom)
- Extrapolação local de `simulatedTime` a 60fps para eliminar paradinhas entre STATE_UPDATEs

## Capabilities

### New Capabilities

- `solar-system`: Dados e simulação dos corpos orbitais do Sistema Solar (Sol, 8 planetas, Cinturão Principal, Cinturão de Kuiper, anéis de Saturno)
- `orbital-physics`: Motor de física elíptica — cálculo de posição angular por tempo simulado acelerado (1000×)
- `tick-engine`: Loop de simulação server-side a 1s, broadcasting STATE_UPDATE para todos os clientes conectados
- `fleet-navigation`: Criação de frota na sessão inicial, seleção de destino, viagem via curva Bézier, chegada e retorno à órbita
- `session-management`: Sessão persistida em localStorage; reconexão automática; servidor mantém estado por sessionId
- `websocket-protocol`: Protocolo JSON HELLO/WELCOME/SYSTEM_DATA/FLEET_DATA/STATE_UPDATE/MOVE_FLEET/MOVE_STARTED
- `camera`: Câmera 2D com zoom-to-cursor, pan (botão direito/meio), centerOn com lerp, fitSystem
- `rendering`: Camadas PixiJS (orbitLayer, bodyLayer, ringLayer, fleetLayer); nameplates em screen space; partículas de cinturões com 3 modos LOD; anéis de Saturno
- `context-menu`: Overlay HTML de menu contextual com opções condicionais por tipo de corpo e estado da frota

### Modified Capabilities

## Impact

- Novos arquivos: `src/server/` (index.js, wsHandler.js, tickEngine.js, sim.js, physics.js, solarSystemData.js), `public/` (main.js, renderer.js, camera.js, input.js, contextMenu.js, particles.js, nameplates.js), `serve.js`, `public/js/pixi.mjs` (vendorizado)
- Duas portas: 3000 (HTTP estático) e 3001 (WebSocket)
- Sem banco de dados, sem build step, sem bundler — estado 100% em memória no POC

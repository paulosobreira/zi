## 1. Setup e Infraestrutura

- [x] 1.1 Criar estrutura de diretórios do projeto (`src/server/`, `public/`, `public/js/`)
- [x] 1.2 Baixar e vendorizar PixiJS 7 (`public/js/pixi.mjs`) — sem CDN
- [x] 1.3 Criar `package.json` com dependência `ws` para WebSocket server
- [x] 1.4 Criar `serve.js` para servir arquivos estáticos na porta 3000
- [x] 1.5 Criar `src/server/index.js` como entry point do servidor WebSocket na porta 3001

## 2. Dados do Sistema Solar

- [x] 2.1 Criar `src/server/solarSystemData.js` com todos os corpos (Sol, 8 planetas, 2 cinturões, anéis de Saturno) e parâmetros orbitais completos
- [x] 2.2 Calcular `roomSize` dinamicamente com base no raio externo do Cinturão de Kuiper + 25% de margem
- [x] 2.3 Definir `centerX`, `centerY` como `roomSize / 2` (não usar coordenada `0,0`)

## 3. Estado em Memória e Sessão

- [x] 3.1 Criar `src/server/sim.js` com estruturas `sessions`, `players`, `fleets`, `movements`, `bodies`
- [x] 3.2 Implementar criação de sessão: mapear `sessionId → playerId`, criar frota em planeta inicial
- [x] 3.3 Implementar reutilização de sessão ao reconectar com `sessionId` existente

## 4. Física Orbital

- [x] 4.1 Criar `src/server/physics.js` com `calculatePosition(body, simulatedTime, centerX, centerY)`
- [x] 4.2 Implementar early return para corpos com `orbitalPeriod = 0` (evitar NaN)
- [x] 4.3 Implementar fórmula elíptica completa com offset de foco (`centerX - a×e`)

## 5. Tick Engine

- [x] 5.1 Criar `src/server/tickEngine.js` com `setInterval` de 1000ms
- [x] 5.2 A cada tick: `simulatedTime += 1000`, recalcular posições orbitais, avançar movimentos
- [x] 5.3 Detectar chegada de frotas (`simulatedTime >= arrivalSimulatedTime`) e transicionar para `ORBIT`
- [x] 5.4 Fazer broadcast de `STATE_UPDATE` para todos os clientes conectados após cada tick

## 6. Protocolo WebSocket

- [x] 6.1 Criar `src/server/wsHandler.js` para processar mensagens do cliente
- [x] 6.2 Implementar fluxo `HELLO → WELCOME → SYSTEM_DATA → FLEET_DATA` na conexão
- [x] 6.3 Implementar `SYSTEM_DATA` com todos os parâmetros orbitais (semiMajorAxis, eccentricity, orbitalPeriod, centerX, centerY, innerRadius, outerRadius)
- [x] 6.4 Implementar handler de `MOVE_FLEET`: validar destino, criar Movement com curva Bézier, responder `MOVE_STARTED`
- [x] 6.5 Rejeitar `MOVE_FLEET` para destinos do tipo STAR com `code: INVALID_DESTINATION`
- [x] 6.6 Para cinturões: calcular `destX/destY` projetado no raio médio a partir de `arrivalPosition`

## 7. Cliente — Bootstrap e Sessão

- [x] 7.1 Criar `public/index.html` com overlay de login (`#loginOverlay`), canvas (`#game`), barra de botões (`#btnBar`)
- [x] 7.2 Criar `public/main.js`: lógica de login, geração de `sessionId`, persistência em localStorage
- [x] 7.3 Implementar fluxo de primeira sessão (seletor de planeta) vs reconexão (overlay "Reconectando...")
- [x] 7.4 Esconder overlay apenas ao receber `WELCOME`; exibir canvas
- [x] 7.5 Implementar reconexão automática a cada 2s no `ws.onclose`
- [x] 7.6 Implementar botão Logoff: `removeItem`, `ws.close()`, `location.reload()`

## 8. Cliente — Câmera

- [x] 8.1 Criar `public/camera.js` com estado `{ x, y, scale }`
- [x] 8.2 Implementar zoom-to-cursor com `clamp(scale × factor, 0.1, 8.0)` e preservação do ponto do mundo
- [x] 8.3 Implementar pan com botão direito e botão do meio
- [x] 8.4 Implementar `fitSystem()` com escala automática e 15% de margem
- [x] 8.5 Implementar `centerOn(worldX, worldY)` com lerp 15%/frame via `targetX/targetY`

## 9. Cliente — Renderização (PixiJS)

- [x] 9.1 Criar `public/renderer.js` com inicialização do PixiJS 7 e as 4 camadas (orbitLayer, bodyLayer, ringLayer, fleetLayer)
- [x] 9.2 Renderizar órbitas elípticas com `drawEllipse(centerX - a*e, centerY, a, b)` — offset correto do foco
- [x] 9.3 Renderizar corpos celestes (círculos) com cores e tamanhos da tabela de dados
- [x] 9.4 Renderizar frota como triângulo `(0,-3), (2.6,2), (-2.6,2)` cor `#00FF88`
- [x] 9.5 Renderizar trajetória ativa como curva Bézier `#00FF88`
- [x] 9.6 Usar getter/setter para callbacks expostos (ex: `onFleetPosition`) — não shorthand property

## 10. Cliente — Partículas e Anéis

- [x] 10.1 Criar `public/particles.js` com geração de partículas para cada cinturão (200 Principal, 400 Kuiper)
- [x] 10.2 Implementar modo DOT (`scale < 1.0`): `drawRect` 1px sólido
- [x] 10.3 Implementar modo PIXEL (`1.0 ≤ scale < 5.0`): cluster de grãos com rotação orbital
- [x] 10.4 Implementar modo ARCADE (`scale ≥ 5.0`): polígono irregular com deriva e rotação
- [x] 10.5 Gerar anéis de Saturno: 14 bandas elípticas, 160 partículas cada (2240 total), estáticas
- [x] 10.6 Container de anéis como filho de `ringLayer` (não de Saturno); reposicionar manualmente a cada frame

## 11. Cliente — Nameplates

- [x] 11.1 Criar `public/nameplates.js` com layer filho de `app.stage` (fora do container da câmera)
- [x] 11.2 Converter posição mundo→tela a cada frame: `sx = worldX × scale + cameraX`
- [x] 11.3 Posicionar nameplate abaixo do corpo: `sy = screenY + body.size × scale + 4`
- [x] 11.4 Fonte monospace 10px, cor `#CCCCCC` com stroke preto

## 12. Cliente — Input e Menu de Contexto

- [x] 12.1 Criar `public/input.js` com handlers de mouse: clique, drag (pan), scroll (zoom)
- [x] 12.2 Implementar hit-detection por tipo: PLANET (`size+15`), STAR (`size+5`), ASTEROID_BELT (região anular)
- [x] 12.3 Criar `public/contextMenu.js` com overlay HTML e posicionamento ajustado à viewport
- [x] 12.4 Implementar opções condicionais por tipo de corpo e estado da frota
- [x] 12.5 Adicionar flag `justShown` + `setTimeout(..., 0)` para evitar auto-fechamento por bubbling
- [x] 12.6 Salvar `currentAction` em variável local antes de chamar `hide()` para evitar perda de callback

## 13. Cliente — Animação Contínua (eliminação da paradinha)

- [x] 13.1 Armazenar `lastSimulatedTime` e `lastWallTime` a cada `STATE_UPDATE`
- [x] 13.2 No ticker (60fps): calcular `currentSimulatedTime = lastSimulatedTime + (performance.now() - lastWallTime)`
- [x] 13.3 Recalcular posição da frota a cada frame: órbita local (planeta) ou posição Bézier (viagem)
- [x] 13.4 Ajustar `orbitPeriod = 15000ms` e `fleetSpeed = 6 px/1000 simTime` para animação suave

## 14. Ajustes Visuais e Polimento

- [x] 14.1 Ajustar tamanho do Sol de 40px para 28px
- [x] 14.2 Remover BlurFilter do Sol (impacto de performance)
- [x] 14.3 Renderizar cinturão como linha circular `lineStyle(1.5, color, 0.3)` + partículas (sem filled ring)
- [x] 14.4 Ajustar `lineStyle` do modo arcade para 0.6 e push factor da Bézier para 0.8
- [x] 14.5 Usar `app.view || app.canvas || document.querySelector('#game canvas')` como referência ao canvas
- [x] 14.6 Anexar handler de clique ao `#game` (não ao canvas PixiJS) para coordenadas corretas

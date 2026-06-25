# Arquitetura Técnica

## Objetivo

Definir a arquitetura inicial do Zeus Interestelar com foco em:

* Simplicidade extrema
* Evolução incremental por milestones
* Simulação server-side authoritative
* Persistência leve
* Comunicação em tempo real

---

# Princípios Fundamentais

## Server Authoritative

Todo estado do jogo pertence ao servidor.

O cliente apenas envia intenções.

Exemplo:

* cliente: “mover frota para Marte”
* servidor: valida, calcula e executa

---

## Universo como simulação contínua

O jogo é uma simulação persistente baseada em ticks.

* movimentos continuam offline
* órbitas são atualizadas continuamente
* eventos são determinísticos

---

## Persistência simples (inicial)

### POC (Milestone 1)

Todo o estado é mantido **em memória** no servidor:

- `sim.sessions: { [sessionId]: playerId }` — mapa de sessões para reconexão
- `sim.players: { [playerId]: { id, createdAt } }` — jogadores
- `sim.fleets: { [playerId]: fleetObject }` — frotas (um por jogador)
- `sim.movements: { [playerId]: movementObject }` — movimentos ativos
- `sim.bodies: [...]` — cópia dos dados do sistema solar
- `sim.clients: [...]` — conexões WebSocket ativas

Não há persistência em disco na POC. Ao reiniciar o servidor, todo estado é perdido.

### Evolução futura

A persistência poderá migrar para JSON em disco ou SQLite sem impacto no domínio.

---

# Stack Inicial

## Backend

Node.js (servidor WebSocket)

Responsável por:

* simulação do universo
* tick engine
* validação de comandos
* gerenciamento de sessões (mapa sessions em memória)
* cálculo orbital
* movimentação de frotas

Desenvolvimento:

```bash
node --watch src/server/index.js   # porta 3001
```

O `--watch` monitora todo o grafo de módulos importados e reinicia o processo
automaticamente.

## Frontend (servidor HTTP separado)

Os arquivos estáticos (HTML, JS, PixiJS) são servidos separadamente:

```bash
python3 -m http.server 3000 --directory public   # porta 3000
```

Não há bundler. O cliente carrega módulos ES nativos via imports de caminho absoluto:

```js
import * as PIXI from "/js/pixi.mjs"
import { camera } from "/js/camera.js"
```

**PixiJS é vendored localmente** em `public/js/pixi.mjs` (~1MB, 23.771 linhas, v7.4.3).
Não depende de CDN (rede corporativa bloqueava cdn.jsdelivr.net).

---

## Comunicação

WebSocket (ws)

* baixa latência
* comandos leves
* eventos contínuos

### Gerenciamento de Sessão

O servidor mantém um mapa `sessions: { [sessionId]: playerId }` em memória.
O cliente armazena `sessionId` em `localStorage("zeus_session_id")`.
Na reconexão, envia `HELLO { sessionId, startingBody }`; o servidor reusa o playerId existente.

### Payload do SYSTEM_DATA

O servidor envia todos os parâmetros necessários para renderização:

* `id`, `name`, `type`, `size`, `color` (identificação básica)
* `semiMajorAxis`, `eccentricity` (parâmetros orbitais — presente em PLANET, STAR)
* `beltInnerRadius`, `beltOuterRadius` (presente em ASTEROID_BELT)
* `parentId` (presente em RING_SYSTEM)
* `centerX`, `centerY` (referencial espacial do sistema)

O cliente nunca hardcoda dados do sistema solar — tudo vem do servidor.

---

## Frontend (arquitetura de módulos)

JavaScript + PixiJS 7 (vendored)

### Estrutura de módulos

| Módulo | Responsabilidade |
|--------|-----------------|
| `main.js` | Orquestrador: WebSocket, login, ticker, conexão entre módulos |
| `renderer.js` | Camadas PIXI, desenho de corpos/órbitas/frotas/trajetórias |
| `camera.js` | Pan, zoom (com zoom to cursor), centerOn, fitSystem |
| `input.js` | Eventos de mouse: pan, clique, detecção de hit em corpos |
| `contextMenu.js` | Menu de contexto HTML overlay |
| `particles.js` | Partículas de cinturão (3 modos) e anéis de Saturno (14 bandas) |
| `nameplates.js` | Rótulos de texto com posição mundo→tela |

### Camadas de renderização (dentro de worldContainer)

1. `orbitLayer` — órbitas elípticas, círculo do cinturão, trajetórias
2. `bodyLayer` — corpos celestes (círculos)
3. `ringLayer` — partículas de cinturão e anéis (nunca limpa em redrawAll)
4. `fleetLayer` — triângulos da frota

`nameplateLayer` fica em `app.stage` (fora do container da câmera), posicionado via conversão mundo→tela a cada frame.

### Recursos

* renderização 2D vetorial (PixiJS Graphics)
* zoom (0.1x a 8x) e pan (botão direito, meio ou Ctrl+clique)
* visão top-down do sistema
* ticker do PixiJS (60fps) para animação suave (lerp 15%/frame)
* login overlay HTML sobre o canvas
* sessão via localStorage + reconexão automática

---

# Estado do Jogo

O servidor mantém tudo em memória:

gameState

* players
* fleets
* systems
* orbitalBodies
* movements

---

# Conceito Central: OrbitalBody

Todo corpo celeste do universo é representado como OrbitalBody.

Isso inclui:

* estrelas
* planetas
* luas
* cinturões de asteroides
* regiões orbitais futuras

---

## Benefícios

* unificação do sistema orbital
* expansão fácil do universo
* lógica de simulação única
* menos duplicação de código

---

# Tick Engine

Intervalo inicial:

1 segundo

A cada tick, o servidor executa a seguinte sequência em ordem:

  1. simulatedTime += 1000
     O tempo simulado do universo avança. Todos os cálculos (órbitas, viagens)
     utilizam simulatedTime como referência, não o tempo real.

  2. recalcular órbitas
     Para cada OrbitalBody do sistema, calcular nova posição (x, y) no plano
     usando a fórmula elíptica com o simulatedTime atual.

  3. processar movimentos
     Para cada Movement ativo:
       - calcular progresso da viagem:
         progresso = (simulatedTime - departureSimulatedTime) /
                     (arrivalSimulatedTime - departureSimulatedTime)
       - interpolar posição da frota entre origem e destino
       - se simulatedTime >= arrivalSimulatedTime:
           Fleet.state = ORBIT
           Fleet.locationId = destinationId
           remover Movement
           disparar evento FLEET_ARRIVED

  4. broadcast STATE_UPDATE por sistema solar
     Agrupar clientes por systemId (sistema onde a frota do jogador está).
     Para cada sistema, montar um STATE_UPDATE contendo apenas os
     orbitalBodies, fleets e movements daquele sistema.
     Enviar para cada cliente apenas o STATE_UPDATE do seu sistema atual.

   5. (futuro) autosave por sistema solar (a cada 30 ticks)
      Na POC não há persistência em disco. Tudo é em memória.

Tick = 1 segundo real (wall clock). simulatedTime é independente e pode ser
acelerado sem afetar o intervalo do tick.

Isto significa que 1 tick real (1s) equivale a ~16,7 minutos simulados
(fator 1000x). O fator poderá ser ajustado por milestone.

---

# Persistência (POC)

Na POC não há persistência em disco. Todo estado é mantido em memória e perdido ao reiniciar o servidor.

## Sessão (reconexão)

A única persistência é o `sessionId` no `localStorage` do cliente, que permite reconexão enquanto o servidor estiver rodando.

## Futuro

Eventos que dispararão save:

* criação de jogador
* criação de frota
* início de movimento
* chegada de frota

Além disso:

autosave a cada 30 segundos

---

# Comunicação

Cliente nunca altera estado diretamente.

Apenas envia comandos via WebSocket (`ws://hostname:3001`):

- `HELLO` — inicia conexão com sessionId e startingBody
- `MOVE_FLEET` — solicita movimentação da frota
- `PONG` — resposta ao heartbeat do servidor

O servidor transmite `STATE_UPDATE` a cada tick (1s) para todos os clientes conectados,
contendo posições de todos os corpos e frotas.

---

# Fora de escopo

* microserviços
* bancos externos complexos
* filas distribuídas
* infraestrutura cloud avançada
* autenticação complexa (inicialmente)

---

# Filosofia

O foco do projeto é gameplay.

Infraestrutura deve ser invisível e mínima.

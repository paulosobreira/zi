# Representação Espacial

## Visão Geral

O Sistema Solar é a área jogável do Milestone 1.

O jogador observa o sistema em uma visão superior (top-down).

Não existe:

* perspectiva
* rotação de câmera
* inclinação do plano orbital

Todo o sistema é visualizado perpendicularmente ao plano orbital.

---

# Escala

Escala inicial alvo:

1 pixel = 1.000.000 km

Esta escala é utilizada para:

* posicionamento orbital
* cálculo de distâncias
* visualização do sistema

A escala poderá ser ajustada futuramente após validação de gameplay.

O objetivo é manter uma relação consistente entre:

* distância visual
* distância simulada
* tempo de viagem

---

# Área da Simulação

O tamanho da sala deve ser calculado dinamicamente.

A sala deve ser grande o suficiente para conter:

* Sol
* todos os planetas
* cinturão principal
* cinturão de Kuiper

com margem adicional para movimentação da câmera.

A área simulada não possui relação com a resolução da tela do jogador.

A viewport representa apenas uma janela sobre o universo.

---

## Cálculo do Tamanho da Sala

```
distância máxima = semiMajorAxis × (1 + eccentricity) do corpo mais distante
margem          = 0.25 (25%)
roomSize        = Math.ceil((distância máxima × (1 + margem)) × 2)
```

Exemplo:

```
Netuno afélio = 4495 × 1.01           ≈ 4540 px
Kuiper belt   ≈ 7000 px (corpo mais distante)
roomSize      = ceil((7000 × 1.25) × 2) = 17500 px
→ arredondar para 18000 × 18000
```

centro da sala: (roomSize / 2, roomSize / 2)

---

# Centro do Sistema

O Sol deve permanecer no centro geométrico da sala.

O Sol não deve utilizar a coordenada (0,0).

Exemplo:

Sala:

16000 x 16000 pixels

Centro:

(8000,8000)

Posição do Sol:

(8000,8000)

Todas as órbitas devem ser calculadas a partir desta posição.

---

# Sistema Solar Inicial

O Milestone 1 deve conter:

* Sol
* Mercúrio
* Vênus
* Terra
* Marte
* Cinturão Principal
* Júpiter
* Saturno
* Urano
* Netuno
* Cinturão de Kuiper

A Nuvem de Oort e a borda do sistema solar não serão consideradas.

---

# Tabela de Dados do Sistema Solar

Escala: 1 pixel = 1.000.000 km

| Corpo | semiMajorAxis (px) | Excentricidade | Período (dias) | size (px) | Cor | Tipo |
|---|---|---|---|---|---|---|
| Sol | centro | 0 | — | 28 | #FFD700 | STAR |
| Mercúrio | 57,9 | 0,205 | 88 | 5 | #B5B5B5 | SOLID |
| Vênus | 108,2 | 0,007 | 225 | 8 | #E6B87D | SOLID |
| Terra | 149,6 | 0,017 | 365 | 8 | #4B7BE5 | SOLID |
| Marte | 227,9 | 0,093 | 687 | 6 | #E27B58 | SOLID |
| Júpiter | 778,5 | 0,049 | 4.333 | 12 | #D4A574 | GAS |
| Saturno | 1.434 | 0,057 | 10.759 | 10 | #E8D5A3 | GAS |
| Urano | 2.871 | 0,046 | 30.687 | 8 | #73B1B7 | GAS |
| Netuno | 4.495 | 0,010 | 60.190 | 7 | #3E54E8 | GAS |

Cinturão Principal: raio interno ~300px, raio externo ~500px (type: ASTEROID_BELT)
Cinturão de Kuiper: raio interno ~4.500px, raio externo ~7.000px (type: ASTEROID_BELT)

Os períodos reais serão acelerados no tick engine (fator ~1000x) para tornar o movimento perceptível visualmente.

---

# Classificação de Planetas

| Tipo | Descrição | Mineração futura |
|------|-----------|------------------|
| SOLID | Planeta rochoso com superfície sólida (Mercúrio, Vênus, Terra, Marte) | Mineração terrestre (superfície) |
| GAS | Planeta gasoso sem superfície sólida (Júpiter, Saturno, Urano, Netuno) | Pode possuir anéis (RING_SYSTEM) que permitem mineração de asteroides |

Apenas planetas GAS podem ter anéis. A presença ou ausência de anéis é definida por OrbitalBody do tipo RING_SYSTEM vinculado via `parentId`.

---

# Órbitas

Todas as órbitas devem ser elípticas.

Cada OrbitalBody possui:

* semi-eixo maior
* excentricidade
* período orbital
* fase orbital

As órbitas devem ser desenhadas permanentemente.

Os corpos orbitais devem se mover continuamente durante a simulação.

A posição visual deve corresponder à posição calculada pelo servidor.

---

# Simulação Orbital

O sistema nunca permanece estático.

Mesmo sem interação do jogador:

* planetas continuam orbitando
* posições continuam sendo atualizadas
* a visualização permanece viva

O movimento orbital pode ser acelerado em relação ao tempo real para melhorar a percepção visual.

## Aceleração Temporal

A simulação utiliza um tempo interno (simulatedTime) que avança mais rápido que o tempo real:

```
a cada tick de 1s real:
  simulatedTime += 1000
```

O fator de aceleração é 1000x (1s real = ~16,7min simulado). Isto permite que órbitas lentas (Netuno: 60.190 dias) sejam perceptíveis.

O cálculo de posição orbital usa simulatedTime no lugar do tick:

```
θ(t) = (2π × simulatedTime / (orbitalPeriodDias × 86400) + orbitalPhase) mod 2π
r(θ) = semiMajorAxis × (1 - eccentricity²) / (1 + eccentricity × cos(θ))
```

Onde orbitalPeriodDias é o período da tabela em dias terrestres. 86400 é o número de segundos em um dia terrestre (24h × 60min × 60s). **Importante:** simulatedTime está em milissegundos, mas é tratado como segundos na fórmula — o denominador efetivo é `(orbitalPeriodDias × 86400)` segundos. Como cada tick adiciona 1000ms, o resultado é o fator de aceleração 1000×. O fator de aceleração poderá ser ajustado por milestone.

A velocidade das frotas também opera neste mesmo domínio (simulatedTime), garantindo que órbitas e viagens compartilhem a mesma escala temporal.

---

# Frota Inicial

Ao iniciar uma nova sessão:

* uma frota é criada
* a frota inicia orbitando um OrbitalBody aleatório do tipo PLANET

Estado inicial:

ORBIT

---

# Órbita da Frota

Quando em órbita de um **planeta**:

* a frota acompanha a posição do planeta
* a frota realiza uma pequena órbita visual ao redor do planeta

Fórmula da órbita local (calculada pelo cliente a cada frame, servidor apenas fornece parâmetros):

```
angle = fleet.orbitPhase + (simulatedTime / fleet.orbitPeriod) × 2π

fx = planetPos.x + cos(angle) × orbitRadius
fy = planetPos.y + sin(angle) × orbitRadius

orbitRadius = body.size + 5
orbitPeriod = 15000 ms (sempre, independente do período orbital do planeta)
```

A órbita da frota não utiliza física real. O objetivo é apenas demonstrar visualmente que ela está estacionada naquele corpo orbital.

O cliente mantém uma réplica local do `simulatedTime` extrapolada a cada frame (`currentSimulatedTime = lastSimulatedTime + (performance.now() - lastWallTime)`), permitindo calcular a posição orbital exata da frota 60 vezes por segundo — animação contínua e sem paradinhas entre STATE_UPDATEs.

Quando em órbita de um **cinturão de asteroides**:

* a frota usa coordenadas fixas armazenadas (`orbitX`/`orbitY`) projetadas no raio médio do cinturão
* não utiliza fórmula orbital; posição é estática no referencial do sistema

---

# Navegação

O jogador seleciona um destino clicando diretamente sobre um OrbitalBody ou sobre a região de um cinturão.

## Detecção de Clique

A detecção usa coordenadas do mundo (convertidas da tela via `camera.screenToWorld()`):

**STAR**: acerto se distância ≤ `body.size + 5`
**PLANET**: acerto se distância ≤ `body.size + 15`
**ASTEROID_BELT**: acerto se `beltInnerRadius ≤ distância do centro ≤ beltOuterRadius`; seleciona o anel mais próximo do raio médio
**RING_SYSTEM**: não clicável (ignorado)

O raio de acerto maior para planetas compensa a escala visual pequena e facilita a interação.

Exemplos:

* Marte
* Júpiter
* Saturno
* Cinturão Principal (clicar na região anular)
* Cinturão de Kuiper (clicar na região anular)

---

# Menu de Contexto

Ao clicar em um OrbitalBody deve ser exibido um menu contextual.

Implementação: HTML overlay (`<div id="contextMenu">`) sobreposto ao canvas PixiJS.

Posicionamento: nas coordenadas do clique (mouseX, mouseY), ajustado automaticamente para não ultrapassar a borda da viewport.

## Opções por tipo de corpo

As opções variam conforme o tipo do corpo clicado e o estado da frota:

| Corpo | Frota não está na órbita | Frota já está na órbita |
|-------|--------------------------|--------------------------|
| PLANET (SOLID) | Viajar para órbita | Minerar planeta (futuro) |
| PLANET (GAS, sem anéis) | Viajar para órbita | (sem ação extra) |
| PLANET (GAS, com anéis) | Viajar para órbita | Minerar asteroides (futuro) |
| ASTEROID_BELT | Viajar para órbita | Iniciar mineração (futuro) |
| RING_SYSTEM | (sem menu — visual apenas) | (sem menu) |

Opção "Cancelar" presente em todos os menus.

Opções de mineração são placeholders: aparecem no menu mas não executam ação.

---

# Transferência Orbital

Ao confirmar a viagem:

o servidor cria um Movement.

Durante a viagem:

* a frota permanece visível
* a trajetória é desenhada como uma curva (arco bezier)
* a animação demonstra claramente a mudança orbital

Não é necessário utilizar mecânica orbital real.

Uma curva de transferência simplificada (Hohmann-like) é suficiente.

O jogador deve conseguir acompanhar visualmente toda a movimentação.

---

## Mecânica de Viagem

```
Fleet speed: 6 pixels / 1000 simulatedTime (mesmo domínio temporal das órbitas)

Cálculo de travelSimulatedTime:
  distance            = distância linear entre origem e destino (em pixels)
  travelSimulatedTime = distance / fleetSpeed × 1000

  departureSimulatedTime = simulatedTime (no momento da partida)
  arrivalSimulatedTime   = departureSimulatedTime + travelSimulatedTime

Trajetória (curva de transferência):
  A trajetória é desenhada como uma quadratic bezier curve simulando
  uma manobra de transferência de Hohmann:

  Ponto de controle (CP) da bezier:
    mid  = (origem + destino) / 2
    dir  = normalize(mid - centroDoSistema)
    push = distance(origem, centroDoSistema) × 0.8
    CP   = mid + dir × push

  A frota segue a MESMA curva bezier (não interpolação linear):
    posFrota = bezier(origem, CP, destino, progresso)
    bezier(P0, P1, P2, t) = (1-t)² × P0 + 2(1-t)t × P1 + t² × P2

  progresso = (simulatedTime - departureSimulatedTime) /
              (arrivalSimulatedTime - departureSimulatedTime)

Ao chegar (simulatedTime >= arrivalSimulatedTime):
  - Fleet.state = ORBIT
  - Fleet.locationId = destinationId
  - Servidor emite evento FLEET_ARRIVED para o cliente
```

---

---

# Câmera

A câmera deve suportar:

* zoom com scroll do mouse
* pan com botão direito
* pan com botão do meio

A câmera pode navegar livremente pela sala.

---

## Comportamento do Zoom

```
minScale      = 0.1   (vê o sistema inteiro)
maxScale      = 8.0   (vê detalhes de um planeta)
defaultScale  = calculado para caber o sistema na viewport
incremento    = 10% por passo do scroll
```

O zoom deve ser centrado na posição atual do mouse (zoom to cursor):

```
factor = 1 + 0.1 × step   // step = +1 (scroll up) ou -1 (scroll down)
newScale = clamp(oldScale × factor, minScale, maxScale)

// Preserva ponto do mundo sob o cursor:
state.x += worldX × (oldScale - newScale)
state.y += worldY × (oldScale - newScale)
```

---

## Comportamento do Pan

```
botão direito  → arrasta a viewport
botão do meio  → arrasta a viewport (alternativo)
scroll + Ctrl  → mesmo que botão do meio
sem limites    → a câmera pode navegar além da sala
```

---

# Centralizar Frota

A interface deve possuir um botão permanente:

Centralizar Frota

Ao clicar:

* a câmera centraliza na posição atual da frota
* o nível de zoom é preservado
* animação suave de transição via lerp (`camera.state.x += (targetX - state.x) × 0.15`, mesma fórmula da frota)

---

# Login

O jogo utiliza um overlay HTML (`<div id="loginOverlay">`) em tela cheia sobre o canvas PixiJS para o fluxo de entrada.

## Primeira sessão

1. Overlay exibe `<select>` com os 8 planetas (Mercúrio a Netuno) como opções de corpo inicial
2. Botão "Iniciar Jornada" habilitado
3. Ao clicar: gera `sessionId = "session-" + Date.now() + "-" + random(6)` e armazena em `localStorage("zeus_session_id")`
4. Conecta WebSocket e envia `HELLO { sessionId, startingBody }`

## Sessão existente (reconexão)

1. Ao detectar `sessionId` no localStorage, o overlay é exibido com:
   - Título: "Reconectando..."
   - Select escondido
   - Mensagem: "Retomando sessão anterior..."
   - Botão "Iniciar Jornada" desabilitado
2. Conecta WebSocket e envia `HELLO { sessionId, startingBody: null }`

## Finalização do login

O overlay permanece visível até a chegada do evento `WELCOME` do servidor.
Apenas ao receber `WELCOME` a função `hideLogin()` é chamada (esconde overlay, exibe canvas).

## Reconexão automática

Ao fechar o WebSocket, tenta reconectar a cada 2 segundos:
```
setTimeout(() => connect(sessionId, startingBody), 2000)
```

# Logoff

Botão permanente na barra de botões (`#btnBar`) ao lado do botão Centralizar Frota:

- Cor: vermelha (`#FF4444`)
- Rótulo: "Logoff"

Ação ao clicar:

1. `localStorage.removeItem("zeus_session_id")`
2. `ws.close()`
3. `location.reload()`

O servidor mantém a sessão em memória (órfã), mas o cliente perde a referência.
Um novo início criará uma nova sessão e uma nova frota.

# Renderização

## Camadas (ordem dentro do container da câmera)

1. `orbitLayer` — órbitas elípticas, círculo dos cinturões, trajetórias de movimento
2. `bodyLayer` — corpos celestes (círculos)
3. `ringLayer` — partículas de cinturões e anéis (nunca limpa em redrawAll)
4. `fleetLayer` — triângulos da frota

## Representação Mínima

* Sol → círculo preenchido
* Planetas → círculos preenchidos
* Frota → triângulo
* Órbitas → linhas elípticas (`lineStyle(1.5, #2A2A4A, 0.5)`)
* Cinturões → linha circular no raio médio + sistema de partículas
* Anéis de Saturno → sistema de partículas em container independente

## Cinturões de Asteroides (partículas)

Partículas geradas no cliente, **sem representação individual no modelo de dados**.

### Geração

Para cada partícula, sortear `angulo ∈ [0, 2π]` e `raio ∈ [beltInnerRadius, beltOuterRadius]`.
Posição inicial: `x = centerX + cos(angulo) × raio`, `y = centerY + sin(angulo) × raio`.
Cada partícula armazenada como `{ graphic, angulo, raio, alpha, grainDots, asteroidVerts, lastMode, asteroidRotation, rotSpeed, vx, vy }`.

### Contagem

- Cinturão Principal: **200 partículas**, cor #8B7355
- Cinturão de Kuiper: **400 partículas**, cor #8B7355

### Três Modos de Renderização (progressivos por zoom)

O modo é selecionado a cada frame com base em `camera.state.scale`:

**Modo DOT** (`scale < 1.0`):
- Partícula desenhada como `drawRect` sólido de 1px (alpha 1)
- Tamanho: `max(1, 1.5 / scale)`
- Sem animação de rotação orbital

**Modo PIXEL** (`1.0 ≤ scale < 5.0`):
- Múltiplos pontos (grãos) por partícula: `2 + floor((scale - 1.0) × 3)` grãos
- Tamanho e alpha variáveis por grão
- Rotação orbital ativa: `angulo += angularSpeed`

**Modo ARCADE** (`scale ≥ 5.0`):
- Polígono irregular de asteroide (6–9 vértices gerados aleatoriamente)
- Renderizado como outline apenas: `lineStyle(0.6, #8B7355, alpha)`
- Deriva lenta: `vx`, `vy` entre 0.01 e 0.05 px/frame
- Rotação própria: `asteroidRotation += rotSpeed` (≈ 0.00005 rad/frame)

### Animação Orbital

Realizada a cada frame do ticker PixiJS (60fps).

Componente radial da animação (gira partículas em torno do centro do sistema):
- `angularSpeed = 0.00005 rad/frame`
- Direção: anti-horário
- Ativa apenas quando `scale ≥ DOT_THRESHOLD` (1.0)
- No modo arcade, a deriva substitui parcialmente a órbita radial; partículas que saem dos limites do cinturão são reposicionadas

### Visibilidade

Partículas **sempre visíveis** em qualquer zoom (sem LOD).

### Cinturão como Órbita

Além das partículas, o cinturão possui uma linha circular representando sua órbita:
`lineStyle(1.5, color, 0.3)` + `drawCircle(centerX, centerY, midRadius)`

## Anéis de Saturno

Região especial associada ao planeta Saturno (planeta GAS com anéis). Apenas representação visual (estética). Não é um corpo independente — acompanha Saturno visualmente.

### Geração

14 bandas elípticas concêntricas, geradas programaticamente no cliente:

- Raio inicial: `1.14 × saturn.size` (≈ 11.4 px do centro)
- Raio final: `2.23 × saturn.size` (≈ 22.3 px do centro)
- Espessura de cada banda: `0.05 × saturn.size`
- Excentricidade variável: `0.15 + |t - 0.5| × 0.70` (centro mais circular, bordas mais elípticas; max ~0.5)
- 160 partículas por banda = **2240 partículas no total**

### Partículas

- `drawPixelRect(pixelSize)` com tamanho `0.3 + random() × 0.3`
- Cor: `#C8B896`
- Posição calculada como elipse:
  - `g.x = cos(angle) × radius`
  - `g.y = sin(angle) × radius × sqrt(1 - ecc²)`
- **Estáticas**: sem animação após criação
- **Container independente**: as partículas NÃO são filhas do container de Saturno; o container de anéis é reposicionado manualmente a cada frame para `(saturn.worldX, saturn.worldY)`

### Visibilidade

Sempre visíveis em qualquer zoom (sem LOD).

---

# Identidade Visual

## Nameplates

Cada planeta e cinturão deve exibir um rótulo com seu nome (nameplate) sobreposto ao sistema solar.

Requisitos:

* tamanho fixo na tela — não deve ser afetado pelo zoom da câmera
* posicionado abaixo do círculo do planeta
* cor #CCCCCC com stroke preto para legibilidade
* fundo: sem fundo (apenas texto)
* camada separada do restante do sistema (não deve ser filha do container da câmera)

Implementação:

```
Layer: Container filho de app.stage (fora do container da câmera)
Fonte: monospace, 10px

Posição (convertida mundo → tela a cada frame via `camera.worldToScreen()`):
  - sx = worldX × camera.state.scale + camera.state.x
  - sy = worldY × camera.state.scale + camera.state.y
  - np.x = sx
  - np.y = sy + body.size × camera.state.scale + 4

Para cinturões: o rótulo é posicionado na borda direita do círculo médio do cinturão
(pos.x + midRadius, pos.y), usando size fixo 6.
```

---

# Animação Suave

## Problema

O servidor envia STATE_UPDATE a cada 1s (tick). Sem interpolação, a frota e os
planetas saltam de posição a cada segundo.

## Solução

Usar o ticker do PixiJS (60fps) para interpolar a posição visual da frota:

```
A cada frame (app.ticker.add):
  vpos.x += (targetX - vpos.x) × 0.15
  vpos.y += (targetY - vpos.y) × 0.15

targetX/targetY é atualizado a cada STATE_UPDATE que chega (1/s)

O redraw() completo (órbitas, corpos, trajetória, frota) roda no ticker,
não mais no evento STATE_UPDATE
```

Isso produz movimento contínuo e suave mesmo com atualizações esparsas do servidor.

## Animação Contínua (Eliminação da Paradinha)

O problema: mesmo com lerp a 15%/frame, a frota em órbita ou viagem apresentava pequenas paradinhas porque o alvo (`targetX/targetY`) só era atualizado a cada STATE_UPDATE (1/s). Entre atualizações, o alvo ficava congelado na última posição conhecida, e ao chegar o próximo tick o alvo saltava para uma nova posição.

Solução: **cálculo de posição exata no cliente a cada frame** usando `simulatedTime` extrapolado localmente:

```
// No ticker (60fps):
simTime = lastSimulatedTime + (performance.now() - lastWallTime)

// Se ORBIT em planeta:
angle = fleet.orbitPhase + (simTime / fleet.orbitPeriod) × 2π
fx = planetPos.x + cos(angle) × fleet.orbitRadius
fy = planetPos.y + sin(angle) × fleet.orbitRadius

// Se TRAVEL:
progress = clamp((simTime - departureTime) / (arrivalTime - departureTime), 0, 1)
pos = bezierPoint(origin, controlPoint, destination, progress)
```

Isso elimina a paradinha porque:
1. O alvo da frota é recalculado a **cada frame** (60fps), não mais a cada 1s
2. O `simTime` local avança na mesma velocidade do servidor (1000 ms/s), mantendo sincronia
3. O lerp residual (15%/frame) absorve micro-variações entre o cálculo local e o STATE_UPDATE seguinte

## Paleta de Cores

| Elemento | Cor | Descrição |
|---|---|---|
| Fundo | #0A0A1A | Azul marinho escuro (espaço) |
| Órbitas | #2A2A4A | Elipses das trajetórias |
| Trajetória da frota | #00FF88 | Linha de viagem ativa |
| Sol | #FFD700 | Dourado |
| Mercúrio | #B5B5B5 | Cinza |
| Vênus | #E6B87D | Amarelo pastel |
| Terra | #4B7BE5 | Azul |
| Marte | #E27B58 | Vermelho alaranjado |
| Júpiter | #D4A574 | Ocre |
| Saturno | #E8D5A3 | Bege |
| Urano | #73B1B7 | Ciano |
| Netuno | #3E54E8 | Azul escuro |
| Cinturões | #8B7355 | Marrom claro |
| Frota (jogador) | #00FF88 | Triângulo verde neon |

## Tamanhos dos Corpos

| Corpo | Raio visual (px) |
|---|---|
| Sol | 28 |
| Mercúrio | 5 |
| Vênus | 8 |
| Terra | 8 |
| Marte | 6 |
| Júpiter | 12 |
| Saturno | 10 |
| Urano | 8 |
| Netuno | 7 |

## Frota

Triângulo apontando para cima com vértices `(0, -3), (2.6, 2), (-2.6, 2)` (≈6×5.2px), cor `#00FF88`.

A posição é calculada a cada frame do ticker (60fps) via simulatedTime extrapolado localmente (ver "Animação Contínua"). O valor de STATE_UPDATE (1/s) serve apenas para re-sincronizar simulatedTime, não para atualizar target.

---

## Cinturões de Asteroides

Ambos os cinturões (Principal e Kuiper) compartilham o mesmo comportamento. A diferença é apenas a órbita em que estão posicionados no sistema solar/sala.

### Modelo

- type: ASTEROID_BELT
- orbitalPeriod = 0 (posição fixa no centro do sistema)
- semiMajorAxis = 0 (não orbita nada)
- As partículas visuais são geradas no cliente e **não possuem representação individual no modelo de dados**

### Cinturão Principal

- Localização: entre Marte e Júpiter
- Raio interno: ~300px, raio externo: ~500px
- **200 partículas**, cor #8B7355
- Ver seção [Renderização → Cinturões de Asteroides](#cinturões-de-asteroides-partículas) para detalhes de renderização e animação

### Cinturão de Kuiper

- Localização: borda do sistema solar
- Raio interno: ~4.500px, raio externo: ~7.000px
- **400 partículas**, cor #8B7355
- Mesmo comportamento do Principal

### Interação

#### Detecção de Clique

O clique em um cinturão NÃO utiliza partículas individuais como alvo. O hit-test é contra a região anular do cinturão:

1. Jogador clica em qualquer ponto da tela
2. Cliente converte a coordenada do clique para o espaço do mundo (worldX, worldY)
3. Calcula a distância do centro do sistema: `dist = √((worldX - centerX)² + (worldY - centerY)²)`
4. Para cada cinturão no sistema, verifica: `beltInnerRadius <= dist <= beltOuterRadius`
5. Se houver match: exibe menu de contexto com o bodyId do cinturão correspondente
6. Se o clique estiver na região de dois cinturões (não ocorre no sistema atual), o mais interno vence

Não há colisão entre frota e asteroides.

#### Cálculo do Ponto de Chegada

Quando a frota viaja para um cinturão, o destino é calculado pelo servidor:

1. Cliente envia MOVE_FLEET com:
   - `destination.bodyId` = id do cinturão
   - `arrivalPosition.x/y` = coordenada do clique no mundo

2. Servidor recebe e calcula:
   - `angle = atan2(arrivalY - centerY, arrivalX - centerX)`
   - `midRadius = (beltInnerRadius + beltOuterRadius) / 2`
   - `destX = centerX + cos(angle) × midRadius`
   - `destY = centerY + sin(angle) × midRadius`

3. Movement armazena `arrivalX`, `arrivalY` com as coordenadas calculadas
4. A frota viaja para (destX, destY) usando a mesma mecânica de viagem (curva bezier)

#### Órbita da Frota no Cinturão

Após chegar, a frota usa coordenadas fixas armazenadas no servidor (`orbitX`/`orbitY`), projetadas no raio médio do cinturão no ângulo do ponto de chegada. A posição da frota no cinturão é estática no referencial do sistema (não utiliza fórmula orbital):

```
Fleet.state = ORBIT
Fleet.locationId = "main-belt" (ou "kuiper-belt")

// Calculado na chegada e armazenado:
orbitX = centerX + cos(anguloChegada) × midRadius
orbitY = centerY + sin(anguloChegada) × midRadius

// Posição da frota (constante):
posFrota.x = orbitX
posFrota.y = orbitY
```

Onde:
- `midRadius` = `(beltInnerRadius + beltOuterRadius) / 2` (calculado na chegada)
- `anguloChegada` = `atan2(arrivalY - centerY, arrivalX - centerX)`

Quando já estiver na órbita do cinturão: menu com opção "Iniciar mineração" (placeholder — sem ação).

## Anéis de Saturno

### Modelo

- type: RING_SYSTEM
- Vinculado a Saturno via parentId = "saturn"
- Apenas representação visual (estética)
- Não é um corpo independente — acompanha Saturno

### Renderização

Ver seção [Renderização → Anéis de Saturno](#anéis-de-saturno-1) para detalhes completos.
As partículas são geradas em container independente (não filho de Saturno), reposicionado manualmente.
Sempre visíveis (sem LOD por zoom).

### Mineração futura

- Quando a frota estiver na órbita de um planeta GAS com anéis (ex: Saturno), o menu de contexto exibe "Minerar asteroides"
- A mecânica será equivalente à mineração de asteroides dos cinturões

# Critérios de Aceitação Visuais

Ao iniciar o jogo deve ser possível:

* visualizar todas as órbitas
* visualizar planetas se movendo
* visualizar a frota orbitando
* visualizar partículas animadas dos cinturões de asteroides
* visualizar anéis de Saturno (partículas visíveis em qualquer zoom)
* clicar na região do cinturão para selecionar como destino
* navegar pelo sistema usando zoom e pan
* selecionar um destino
* iniciar uma viagem
* acompanhar a transferência orbital
* centralizar a câmera na frota
* menu de contexto com opções condicionais ao tipo de corpo e estado da frota
* opção de mineração no menu (sem ação — preparação futura)

O sistema deve transmitir a sensação de estar observando um Sistema Solar vivo em escala reduzida.

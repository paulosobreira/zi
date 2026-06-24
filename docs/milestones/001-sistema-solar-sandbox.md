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
| Sol | centro | 0 | — | 40 | #FFD700 | STAR |
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

Onde orbitalPeriodDias é o período da tabela em dias terrestres. 86400 é o número de segundos em um dia terrestre (24h × 60min × 60s) — necessário para converter dias para segundos simulados. O fator de aceleração poderá ser ajustado por milestone.

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

Quando em órbita:

* a frota acompanha a posição do planeta
* a frota realiza uma pequena órbita visual ao redor do planeta

A órbita da frota não precisa utilizar física real.

O objetivo é apenas demonstrar visualmente que ela está estacionada naquele corpo orbital.

---

# Navegação

O jogador seleciona um destino clicando diretamente sobre um OrbitalBody ou sobre as partículas visuais de um cinturão.

Exemplos:

* Marte
* Júpiter
* Saturno
* Cinturão Principal (clicar em qualquer partícula)
* Cinturão de Kuiper (clicar em qualquer partícula)

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
Fleet speed: 20 pixels / 1000 simulatedTime (mesmo domínio temporal das órbitas)

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
    push = distance(origem, centroDoSistema) × 0.4
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

O zoom deve ser centrado na posição atual do mouse (zoom to cursor).

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
* animação suave de transição (ex: 300ms ease-out)

---

# Renderização

Representação mínima:

* Sol → círculo
* Planetas → círculos
* Frota → triângulo
* Órbitas → linhas elípticas
* Cinturões → círculos individuais (partículas geradas no cliente, sem representação no modelo de dados)
  - Geração: para cada partícula, sortear `angulo ∈ [0, 2π]` e `raio ∈ [beltInnerRadius, beltOuterRadius]`. Posição inicial: `x = centerX + cos(angulo) × raio`, `y = centerY + sin(angulo) × raio`. Cada partícula armazenada como `{ graphic, angulo, raio }`.
  - Cinturão Principal: ~60 partículas de 2-3px, cor #8B7355 com alpha 0.3 a 0.8
  - Cinturão de Kuiper: ~120 partículas de 2px, cor #8B7355 com alpha 0.2 a 0.6
  - Animação (aplicada a cada frame do ticker PixiJS, 60fps): `angulo += angularSpeed × deltaTime`; `pos = center + raio × (cos(angulo), sin(angulo))`. `angularSpeed = 0.0002 rad/ms` (≈ 1 volta a cada ~31s). Direção: anti-horário.
  - Camera scale < 2.0: partículas estáticas (posição fixa, sem update de ângulo). Camera scale >= 2.0: animação ativa.
  - Partículas sempre visíveis e clicáveis em qualquer zoom.
* Anéis de Saturno → mesmo sistema de partículas, geradas com offset RELATIVO a Saturno: `raio ∈ [5, 15]px`, ~40 partículas, 1-2px, cor #C8B896, alpha 0.2-0.6
  - Container PIXI filho do container de Saturno (acompanha o planeta automaticamente)
  - Camera scale < 3.0: invisível. Camera scale >= 3.0: visível.

Sem texturas, sombras, iluminação, ou efeitos visuais complexos.

Exceção: glow sutil no Sol (círculo com gradiente radial + blur).

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

Posição (convertida mundo → tela a cada frame):
  sx = planet.worldX × camera.scale.x + camera.container.x
  sy = planet.worldY × camera.scale.y + camera.container.y
  np.x = sx
  np.y = sy + planet.size × camera.scale.x + 4
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

## Paleta de Cores

| Elemento | Cor | Descrição |
|---|---|---|
| Fundo | #0A0A1A | Azul marinho escuro (espaço) |
| Órbitas | #2A2A4A | Elipses das trajetórias |
| Trajetória da frota | #00FF88 | Linha de viagem ativa |
| Sol | #FFD700 | Dourado com efeito glow |
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
| Sol | 40 |
| Mercúrio | 5 |
| Vênus | 8 |
| Terra | 8 |
| Marte | 6 |
| Júpiter | 12 |
| Saturno | 10 |
| Urano | 8 |
| Netuno | 7 |

## Frota

Triângulo equilátero com 4px de lado, cor #00FF88.

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
- ~60 partículas, 2-3px, cor #8B7355, alpha 0.3-0.8

### Cinturão de Kuiper

- Localização: borda do sistema solar
- Raio interno: ~4.500px, raio externo: ~7.000px
- ~120 partículas, 2px, cor #8B7355, alpha 0.2-0.6
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

Após chegar, a frota orbita o Sol rigorosamente como um planeta, seguindo a órbita do cinturão:

```
Fleet.state = ORBIT
Fleet.locationId = "main-belt" (ou "kuiper-belt")

anguloOrbital(t) = (2π × simulatedTime / (periodoOrbital × 86400) + faseInicial) mod 2π

posFrota.x = centerX + midRadius × cos(anguloOrbital)
posFrota.y = centerY + midRadius × sin(anguloOrbital)
```

Onde:
- `midRadius` = `(beltInnerRadius + beltOuterRadius) / 2` (calculado na chegada)
- `periodoOrbital` = período do planeta mais próximo: Marte (687d) para o Principal, Netuno (60.190d) para Kuiper
- `faseInicial` = ângulo do ponto de chegada (para a frota começar de onde chegou)

Isso garante que a frota mantenha-se dentro da região do cinturão orbitando o Sol com a mesma mecânica orbital dos planetas.

Quando já estiver na órbita do cinturão: menu com opção "Iniciar mineração" (placeholder — sem ação).

## Anéis de Saturno

Região especial associada ao planeta Saturno (planeta GAS com anéis).

### Modelo

- type: RING_SYSTEM
- Vinculado a Saturno via parentId = "saturn"
- Apenas representação visual (estética)
- Não é um corpo independente — acompanha Saturno

### Renderização

- Mesmo sistema de partículas dos cinturões de asteroides
- Partículas geradas com offset RELATIVO a Saturno:
  - Container PIXI filho do container de Saturno (herda a transformação do planeta)
  - `raio ∈ [5, 15]px` (distância do centro de Saturno)
  - `angulo ∈ [0, 2π]` sorteado, ~40 partículas, 1-2px, cor #C8B896, alpha 0.2-0.6
  - Animação: mesma `angularSpeed` dos cinturões (0.0002 rad/ms), rotação no eixo Z
  - Posição absoluta calculada automaticamente por ser filho de Saturno
- LOD: `camera.scale < 3.0` → invisível; `camera.scale >= 3.0` → visível
- Sem interação direta: não é clicável, não é navegável

### Mineração futura

- Quando a frota estiver na órbita de um planeta GAS com anéis (ex: Saturno), o menu de contexto exibe "Minerar asteroides"
- A mecânica será equivalente à mineração de asteroides dos cinturões

# Critérios de Aceitação Visuais

Ao iniciar o jogo deve ser possível:

* visualizar todas as órbitas
* visualizar planetas se movendo
* visualizar a frota orbitando
* visualizar partículas animadas dos cinturões de asteroides
* visualizar anéis de Saturno (partículas visíveis ao aplicar zoom)
* clicar em partículas do cinturão para selecionar como destino
* navegar pelo sistema usando zoom e pan
* selecionar um destino
* iniciar uma viagem
* acompanhar a transferência orbital
* centralizar a câmera na frota
* menu de contexto com opções condicionais ao tipo de corpo e estado da frota
* opção de mineração no menu (sem ação — preparação futura)

O sistema deve transmitir a sensação de estar observando um Sistema Solar vivo em escala reduzida.

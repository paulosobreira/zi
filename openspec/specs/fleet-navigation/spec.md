# Fleet Navigation Spec

## Purpose

Define criação de frotas, órbita local visual ao redor de planetas e cinturões, viagem via curva Bézier e regras de destinos válidos (incluindo proibição de viagem ao Sol).

## Requirements

### Requirement: Frota inicial
Ao criar uma nova sessão, o servidor SHALL criar uma frota com estado `ORBIT` em um planeta aleatório do tipo SOLID ou GAS (nunca em STAR ou ASTEROID_BELT).

#### Scenario: Nova sessão
- **WHEN** o servidor recebe `HELLO` com `startingBody` definido
- **THEN** SHALL criar uma frota em órbita do `startingBody` selecionado

### Requirement: Órbita local em planeta
Quando em órbita de um planeta, a frota SHALL realizar pequena órbita visual ao redor do corpo:

```
angle = fleet.orbitPhase + (simulatedTime / fleet.orbitPeriod) × 2π
fx = planetPos.x + cos(angle) × orbitRadius
fy = planetPos.y + sin(angle) × orbitRadius
orbitRadius = body.size + 5
orbitPeriod = 15000  (ms de simulatedTime, constante)
```

Cálculo feito pelo cliente a cada frame via `simulatedTime` extrapolado.

#### Scenario: Frota circula o planeta
- **WHEN** `fleet.state = ORBIT` e `fleet.locationId` aponta para um planeta
- **THEN** a posição visual da frota SHALL mudar a cada frame, descrevendo um círculo ao redor do planeta

### Requirement: Órbita em cinturão
Quando em órbita de um cinturão, a frota SHALL usar coordenadas fixas (`orbitX`, `orbitY`) calculadas na chegada e projetadas no raio médio do cinturão:

```
angle = atan2(arrivalY - centerY, arrivalX - centerX)
orbitX = centerX + cos(angle) × midRadius
orbitY = centerY + sin(angle) × midRadius
```

#### Scenario: Frota estacionada no cinturão
- **WHEN** `fleet.state = ORBIT` e `fleet.locationId` aponta para um cinturão
- **THEN** a posição da frota SHALL ser constante em `(orbitX, orbitY)`

### Requirement: Viagem via curva Bézier
Ao receber `MOVE_FLEET`, o servidor SHALL criar um `Movement` com:

```
distance = distância linear (origem → destino)
travelSimulatedTime = distance / 6 × 1000   (fleetSpeed = 6 px / 1000 simTime)
departureSimulatedTime = simulatedTime atual
arrivalSimulatedTime = departure + travel

Ponto de controle Bézier:
  mid = (origem + destino) / 2
  dir = normalize(mid - center)
  push = distance(origem, center) × 0.8
  CP = mid + dir × push
```

A frota SHALL seguir a mesma curva Bézier quadrática que é desenhada no cliente:
`pos = bezier(origem, CP, destino, progresso)` onde `progresso = (simTime - departure) / (arrival - departure)`.

#### Scenario: Viagem iniciada
- **WHEN** o servidor recebe `MOVE_FLEET` válido
- **THEN** SHALL responder com `MOVE_STARTED` e criar o movimento; `fleet.state` SHALL ser `TRAVEL`

#### Scenario: Destino proibido (STAR)
- **WHEN** `MOVE_FLEET` tem `destination.bodyId` de um corpo do tipo `STAR`
- **THEN** SHALL rejeitar com `code: INVALID_DESTINATION`; frota permanece em órbita

### Requirement: Destino em cinturão
Para destinos do tipo `ASTEROID_BELT`, o cliente SHALL incluir `arrivalPosition: {x, y}` na mensagem `MOVE_FLEET`. O servidor SHALL projetar este ponto no raio médio do cinturão:

```
angle = atan2(arrivalY - centerY, arrivalX - centerX)
midRadius = (innerRadius + outerRadius) / 2
destX = centerX + cos(angle) × midRadius
destY = centerY + sin(angle) × midRadius
```

#### Scenario: Chegada no cinturão
- **WHEN** a frota chega a um cinturão
- **THEN** a posição de chegada SHALL ser no raio médio do cinturão, no ângulo do ponto clicado

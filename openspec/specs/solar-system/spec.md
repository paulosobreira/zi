# Solar System Spec

## Purpose

Define a composição e parâmetros dos corpos do sistema solar simulado, escala espacial, posicionamento do Sol no centro e classificação de tipos de corpo.

## Requirements

### Requirement: Corpos do Sistema Solar
O sistema SHALL conter os seguintes corpos orbitais com os parâmetros definidos:

| Corpo | Tipo | semiMajorAxis (px) | Excentricidade | Período (dias) | Raio visual (px) | Cor |
|---|---|---|---|---|---|---|
| Sol | STAR | centro | 0 | — | 28 | #FFD700 |
| Mercúrio | SOLID | 57,9 | 0,205 | 88 | 5 | #B5B5B5 |
| Vênus | SOLID | 108,2 | 0,007 | 225 | 8 | #E6B87D |
| Terra | SOLID | 149,6 | 0,017 | 365 | 8 | #4B7BE5 |
| Marte | SOLID | 227,9 | 0,093 | 687 | 6 | #E27B58 |
| Júpiter | GAS | 778,5 | 0,049 | 4.333 | 12 | #D4A574 |
| Saturno | GAS | 1.434 | 0,057 | 10.759 | 10 | #E8D5A3 |
| Urano | GAS | 2.871 | 0,046 | 30.687 | 8 | #73B1B7 |
| Netuno | GAS | 4.495 | 0,010 | 60.190 | 7 | #3E54E8 |
| Cinturão Principal | ASTEROID_BELT | — | — | 0 | — | #8B7355 |
| Cinturão de Kuiper | ASTEROID_BELT | — | — | 0 | — | #8B7355 |
| Anéis de Saturno | RING_SYSTEM | — | — | — | — | — |

A Nuvem de Oort não está incluída.

#### Scenario: Sistema carregado ao iniciar
- **WHEN** o servidor inicia
- **THEN** todos os corpos acima DEVEM estar presentes em `sim.bodies`

### Requirement: Escala espacial
O sistema SHALL usar escala de 1 pixel = 1.000.000 km para posicionamento orbital.

#### Scenario: Sala de simulação
- **WHEN** os dados do sistema solar são inicializados
- **THEN** a sala SHALL ter dimensões calculadas como `ceil((maxDist × 1.25) × 2)` onde `maxDist` é o raio externo do Cinturão de Kuiper (~7000px), resultando em sala de aproximadamente 17500×17500px

### Requirement: Centro do sistema
O Sol SHALL estar posicionado no centro geométrico da sala. O sistema SHALL usar coordenadas `(roomSize/2, roomSize/2)` e não `(0,0)`.

#### Scenario: Posição do Sol
- **WHEN** `centerX` e `centerY` são calculados
- **THEN** `centerX == roomSize / 2` e `centerY == roomSize / 2`

### Requirement: Classificação de corpos
Planetas do tipo SOLID SHALL ter superfície minerável no futuro. Planetas do tipo GAS podem ter RING_SYSTEM vinculado via `parentId`. Corpos do tipo ASTEROID_BELT têm `orbitalPeriod = 0` e posição fixa no centro.

#### Scenario: Saturno com anéis
- **WHEN** os dados do sistema solar são carregados
- **THEN** deve existir um corpo do tipo RING_SYSTEM com `parentId = "saturn"`

### Requirement: Cinturões de asteroides
O Cinturão Principal SHALL ter raio interno ~300px e raio externo ~500px. O Cinturão de Kuiper SHALL ter raio interno ~4500px e raio externo ~7000px.

#### Scenario: Dimensões dos cinturões
- **WHEN** um cinturão é clicado
- **THEN** o hit-test SHALL verificar `innerRadius ≤ dist ≤ outerRadius`

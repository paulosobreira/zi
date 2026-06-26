## ADDED Requirements

### Requirement: Cálculo de posição elíptica
O sistema SHALL calcular a posição de cada corpo orbital usando física elíptica parametrizada por `simulatedTime`:

```
θ = (2π × simulatedTime / (orbitalPeriodDays × 86400) + orbitalPhase) mod 2π
r = semiMajorAxis × (1 - e²) / (1 + e × cos(θ))
x = centerX + cos(θ) × r - (a × e)  // offset do foco
y = centerY + sin(θ) × r
```

O foco (Sol) está em `centerX`; o centro da elipse está em `centerX - a×e`.

#### Scenario: Planeta em órbita
- **WHEN** `calculatePosition` é chamado com `orbitalPeriod > 0`
- **THEN** retorna `{x, y}` diferentes a cada `simulatedTime` distinto

#### Scenario: Posição do foco correta
- **WHEN** `drawEllipse(centerX - a*e, centerY, a, b)` é chamado no cliente
- **THEN** a elipse desenhada SHALL ter o Sol (foco) em `centerX`, não no centro da elipse

### Requirement: Corpos estáticos
Corpos com `orbitalPeriod = 0` (Sol, cinturões) SHALL retornar `{x: centerX, y: centerY}` imediatamente, sem executar a fórmula orbital (evitar divisão por zero).

#### Scenario: Sol não produz NaN
- **WHEN** `calculatePosition` é chamado para o Sol (`orbitalPeriod = 0`)
- **THEN** retorna `{x: centerX, y: centerY}` sem NaN

### Requirement: Aceleração temporal
O `simulatedTime` SHALL avançar 1000ms por tick de 1s real, resultando em fator de aceleração 1000×. Isso torna órbitas com período de anos visíveis em minutos.

#### Scenario: Avanço por tick
- **WHEN** o tick engine dispara
- **THEN** `sim.simulatedTime += 1000`

### Requirement: Extrapolação local no cliente
O cliente SHALL extrapoldar `simulatedTime` a cada frame usando:

```
currentSimulatedTime = lastSimulatedTime + (performance.now() - lastWallTime)
```

`lastSimulatedTime` e `lastWallTime` são atualizados a cada `STATE_UPDATE` recebido.

#### Scenario: Animação contínua entre ticks
- **WHEN** o cliente não recebeu STATE_UPDATE nos últimos 500ms
- **THEN** a posição da frota/planeta SHALL continuar sendo recalculada a 60fps via extrapolação local, sem congelar

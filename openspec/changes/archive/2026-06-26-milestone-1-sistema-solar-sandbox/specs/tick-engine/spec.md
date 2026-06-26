## ADDED Requirements

### Requirement: Loop de simulação
O servidor SHALL executar um tick a cada 1 segundo real, realizando em sequência:
1. `simulatedTime += 1000`
2. Recalcular posições orbitais de todos os corpos
3. Avançar movimentos de frota ativos em suas curvas Bézier
4. Fazer broadcast de `STATE_UPDATE` para todos os clientes conectados

#### Scenario: Tick periódico
- **WHEN** o servidor está rodando
- **THEN** `STATE_UPDATE` SHALL ser enviado a todos os clientes conectados a cada ~1000ms

### Requirement: Estado em memória
O servidor SHALL manter estado em `sim.js` contendo: `sessions`, `players`, `fleets`, `movements`, `bodies`. Reinício do servidor limpa todo o estado.

#### Scenario: Ausência de persistência
- **WHEN** o servidor é reiniciado
- **THEN** todas as sessões, frotas e movimentos são perdidos; clientes reconectam e recebem nova sessão

### Requirement: Movimento de frota via progresso Bézier
Durante cada tick, o servidor SHALL verificar se movimentos ativos (`fleet.state = TRAVEL`) atingiram `arrivalSimulatedTime`. Ao chegar:
- `fleet.state = ORBIT`
- `fleet.locationId = destinationId`
- Emite `FLEET_ARRIVED` para o cliente

#### Scenario: Chegada da frota
- **WHEN** `simulatedTime >= movement.arrivalSimulatedTime`
- **THEN** a frota SHALL transicionar para `ORBIT` com `locationId` do destino

# WebSocket Protocol Spec

## Purpose

Define o protocolo de comunicação bidirecional entre cliente e servidor: formato de mensagens JSON, fluxo de conexão, conteúdo de STATE_UPDATE, comando MOVE_FLEET e payload completo de SYSTEM_DATA.

## Requirements

### Requirement: Formato das mensagens
Todas as mensagens SHALL ser JSON. Cliente→Servidor: `{ type: "COMMAND", action, payload }`. Servidor→Cliente: `{ type, payload }`.

#### Scenario: Mensagem malformada
- **WHEN** o servidor recebe uma mensagem não-JSON
- **THEN** SHALL ignorar sem crashar

### Requirement: Fluxo de conexão
O protocolo SHALL seguir a sequência:
1. Cliente envia `HELLO { sessionId, startingBody }`
2. Servidor responde `WELCOME { playerId, sessionId }`
3. Servidor empurra imediatamente `SYSTEM_DATA { bodies, centerX, centerY, roomSize }`
4. Servidor empurra imediatamente `FLEET_DATA { fleet }`
5. Servidor faz broadcast de `STATE_UPDATE` a cada tick (1s)

#### Scenario: Dados disponíveis imediatamente
- **WHEN** o cliente recebe `WELCOME`
- **THEN** `SYSTEM_DATA` e `FLEET_DATA` SHALL chegar sem necessidade de polling

### Requirement: STATE_UPDATE
O payload de `STATE_UPDATE` SHALL conter: `simulatedTime`, posições de todos os corpos (`bodies`), estado de todas as frotas do jogador (`fleets`), movimentos ativos (`movements`).

#### Scenario: Conteúdo do STATE_UPDATE
- **WHEN** o servidor emite `STATE_UPDATE`
- **THEN** o payload SHALL incluir `simulatedTime`, `bodies` com posições calculadas, `fleets` com estado e parâmetros de órbita

### Requirement: MOVE_FLEET
O cliente SHALL enviar `{ type: "COMMAND", action: "MOVE_FLEET", payload: { fleetId, destination: { bodyId }, arrivalPosition? } }`. Para cinturões, `arrivalPosition: { x, y }` é obrigatório.

#### Scenario: MOVE_FLEET aceito
- **WHEN** o servidor recebe `MOVE_FLEET` com destino válido (não STAR)
- **THEN** SHALL responder com `{ type: "MOVE_STARTED", payload: { fleetId, movement } }`

#### Scenario: MOVE_FLEET rejeitado (STAR)
- **WHEN** o servidor recebe `MOVE_FLEET` com `destination.bodyId` de tipo STAR
- **THEN** SHALL responder com `{ type: "ERROR", payload: { code: "INVALID_DESTINATION" } }`

### Requirement: SYSTEM_DATA deve incluir parâmetros orbitais completos
O payload `SYSTEM_DATA` SHALL incluir para cada corpo: `id`, `name`, `type`, `size`, `color`, `semiMajorAxis`, `eccentricity`, `orbitalPeriod`, `orbitalPhase`, `parentId` (se aplicável), `innerRadius`/`outerRadius` (para cinturões), `centerX`, `centerY`.

#### Scenario: Parâmetros completos
- **WHEN** o cliente recebe `SYSTEM_DATA`
- **THEN** SHALL ser possível desenhar todas as órbitas e calcular posições sem dados hardcoded no cliente

# Protocolo WebSocket

## Objetivo

Definir comunicação entre cliente e servidor.

Tudo baseado em JSON.

---

# Formato base

## Cliente → Servidor

{
"type": "COMMAND",
"action": "ACTION_NAME",
"payload": {}
}

## Servidor → Cliente

{
"type": "RESPONSE",
"success": true,
"payload": {}
}

---

# Entidade central do protocolo

## OrbitalBody

A partir deste momento, todo objeto orbital é representado como:

* bodyId
* bodyType
* planetType        (opcional — "SOLID" | "GAS"; presente apenas quando bodyType = PLANET)
* beltInnerRadius   (opcional — raio interno em pixels; presente apenas quando bodyType = ASTEROID_BELT)
* beltOuterRadius   (opcional — raio externo em pixels; presente apenas quando bodyType = ASTEROID_BELT)
* parentId          (opcional — presente apenas quando bodyType = RING_SYSTEM)
* semiMajorAxis     (opcional — presente em PLANET, STAR; ausente em ASTEROID_BELT, RING_SYSTEM)
* eccentricity      (opcional — presente em PLANET, STAR; ausente em ASTEROID_BELT, RING_SYSTEM)
* orbitalPeriod     (opcional — presente em PLANET, STAR; ausente em ASTEROID_BELT, RING_SYSTEM)
* orbitalPhase      (opcional — presente em PLANET; ausente em ASTEROID_BELT, RING_SYSTEM)
* size              (opcional — presente em PLANET, STAR, RING_SYSTEM; ausente em ASTEROID_BELT)
* color

---

## bodyType

* STAR
* PLANET
* MOON
* ASTEROID_BELT
* RING_SYSTEM
* ~~COMET_REGION~~ (reservado)

---

# Comandos

## HELLO

Cliente inicia conexão.

Se o cliente já possui um playerId de sessão anterior, deve enviá-lo para reentrar no jogo.

### Cliente (primeira conexão)

{
"type": "COMMAND",
"action": "HELLO"
}

### Cliente (reconexão)

{
"type": "COMMAND",
"action": "HELLO",
"payload": {
"playerId": "player-1"
}
}

### Servidor (sucesso)

{
"type": "WELCOME",
"playerId": "player-1"
}

### Servidor (playerId inválido na reconexão)

{
"type": "WELCOME",
"playerId": "player-2"   /* servidor cria novo player */
}

### Nota

Imediatamente após enviar WELCOME, o servidor empurra automaticamente:

  SYSTEM_DATA  → estado atual do sistema solar
  FLEET_DATA   → estado da frota do jogador

O cliente não precisa solicitar GET_SYSTEM ou GET_FLEET.

---

## HEARTBEAT

Servidor envia PING a cada 30 segundos. Cliente deve responder PONG.

### Servidor → Cliente

{
"type": "PING"
}

### Cliente → Servidor

{
"type": "PONG"
}

Se o servidor não receber PONG após 3 PINGs consecutivos, a conexão é considerada perdida.

---

## GET_SYSTEM

Retorna estado do sistema atual.

### Servidor (atualizado)

O servidor envia todos os OrbitalBodies do sistema:

{
"type": "SYSTEM_DATA",
"payload": {
"system": {
"id": "sol",
"centerX": 9000,
"centerY": 9000,
"orbitalBodies": [
{ "id": "sun",          "type": "STAR",         "semiMajorAxis": 0,    "eccentricity": 0, "orbitalPeriod": 0, "size": 40, "color": "#FFD700" },
{ "id": "mercury",      "type": "PLANET",      "planetType": "SOLID", "semiMajorAxis": 57.9, "eccentricity": 0.205, "orbitalPeriod": 88, "orbitalPhase": 0, "size": 5, "color": "#B5B5B5" },
{ "id": "venus",        "type": "PLANET",      "planetType": "SOLID", "semiMajorAxis": 108.2, "eccentricity": 0.007, "orbitalPeriod": 225, "orbitalPhase": 0, "size": 8, "color": "#E6B87D" },
{ "id": "earth",        "type": "PLANET",      "planetType": "SOLID", "semiMajorAxis": 149.6, "eccentricity": 0.017, "orbitalPeriod": 365, "orbitalPhase": 0, "size": 8, "color": "#4B7BE5" },
{ "id": "mars",         "type": "PLANET",      "planetType": "SOLID", "semiMajorAxis": 227.9, "eccentricity": 0.093, "orbitalPeriod": 687, "orbitalPhase": 0.25, "size": 6, "color": "#E27B58" },
{ "id": "main-belt",    "type": "ASTEROID_BELT", "beltInnerRadius": 300, "beltOuterRadius": 500, "color": "#8B7355" },
{ "id": "jupiter",      "type": "PLANET",      "planetType": "GAS",   "semiMajorAxis": 778.5, "eccentricity": 0.049, "orbitalPeriod": 4333, "orbitalPhase": 0, "size": 12, "color": "#D4A574" },
{ "id": "saturn",       "type": "PLANET",      "planetType": "GAS",   "semiMajorAxis": 1434, "eccentricity": 0.057, "orbitalPeriod": 10759, "orbitalPhase": 0, "size": 10, "color": "#E8D5A3" },
{ "id": "saturn-rings", "type": "RING_SYSTEM",  "parentId": "saturn", "size": 18, "color": "#C8B896" },
{ "id": "uranus",       "type": "PLANET",      "planetType": "GAS",   "semiMajorAxis": 2871, "eccentricity": 0.046, "orbitalPeriod": 30687, "orbitalPhase": 0, "size": 8, "color": "#73B1B7" },
{ "id": "neptune",      "type": "PLANET",      "planetType": "GAS",   "semiMajorAxis": 4495, "eccentricity": 0.010, "orbitalPeriod": 60190, "orbitalPhase": 0, "size": 7, "color": "#3E54E8" },
{ "id": "kuiper-belt",  "type": "ASTEROID_BELT", "beltInnerRadius": 4500, "beltOuterRadius": 7000, "color": "#8B7355" }
]
}
}
}

---

## GET_FLEET

### Resposta

{
"type": "FLEET_DATA",
"payload": {
"fleetId": "fleet-1",
"location": {
"type": "ORBITAL_BODY",
"bodyId": "mars",
"bodyType": "PLANET"
}
}
}

---

## MOVE_FLEET

Inicia movimentação.

### Cliente (planeta como destino)

{
"type": "COMMAND",
"action": "MOVE_FLEET",
"payload": {
"destination": {
"type": "ORBITAL_BODY",
"bodyId": "jupiter"
}
}
}

### Cliente (cinturão como destino — com arrivalPosition)

Quando o destino é um cinturão, o cliente envia a posição do clique como arrivalPosition:

{
"type": "COMMAND",
"action": "MOVE_FLEET",
"payload": {
"destination": {
"type": "ORBITAL_BODY",
"bodyId": "main-belt"
},
"arrivalPosition": {
"x": 8500,
"y": 9200
}
}
}

O servidor projeta arrivalPosition no raio médio do cinturão e usa essa projeção como destino da viagem.

arrivalPosition é opcional. Quando ausente (destino = planeta), a viagem usa a posição orbital calculada do corpo de destino.

---

### Servidor

{
"type": "MOVE_STARTED",
"payload": {
"fleetId": "fleet-1",
"arrivalSimulatedTime": 90000
}
}

---

# Eventos

## FLEET_ARRIVED

{
"type": "FLEET_ARRIVED",
"payload": {
"fleetId": "fleet-1",
"destination": {
"type": "ORBITAL_BODY",
"bodyId": "jupiter"
}
}
}

---

## STATE_UPDATE

Atualização periódica do universo, enviada a cada tick (1s) para todos os clientes conectados. Contém posições calculadas de todos os corpos e frotas.

```
{
  "type": "STATE_UPDATE",
  "payload": {
    "tick": 1234,
    "simulatedTime": 1234000,
    "orbitalBodies": {
      "sun":        { "x": 9000, "y": 9000 },
      "mercury":    { "x": 9057, "y": 8950 },
      "venus":      { "x": 9100, "y": 8920 },
      "earth":      { "x": 9140, "y": 8890 },
      "mars":       { "x": 9200, "y": 8860 },
      "main-belt":  { "x": 9000, "y": 9000 },
      "jupiter":    { "x": 9700, "y": 8700 },
      "saturn":     { "x": 10000, "y": 8500 },
      "uranus":     { "x": 11000, "y": 8200 },
      "neptune":    { "x": 12000, "y": 8000 },
      "kuiper-belt":{ "x": 9000, "y": 9000 }
    },
    "fleets": {
      "fleet-1": {
        "state": "ORBIT",
        "locationId": "mars",
        "x": 9205,
        "y": 8865
      }
    },
    "movements": [
      {
        "id": "move-1",
        "fleetId": "fleet-1",
        "originId": "mars",
        "destinationId": "jupiter",
        "originX": 9200,
        "originY": 8860,
        "destX": 9700,
        "destY": 8700,
        "progress": 0.35,
        "x": 9375,
        "y": 8804
      }
    ]
  }
}
```

O cliente deve interpolar visualmente a posição entre STATE_UPDATES para obter animação suave em 60fps.

---

# Erros

Formato padrão:

{
"type": "ERROR",
"code": "INVALID_ACTION",
"message": "Ação inválida"
}

## Códigos de Erro

| Código | Significado |
|---|---|
| INVALID_ACTION | Ação não reconhecida |
| INVALID_DESTINATION | Destino não encontrado ou inválido |
| FLEET_BUSY | Frota já está em viagem |
| FLEET_NOT_FOUND | Frota não pertence ao jogador |
| PLAYER_NOT_FOUND | playerId inválido na reconexão |
| RATE_LIMIT | Muitos comandos em curto período |

---

# Regra principal do protocolo

O cliente nunca assume lógica de jogo.

Ele apenas:

* envia comandos
* recebe estados
* renderiza simulação

---

# Evolução futura

O protocolo pode evoluir para suportar:

* múltiplos sistemas
* eventos galácticos
* combate
* mineração

sem quebrar compatibilidade base.

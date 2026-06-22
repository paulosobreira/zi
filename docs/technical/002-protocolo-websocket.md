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

---

## bodyType

* STAR
* PLANET
* MOON
* ASTEROID_BELT
* COMET_REGION
* RING_SYSTEM

---

# Comandos

## HELLO

Cliente inicia conexão

### Cliente

{
"type": "COMMAND",
"action": "HELLO"
}

### Servidor

{
"type": "WELCOME",
"playerId": "player-1"
}

---

## GET_SYSTEM

Retorna estado do sistema atual.

### Servidor (atualizado)

{
"type": "SYSTEM_DATA",
"payload": {
"system": {
"id": "sol",
"orbitalBodies": [
{
"id": "mars",
"type": "PLANET"
}
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

### Cliente

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

---

### Servidor

{
"type": "MOVE_STARTED",
"payload": {
"fleetId": "fleet-1",
"arrivalTime": 1750003600
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

Atualização periódica do universo.

Pode conter:

* fleets
* orbitalBodies
* movements

---

# Erros

Formato padrão:

{
"type": "ERROR",
"code": "INVALID_ACTION",
"message": "Ação inválida"
}

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

# Modelo de Dados

## Objetivo

Definir as entidades fundamentais do universo do jogo Zeus Interestelar.

Os modelos devem ser independentes de persistência e focados em regras de domínio.

---

# OrbitalBody (Entidade Base)

Representa qualquer corpo celeste que possui comportamento orbital.

Serve como base para:

* Estrelas
* Planetas
* Luas
* Asteroides
* Cinturões
* Anéis planetários

---

## Campos

* id
* name
* type
* systemId
* semiMajorAxis   (semieixo maior da órbita elíptica, em pixels)
* eccentricity    (excentricidade: 0 = circular, 0 < e < 1)
* orbitalPeriod   (período orbital em dias terrestres; usado na fórmula como orbitalPeriod × 86400 para segundos simulados)
* orbitalPhase    (fase inicial em radianos, 0 = periélio)
* size            (raio visual em pixels)
* color           (cor em hex, ex: "#FFD700")
* planetType      (opcional — "SOLID" | "GAS"; aplicável apenas quando type = PLANET)
* parentId        (opcional — id do corpo pai; usado por RING_SYSTEM para vincular ao planeta)
* beltInnerRadius (opcional — raio interno do cinturão em pixels; aplicável apenas quando type = ASTEROID_BELT)
* beltOuterRadius (opcional — raio externo do cinturão em pixels; aplicável apenas quando type = ASTEROID_BELT)

---

## Types possíveis

* STAR
* PLANET
* MOON
* ASTEROID_BELT   (cinturão de asteroides — Principal e Kuiper; orbitalPeriod = 0, posição fixa)
* RING_SYSTEM     (anéis planetários, vinculado a planeta GAS via parentId)
* ~~COMET_REGION~~ (reservado para uso futuro)

---

## Exemplo (planeta sólido)

{
"id": "mars",
"name": "Marte",
"type": "PLANET",
"planetType": "SOLID",
"systemId": "sol",
"semiMajorAxis": 227.9,
"eccentricity": 0.093,
"orbitalPeriod": 687,
"orbitalPhase": 0.25,
"size": 6,
"color": "#E27B58"
}

## Exemplo (planeta gasoso com anéis)

{
"id": "saturn",
"name": "Saturno",
"type": "PLANET",
"planetType": "GAS",
"systemId": "sol",
"semiMajorAxis": 1434,
"eccentricity": 0.057,
"orbitalPeriod": 10759,
"orbitalPhase": 0.0,
"size": 10,
"color": "#E8D5A3"
}

## Exemplo (anéis — vinculado a Saturno via parentId)

{
"id": "saturn-rings",
"name": "Anéis de Saturno",
"type": "RING_SYSTEM",
"parentId": "saturn",
"systemId": "sol",
"semiMajorAxis": 0,
"eccentricity": 0,
"orbitalPeriod": 0,
"orbitalPhase": 0,
"size": 18,
"color": "#C8B896"
}

## Exemplo (cinturão de asteroides)

{
"id": "main-belt",
"name": "Cinturão Principal",
"type": "ASTEROID_BELT",
"systemId": "sol",
"semiMajorAxis": 0,
"eccentricity": 0,
"orbitalPeriod": 0,
"orbitalPhase": 0,
"size": 0,
"color": "#8B7355",
"beltInnerRadius": 300,
"beltOuterRadius": 500
}

---

# IDs das Entidades do Sistema Solar

| ID | Nome | Type |
|----|------|------|
| sun | Sol | STAR |
| mercury | Mercúrio | PLANET |
| venus | Vênus | PLANET |
| earth | Terra | PLANET |
| mars | Marte | PLANET |
| main-belt | Cinturão Principal | ASTEROID_BELT |
| jupiter | Júpiter | PLANET |
| saturn | Saturno | PLANET |
| saturn-rings | Anéis de Saturno | RING_SYSTEM |
| uranus | Urano | PLANET |
| neptune | Netuno | PLANET |
| kuiper-belt | Cinturão de Kuiper | ASTEROID_BELT |

---

# System

Representa um sistema estelar.

Contém um conjunto de OrbitalBodies.

---

## Campos

* id
* name
* positionX
* positionY
* bodies: OrbitalBody[]

---

## Exemplo

{
"id": "sol",
"name": "Sistema Solar",
"positionX": 0,
"positionY": 0,
"bodies": ["sun", "earth", "mars", "jupiter"]
}

---

# Player

Representa um jogador.

---

## Campos

* id
* name
* createdAt
* fleetIds

---

## Exemplo

{
"id": "player-1",
"name": "Paulo",
"createdAt": 1750000000,
"fleetIds": ["fleet-1"]
}

---

# Fleet

Representa uma frota de naves.

---

## Campos

* id
* ownerId
* locationType
* locationId
* state

---

## States

* ORBIT
* TRAVEL
* STATIONARY

---

## Exemplo

{
"id": "fleet-1",
"ownerId": "player-1",
"locationType": "ORBITAL_BODY",
"locationId": "mars",
"state": "ORBIT"
}

---

# Movement

Representa uma viagem entre dois pontos orbitais.

---

## Campos

* id
* fleetId
* originId
* destinationId
* departureSimulatedTime
* arrivalSimulatedTime
* arrivalX          (opcional — coordenada X de chegada; usado quando destino é cinturão)
* arrivalY          (opcional — coordenada Y de chegada)

---

## Exemplo (planeta → planeta)

{
"id": "move-1",
"fleetId": "fleet-1",
"originId": "mars",
"destinationId": "jupiter",
"departureSimulatedTime": 50000,
"arrivalSimulatedTime": 90000
}

## Exemplo (planeta → cinturão)

{
"id": "move-2",
"fleetId": "fleet-1",
"originId": "mars",
"destinationId": "main-belt",
"arrivalX": 8500,
"arrivalY": 9200,
"departureSimulatedTime": 50000,
"arrivalSimulatedTime": 90000
}

---

# GameState

Estado global do universo.

---

## Campos

* systems
* players
* fleets
* movements

---

## Exemplo

{
"systems": [],
"players": [],
"fleets": [],
"movements": []
}

---

# Cálculo de Posição Orbital

Dado um OrbitalBody com parâmetros elípticos, a posição no tempo simulado é:

```
ângulo θ(t) = (2π × simulatedTime / (orbitalPeriod × 86400) + orbitalPhase) mod 2π
raio r(θ)   = semiMajorAxis × (1 - eccentricity²) / (1 + eccentricity × cos(θ))

posição no plano:
  x = centroSistemaX + r × cos(θ)
  y = centroSistemaY + r × sin(θ)
```

86400 = número de segundos em um dia terrestre (24h × 60min × 60s).
orbitalPeriod está em dias, simulatedTime em segundos — a conversão unifica as unidades.

---

# Regra Fundamental

Toda entidade que orbita algo no universo deve ser representada como OrbitalBody.

Isso garante:

* extensibilidade futura
* suporte a novos tipos de corpos celestes
* consistência de simulação orbital

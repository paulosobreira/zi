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
* Anéis planetários (futuro)

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

---

## Types possíveis

* STAR
* PLANET
* MOON
* ASTEROID_BELT
* COMET_REGION
* RING_SYSTEM

---

## Exemplo

{
"id": "mars",
"name": "Marte",
"type": "PLANET",
"systemId": "sol",
"semiMajorAxis": 227.9,
"eccentricity": 0.093,
"orbitalPeriod": 687,
"orbitalPhase": 0.25,
"size": 6,
"color": "#E27B58"
}

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
* departureTime
* arrivalTime

---

## Exemplo

{
"id": "move-1",
"fleetId": "fleet-1",
"originId": "mars",
"destinationId": "jupiter",
"departureTime": 1750000000,
"arrivalTime": 1750003600
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

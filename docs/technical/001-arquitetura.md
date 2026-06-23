# Arquitetura Técnica

## Objetivo

Definir a arquitetura inicial do Zeus Interestelar com foco em:

* Simplicidade extrema
* Evolução incremental por milestones
* Simulação server-side authoritative
* Persistência leve
* Comunicação em tempo real

---

# Princípios Fundamentais

## Server Authoritative

Todo estado do jogo pertence ao servidor.

O cliente apenas envia intenções.

Exemplo:

* cliente: “mover frota para Marte”
* servidor: valida, calcula e executa

---

## Universo como simulação contínua

O jogo é uma simulação persistente baseada em ticks.

* movimentos continuam offline
* órbitas são atualizadas continuamente
* eventos são determinísticos

---

## Persistência simples (inicial)

Durante os primeiros milestones:

### armazenamento em JSON

Arquivos:

data/

players.json
fleets.json
systems.json
movements.json

---

# Evolução futura

A persistência poderá migrar para SQLite sem impacto no domínio.

---

# Stack Inicial

## Backend

Node.js

Responsável por:

* simulação do universo
* tick engine
* validação de comandos
* persistência
* cálculo orbital
* movimentação de frotas

---

## Comunicação

WebSocket (ws)

* baixa latência
* comandos leves
* eventos contínuos

---

## Frontend

JavaScript + PixiJS

* renderização 2D vetorial
* zoom e pan espacial
* visão top-down do sistema

---

# Estado do Jogo

O servidor mantém tudo em memória:

gameState

* players
* fleets
* systems
* orbitalBodies
* movements

---

# Conceito Central: OrbitalBody

Todo corpo celeste do universo é representado como OrbitalBody.

Isso inclui:

* estrelas
* planetas
* luas
* cinturões de asteroides
* regiões orbitais futuras

---

## Benefícios

* unificação do sistema orbital
* expansão fácil do universo
* lógica de simulação única
* menos duplicação de código

---

# Tick Engine

Intervalo inicial:

1 segundo

A cada tick, o tempo simulado avança:

simulatedTime += 1000   // fator de aceleração 1000x

Isto significa que 1 tick real (1s) equivale a ~16,7 minutos simulados. O fator poderá ser ajustado por milestone.

Responsável por:

* atualizar órbitas
* processar movimentos
* disparar eventos
* atualizar estado global

---

# Persistência

Eventos que disparam save:

* criação de jogador
* criação de frota
* início de movimento
* chegada de frota

Além disso:

autosave a cada 30 segundos

---

# Comunicação

Cliente nunca altera estado diretamente.

Apenas envia comandos.

Exemplo:

MOVE_FLEET

GET_SYSTEM

PING

---

# Fora de escopo

* microserviços
* bancos externos complexos
* filas distribuídas
* infraestrutura cloud avançada
* autenticação complexa (inicialmente)

---

# Filosofia

O foco do projeto é gameplay.

Infraestrutura deve ser invisível e mínima.

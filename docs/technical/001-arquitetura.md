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

Desenvolvimento:

Usar `node --watch src/server/index.js` para auto-restart ao editar arquivos.
O `--watch` monitora todo o grafo de módulos importados e reinicia o processo
automaticamente.

---

## Comunicação

WebSocket (ws)

* baixa latência
* comandos leves
* eventos contínuos

### Payload do SYSTEM_DATA

O servidor envia todos os parâmetros necessários para renderização:

* `id`, `name`, `type`, `size`, `color` (identificação básica)
* `semiMajorAxis`, `eccentricity` (parâmetros orbitais)
* `centerX`, `centerY` (referencial espacial do sistema)

O cliente nunca hardcoda dados do sistema solar — tudo vem do servidor.

---

## Frontend

JavaScript + PixiJS

* renderização 2D vetorial
* zoom e pan espacial
* visão top-down do sistema
* ticker do PixiJS (60fps) para animação suave
* nameplates em camada separada (app.stage) com posição mundo→tela

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

A cada tick, o servidor executa a seguinte sequência em ordem:

  1. simulatedTime += 1000
     O tempo simulado do universo avança. Todos os cálculos (órbitas, viagens)
     utilizam simulatedTime como referência, não o tempo real.

  2. recalcular órbitas
     Para cada OrbitalBody do sistema, calcular nova posição (x, y) no plano
     usando a fórmula elíptica com o simulatedTime atual.

  3. processar movimentos
     Para cada Movement ativo:
       - calcular progresso da viagem:
         progresso = (simulatedTime - departureSimulatedTime) /
                     (arrivalSimulatedTime - departureSimulatedTime)
       - interpolar posição da frota entre origem e destino
       - se simulatedTime >= arrivalSimulatedTime:
           Fleet.state = ORBIT
           Fleet.locationId = destinationId
           remover Movement
           disparar evento FLEET_ARRIVED

  4. broadcast STATE_UPDATE por sistema solar
     Agrupar clientes por systemId (sistema onde a frota do jogador está).
     Para cada sistema, montar um STATE_UPDATE contendo apenas os
     orbitalBodies, fleets e movements daquele sistema.
     Enviar para cada cliente apenas o STATE_UPDATE do seu sistema atual.

  5. autosave por sistema solar (a cada 30 ticks)
     Para cada sistema, persistir seus dados em:
       data/systems/<systemId>/bodies.json
       data/systems/<systemId>/fleets.json
       data/systems/<systemId>/movements.json
     Players e players.json permanecem globais (cross-system).

Tick = 1 segundo real (wall clock). simulatedTime é independente e pode ser
acelerado sem afetar o intervalo do tick.

Isto significa que 1 tick real (1s) equivale a ~16,7 minutos simulados
(fator 1000x). O fator poderá ser ajustado por milestone.

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

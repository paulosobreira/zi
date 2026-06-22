# Zeus Interestelar

## Visão Geral

Zeus Interestelar é um jogo multiplayer assíncrono de exploração e expansão espacial onde jogadores controlam frotas em um universo persistente.

Cada jogador inicia em um sistema estelar e evolui sua civilização através de exploração orbital, mineração, logística espacial e conflito entre frotas.

O jogo é estruturado como uma simulação contínua de um universo vivo.

---

# Filosofia do Jogo

## Simulação contínua

O universo não depende da presença do jogador.

- frotas continuam viajando offline
- órbitas continuam evoluindo
- eventos continuam acontecendo

---

## Escala progressiva

O jogo começa pequeno:

- um sistema solar
- poucas interações
- movimentação simples entre corpos orbitais

E evolui para:

- múltiplos sistemas
- guerra interestelar
- expansão galáctica

---

## Informação como vantagem estratégica

O jogador não controla diretamente suas naves.

Ele define intenções:

- mover frota
- explorar
- minerar
- posicionar

A execução é sempre feita pelo servidor.

---

# Loop Central do Jogo

1. Observar sistema
2. Planejar movimento
3. Enviar frota
4. Esperar tempo real passar
5. Reagir a eventos
6. Expandir presença
7. Repetir

---

# Identidade do Universo

O universo é representado como uma malha de:

- sistemas estelares (coordenadas X,Y)
- corpos orbitais (OrbitalBody)
- frotas em trânsito

Tudo existe simultaneamente em tempo real.

---

# Pilares de Design

## 1. Persistência

Nada depende da sessão do jogador.

---

## 2. Simplicidade inicial

O jogo começa com:

- 1 sistema
- movimentação orbital básica
- sem combate complexo
- sem economia avançada

---

## 3. Expansão por milestones

O jogo é construído em etapas claras:

- Sistema solar sandbox
- mineração planetária
- asteroides
- multiplayer galáctico
- combate

---

## 4. Server Authoritative

O cliente nunca decide o resultado de nenhuma ação.

---

# Entidades centrais do universo

O jogo é baseado em quatro conceitos fundamentais:

## OrbitalBody

Qualquer corpo celeste:
- planetas
- estrelas
- asteroides
- regiões orbitais

---

## System

Um conjunto de OrbitalBodies organizados em um sistema estelar.

---

## Fleet

Unidade de ação do jogador.

---

## Movement

Representa deslocamentos no espaço orbital ou inter-sistemas.

---

# Direção de gameplay

O jogo é uma mistura de:

- estratégia em tempo real assíncrona
- logística espacial
- exploração orbital
- controle de rotas

---

# Objetivo do jogador

Expandir sua civilização através de:

- domínio de corpos orbitais
- controle de rotas de viagem
- crescimento de frota
- expansão interestelar

---

# Não objetivos (importante)

O jogo NÃO foca inicialmente em:

- simulação física realista
- gráficos 3D complexos
- combate tático em tempo real
- microgestão de unidades
- economia detalhada

---

# Direção futura

O universo deve evoluir naturalmente para:

- múltiplas galáxias
- conflitos entre civilizações
- economia espacial complexa
- estruturas gigantes (megaestruturas)
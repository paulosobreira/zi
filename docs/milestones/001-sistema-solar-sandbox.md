# Milestone 1 - Sistema Solar Sandbox

## Objetivo

Permitir que um jogador controle uma frota em um Sistema Solar simplificado e realize viagens entre planetas utilizando mecânicas baseadas em órbitas.

O objetivo deste milestone é validar:

* Universo persistente
* Movimentação de frotas
* Cálculo de trajetórias
* Persistência de viagens
* Visualização do sistema solar

---

## Escopo

### Sistema Solar

O jogo inicia com um único sistema:

* Sol
* Mercúrio
* Vênus
* Terra
* Marte
* Cinturão Principal
* Júpiter
* Saturno
* Urano
* Netuno
* Cinturão de Kuiper
* Nuvem de Oort

---

### Escala

O sistema utiliza escala reduzida.

Escala inicial:

1 unidade visual = 1.000.000 km

O objetivo é manter:

* Órbitas reconhecíveis
* Distâncias proporcionais
* Boa visualização em tela

---

### Órbitas

Todos os corpos orbitais utilizam órbitas elípticas simplificadas.

Cada astro possui:

* Semi-eixo maior
* Excentricidade
* Período orbital
* Posição orbital atual

O servidor é responsável por atualizar as posições.

---

### Visualização

Visão superior do plano orbital.

Características:

* Zoom contínuo
* Pan livre
* Sem perspectiva
* Sem sombras
* Sem texturas

Representação visual:

* Sol = círculo
* Planetas = círculos
* Asteroides = pontos
* Órbitas = linhas finas

Os corpos celestes não utilizam cores.

A diferenciação ocorre por:

* Tamanho
* Nome
* Distância orbital

---

## Jogador

Ao conectar:

* Recebe uma frota inicial
* A frota inicia em órbita de um planeta aleatório
* Apenas uma frota existe neste milestone

---

## Frota

Estrutura mínima:

* Identificador
* Proprietário
* Posição atual
* Estado atual

Estados possíveis:

* Em órbita
* Em trânsito
* Estacionada

---

## Navegação

O jogador não controla a nave manualmente.

O jogador informa apenas:

* Destino
* Tipo de inserção orbital

O servidor calcula toda a trajetória.

---

## Tipos de Destino

### Órbita Planetária

Exemplo:

Terra

Resultado:

A frota entra em órbita da Terra.

---

### Anéis Planetários

Exemplo:

Anel de Saturno

Resultado:

A frota permanece estacionada na região dos anéis.

---

### Cinturões de Asteroides

Exemplo:

Cinturão Principal

Resultado:

A frota permanece na região escolhida.

---

### Nuvem de Oort

Destino extremo do sistema.

Utilizada futuramente para mineração.

---

## Interface de Navegação

Entrada simples:

Origem:
Marte

Destino:
Júpiter

Modo:
Órbita

Ao confirmar:

* O servidor calcula a interseção orbital
* Define a rota
* Define o tempo estimado
* Inicia a viagem

---

## Modelo Simplificado de Viagem

O sistema não simula física real.

Utiliza uma aproximação baseada em:

* Distância orbital
* Velocidade da frota
* Penalidade de transferência orbital

Tempo de viagem:

Tempo = Distância / Velocidade

---

## Tempos Desejados

Objetivo de gameplay:

* Planetas vizinhos: 15 a 30 minutos
* Planetas médios: 30 a 90 minutos
* Júpiter e Saturno: 1 a 3 horas
* Urano e Netuno: 3 a 6 horas
* Nuvem de Oort: até 12 horas

O sistema deve transmitir sensação de escala sem tornar os testes lentos.

---

## Persistência

Toda movimentação continua ocorrendo mesmo com o jogador desconectado.

A chegada é calculada pelo servidor.

---

## Critérios de Aceitação

* Jogador conecta
* Recebe uma frota
* Visualiza o sistema solar
* Seleciona destino
* Servidor calcula rota
* Viagem é iniciada
* Viagem continua offline
* Chegada ocorre corretamente
* Estado é persistido após reinício do servidor

---

## Fora de Escopo

* Combate
* Recursos
* Mineração
* Lander
* Asteroides jogáveis
* Tecnologia
* Colonização
* Múltiplos jogadores
* Diplomacia
* Economia

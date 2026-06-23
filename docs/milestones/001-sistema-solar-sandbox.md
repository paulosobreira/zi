# Representação Espacial

## Visão Geral

O Sistema Solar é a área jogável do Milestone 1.

O jogador observa o sistema em uma visão superior (top-down).

Não existe:

* perspectiva
* rotação de câmera
* inclinação do plano orbital

Todo o sistema é visualizado perpendicularmente ao plano orbital.

---

# Escala

Escala inicial alvo:

1 pixel = 1.000.000 km

Esta escala é utilizada para:

* posicionamento orbital
* cálculo de distâncias
* visualização do sistema

A escala poderá ser ajustada futuramente após validação de gameplay.

O objetivo é manter uma relação consistente entre:

* distância visual
* distância simulada
* tempo de viagem

---

# Área da Simulação

O tamanho da sala deve ser calculado dinamicamente.

A sala deve ser grande o suficiente para conter:

* Sol
* todos os planetas
* cinturão principal
* cinturão de Kuiper

com margem adicional para movimentação da câmera.

A área simulada não possui relação com a resolução da tela do jogador.

A viewport representa apenas uma janela sobre o universo.

---

## Cálculo do Tamanho da Sala

```
distância máxima = semiMajorAxis × (1 + eccentricity) do corpo mais distante
margem          = 0.25 (25%)
roomSize        = Math.ceil((distância máxima × (1 + margem)) × 2)
```

Exemplo:

```
Netuno afélio = 4495 × 1.01           ≈ 4540 px
Kuiper belt   ≈ 7000 px (corpo mais distante)
roomSize      = ceil((7000 × 1.25) × 2) = 17500 px
→ arredondar para 18000 × 18000
```

centro da sala: (roomSize / 2, roomSize / 2)

---

# Centro do Sistema

O Sol deve permanecer no centro geométrico da sala.

O Sol não deve utilizar a coordenada (0,0).

Exemplo:

Sala:

16000 x 16000 pixels

Centro:

(8000,8000)

Posição do Sol:

(8000,8000)

Todas as órbitas devem ser calculadas a partir desta posição.

---

# Sistema Solar Inicial

O Milestone 1 deve conter:

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

A Nuvem de Oort Ou borda dos sitema solar não sera considerada.

---

# Tabela de Dados do Sistema Solar

Escala: 1 pixel = 1.000.000 km

| Corpo | semiMajorAxis (px) | Excentricidade | Período (dias) | size (px) | Cor |
|---|---|---|---|---|---|
| Sol | centro | 0 | — | 40 | #FFD700 |
| Mercúrio | 57,9 | 0,205 | 88 | 5 | #B5B5B5 |
| Vênus | 108,2 | 0,007 | 225 | 8 | #E6B87D |
| Terra | 149,6 | 0,017 | 365 | 8 | #4B7BE5 |
| Marte | 227,9 | 0,093 | 687 | 6 | #E27B58 |
| Júpiter | 778,5 | 0,049 | 4.333 | 12 | #D4A574 |
| Saturno | 1.434 | 0,057 | 10.759 | 10 | #E8D5A3 |
| Urano | 2.871 | 0,046 | 30.687 | 8 | #73B1B7 |
| Netuno | 4.495 | 0,010 | 60.190 | 7 | #3E54E8 |

Cinturão Principal: raio interno ~300px, raio externo ~500px
Cinturão de Kuiper: raio interno ~4.500px, raio externo ~7.000px

Os períodos reais serão acelerados no tick engine (fator ~1000x) para tornar o movimento perceptível visualmente.

---

# Órbitas

Todas as órbitas devem ser elípticas.

Cada OrbitalBody possui:

* semi-eixo maior
* excentricidade
* período orbital
* fase orbital

As órbitas devem ser desenhadas permanentemente.

Os corpos orbitais devem se mover continuamente durante a simulação.

A posição visual deve corresponder à posição calculada pelo servidor.

---

# Simulação Orbital

O sistema nunca permanece estático.

Mesmo sem interação do jogador:

* planetas continuam orbitando
* posições continuam sendo atualizadas
* a visualização permanece viva

O movimento orbital pode ser acelerado em relação ao tempo real para melhorar a percepção visual.

---

# Frota Inicial

Ao iniciar uma nova sessão:

* uma frota é criada
* a frota inicia orbitando um OrbitalBody aleatório do tipo PLANET

Estado inicial:

ORBIT

---

# Órbita da Frota

Quando em órbita:

* a frota acompanha a posição do planeta
* a frota realiza uma pequena órbita visual ao redor do planeta

A órbita da frota não precisa utilizar física real.

O objetivo é apenas demonstrar visualmente que ela está estacionada naquele corpo orbital.

---

# Navegação

O jogador seleciona um destino clicando diretamente sobre um OrbitalBody.

Exemplos:

* Marte
* Júpiter
* Saturno
* Cinturão Principal
* Cinturão de Kuiper

---

# Menu de Contexto

Ao clicar em um OrbitalBody deve ser exibido um menu contextual.

Opções iniciais:

* Viajar para órbita
* Cancelar

---

# Transferência Orbital

Ao confirmar a viagem:

o servidor cria um Movement.

Durante a viagem:

* a frota permanece visível
* a trajetória é desenhada
* a animação demonstra claramente a mudança orbital

Não é necessário utilizar mecânica orbital real.

Uma curva de transferência simplificada é suficiente.

O jogador deve conseguir acompanhar visualmente toda a movimentação.

---

## Mecânica de Viagem

```
Fleet speed: 20 pixels / tick (20 px/s em tempo real)

Cálculo de travelTime:
  distance    = distância linear entre origem e destino (em pixels)
  travelTime  = distance / fleetSpeed  (em ticks)

Animação da trajetória:
  - A frota move-se em linha reta da posição orbital de origem
    até a posição orbital do destino (ambos se movem durante a viagem)
  - A cada tick, a posição da frota é interpolada linearmente:
    progresso    = (tickAtual - departureTime) / (arrivalTime - departureTime)
    posFrota     = lerp(posOrigem(t), posDestino(t), progresso)
  - Uma linha de trajetória é desenhada do ponto de origem ao destino

Ao chegar:
  - Fleet.state = ORBIT
  - Fleet.locationId = destinationId
  - Servidor emite evento FLEET_ARRIVED para o cliente
```

---

# Câmera

A câmera deve suportar:

* zoom com scroll do mouse
* pan com botão direito
* pan com botão do meio

A câmera pode navegar livremente pela sala.

---

## Comportamento do Zoom

```
minScale      = 0.1   (vê o sistema inteiro)
maxScale      = 8.0   (vê detalhes de um planeta)
defaultScale  = calculado para caber o sistema na viewport
incremento    = 10% por passo do scroll
```

O zoom deve ser centrado na posição atual do mouse (zoom to cursor).

---

## Comportamento do Pan

```
botão direito  → arrasta a viewport
botão do meio  → arrasta a viewport (alternativo)
scroll + Ctrl  → mesmo que botão do meio
sem limites    → a câmera pode navegar além da sala
```

---

# Centralizar Frota

A interface deve possuir um botão permanente:

Centralizar Frota

Ao clicar:

* a câmera centraliza na posição atual da frota
* o nível de zoom é preservado
* animação suave de transição (ex: 300ms ease-out)

---

# Renderização

Representação mínima:

* Sol → círculo
* Planetas → círculos
* Frota → triângulo
* Órbitas → linhas elípticas
* Cinturões → anéis pontilhados

Sem texturas, sombras, iluminação, ou efeitos visuais complexos.

Exceção: glow sutil no Sol (círculo com gradiente radial + blur).

---

# Identidade Visual

## Paleta de Cores

| Elemento | Cor | Descrição |
|---|---|---|
| Fundo | #0A0A1A | Azul marinho escuro (espaço) |
| Órbitas | #2A2A4A | Elipses das trajetórias |
| Trajetória da frota | #00FF88 | Linha de viagem ativa |
| Sol | #FFD700 | Dourado com efeito glow |
| Mercúrio | #B5B5B5 | Cinza |
| Vênus | #E6B87D | Amarelo pastel |
| Terra | #4B7BE5 | Azul |
| Marte | #E27B58 | Vermelho alaranjado |
| Júpiter | #D4A574 | Ocre |
| Saturno | #E8D5A3 | Bege |
| Urano | #73B1B7 | Ciano |
| Netuno | #3E54E8 | Azul escuro |
| Cinturões | #8B7355 | Marrom claro |
| Frota (jogador) | #00FF88 | Triângulo verde neon |

## Tamanhos dos Corpos

| Corpo | Raio visual (px) |
|---|---|
| Sol | 40 |
| Mercúrio | 5 |
| Vênus | 8 |
| Terra | 8 |
| Marte | 6 |
| Júpiter | 12 |
| Saturno | 10 |
| Urano | 8 |
| Netuno | 7 |

## Frota

Triângulo equilátero com 4px de lado, cor #00FF88.

---

# Critérios de Aceitação Visuais

Ao iniciar o jogo deve ser possível:

* visualizar todas as órbitas
* visualizar planetas se movendo
* visualizar a frota orbitando
* navegar pelo sistema usando zoom e pan
* selecionar um destino
* iniciar uma viagem
* acompanhar a transferência orbital
* centralizar a câmera na frota

O sistema deve transmitir a sensação de estar observando um Sistema Solar vivo em escala reduzida.

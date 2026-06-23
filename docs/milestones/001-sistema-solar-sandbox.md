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

A Nuvem de Oort poderá ser adicionada posteriormente.

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

# Câmera

A câmera deve suportar:

* zoom com scroll do mouse
* pan com botão direito
* pan com botão do meio

A câmera pode navegar livremente pela sala.

---

# Centralizar Frota

A interface deve possuir um botão permanente:

Centralizar Frota

Ao clicar:

* a câmera centraliza na posição atual da frota
* o nível de zoom é preservado

---

# Renderização

Representação mínima:

* Sol → círculo
* Planetas → círculos
* Frota → triângulo
* Órbitas → linhas elípticas
* Cinturões → anéis pontilhados

Sem:

* texturas
* sombras
* iluminação
* efeitos visuais complexos

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

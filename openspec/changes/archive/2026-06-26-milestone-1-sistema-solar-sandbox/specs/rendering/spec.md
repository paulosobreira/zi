## ADDED Requirements

### Requirement: Camadas de renderização
O renderer SHALL usar PixiJS 7 com as seguintes camadas dentro do container da câmera, nesta ordem:
1. `orbitLayer` — órbitas elípticas, trajetórias de movimento
2. `bodyLayer` — corpos celestes
3. `ringLayer` — partículas de cinturões e anéis
4. `fleetLayer` — triângulos de frotas

#### Scenario: Frota acima dos planetas
- **WHEN** a frota e um planeta estão na mesma posição
- **THEN** o triângulo da frota SHALL ser renderizado acima do círculo do planeta

### Requirement: Representação dos corpos
- Sol: círculo preenchido `#FFD700`, raio 28px
- Planetas: círculos preenchidos com cor da tabela de dados
- Frota: triângulo `(0,-3), (2.6,2), (-2.6,2)` (apontando para cima), cor `#00FF88`
- Órbitas: linhas elípticas `lineStyle(1.5, #2A2A4A, 0.5)`
- Trajetória ativa: curva Bézier `lineStyle(1.5, #00FF88, 0.8)`
- Fundo: `#0A0A1A`

#### Scenario: Planetas visíveis
- **WHEN** o jogador visualiza o sistema em qualquer zoom válido
- **THEN** todos os planetas SHALL ser representados por círculos com suas cores definidas

### Requirement: Partículas de cinturões (3 modos por zoom)
Cada cinturão SHALL ter partículas animadas com modo selecionado por `camera.state.scale`:

**Modo DOT** (`scale < 1.0`): `drawRect` de 1px sólido, tamanho `max(1, 1.5/scale)`, alpha 1
**Modo PIXEL** (`1.0 ≤ scale < 5.0`): cluster de grãos, `grainCount = 2 + floor((scale-1.0)×3)`, com rotação orbital
**Modo ARCADE** (`scale ≥ 5.0`): polígono irregular 6–9 vértices, `lineStyle(0.6, color, alpha)`, com deriva e rotação própria

Contagens: Cinturão Principal 200 partículas, Cinturão de Kuiper 400 partículas. Partículas sempre visíveis (sem LOD por zoom).

Velocidade angular: `angularSpeed = 0.00005 rad/frame`, direção anti-horária, ativa apenas em `scale ≥ 1.0`.

#### Scenario: Transição de modo
- **WHEN** o usuário faz zoom in de `scale = 0.8` para `scale = 1.2`
- **THEN** as partículas do cinturão SHALL mudar do modo DOT para PIXEL

#### Scenario: Modo ARCADE com deriva
- **WHEN** `scale ≥ 5.0`
- **THEN** cada partícula SHALL ser um polígono outline que rotaciona e deriva lentamente; partículas que saem dos limites do cinturão SHALL ser reposicionadas

### Requirement: Anéis de Saturno
Os anéis de Saturno SHALL ser renderizados como 14 bandas elípticas concêntricas com 160 partículas cada (2240 total):
- Raio: de `1.14 × saturn.size` a `2.23 × saturn.size`
- Excentricidade variável: `0.15 + |t - 0.5| × 0.70` por banda
- Cor: `#C8B896`, partículas estáticas (sem animação)
- Container independente reposicionado manualmente a cada frame para `(saturn.worldX, saturn.worldY)`

#### Scenario: Anéis acompanham Saturno
- **WHEN** Saturno se move em sua órbita
- **THEN** o container dos anéis SHALL ser reposicionado a cada frame, mantendo alinhamento

#### Scenario: Anéis sempre visíveis
- **WHEN** o zoom é qualquer valor válido (`0.1` a `8.0`)
- **THEN** os anéis de Saturno SHALL ser visíveis (sem LOD por zoom)

### Requirement: Nameplates em screen space
Cada planeta e cinturão SHALL ter um rótulo de nome renderizado fora do container da câmera (`app.stage`), com tamanho fixo independente do zoom. Posição convertida mundo→tela a cada frame:

```
sx = worldX × scale + cameraX
sy = worldY × scale + cameraY + body.size × scale + 4
```

Fonte: monospace 10px, cor `#CCCCCC` com stroke preto.

#### Scenario: Nameplate não encolhe no zoom out
- **WHEN** o usuário faz zoom out
- **THEN** o tamanho do texto dos nameplates SHALL permanecer constante na tela

### Requirement: Animação a 60fps via ticker
O redraw completo SHALL rodar no ticker do PixiJS a 60fps. `STATE_UPDATE` (1/s) atualiza apenas dados, não dispara redraw diretamente.

#### Scenario: Animação contínua
- **WHEN** o ticker do PixiJS dispara a cada frame
- **THEN** órbitas, corpos, trajetória e frota SHALL ser redesenhados com posições atualizadas

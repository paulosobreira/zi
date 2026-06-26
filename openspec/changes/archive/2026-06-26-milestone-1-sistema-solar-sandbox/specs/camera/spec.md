## ADDED Requirements

### Requirement: Zoom com scroll
A câmera SHALL suportar zoom via scroll do mouse, centrado na posição do cursor (zoom-to-cursor):

```
factor = 1 + 0.1 × step   // step = +1 (up) ou -1 (down)
newScale = clamp(oldScale × factor, 0.1, 8.0)
state.x += worldX × (oldScale - newScale)
state.y += worldY × (oldScale - newScale)
```

Limites: `minScale = 0.1` (sistema inteiro visível), `maxScale = 8.0` (detalhe de planeta).

#### Scenario: Zoom preserva ponto do mundo
- **WHEN** o usuário rola o scroll com cursor sobre um planeta
- **THEN** o planeta SHALL permanecer no mesmo pixel da tela após o zoom

### Requirement: Pan
A câmera SHALL suportar pan via botão direito do mouse e botão do meio. Sem limites — a câmera pode navegar além dos limites da sala.

#### Scenario: Pan com botão direito
- **WHEN** o usuário arrasta com botão direito
- **THEN** a viewport SHALL se deslocar na mesma direção do arrasto

### Requirement: FitSystem
A câmera SHALL ter função `fitSystem()` que centraliza e escala para mostrar o sistema inteiro com 15% de margem:

```
scale = min(screenW / roomSize, screenH / roomSize) × 0.85
state.x = (screenW - roomSize × scale) / 2
state.y = (screenH - roomSize × scale) / 2
```

#### Scenario: Sistema visível ao conectar
- **WHEN** o jogador entra no jogo e `SYSTEM_DATA` é recebido
- **THEN** a câmera SHALL ajustar para mostrar o sistema solar inteiro

### Requirement: CenterOn
A câmera SHALL ter função `centerOn(worldX, worldY)` que define `targetX = -worldX × scale + screenW/2` e `targetY = -worldY × scale + screenH/2`. A câmera SHALL interpolar suavemente (`lerp 15%/frame`) até o target.

#### Scenario: Centralizar na frota
- **WHEN** o usuário clica no botão "Centralizar Frota"
- **THEN** a câmera SHALL deslizar suavemente até centralizar na posição da frota

# Context Menu Spec

## Purpose

Define o comportamento do menu de contexto HTML sobreposto ao canvas, incluindo detecção de cliques em corpos orbitais, opções condicionais por tipo de corpo e proteções contra fechamento prematuro.

## Requirements

### Requirement: Detecção de clique em corpo orbital
O cliente SHALL detectar cliques convertendo coordenadas da tela para o espaço do mundo via `camera.screenToWorld()` e aplicando hit-tests por tipo:

| Tipo | Condição de acerto |
|---|---|
| STAR | `dist ≤ body.size + 5` (clicável para hit-test, mas sem menu) |
| PLANET | `dist ≤ body.size + 15` |
| ASTEROID_BELT | `innerRadius ≤ dist ≤ outerRadius` |
| RING_SYSTEM | Não clicável (ignorado) |

#### Scenario: Clique em planeta pequeno
- **WHEN** o usuário clica a até 15px além do raio de um planeta
- **THEN** o planeta SHALL ser selecionado (raio de hit maior que raio visual compensa escala pequena)

### Requirement: Menu de contexto HTML
O menu de contexto SHALL ser implementado como overlay HTML (`<div id="contextMenu">`) sobreposto ao canvas PixiJS. Posicionado nas coordenadas do clique, ajustado automaticamente para não ultrapassar a borda da viewport.

#### Scenario: Menu visível após clique
- **WHEN** o usuário clica em um planeta ou cinturão
- **THEN** o menu contextual SHALL aparecer próximo ao ponto do clique, sem sair da tela

### Requirement: Opções condicionais por tipo e estado
As opções do menu SHALL variar conforme o tipo do corpo e o estado da frota:

| Corpo | Frota em outro lugar | Frota já na órbita |
|---|---|---|
| STAR | (sem menu) | (sem menu) |
| PLANET (SOLID) | "Viajar para órbita" | "Minerar planeta" (placeholder) |
| PLANET (GAS, sem anéis) | "Viajar para órbita" | (sem ação extra) |
| PLANET (GAS, com anéis) | "Viajar para órbita" | "Minerar asteroides" (placeholder) |
| ASTEROID_BELT | "Viajar para órbita" | "Iniciar mineração" (placeholder) |
| RING_SYSTEM | (sem menu) | (sem menu) |

Opção "Cancelar" presente em todos os menus com opções.

#### Scenario: Viagem disponível apenas para corpos acessíveis
- **WHEN** a frota está em órbita de Marte e o usuário clica no Sol
- **THEN** nenhum menu SHALL aparecer

### Requirement: Proteção contra auto-fechamento
O menu SHALL usar flag `justShown` com `setTimeout(..., 0)` para evitar que o mesmo evento que abre o menu dispare o listener de fechamento via bubbling.

#### Scenario: Menu não fecha imediatamente
- **WHEN** o usuário clica em um planeta para abrir o menu
- **THEN** o menu SHALL permanecer visível até o usuário clicar em uma opção ou fora do menu

### Requirement: Callback salvo antes de hide()
O handler de opção SHALL salvar a referência ao `currentAction` em variável local antes de chamar `hide()`, pois `hide()` define `currentAction = null`.

#### Scenario: Ação executada após fechar menu
- **WHEN** o usuário clica em "Viajar para órbita"
- **THEN** `MOVE_FLEET` SHALL ser enviado ao servidor; o menu SHALL fechar e a ação SHALL ser executada

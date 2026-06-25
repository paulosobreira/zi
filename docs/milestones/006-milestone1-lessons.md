# Milestone 1 — Lições Aprendidas

## Problemas Encontrados e Soluções Aplicadas

---

# 1. Setup / Arquitetura

## 1.1 PixiJS via CDN bloqueado

| | |
|---|---|
| **Sintoma** | Página em branco, console com erro de CORS/rede bloqueada |
| **Causa** | Rede corporativa bloqueava CDN (cdn.jsdelivr.net) |
| **Solução** | Baixar `pixi.mjs` (v7.4.3) para `src/client/lib/` e importar localmente |
| **Prevenção** | Servir todas as dependências localmente desde o início; evitar CDN em redes corporativas |

## 1.2 Dois servidores (HTTP + WebSocket)

| | |
|---|---|
| **Sintoma** | Conflito de porta ao tentar servir estático e WebSocket no mesmo processo |
| **Causa** | Node.js com `ws` não serve arquivos estáticos nativamente |
| **Solução** | Porta 3000 (Python `http.server`) para estático, porta 3001 (`node --watch`) para WebSocket |
| **Prevenção** | Documentar no README que são dois processos. Usar script `npm run dev:*` para cada um |

## 1.3 Node.js `--watch` e auto-restart

| | |
|---|---|
| **Sintoma** | Servidor não refletia alterações após editar arquivos |
| **Causa** | Desconhecimento do `--watch` nativo do Node.js |
| **Solução** | Usar `node --watch src/server/index.js` no script `dev:server` |
| **Prevenção** | Sempre usar `--watch` em desenvolvimento; ele reinicia o processo ao detectar mudanças nos imports |

---

# 2. Dados do Servidor (SYSTEM_DATA)

## 2.1 `semiMajorAxis` ausente no payload

| | |
|---|---|
| **Sintoma** | Órbitas não eram desenhadas |
| **Causa** | `sendSystemData()` em `wsHandler.js` só enviava `id, name, type, size, color` |
| **Solução** | Adicionar `semiMajorAxis` ao mapeamento em `wsHandler.js:96` |
| **Prevenção** | Mapear todos os campos que o cliente precisa para renderização; não confiar que o cliente tem dados hardcoded |

## 2.2 `eccentricity` ausente no payload

| | |
|---|---|
| **Sintoma** | Planetas fora das órbitas desenhadas (órbita circular vs posição elíptica real) |
| **Causa** | `sendSystemData()` não enviava `eccentricity`; renderizador desenhava `drawCircle` |
| **Solução** | Adicionar `eccentricity` ao payload e trocar `drawCircle` por `drawEllipse` no cliente |
| **Prevenção** | Incluir todos os parâmetros orbitais no `SYSTEM_DATA`; o cliente não deve hardcodar dados do sistema solar |

## 2.3 `centerX` / `centerY` ausentes no payload

| | |
|---|---|
| **Sintoma** | Órbitas desenhadas em (0,0), planetas posicionados em (5700,5700) → tudo desalinhado |
| **Causa** | O servidor calcula posições relativas a `centerX/centerY`, mas o cliente não recebia essas coordenadas |
| **Solução** | Incluir `centerX` e `centerY` no `SYSTEM_DATA`; renderizador usa `centerX/centerY` para centralizar órbitas, cinturões e corpos |
| **Prevenção** | Sempre enviar o referencial espacial (centro do sistema) junto com os dados dos corpos |

---

# 3. Física Orbital

## 3.1 `NaN` para corpos com `orbitalPeriod = 0`

| | |
|---|---|
| **Sintoma** | Sol e cinturões de asteroides com posição `{x: NaN, y: NaN}` no servidor |
| **Causa** | `calculatePosition()` dividia `simulatedTime / (orbitalPeriod * 86400)` → divisão por zero |
| **Solução** | Adicionar early return: se `orbitalPeriod === 0`, retornar `{x: centerX, y: centerY}` |
| **Prevenção** | Tratar divisão por zero em todas as fórmulas físicas; bodies estáticos (estrelas, cinturões) devem ter `orbitalPeriod = 0` e posição fixa no centro |

## 3.2 Centro da elipse com sinal trocado

| | |
|---|---|
| **Sintoma** | Planetas fora da órbita elíptica desenhada |
| **Causa** | `drawEllipse(centerX + a*e, centerY, a, b)` — o centro da elipse estava no lado errado do foco |
| **Solução** | Corrigir para `drawEllipse(centerX - a*e, centerY, a, b)` — o foco (Sol) está em `centerX`, o centro da elipse está em `centerX - a*e` |
| **Prevenção** | Revisar a geometria: o centro da elipse está sempre mais distante do periapsis. O foco fica entre o centro e o periapsis |

---

# 4. Renderização (PixiJS 7)

## 4.1 API PixiJS 7 vs 8

| | |
|---|---|
| **Sintoma** | `fill(...)` ou `circle(...)` não existem; console com `TypeError` |
| **Causa** | PixiJS 7 usa `beginFill/endFill/drawCircle`; PixiJS 8 usa `fill/circle`. Código escrito para a versão errada |
| **Solução** | Usar `beginFill(color)/endFill()` e `drawCircle(x, y, r)` do PixiJS 7 |
| **Prevenção** | Verificar a versão do PixiJS no bundle (`pixi.js - vX.Y.Z`) e consultar a API correta |

## 4.2 `app.view` vs `app.canvas`

| | |
|---|---|
| **Sintoma** | `app.view` retornava `undefined` em alguns contextos |
| **Causa** | PixiJS 7.x pode usar `app.view` ou `app.canvas` dependendo da build |
| **Solução** | Usar `app.view || app.canvas || document.querySelector('#game canvas')` |
| **Prevenção** | Sempre usar fallback triplo para obter o canvas do PixiJS |

## 4.3 `drawEllipse` no PixiJS 7

| | |
|---|---|
| **Sintoma** | (Nenhum erro, mas comportamento incorreto se os parâmetros estiverem errados) |
| **Causa** | PixiJS 7 `drawEllipse(x, y, radiusX, radiusY)` recebe semi-eixos, não diâmetros |
| **Solução** | Confirmar que a API usa `radiusX/radiusY` (semi-eixos) e passar `a` e `b` corretamente |
| **Prevenção** | Verificar a assinatura no bundle ou docs antes de usar |

---

# 5. WebSocket / Estado do Cliente

## 5.1 `onFleetPosition` com closure quebrado

| | |
|---|---|
| **Sintoma** | `camera.centerOn()` nunca era chamado; câmera ficava em (0,0) e nada era visível |
| **Causa** | No objeto retornado por `createRenderer()`, a propriedade `onFleetPosition` era uma cópia do valor inicial (`null`). `renderer.onFleetPosition = fn` setava a propriedade, mas NÃO atualizava a variável local do closure usada dentro de `redraw()` |
| **Solução** | Substituir `onFleetPosition,` (shorthand) por `set onFleetPosition(fn) { onFleetPosition = fn }, get onFleetPosition() { return onFleetPosition }` (getter/setter) |
| **Prevenção** | Ao expor callbacks via objeto retornado de uma factory, sempre usar getter/setter para manter a vinculação com a variável do closure |

## 5.2 `STATE_UPDATE` vs ordem das mensagens

| | |
|---|---|
| **Sintoma** | Nada era desenhado nos primeiros 1-2 segundos após conectar |
| **Causa** | Servidor envia `WELCOME → SYSTEM_DATA → FLEET_DATA` síncrono na conexão, mas `STATE_UPDATE` só chega no primeiro tick (1s depois) |
| **Solução** | Aceitar o delay como comportamento normal (a simulação precisa de 1 tick para calcular posições) |
| **Prevenção** | N/A (delay aceitável). Pode-se adicionar loading screen se necessário |

---

# 6. Animação

## 6.1 Frota seguia linha reta em vez da curva

| | |
|---|---|
| **Sintoma** | Trajetória desenhada como curva bezier, mas triângulo da frota viajava em linha reta |
| **Causa** | Servidor calculava posição da frota com `lerp(posOrigem, posDestino, progresso)` (linear). Cliente desenhava a trajetória com `quadraticCurveTo` (curva) |
| **Solução** | Calcular a posição da frota no cliente usando a mesma bezier da trajetória: `bezierPoint(origem, controlPoint, destino, progresso)` |
| **Prevenção** | A posição visual da frota e a trajetória devem usar a mesma curva; não misturar interpolação linear no servidor com curva no cliente |

## 6.2 Animação a 1fps (apenas nos ticks)

| | |
|---|---|
| **Sintoma** | Frota e planetas saltavam a cada segundo em vez de se mover suavemente |
| **Causa** | `redraw()` só era chamado quando `STATE_UPDATE` chegava (1/segundo) |
| **Solução** | Adicionar ticker do PixiJS (`app.ticker.add(...)`) rodando a 60fps. A cada frame: interpolar posição visual da frota com lerp de 15% em direção ao target. Manter `redraw()` no ticker para renderização contínua |
| **Prevenção** | Usar o ticker do PixiJS para renderização contínua desde o início; usar `STATE_UPDATE` apenas para atualizar targets, não para acionar redraw |

---

# 7. UI / Eventos

## 7.1 Menu de contexto escondido imediatamente

| | |
|---|---|
| **Sintoma** | Menu piscava e sumia antes do usuário conseguir clicar |
| **Causa** | O listener `click` no `document` disparava no mesmo evento que `showMenu()` (bubbling). `showMenu()` setava `display: block`, e o listener do `document` imediatamente setava `display: none` |
| **Solução** | Adicionar flag `justShown = true` em `showMenu()` e `setTimeout(() => justShown = false, 0)`. O listener do `document` checa `if (justShown) return` |
| **Prevenção** | Ao usar menus contextuais com overlay HTML + bubbling de eventos, sempre proteger contra o mesmo evento esconder o menu antes de exibí-lo |

## 7.2 Coordenadas do clique erradas

| | |
|---|---|
| **Sintoma** | Clique não detectava planetas mesmo com menu funcionando |
| **Causa** | `app.view` podia ser inválido; `canvas.getBoundingClientRect()` retornava valores incorretos se o canvas estivesse em estado inconsistente |
| **Solução** | Anexar handler de clique ao `#game` (sempre existe) em vez de `canvas`. Usar `gameEl.getBoundingClientRect()` para converter coordenadas |
| **Prevenção** | Preferir elementos HTML garantidos (`document.getElementById`) a referências do PixiJS para eventos de UI |

## 7.3 Nameplates encolhiam com zoom

| | |
|---|---|
| **Sintoma** | Rótulos dos planetas ficavam ilegíveis ao zoom out |
| **Causa** | `nameplateLayer` era filha do container da câmera (escalado). O texto encolhia junto com o zoom |
| **Solução** | Mover `nameplateLayer` para `app.stage` (fora do container da câmera). Converter posição mundo → tela manualmente: `sx = pos.x * scale.x + container.x`. Sem counter-scale pois o texto já está no espaço de tela |
| **Prevenção** | Elementos de UI que não devem ser afetados pelo zoom devem estar fora do container da câmera, com posição convertida manualmente |

## 7.4 Document listener duplicado

| | |
|---|---|
| **Sintoma** | Menu de contexto nunca aparecia (era escondido por dois listeners) |
| **Causa** | Durante edições, um `document.addEventListener('click', hideMenu)` antigo não foi removido, resultando em dois listeners: um com flag `justShown` e outro sem |
| **Solução** | Remover o listener duplicado |
| **Prevenção** | Ao reescrever blocos de código, verificar listeners antigos que podem ter ficado órfãos |

## 7.5 Callback anulado por hide() antes de ser invocado

| | |
|---|---|
| **Sintoma** | Clicar em "Viajar para órbita" não disparava nenhuma ação; nenhum erro no console |
| **Causa** | O click handler chamava `hide()` antes de verificar `currentAction`. `hide()` faz `currentAction = null` como cleanup. O `if (currentAction)` subsequente avaliava `null` e o callback nunca era invocado |
| **Código problemático** | `hide(); if (currentAction) currentAction(action, body)` |
| **Solução** | Salvar a referência antes de chamar `hide()`: `const savedAction = currentAction; hide(); if (savedAction) savedAction(action, body)` |
| **Prevenção** | Sempre que uma função de cleanup anular uma variável de closure, salvar a referência em variável local antes de chamar o cleanup. O efeito colateral de `hide()` não é óbvio no ponto de chamada |

---

# 8. Melhorias Pós-Correção

## 8.1 Transferência de Hohmann (rota curva)

| | |
|---|---|
| **Descrição** | Substituir linha reta por arco bezier simulando manobra de transferência orbital |
| **Implementação** | `quadraticCurveTo(cpX, cpY, destX, destY)` com ponto de controle calculado a partir do midpoint entre origem e destino, empurrado radialmente para fora do centro |
| **Fórmula do CP** | `mid = (origem + destino) / 2; dir = normalize(mid - center); push = distance(origem, center) * 0.8; cp = mid + dir * push` |

## 8.2 Nameplaces com tamanho fixo

| | |
|---|---|
| **Descrição** | Rótulos dos planetas devem manter tamanho constante na tela independente do zoom |
| **Implementação** | Nameplate layer em `app.stage` (fora do container da câmera). Posição convertida mundo → tela a cada frame. Tamanho da fonte fixo |
| **Fórmula** | `sx = worldX * camera.scale.x + camera.x; sy = worldY * camera.scale.y + camera.y` |

## 8.3 Animação suave da frota

| | |
|---|---|
| **Descrição** | Frota deve se mover fluidamente entre STATE_UPDATEs |
| **Implementação** | Ticker PixiJS a 60fps com lerp de 15%/frame da posição atual para o target |
| **Fórmula** | `vpos.x += (targetX - vpos.x) * 0.15; vpos.y += (targetY - vpos.y) * 0.15` |

---

# 9. Login e Sessão

## 9.1 Overlay vs tela separada

| | |
|---|---|
| **Sintoma** | Fluxo de login precisava bloquear o canvas até conexão estabelecida |
| **Causa** | Login como página separada quebrava a imersão; canvas ficava visível antes do servidor confirmar |
| **Solução** | Overlay HTML (`<div id="loginOverlay">`) em tela cheia (z-index 9999) sobre o canvas. `hideLogin()` chamada apenas ao receber evento `WELCOME` do servidor |
| **Prevenção** | Usar overlay para estados de transição (conectando, carregando); nunca mostrar o canvas antes do jogo estar pronto |

## 9.2 Session ID em localStorage

| | |
|---|---|
| **Sintoma** | Ao recarregar a página, o jogador perdia a frota e o planeta inicial |
| **Causa** | Nenhuma persistência de sessão no cliente |
| **Solução** | Armazenar `sessionId` em `localStorage("zeus_session_id")`. Formato: `"session-" + Date.now() + "-" + Math.random().toString(36).slice(2,8)`. Servidor mantém mapa `sessions: { sessionId → playerId }` em memória. Reconexão envia `HELLO { sessionId, startingBody }` |
| **Prevenção** | Sempre persistir identificador de sessão no cliente para permitir reconexão |

## 9.3 Reconexão automática

| | |
|---|---|
| **Sintoma** | Ao fechar/recarregar o servidor WebSocket, o cliente ficava desconectado para sempre |
| **Causa** | Nenhum mecanismo de reconexão |
| **Solução** | No `onclose` do WebSocket, agendar reconexão com `setTimeout(() => connect(...), 2000)`. A cada tentativa, enviar mesmo sessionId. Servidor reusa playerId se sessão existir |
| **Prevenção** | Sempre implementar reconexão automática em jogos com WebSocket; o servidor pode reiniciar |

## 9.4 Sessão existente vs nova

| | |
|---|---|
| **Sintoma** | Jogador retornando via localStorage via mesma tela de "escolher planeta" |
| **Causa** | O fluxo de login não distinguia sessão nova de retorno |
| **Solução** | Se `localStorage` tem sessionId: overlay mostra "Reconectando...", esconde `<select>`, desabilita botão, envia `startingBody: null`. Se não: mostra seletor de planeta, habilita botão |
| **Prevenção** | Tratar os dois caminhos (novo jogador vs retorno) como fluxos separados na UI |

---

# 10. Partículas Progressivas (Zoom-based)

## 10.1 Três modos de renderização

| | |
|---|---|
| **Sintoma** | Partículas de cinturão com alpha fixo ficavam ruins em certos zooms: no zoom out pareciam borrão, no zoom in pareciam pontos sem forma |
| **Causa** | Um único estilo de partícula para todos os níveis de zoom |
| **Solução** | Três modos selecionados por `camera.state.scale`: **dot** (<1.0), **pixel** (1.0–5.0), **arcade** (≥5.0). Cada frame verifica o modo atual e reconstrói a partícula se houve mudança |
| **Prevenção** | Partículas com zoom progressivo: quanto mais zoom, mais detalhe. Usar thresholds de escala para alternar modos |

## 10.2 Modo dot: `drawRect` sólido

| | |
|---|---|
| **Sintoma** | No zoom out, partículas com `drawCircle` + alpha ficavam desaparecendo ou muito transparentes |
| **Causa** | `drawCircle` com alpha baixo + antialiasing torna partículas quase invisíveis em escala reduzida |
| **Solução** | Usar `drawRect` de 1px com alpha 1 (sólido). Tamanho: `max(1, 1.5 / scale)`. Muda de círculo para retângulo pixel-perfeito |
| **Prevenção** | Em escalas muito pequenas, usar geometria pixel-perfeita (retângulos 1x1) em vez de círculos com alpha |

## 10.3 Modo pixel: grãos crescentes

| | |
|---|---|
| **Descrição** | Entre scale 1.0 e 5.0, cada partícula se transforma em um cluster de pontos (grãos) que cresce com o zoom |
| **Implementação** | `grainCount = 2 + floor((scale - 1.0) * 3)` pontos por partícula. Cada grão com posição, tamanho e alpha sorteados |
| **Efeito** | Cinturão parece granulado, como poeira espacial. Mais zoom = mais grãos visíveis |

## 10.4 Modo arcade: polígonos com deriva

| | |
|---|---|
| **Descrição** | Em scale ≥5.0, cada partícula vira um polígono irregular outline (6–9 vértices) que deriva e rotaciona lentamente |
| **Implementação** | `lineStyle(0.6, color, alpha)` — apenas borda, sem preenchimento. Gera vértices aleatórios em torno de (0,0) com raio 0.5–2px. Velocidade de deriva: `vx, vy ∈ [0.01, 0.05]` px/frame (muito lento). Rotação: `rotSpeed ≈ 0.00005` rad/frame |
| **Efeito** | Asteroides clássicos de arcade, flutuando suavemente. Partículas que saem dos limites do cinturão são reposicionadas na borda |

## 10.5 Velocidade angular reduzida

| | |
|---|---|
| **Sintoma** | Cinturão girava muito rápido, parecendo um disco sólido |
| **Causa** | `angularSpeed = 0.0002 rad/ms` (~31s por volta) |
| **Solução** | Reduzir para `0.00005 rad/frame` (~84s por volta a 60fps). A rotação orbital é ativada apenas quando `scale ≥ 1.0` |
| **Prevenção** | Ajustar velocidades orbitais com base na percepção visual, não em valores teóricos |

## 10.6 Sem LOD por zoom

| | |
|---|---|
| **Decisão** | Diferente do spec original, as partículas de cinturão e anéis são **sempre visíveis** em qualquer nível de zoom. A variação visual vem dos modos de renderização, não da visibilidade |
| **Motivo** | Desaparecimento de partículas ao zoom out quebrava a sensação de "cinturão". Melhor mostrar partículas simplificadas (modo dot) do que escondê-las |

---

# 11. Anéis de Saturno

## 11.1 Bandas elípticas (não partículas simples)

| | |
|---|---|
| **Sintoma** | Anéis de Saturno com ~40 partículas circulares pareciam um punhado de pontos, não anéis |
| **Causa** | Spec original: ~40 partículas, 1-2px, alpha 0.2-0.6 |
| **Solução** | 14 bandas concêntricas, 160 partículas cada (2240 total). De `1.14 × size` a `2.23 × size`. Partículas em formação elíptica. Excentricidade variável: `0.15 + |t - 0.5| × 0.70` (centro + circular, bordas + elípticas) |
| **Efeito** | Anéis densos e detalhados, visualmente próximos dos anéis reais de Saturno |

## 11.2 Container independente

| | |
|---|---|
| **Sintoma** | Anéis tremiam ou desalinhavam ao mover câmera quando filhos de Saturno |
| **Causa** | Container filho do container de Saturno dentro do container da câmera; transformações acumuladas causavam imprecisão |
| **Solução** | Container de anéis é filho direto de `ringLayer` (dentro do container da câmera, mesmo nível das partículas de cinturão). Reposicionado manualmente a cada frame para `(saturn.worldX, saturn.worldY)` |
| **Prevenção** | Evitar hierarquia profunda de containers PIXI para objetos que precisam de posição precisa; reposicionar manualmente |

## 11.3 Partículas estáticas

| | |
|---|---|
| **Decisão** | Anéis de Saturno NÃO animam (sem rotação orbital, sem deriva). São estáticos em relação ao centro do planeta |
| **Motivo** | Rotação dos anéis não era perceptível e consumia CPU desnecessariamente para 2240 partículas |
| **Efeito** | Anéis fixos, mas acompanham Saturno na órbita. Visualmente corretos |

## 11.4 Sem LOD

| | |
|---|---|
| **Decisão** | Anéis sempre visíveis em qualquer zoom (diferente do spec original que escondia em scale < 3.0) |
| **Motivo** | Consistência visual; zoom out não deve esconder anéis |

---

# 12. Frotas e Física Orbital

## 12.1 Órbita local em planetas

| | |
|---|---|
| **Descoberta** | A frota precisa orbitar o planeta localmente, não apenas ficar parada na posição do planeta |
| **Implementação** | `angle = fleet.orbitPhase + (simulatedTime / fleet.orbitPeriod) * 2π`. `orbitRadius = body.size + 5`. `orbitPeriod = 15000 ms` (fixo, não vinculado ao período orbital do planeta). Cálculo no servidor e **também no cliente a cada frame** via extrapolação local de simulatedTime |
| **Efeito** | Frota circula o planeta a cada 15s, visível e dinâmica |

## 12.2 Órbita em cinturão (coordenada fixa)

| | |
|---|---|
| **Decisão** | Diferente do spec, a frota em cinturão NÃO usa fórmula orbital. Armazena `orbitX`/`orbitY` fixos, calculados na chegada: `anguloChegada = atan2(arrivalY - centerY, arrivalX - centerX)`, `orbitX = centerX + cos(angulo) × midRadius` |
| **Motivo** | Cinturão não tem órbita própria (é estático); a frota "estaciona" no ponto de chegada |

## 12.3 arrivalPosition para cinturão

| | |
|---|---|
| **Implementação** | Cliente envia `arrivalPosition: { x, y }` com MOVE_FLEET para cinturão. Servidor projeta no raio médio: `angle = atan2(y - centerY, x - centerX)`, `destX = centerX + cos(angle) × midRadius` |
| **Efeito** | Frota viaja para o ponto onde o jogador clicou (projetado no cinturão) |

## 12.4 Período de órbita em cinturão

| | |
|---|---|
| **Observação** | O campo `orbitPeriod` para cinturão é definido como 687 (Principal) e 60190 (Kuiper) — herdado do planeta mais próximo. Não é usado para movimento (posição é fixa), mas armazenado por consistência |

---

# 13. Ajustes de Renderização

## 13.1 Sun size: 40 → 28

| | |
|---|---|
| **Sintoma** | Sol era desproporcionalmente grande comparado aos planetas (40px vs max 12px) |
| **Solução** | Reduzir para 28px (70% do original). Ajuste em `solarSystemData.js` |
| **Efeito** | Sol ainda domina visualmente, mas sem esmagar os planetas |

## 13.2 Sun glow removido

| | |
|---|---|
| **Sintoma** | BlurFilter no Sol causava queda de performance em zoom out e artefatos visuais |
| **Solução** | Remover BlurFilter. Sol é apenas um círculo preenchido `#FFD700` |
| **Efeito** | Performance ganha, visual mais limpo |

## 13.3 Belt como linha circular (sem filled ring)

| | |
|---|---|
| **Decisão** | Spec original: `beginFill(alpha 0.03)` + `beginHole`/`endHole`. Implementado como: `lineStyle(1.5, color, 0.3)` + `drawCircle(centerX, centerY, midRadius)` |
| **Motivo** | Filled ring com alpha 0.03 era quase invisível; beginHole adicionava complexidade sem benefício visual. Linha circular sutil + partículas densas é mais limpo |
| **Efeito** | Cinturão visível como um anel fino + nuvem de partículas |

## 13.4 lineStyle do arcade: 0.6

| | |
|---|---|
| **Ajuste** | Arcade mode `lineStyle(0.6, color, alpha)` — metade do valor original (1.2) |
| **Motivo** | Polígonos outline com lineStyle 1.2 pareciam grossos demais; 0.6 dá aspecto de asteroides clássicos |

## 13.5 Bezier push factor: 0.8

| | |
|---|---|
| **Ajuste** | Push factor do ponto de controle bezier: 0.8 (vs 0.4 original) |
| **Efeito** | Curva de transferência mais pronunciada, visualmente clara mesmo em viagens curtas |

## 13.6 Fleet triangle: 6×5.2px

| | |
|---|---|
| **Vertices** | `moveTo(0, -3), lineTo(2.6, 2), lineTo(-2.6, 2)` |
| **Efeito** | Triângulo apontando para cima, visível em qualquer zoom |

---

# 14. UI/UX e Interação

## 14.1 Botão Logoff

| | |
|---|---|
| **Implementação** | Botão `#btnLogoff` na `#btnBar` ao lado de Centralizar Frota. Cor vermelha `#FF4444`. Ação: `localStorage.removeItem("zeus_session_id")`, `ws.close()`, `location.reload()` |
| **Efeito** | Jogador pode forçar nova sessão. Servidor mantém sessão órfã em memória |

## 14.2 Raio de hit detection

| | |
|---|---|
| **Ajuste** | Planetas: `body.size + 15`. Estrela: `body.size + 5`. Cinturão: teste de região anular |
| **Motivo** | Planetas são pequenos (5-12px); `size + 15` dá área de clique confortável. Estrela é grande (28px), precisa de menos margem |

## 14.3 Zoom to cursor

| | |
|---|---|
| **Fórmula** | `newScale = clamp(scale * factor, 0.1, 8.0)`; `state.x += worldX * (oldScale - newScale)`; mesmo para y. `factor = 1 + 0.1 × step` |
| **Efeito** | Ponto do mundo sob o cursor permanece no mesmo pixel da tela após o zoom |

## 14.4 FitSystem com margem

| | |
|---|---|
| **Fórmula** | `scale = min(screenW / worldW, screenH / worldH) * 0.85`. `state.x = (screenW - worldW * scale) / 2` |
| **Efeito** | Sistema solar centralizado na viewport com 15% de margem nas bordas |

## 14.5 Center on fleet

| | |
|---|---|
| **Implementação** | `camera.centerOn(fx, fy)` define `targetX = -fx * scale + screenW/2`, `targetY = -fy * scale + screenH/2`. Câmera lerp 0.15/frame em direção ao target |
| **Efeito** | Transição suave ao centralizar na frota |

## 14.6 Nameplate offset dinâmico

| | |
|---|---|
| **Fórmula** | `nameplate.y = screenY + body.size * camera.state.scale + 4` |
| **Motivo** | O offset precisa escalar com o zoom para que o rótulo acompanhe a borda do círculo do planeta |

## 14.7 RoomSize e centro

| | |
|---|---|
| **Cálculo** | `maxDist = max(Kuiper.outerRadius(7000), planetas no afélio)`. `roomSize = ceil(7000 * 1.25 * 2) = 17500`. Centro em `(8750, 8750)` |
| **Configuração** | `solarSystemData.js` define MARGIN=0.25, sala 17500×17500 |

## 14.8 Botão Centralizar Frota com lerp

| | |
|---|---|
| **Observação** | O botão usa `camera.centerOn()` com interpolação (lerp 0.15/frame), não animação CSS ou tweens. A câmera desliza suavemente até a frota |

---

# 15. Animação Contínua (Eliminação da Paradinha)

## 15.1 Problema: alvo da frota congelado entre STATE_UPDATEs

| | |
|---|---|
| **Sintoma** | Frota em órbita ou viagem apresentava micro-paradinhas a cada ~1s, mesmo com lerp de 15%/frame |
| **Causa** | O alvo (`targetX/targetY`) do lerp só era atualizado quando chegava um STATE_UPDATE (1/s). Entre ticks, o alvo ficava congelado na última posição. Ao chegar o próximo STATE_UPDATE, o alvo saltava para uma nova posição, e o lerp recomeçava a perseguição — criando um ciclo de "congela-salta-corre" |
| **Solução** | Calcular a posição exata da frota no cliente a cada frame do ticker, usando `simulatedTime` extrapolado localmente. O alvo do lerp deixa de ser o `STATE_UPDATE` e passa a ser o cálculo local contínuo |
| **Prevenção** | Para animações que dependem de tempo simulado determinístico (órbitas, trajetórias bezier), calcular a posição no cliente a cada frame e usar o servidor apenas para sincronia periódica |

## 15.2 Extrapolação local de simulatedTime

| | |
|---|---|
| **Implementação** | No `applyStateUpdate`: armazenar `lastSimulatedTime = payload.simulatedTime` e `lastWallTime = performance.now()`. No ticker: `currentSimulatedTime = lastSimulatedTime + (performance.now() - lastWallTime)`. Como `simulatedTime` avança 1000 por segundo real, a extrapolação local mantém sincronia com o servidor |
| **Resync** | A cada STATE_UPDATE (1/s), `lastSimulatedTime` e `lastWallTime` são reajustados, eliminando qualquer deriva acumulada |

## 15.3 Cálculo de posição exata a cada frame

| | |
|---|---|
| **ORBIT em planeta** | `angle = extra.orbitPhase + (simTime / extra.orbitPeriod) * 2π; fx = planetPos.x + cos(angle) * extra.orbitRadius; fy = planetPos.y + sin(angle) * extra.orbitRadius` — mesmo cálculo do servidor, mas rodando a 60fps |
| **ORBIT em cinturão** | Posição fixa (`extra.orbitX/orbitY`) — sem animação necessária |
| **TRAVEL** | `progress = clamp((simTime - mov.departureTime) / (mov.arrivalTime - mov.departureTime), 0, 1)`; `pt = bezierPoint(origin, cp, dest, progress)` — trajetória contínua |
| **Dados necessários** | Fleet `orbitRadius/orbitPeriod/orbitPhase` enviados no STATE_UPDATE; `originX/originY/destX/destY/departureTime/arrivalTime` dos movimentos — ambos já disponíveis no cliente |

## 15.4 Parâmetros de velocidade ajustados

| | |
|---|---|
| **orbitPeriod** | 5000 → **15000** ms (3× mais lento). Ângulo por tick: de 72°/tick → 24°/tick. O lerp de 15%/frame agora acompanha suavemente |
| **fleetSpeed** | 20 → **6** pixels/1000 simulatedTime (~3.3× mais lento). Travessia Terra-Marte: de ~5s → ~16s. Progresso bezier por tick: de ~20% → ~6% |
| **Efeito combinado** | Animações visivelmente mais suaves e naturais. A redução de velocidade combinada com o cálculo client-side elimina completamente as paradinhas |

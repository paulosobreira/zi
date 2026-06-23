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

---

# 8. Melhorias Pós-Correção

## 8.1 Transferência de Hohmann (rota curva)

| | |
|---|---|
| **Descrição** | Substituir linha reta por arco bezier simulando manobra de transferência orbital |
| **Implementação** | `quadraticCurveTo(cpX, cpY, destX, destY)` com ponto de controle calculado a partir do midpoint entre origem e destino, empurrado radialmente para fora do centro |
| **Fórmula do CP** | `mid = (origem + destino) / 2; dir = normalize(mid - center); push = distance(origem, center) * 0.4; cp = mid + dir * push` |

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

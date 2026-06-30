## Context

Zeus Interestelar é um jogo multiplayer assíncrono. O milestone 1 (POC) estabelece a arquitetura base: servidor autoritativo, tick engine, simulação orbital e cliente PixiJS 7. Não há banco de dados — estado 100% em memória. A rede corporativa bloqueia CDNs, então todas as dependências são vendorizadas.

## Goals / Non-Goals

**Goals:**
- Servidor autoritativo WebSocket com tick de 1s e simulação orbital contínua
- Cliente PixiJS 7 com animação a 60fps entre STATE_UPDATEs (sem paradinhas)
- Sistema Solar completo: Sol, 8 planetas, 2 cinturões, anéis de Saturno
- Sessão persistida em localStorage com reconexão automática
- Navegação de frota com curva Bézier e menu de contexto

**Non-Goals:**
- Persistência em disco (futuro milestone)
- Múltiplos sistemas estelares
- Combate, mineração funcional ou economia
- Simulação física realista (só elliptic orbit simplificado)
- Testes automatizados, CI/CD ou build step

## Decisions

### 1. Servidor autoritativo + cliente extrapolador

**Decisão**: O servidor roda o tick engine a 1s; o cliente extrapola `simulatedTime` localmente a cada frame para suavizar animações entre ticks.

**Alternativas consideradas**:
- Cliente autoritativo: rejeitado — multiplayer exige server-side truth
- Interpolação entre dois STATE_UPDATEs: rejeitado — introduz 1s de lag perceptível

**Rationale**: Servidor autoritativo garante consistência entre jogadores. A extrapolação local (`lastSimulatedTime + (performance.now() - lastWallTime)`) recalcula posições exatas de órbita e viagem a 60fps usando a mesma fórmula física do servidor, eliminando paradinhas sem adicionar lag.

---

### 2. Física orbital elíptica simplificada

**Decisão**: Posição calculada por `θ = (2π × t / (T × 86400) + φ) mod 2π` com `r = a(1-e²)/(1+e·cosθ)`. Tempo acelerado 1000× (`simulatedTime += 1000` por tick de 1s real).

**Alternativas consideradas**:
- Órbitas circulares: rejeitado — visualmente errado, planetas saíam das órbitas desenhadas
- Física newtoniana completa: rejeitado — overkill para um POC

**Rationale**: A fórmula elíptica parametrizada por tempo produz posições visualmente corretas e é determinística — cliente e servidor chegam ao mesmo valor dado o mesmo `simulatedTime`. O fator 1000× torna órbitas de dias a décadas visíveis na escala de segundos a minutos.

---

### 3. PixiJS 7 vendorizado, sem bundler

**Decisão**: `pixi.mjs` copiado para `public/js/`, importado via ES module nativo. Sem build step.

**Alternativas consideradas**:
- CDN: bloqueado pela rede corporativa
- PixiJS 8: quebra de API (`fill()` vs `beginFill()`); migração desnecessária para POC

**Rationale**: Zero configuração de build. Dois processos (`node --watch` para servidor, `node serve.js` para estático) é o mínimo viável para desenvolvimento iterativo.

---

### 4. Curva Bézier quadrática para viagem de frota

**Decisão**: Trajeto como quadratic Bézier com ponto de controle empurrado radialmente para fora do centro do sistema. Frota segue a **mesma curva** desenhada.

```
mid = (origem + destino) / 2
dir = normalize(mid - center)
push = distance(origem, center) × 0.8
CP = mid + dir × push
```

**Alternativas consideradas**:
- Linha reta: visualmente correto para transferência de Hohmann simplificada, mas sem a sensação de manobra orbital
- Caminho servidor calculado + cliente interpola linear: rejeitado — frota seguia linha reta enquanto trajetória mostrava curva (bug visual)

**Rationale**: A curva evoca uma manobra de transferência orbital sem física real. Push factor 0.8 do raio de origem produz curvas pronunciadas mesmo em viagens curtas.

---

### 5. Partículas com 3 modos de renderização por zoom

**Decisão**: Cinturões alternnam entre DOT (`scale < 1.0`), PIXEL (`1.0 ≤ scale < 5.0`) e ARCADE (`scale ≥ 5.0`).

**Rationale**: Um único estilo de partícula degrada em algum nível de zoom. Modos progressivos garantem leitura visual em zoom out (ponto sólido 1px) e detalhe em zoom in (polígono de asteroide com rotação).

---

### 6. Nameplates fora do container da câmera

**Decisão**: `nameplateLayer` é filho de `app.stage`, não do container da câmera. Posição convertida world→screen manualmente a cada frame.

**Alternativas consideradas**:
- Filho da câmera com counter-scale: rejeitado — complexo e frágil em diferentes ratios de zoom
- HTML overlay: possível, mas sincronizar posição de DOM com canvas é custoso

**Rationale**: Texto em `app.stage` não é afetado pela escala da câmera. Conversão simples `sx = worldX × scale + cameraX` é mais confiável que counter-scale.

---

### 7. Estado de sessão em memória (servidor) + localStorage (cliente)

**Decisão**: Servidor mantém `sessions: { sessionId → playerId }` em memória. Cliente persiste `sessionId` em `localStorage("zeus_session_id")`.

**Rationale**: POC de validação de gameplay. Persistência em disco introduz complexidade (migrations, schema) sem benefício para o milestone. Reconexão automática (retry a cada 2s) garante sobrevivência a reinícios de servidor durante desenvolvimento.

## Risks / Trade-offs

- **Estado em memória** → Reinício do servidor limpa sessões e frotas. Aceitável no POC; milestone 2 ou 3 deve introduzir persistência.
- **Extrapolação de simulatedTime** → Drift acumulado se clock do cliente divergir do servidor. Mitigação: resync a cada STATE_UPDATE (1/s) com `lastSimulatedTime = payload.simulatedTime`.
- **Dois processos no dev** → Fricção no onboarding (dois terminais). Mitigação: documentar claramente no README.
- **2240 partículas nos anéis de Saturno** → Potencial queda de performance em hardware fraco. Modo estático (sem animação) mitiga; LOD por zoom pode ser adicionado se necessário.
- **PixiJS 7 vendorizado** → Atualizações de segurança manuais. Aceitável para POC interno.

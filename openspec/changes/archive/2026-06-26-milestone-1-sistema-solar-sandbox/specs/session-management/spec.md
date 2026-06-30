## ADDED Requirements

### Requirement: Identificador de sessão
O cliente SHALL gerar e persistir um `sessionId` único em `localStorage("zeus_session_id")` no formato `"session-" + Date.now() + "-" + random(6chars)`.

#### Scenario: Primeira conexão
- **WHEN** não existe `sessionId` no localStorage
- **THEN** o cliente SHALL gerar um novo `sessionId`, armazená-lo e exibir o seletor de planeta inicial

#### Scenario: Reconexão
- **WHEN** existe `sessionId` no localStorage
- **THEN** o cliente SHALL pular o seletor e reconectar com o mesmo `sessionId`

### Requirement: Mapeamento servidor
O servidor SHALL manter `sessions: { sessionId → playerId }`. Se o `sessionId` já existe, a sessão é reutilizada e a frota é retomada. Se não existe, uma nova sessão e frota são criadas.

#### Scenario: Sessão existente
- **WHEN** servidor recebe `HELLO { sessionId }` com sessão já mapeada
- **THEN** SHALL retomar a sessão existente, sem criar nova frota

### Requirement: Reconexão automática
O cliente SHALL tentar reconectar a cada 2 segundos após fechamento do WebSocket, enviando o mesmo `sessionId`.

#### Scenario: Queda de conexão
- **WHEN** o WebSocket fecha (`onclose`)
- **THEN** o cliente SHALL agendar `setTimeout(() => connect(sessionId, startingBody), 2000)`

### Requirement: Logoff
O botão Logoff SHALL remover o `sessionId` do localStorage, fechar o WebSocket e recarregar a página. O servidor mantém a sessão órfã em memória.

#### Scenario: Usuário clica Logoff
- **WHEN** o botão `#btnLogoff` é clicado
- **THEN** `localStorage.removeItem("zeus_session_id")`, `ws.close()`, `location.reload()` são executados em sequência

### Requirement: Overlay de login
O overlay de login (#loginOverlay) SHALL permanecer visível até o servidor confirmar `WELCOME`. O canvas não SHALL ser exibido antes do jogo estar pronto.

#### Scenario: Login bem-sucedido
- **WHEN** o cliente recebe `WELCOME` do servidor
- **THEN** `hideLogin()` SHALL ser chamado, escondendo o overlay e revelando o canvas

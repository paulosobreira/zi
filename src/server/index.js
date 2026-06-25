import { WebSocketServer } from 'ws'
import { handleMessage, handleConnect, handleDisconnect } from './wsHandler.js'
import { startTick } from './tickEngine.js'

const PORT = 3001
const wss = new WebSocketServer({ port: PORT })

startTick()

wss.on('connection', (ws) => {
  handleConnect(ws)
  ws.on('message', (raw) => {
    try {
      handleMessage(ws, JSON.parse(raw))
    } catch (e) {
      console.error('Mensagem inválida:', e.message)
    }
  })
  ws.on('close', () => handleDisconnect(ws))
  ws.on('error', (e) => console.error('WebSocket error:', e.message))
})

console.log(`Zeus Interestelar rodando em ws://localhost:${PORT}`)

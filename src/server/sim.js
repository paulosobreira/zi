import { solarSystem } from './solarSystemData.js'

export const sim = {
  sessions: {},
  players: {},
  fleets: {},
  movements: {},
  bodies: {},
  clients: [],
  system: solarSystem,
  simulatedTime: 0,
  tick: 0,
  nextPlayerId: 1
}

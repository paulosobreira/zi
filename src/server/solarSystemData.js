const ROOM_SIZE = 17500
const CENTER_X = ROOM_SIZE / 2
const CENTER_Y = ROOM_SIZE / 2

export const solarSystem = {
  id: 'sol',
  centerX: CENTER_X,
  centerY: CENTER_Y,
  roomSize: ROOM_SIZE,
  orbitalBodies: [
    {
      id: 'sun',
      name: 'Sol',
      type: 'STAR',
      systemId: 'sol',
      semiMajorAxis: 0,
      eccentricity: 0,
      orbitalPeriod: 0,
      orbitalPhase: 0,
      size: 28,
      color: '#FFD700'
    },
    {
      id: 'mercury',
      name: 'Mercúrio',
      type: 'PLANET',
      planetType: 'SOLID',
      systemId: 'sol',
      semiMajorAxis: 57.9,
      eccentricity: 0.205,
      orbitalPeriod: 88,
      orbitalPhase: 0,
      size: 5,
      color: '#B5B5B5'
    },
    {
      id: 'venus',
      name: 'Vênus',
      type: 'PLANET',
      planetType: 'SOLID',
      systemId: 'sol',
      semiMajorAxis: 108.2,
      eccentricity: 0.007,
      orbitalPeriod: 225,
      orbitalPhase: 0.8,
      size: 8,
      color: '#E6B87D'
    },
    {
      id: 'earth',
      name: 'Terra',
      type: 'PLANET',
      planetType: 'SOLID',
      systemId: 'sol',
      semiMajorAxis: 149.6,
      eccentricity: 0.017,
      orbitalPeriod: 365,
      orbitalPhase: 1.6,
      size: 8,
      color: '#4B7BE5'
    },
    {
      id: 'mars',
      name: 'Marte',
      type: 'PLANET',
      planetType: 'SOLID',
      systemId: 'sol',
      semiMajorAxis: 227.9,
      eccentricity: 0.093,
      orbitalPeriod: 687,
      orbitalPhase: 0.25,
      size: 6,
      color: '#E27B58'
    },
    {
      id: 'main-belt',
      name: 'Cinturão Principal',
      type: 'ASTEROID_BELT',
      systemId: 'sol',
      semiMajorAxis: 0,
      eccentricity: 0,
      orbitalPeriod: 0,
      orbitalPhase: 0,
      beltInnerRadius: 300,
      beltOuterRadius: 500,
      size: 0,
      color: '#8B7355'
    },
    {
      id: 'jupiter',
      name: 'Júpiter',
      type: 'PLANET',
      planetType: 'GAS',
      systemId: 'sol',
      semiMajorAxis: 778.5,
      eccentricity: 0.049,
      orbitalPeriod: 4333,
      orbitalPhase: 0.5,
      size: 12,
      color: '#D4A574'
    },
    {
      id: 'saturn',
      name: 'Saturno',
      type: 'PLANET',
      planetType: 'GAS',
      systemId: 'sol',
      semiMajorAxis: 1434,
      eccentricity: 0.057,
      orbitalPeriod: 10759,
      orbitalPhase: 1.2,
      size: 10,
      color: '#E8D5A3'
    },
    {
      id: 'saturn-rings',
      name: 'Anéis de Saturno',
      type: 'RING_SYSTEM',
      parentId: 'saturn',
      systemId: 'sol',
      semiMajorAxis: 0,
      eccentricity: 0,
      orbitalPeriod: 0,
      orbitalPhase: 0,
      size: 18,
      color: '#C8B896'
    },
    {
      id: 'uranus',
      name: 'Urano',
      type: 'PLANET',
      planetType: 'GAS',
      systemId: 'sol',
      semiMajorAxis: 2871,
      eccentricity: 0.046,
      orbitalPeriod: 30687,
      orbitalPhase: 2.1,
      size: 8,
      color: '#73B1B7'
    },
    {
      id: 'neptune',
      name: 'Netuno',
      type: 'PLANET',
      planetType: 'GAS',
      systemId: 'sol',
      semiMajorAxis: 4495,
      eccentricity: 0.010,
      orbitalPeriod: 60190,
      orbitalPhase: 3.5,
      size: 7,
      color: '#3E54E8'
    },
    {
      id: 'kuiper-belt',
      name: 'Cinturão de Kuiper',
      type: 'ASTEROID_BELT',
      systemId: 'sol',
      semiMajorAxis: 0,
      eccentricity: 0,
      orbitalPeriod: 0,
      orbitalPhase: 0,
      beltInnerRadius: 4500,
      beltOuterRadius: 7000,
      size: 0,
      color: '#8B7355'
    }
  ]
}

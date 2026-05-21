export interface WallData {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number]; // Euler angles in radians
  scale: [number, number, number];
  integrity: number; // 0.0 = fully collapsed, 1.0 = intact
}

export interface DebrisSeed {
  id: string;
  center: [number, number, number];
  radius: number;
  density: number; // Number of fragments around this seed
}

export interface FloorData {
  width: number;
  depth: number;
  gridDivisions: number;
}

export interface RoomData {
  walls: WallData[];
  debrisSeeds: DebrisSeed[];
  floor: FloorData;
}

export const roomData: RoomData = {
  floor: {
    width: 12,
    depth: 12,
    gridDivisions: 24,
  },

  walls: [
    // Back wall — partially collapsed
    {
      id: 'wall-back',
      position: [0, 1.5, -5],
      rotation: [0, 0, 0],
      scale: [10, 3.5, 0.15],
      integrity: 0.45,
    },
    // Front wall — heavily damaged
    {
      id: 'wall-front',
      position: [0, 1.2, 5],
      rotation: [0, 0, 0],
      scale: [10, 2.8, 0.15],
      integrity: 0.2,
    },
    // Left wall — largely intact
    {
      id: 'wall-left',
      position: [-5, 1.5, 0],
      rotation: [0, Math.PI / 2, 0],
      scale: [10, 3.5, 0.15],
      integrity: 0.78,
    },
    // Right wall — partial collapse with lean
    {
      id: 'wall-right',
      position: [5, 1.3, 0],
      rotation: [0, Math.PI / 2, 0.06],
      scale: [10, 3.2, 0.15],
      integrity: 0.35,
    },
    // Interior partition wall — mostly destroyed
    {
      id: 'wall-partition',
      position: [1.5, 0.8, 1.5],
      rotation: [0, Math.PI / 4, 0.1],
      scale: [3.5, 1.8, 0.15],
      integrity: 0.18,
    },
    // Ceiling fragment — fallen slab
    {
      id: 'ceiling-slab-1',
      position: [-1, 2.8, -1],
      rotation: [0.2, 0.1, -0.15],
      scale: [4, 0.2, 3],
      integrity: 0.9,
    },
    {
      id: 'ceiling-slab-2',
      position: [2.5, 1.8, 2],
      rotation: [0.4, 0.3, 0.2],
      scale: [2.5, 0.2, 2],
      integrity: 0.85,
    },
  ],

  debrisSeeds: [
    { id: 'debris-front-wall', center: [0, 0, 4], radius: 2.5, density: 120 },
    { id: 'debris-right-wall', center: [4, 0, 0], radius: 2, density: 90 },
    { id: 'debris-partition', center: [1.5, 0, 1.5], radius: 1.5, density: 80 },
    { id: 'debris-center', center: [0, 0, 0], radius: 3, density: 60 },
    { id: 'debris-corner-bl', center: [-4, 0, -3.5], radius: 1.8, density: 70 },
    { id: 'debris-corner-br', center: [4, 0, -4], radius: 1.5, density: 50 },
  ],
};

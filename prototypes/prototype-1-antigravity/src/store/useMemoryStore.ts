import { create } from 'zustand';
import * as THREE from 'three';

interface EXMemoryStore {
  // Reality State
  activeLayer: 'PHYSICAL' | 'PERCEPTIVE' | 'INTERPRETATIVE';
  collectiveEntropy: number;

  // Navigation State
  currentLevel: number;
  targetPosition: THREE.Vector3;

  // Camera & Interaction
  cameraTarget: THREE.Vector3;
  activeHotspotId: string | null;

  // Actions
  setCollectiveEntropy: (val: number) => void;
  setLayer: (layer: 'PHYSICAL' | 'PERCEPTIVE' | 'INTERPRETATIVE') => void;
  setLevel: (level: number) => void;
  setActiveHotspot: (id: string | null) => void;
}

const getLevelPosition = (level: number): THREE.Vector3 => {
  switch (level) {
    case 1: return new THREE.Vector3(0, 0, 20);
    case 2: return new THREE.Vector3(0, 5, 10);
    case 3: return new THREE.Vector3(0, 2, 5);
    case 4: return new THREE.Vector3(0, 1.2, 3.5);
    default: return new THREE.Vector3(0, 0, 20);
  }
};

export const useMemoryStore = create<EXMemoryStore>((set) => ({
  activeLayer: 'PHYSICAL',
  collectiveEntropy: 0.0,
  currentLevel: 1,
  targetPosition: getLevelPosition(1),
  cameraTarget: new THREE.Vector3(0, 0, 0),
  activeHotspotId: null,
  setCollectiveEntropy: (val) => set({ collectiveEntropy: val }),
  setLayer: (layer) => set({ activeLayer: layer }),
  setLevel: (level) => set({
    currentLevel: level,
    targetPosition: getLevelPosition(level),
    // Close panel when navigating away from Room
    activeHotspotId: level !== 4 ? null : undefined,
  }),
  setActiveHotspot: (id) => set({ activeHotspotId: id }),
}));

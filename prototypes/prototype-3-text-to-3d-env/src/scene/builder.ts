/**
 * Scene builder — high-level orchestrator.
 * Takes a SceneSchema and builds the complete Three.js scene.
 */

import * as THREE from 'three';
import type { SceneSchema } from '../types/scene.ts';
import { buildEnvironment } from './environment.ts';
import { buildLights } from './lights.ts';
import { assembleObjects } from './objects.ts';
import { createDemoScene } from './demo.ts';
import { createWater, updateWater } from './water.ts';
import { addVegetation } from './vegetation.ts';
import { createParticles, updateParticles } from './particles.ts';
import { updateAnimations } from './animation.ts';

export interface BuildOptions {
  /** Whether to add a grid helper. Default: true */
  grid?: boolean;
  /** Whether to add a subtle ambient light if none in schema. Default: true */
  ambientFallback?: boolean;
}

const DEFAULT_OPTIONS: BuildOptions = {
  grid: true,
  ambientFallback: true,
};

/**
 * Build a complete scene from a SceneSchema.
 * Clears the scene first, then builds environment, lights, objects, and camera.
 */
export function buildSceneFromSchema(
  scene: THREE.Scene,
  schema: Partial<SceneSchema>,
  options: BuildOptions = DEFAULT_OPTIONS,
): void {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Clear everything and init updater registry
  clearSceneNodes(scene);
  const updaters: Array<(delta: number) => void> = [];
  scene.userData._updaters = updaters;

  // 1. Environment (sky, ground, fog)
  const env = buildEnvironment(scene, schema.environment);

  // 1b. Animated water (replaces static water from environment.ts)
  if (env.isWaterGround) {
    const groundCfg = schema.environment?.ground;
    const waterMesh = createWater({
      color: groundCfg?.color,
      waveHeight: groundCfg?.waveHeight,
      waveSpeed: groundCfg?.waveSpeed,
      waveFrequency: groundCfg?.waveFrequency,
      opacity: groundCfg?.opacity,
      width: groundCfg?.width,
      depth: groundCfg?.height,
    });
    waterMesh.position.y = env.groundY;
    scene.add(waterMesh);
    updaters.push((delta) => updateWater(waterMesh, delta));
  }

  // 2. Lights
  buildLights(scene, schema.lights, opts.ambientFallback);

  // 3. Objects — split nature types vs regular primitives
  const NATURE_TYPES = new Set(['tree', 'rock', 'grass', 'cloud']);
  const allObjects = schema.objects ?? [];
  const nature: typeof allObjects = [];
  const regular: typeof allObjects = [];
  for (const o of allObjects) {
    if (NATURE_TYPES.has(o.type)) nature.push(o);
    else regular.push(o);
  }
  assembleObjects(scene, regular.length > 0 ? regular : undefined, { groundY: env.groundY + 0.01 });
  if (nature.length > 0) {
    addVegetation(scene, nature, { groundY: env.groundY });
  }

  // 4. Particles
  if (schema.particles) {
    for (const cfg of schema.particles) {
      const particleSystem = createParticles(cfg);
      particleSystem.position.y = env.groundY;
      scene.add(particleSystem);
      updaters.push((delta) => updateParticles(particleSystem, delta));
    }
  }

  // 5. Animation updater (processes userData.animations on all objects)
  updaters.push((delta) => updateAnimations(scene, delta));

  // 6. Camera
  applyCamera(scene, schema.camera);

  // 7. Grid helper
  if (opts.grid) {
    const existing = scene.getObjectByName('__grid_helper__');
    if (!existing) {
      const grid = new THREE.GridHelper(20, 20, 0x444466, 0x333355);
      grid.position.y = env.groundY + 0.01;
      grid.name = '__grid_helper__';
      scene.add(grid);
    }
  }
}

/**
 * Apply camera config or auto-compute.
 */
function applyCamera(
  scene: THREE.Scene,
  cameraConfig: SceneSchema['camera'],
): void {
  // Camera is owned by renderer, not scene.
  // We store the desired config on scene.userData for the renderer to read.
  if (cameraConfig) {
    if (cameraConfig.position) {
      scene.userData.cameraPosition = cameraConfig.position;
    }
    if (cameraConfig.target) {
      scene.userData.cameraTarget = cameraConfig.target;
    }
    if (cameraConfig.fov) {
      scene.userData.cameraFov = cameraConfig.fov;
    }
  } else {
    // Auto-camera will be computed by renderer
    scene.userData.cameraPosition = [10, 8, 10];
    scene.userData.cameraTarget = [0, 0, 0];
  }
}

/**
 * Build a fallback demo scene (for initial state or empty schemas).
 */
export function buildDemoScene(scene: THREE.Scene): void {
  clearSceneNodes(scene);
  createDemoScene(scene);
}

/**
 * Remove all scene children and dispose geometries/materials.
 * More thorough than the basic clearScene — handles groups recursively.
 */
function clearSceneNodes(scene: THREE.Scene): void {
  // Clear fog
  scene.fog = null;

  // Clear userData
  scene.userData = {};

  const toRemove: THREE.Object3D[] = [];
  scene.traverse((child) => {
    toRemove.push(child);
  });

  for (const child of toRemove) {
    scene.remove(child);
    if (child instanceof THREE.Mesh) {
      child.geometry?.dispose();
      if (Array.isArray(child.material)) {
        child.material.forEach((m) => { m.dispose(); });
      } else {
        child.material?.dispose();
      }
    }
    // Dispose children of Groups
    if (child instanceof THREE.Group) {
      child.children.forEach((c) => {
        if (c instanceof THREE.Mesh) {
          c.geometry?.dispose();
          c.material?.dispose();
        }
      });
    }
  }
}

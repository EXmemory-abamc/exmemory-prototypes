/**
 * Lighting system — create and configure Three.js lights from SceneSchema.
 */

import * as THREE from 'three';
import type { LightSource } from '../types/scene.ts';

// ─── Light Factory ──────────────────────────────────────────────────────────

export function createLight(config: LightSource, shadowMapSize = 1024): THREE.Light {
  const color = new THREE.Color(config.color ?? '#ffffff');
  const intensity = config.intensity ?? 1;

  let light: THREE.Light;

  switch (config.type) {
    case 'ambient': {
      light = new THREE.AmbientLight(color, intensity);
      break;
    }

    case 'directional': {
      const dl = new THREE.DirectionalLight(color, intensity);
      const pos = config.position ?? [5, 10, 5];
      dl.position.set(...pos);
      if (config.castShadow) {
        dl.castShadow = true;
        dl.shadow.mapSize.width = config.shadowMapSize ?? shadowMapSize;
        dl.shadow.mapSize.height = config.shadowMapSize ?? shadowMapSize;
        dl.shadow.camera.near = 0.5;
        dl.shadow.camera.far = 60;
        dl.shadow.camera.left = -20;
        dl.shadow.camera.right = 20;
        dl.shadow.camera.top = 20;
        dl.shadow.camera.bottom = -20;
        dl.shadow.bias = -0.001;
      }
      light = dl;
      break;
    }

    case 'point': {
      const pl = new THREE.PointLight(
        color,
        intensity,
        config.distance ?? 50,
        config.decay ?? 1,
      );
      const pos = config.position ?? [0, 5, 0];
      pl.position.set(...pos);
      if (config.castShadow) {
        pl.castShadow = true;
        pl.shadow.mapSize.width = config.shadowMapSize ?? shadowMapSize;
        pl.shadow.mapSize.height = config.shadowMapSize ?? shadowMapSize;
      }
      light = pl;
      break;
    }

    case 'spot': {
      const sl = new THREE.SpotLight(
        color,
        intensity,
        config.distance ?? 50,
        config.angle ?? Math.PI / 6,
        config.penumbra ?? 0.3,
        config.decay ?? 1,
      );
      const pos = config.position ?? [0, 8, 0];
      sl.position.set(...pos);
      if (config.target) {
        sl.target.position.set(...config.target);
      }
      if (config.castShadow) {
        sl.castShadow = true;
        sl.shadow.mapSize.width = config.shadowMapSize ?? shadowMapSize;
        sl.shadow.mapSize.height = config.shadowMapSize ?? shadowMapSize;
      }
      light = sl;
      break;
    }

    case 'hemisphere': {
      const groundColor = new THREE.Color(config.groundColor ?? '#445533');
      light = new THREE.HemisphereLight(color, groundColor, intensity);
      break;
    }

    default:
      light = new THREE.DirectionalLight(color, intensity);
  }

  return light;
}

// ─── Batch ──────────────────────────────────────────────────────────────────

export interface LightsResult {
  ambientLight: THREE.AmbientLight | null;
  lights: THREE.Light[];
}

/**
 * Build all lights from an array of light configs.
 * Always includes a basic ambient as fallback.
 */
export function buildLights(
  scene: THREE.Scene,
  configs: LightSource[] | undefined,
  ambientFallback = true,
): LightsResult {
  const result: LightsResult = {
    ambientLight: null,
    lights: [],
  };

  const allConfigs = configs ?? [];

  // Check if there's an ambient or hemisphere (which acts as ambient)
  const hasAmbient = allConfigs.some(
    (c) => c.type === 'ambient' || c.type === 'hemisphere',
  );

  // Add fallback ambient if none provided and fallback requested
  if (!hasAmbient && ambientFallback) {
    const amb = new THREE.AmbientLight(0x333355, 0.4);
    scene.add(amb);
    result.ambientLight = amb;
  }

  // Build each light
  for (const cfg of allConfigs) {
    const light = createLight(cfg);
    scene.add(light);

    // Add target helper for spot lights
    if (light instanceof THREE.SpotLight) {
      scene.add(light.target);
    }

    if (light instanceof THREE.AmbientLight) {
      result.ambientLight = light;
    }
    result.lights.push(light);
  }

  return result;
}

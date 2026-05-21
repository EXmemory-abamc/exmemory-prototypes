/**
 * Vegetation system — InstancedMesh for grass, procedural trees/rocks/clouds.
 */

import * as THREE from 'three';
import type { SceneObject } from '../types/scene.ts';
import { createTreeGeometry, createCloudGeometry } from './geometries.ts';

// ─── Instanced Grass ────────────────────────────────────────────────────────

export interface GrassConfig {
  count: number;
  spread: number;
  color?: string;
  groundY?: number;
}

/**
 * Create an InstancedMesh of grass blades distributed across the ground.
 */
export function createGrassField(config: GrassConfig): THREE.InstancedMesh | null {
  const { count, spread, color = '#4a8a3f', groundY = 0 } = config;

  if (count <= 0) return null;

  // Single grass blade geometry (small plane)
  const geo = new THREE.PlaneGeometry(0.06, 0.15);
  const mat = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.8,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.9,
  });

  const mesh = new THREE.InstancedMesh(geo, mat, count);
  mesh.castShadow = false;
  mesh.receiveShadow = false;

  const dummy = new THREE.Object3D();
  for (let i = 0; i < count; i++) {
    dummy.position.set(
      (Math.random() - 0.5) * spread,
      groundY,
      (Math.random() - 0.5) * spread,
    );
    dummy.rotation.set(
      (Math.random() - 0.5) * 0.3,
      Math.random() * Math.PI * 2,
      (Math.random() - 0.5) * 0.3,
    );
    const s = 0.5 + Math.random() * 0.8;
    dummy.scale.set(s, s, s);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  }

  mesh.instanceMatrix.needsUpdate = true;
  mesh.name = '__grass_field__';
  return mesh;
}

// ─── Vegetation batch ──────────────────────────────────────────────────────

export interface VegetationOptions {
  groundY?: number;
}

/**
 * Create vegetation objects from SceneObject configs that are nature types.
 * For 'tree' and 'cloud', delegates to geometries.ts composites.
 * For 'rock', creates randomized meshes.
 * For 'grass', creates an instanced field.
 */
export function createVegetationObject(
  config: SceneObject,
  options: VegetationOptions = {},
): THREE.Object3D | null {
  const { groundY = 0 } = options;
  const pos = config.position ?? [0, 0, 0];
  const scale = config.scale;

  let object: THREE.Object3D;

  switch (config.type) {
    case 'tree': {
      object = createTreeGeometry();
      const color = config.material?.color ?? config.color ?? '#4a8a3f';
      object.traverse((child) => {
        if (
          child instanceof THREE.Mesh &&
          child.material instanceof THREE.MeshStandardMaterial
        ) {
          // Only recolor foliage-like meshes (green ones)
          const hex = child.material.color.getHex();
          if (hex >= 0x3a7a00 && hex <= 0x5c8b3f) {
            child.material.color.set(color);
          }
        }
      });
      object.castShadow = true;
      break;
    }
    case 'cloud': {
      object = createCloudGeometry();
      break;
    }
    case 'rock': {
      // Random dodecahedron
      const size = (config.dimensions?.radius ?? 0.3) * (0.8 + Math.random() * 0.4);
      const geo = new THREE.DodecahedronGeometry(size);
      // Randomize vertices
      const posAttr = geo.attributes.position;
      for (let i = 0; i < posAttr.count; i++) {
        posAttr.setXYZ(
          i,
          posAttr.getX(i) + (Math.random() - 0.5) * size * 0.5,
          posAttr.getY(i) + (Math.random() - 0.5) * size * 0.3,
          posAttr.getZ(i) + (Math.random() - 0.5) * size * 0.5,
        );
      }
      geo.computeVertexNormals();

      const matColor = config.material?.color ?? config.color ?? '#666666';
      const mat = new THREE.MeshStandardMaterial({
        color: matColor,
        roughness: config.material?.roughness ?? 0.9,
        metalness: config.material?.metalness ?? 0.0,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      object = mesh;
      break;
    }
    default:
      return null;
  }

  object.position.set(pos[0], pos[1] + groundY, pos[2]);
  if (scale) object.scale.set(scale[0], scale[1], scale[2]);

  return object;
}

/**
 * Batch-create vegetation objects from a list of nature-type configs.
 */
export function addVegetation(
  scene: THREE.Scene,
  objects: SceneObject[],
  options: VegetationOptions = {},
): void {
  // Separate grass fields from individual objects
  const grassConfigs = objects.filter((o) => o.type === 'grass');
  const individualConfigs = objects.filter((o) => o.type !== 'grass');

  // Create grass field from first grass config (or use defaults)
  if (grassConfigs.length > 0) {
    const gc = grassConfigs[0];
    const grassField = createGrassField({
      count: gc.count ?? 200,
      spread: gc.spread ?? 15,
      color: gc.material?.color ?? gc.color ?? '#4a8a3f',
      groundY: options.groundY ?? 0,
    });
    if (grassField) scene.add(grassField);
  }

  // Create individual vegetation objects
  for (const cfg of individualConfigs) {
    const obj = createVegetationObject(cfg, options);
    if (obj) scene.add(obj);
  }
}

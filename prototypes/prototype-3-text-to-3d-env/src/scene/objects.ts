/**
 * Object assembler — creates Meshes/Groups from SceneObject configs.
 */

import * as THREE from 'three';
import type { SceneObject } from '../types/scene.ts';
import { createGeometry, createTreeGeometry, createCloudGeometry } from './geometries.ts';
import { createMaterial } from './materials.ts';

export interface AssembleOptions {
  groundY?: number;
}

/**
 * Assemble a single SceneObject into a THREE.Object3D (Mesh or Group).
 * Wires interaction data into userData.
 */
export function assembleObject(
  config: SceneObject,
  options: AssembleOptions = {},
): THREE.Object3D {
  const pos = config.position ?? [0, 0.5, 0];
  const rot = config.rotation;
  const scale = config.scale;

  let object: THREE.Object3D;

  // Composite objects (Groups)
  if (config.type === 'tree') {
    object = createTreeGeometry();
    // Apply color to foliage
    const color = config.material?.color ?? config.color ?? '#4a8a3f';
    object.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
        if (child.material.color.getHex() === 0x4a8a3f || child.material.color.getHex() === 0x3a7a2f) {
          child.material.color.set(color);
        }
      }
    });
    object.castShadow = true;
  } else if (config.type === 'cloud') {
    object = createCloudGeometry();
  } else if (config.type === 'grass') {
    // Single grass blade — will be instanced later in Phase 4
    const mat = createMaterial(config.material);
    if (config.color) mat.color.set(config.color);
    const geo = createGeometry('grass', config.dimensions);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = false;
    object = mesh;
  } else {
    // Standard primitive
    const mat = createMaterial(config.material);
    if (config.color) mat.color.set(config.color);
    const geo = createGeometry(config.type, config.dimensions);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    object = mesh;
  }

  // Transform
  object.position.set(pos[0], pos[1] + (options.groundY ?? 0), pos[2]);
  if (rot) object.rotation.set(rot[0], rot[1], rot[2]);
  if (scale) object.scale.set(scale[0], scale[1], scale[2]);

  // Interaction metadata
  if (config.interaction?.interactive) {
    object.userData.interactive = true;
    object.userData.interactionType = config.interaction.interactionType ?? 'click';
    object.userData.action = config.interaction.action ?? 'info';
    object.userData.description = config.interaction.description ?? '';
  }

  // Animation metadata
  if (config.animations && config.animations.length > 0) {
    object.userData.animations = config.animations;
  }

  return object;
}

/**
 * Assemble an array of SceneObjects into a scene.
 */
export function assembleObjects(
  scene: THREE.Scene,
  configs: SceneObject[] | undefined,
  options: AssembleOptions = {},
): THREE.Object3D[] {
  const objects: THREE.Object3D[] = [];

  if (!configs) return objects;

  for (const cfg of configs) {
    const obj = assembleObject(cfg, options);
    scene.add(obj);
    objects.push(obj);
  }

  return objects;
}

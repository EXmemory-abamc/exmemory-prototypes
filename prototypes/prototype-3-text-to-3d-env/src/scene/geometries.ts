/**
 * Primitive geometry factory — maps type strings to Three.js BufferGeometry.
 */

import * as THREE from 'three';
import type { PrimitiveType } from '../types/scene.ts';

export interface GeometryParams {
  width?: number;
  height?: number;
  depth?: number;
  radius?: number;
  radiusTop?: number;
  radiusBottom?: number;
  tube?: number;
  radialSegments?: number;
}

const DEFAULTS: Record<string, GeometryParams> = {
  box: { width: 1, height: 1, depth: 1 },
  sphere: { radius: 0.8 },
  cylinder: { radiusTop: 0.5, radiusBottom: 0.7, height: 1.2 },
  cone: { radius: 0.6, height: 1.2 },
  torus: { radius: 0.6, tube: 0.25 },
  plane: { width: 1, height: 1 },
  ring: { radius: 0.3 },
  torusKnot: { radius: 0.5, tube: 0.2, radialSegments: 64 },
  tree: { height: 1.2 },
  rock: { radius: 0.3 },
  grass: { width: 0.1, height: 0.2 },
};

/**
 * Create a geometry from primitive type and optional dimensions.
 */
export function createGeometry(
  type: PrimitiveType,
  params?: GeometryParams,
): THREE.BufferGeometry {
  const p = { ...DEFAULTS[type], ...params } as Required<GeometryParams>;

  switch (type) {
    case 'box':
      return new THREE.BoxGeometry(p.width, p.height ?? p.width, p.depth ?? p.width);
    case 'sphere':
      return new THREE.SphereGeometry(p.radius, 24, 24);
    case 'cylinder':
      return new THREE.CylinderGeometry(p.radiusTop, p.radiusBottom ?? p.radiusTop, p.height, 16);
    case 'cone':
      return new THREE.ConeGeometry(p.radius, p.height, 16);
    case 'torus':
      return new THREE.TorusGeometry(p.radius, p.tube ?? 0.25, 16, 32);
    case 'torusKnot':
      return new THREE.TorusKnotGeometry(p.radius, p.tube ?? 0.2, p.radialSegments ?? 64, 8);
    case 'plane':
      return new THREE.PlaneGeometry(p.width, p.height);
    case 'ring':
      return new THREE.RingGeometry(p.radius * 0.5, p.radius, 24);
    case 'rock':
      return createRockGeometry(p.radius);
    case 'grass':
      return new THREE.PlaneGeometry(p.width, p.height);
    default:
      return new THREE.BoxGeometry(0.8, 0.8, 0.8);
  }
}

/**
 * Rock geometry — dodecahedron with randomized vertices.
 */
function createRockGeometry(radius: number): THREE.BufferGeometry {
  const geo = new THREE.DodecahedronGeometry(radius);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    pos.setXYZ(
      i,
      pos.getX(i) + (Math.random() - 0.5) * radius * 0.5,
      pos.getY(i) + (Math.random() - 0.5) * radius * 0.3,
      pos.getZ(i) + (Math.random() - 0.5) * radius * 0.5,
    );
  }
  geo.computeVertexNormals();
  return geo;
}

/**
 * Create a tree as a Group (trunk + foliage).
 */
export function createTreeGeometry(): THREE.Group {
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.15, 0.6, 8),
    new THREE.MeshStandardMaterial({ color: 0x8B5E3C, roughness: 0.9 }),
  );
  trunk.position.y = 0.3;

  const foliage1 = new THREE.Mesh(
    new THREE.ConeGeometry(0.4, 0.5, 8),
    new THREE.MeshStandardMaterial({ color: 0x4a8a3f, roughness: 0.8 }),
  );
  foliage1.position.y = 0.9;

  const foliage2 = new THREE.Mesh(
    new THREE.ConeGeometry(0.3, 0.4, 8),
    new THREE.MeshStandardMaterial({ color: 0x3a7a2f, roughness: 0.8 }),
  );
  foliage2.position.y = 1.3;

  const group = new THREE.Group();
  group.add(trunk);
  group.add(foliage1);
  group.add(foliage2);
  return group;
}

/**
 * Create a cloud as a Group of overlapping spheres.
 */
export function createCloudGeometry(): THREE.Group {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.6,
    roughness: 0.1,
  });

  const count = 4 + Math.floor(Math.random() * 3);
  for (let i = 0; i < count; i++) {
    const s = 0.2 + Math.random() * 0.3;
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(s, 8, 8), mat);
    sphere.position.set(
      (Math.random() - 0.5) * 1.2,
      Math.random() * 0.15,
      (Math.random() - 0.5) * 0.6,
    );
    group.add(sphere);
  }
  return group;
}

/**
 * Registry of primitive types that produce Groups (composite objects).
 */
export const COMPOSITE_TYPES = new Set<PrimitiveType>(['tree', 'cloud']);

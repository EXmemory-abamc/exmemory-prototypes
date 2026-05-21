/**
 * Material system — build Three.js materials from schema MaterialProps.
 */

import * as THREE from 'three';
import type { MaterialProps } from '../types/scene.ts';

const DEFAULT_COLOR = '#cccccc';

/**
 * Parse a color value to a THREE.Color.
 * Handles hex strings (#rgb, #rrggbb, #rrggbbaa) and falls back to default.
 */
export function parseColor(value: string | undefined, fallback = DEFAULT_COLOR): THREE.Color {
  if (!value) return new THREE.Color(fallback);
  try {
    return new THREE.Color(value);
  } catch {
    return new THREE.Color(fallback);
  }
}

/**
 * Build a MeshStandardMaterial from schema MaterialProps.
 * Always returns a new material instance.
 */
export function createMaterial(props: MaterialProps | undefined): THREE.MeshStandardMaterial {
  const p = props ?? {};

  const color = parseColor(p.color, DEFAULT_COLOR);
  const emissive = parseColor(p.emissive, '#000000');

  const mat = new THREE.MeshStandardMaterial({
    color,
    roughness: p.roughness ?? 0.5,
    metalness: p.metalness ?? 0.0,
    emissive,
    emissiveIntensity: p.emissiveIntensity ?? 0,
    transparent: p.transparent ?? false,
    opacity: p.opacity ?? 1,
    wireframe: p.wireframe ?? false,
  });

  if (p.side === 'double') mat.side = THREE.DoubleSide;

  return mat;
}

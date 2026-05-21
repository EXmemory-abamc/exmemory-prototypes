/**
 * Animation system — per-object animations driven by the render loop.
 *
 * Reads `userData.animations` from scene objects and applies transforms
 * each frame. Supports: rotate, float, orbit, pulse.
 */

import * as THREE from 'three';
import type { AnimationDef } from '../types/scene.ts';

// ─── Accumulated time per object ────────────────────────────────────────────

const objectTimers = new WeakMap<THREE.Object3D, number>();

function getTime(obj: THREE.Object3D, delta: number): number {
  let t = objectTimers.get(obj) ?? 0;
  t += delta;
  objectTimers.set(obj, t);
  return t;
}

// ─── Apply single animation ─────────────────────────────────────────────────

/**
 * Apply an animation definition to an object.
 */
export function applyAnimation(
  obj: THREE.Object3D,
  anim: AnimationDef,
  delta: number,
): void {
  const t = getTime(obj, delta);
  const speed = anim.speed ?? 1;
  const axis = anim.axis ?? 'y';
  const amplitude = anim.amplitude ?? 1;

  switch (anim.type) {
    case 'rotate': {
      const amount = t * speed;
      switch (axis) {
        case 'x': obj.rotation.x = amount; break;
        case 'y': obj.rotation.y = amount; break;
        case 'z': obj.rotation.z = amount; break;
      }
      break;
    }
    case 'float': {
      const offset = Math.sin(t * speed) * amplitude * 0.3;
      // Store original position on first call
      if (obj.userData._origY === undefined) {
        obj.userData._origY = obj.position.y;
      }
      obj.position.y = (obj.userData._origY as number) + offset;
      break;
    }
    case 'orbit': {
      const radius = amplitude;
      const angle = t * speed;
      if (obj.userData._orbitCenter === undefined) {
        obj.userData._orbitCenter = { x: 0, z: 0 };
      }
      const center = obj.userData._orbitCenter as { x: number; z: number };
      obj.position.x = center.x + Math.cos(angle) * radius;
      obj.position.z = center.z + Math.sin(angle) * radius;
      break;
    }
    case 'pulse': {
      const scaleVal = 1 + Math.sin(t * speed) * amplitude * 0.2;
      obj.scale.set(scaleVal, scaleVal, scaleVal);
      break;
    }
  }
}

// ─── Process all animations in a scene ─────────────────────────────────────

/**
 * Update all animated objects in the scene.
 * Call this from the animation loop each frame.
 */
export function updateAnimations(scene: THREE.Scene, delta: number): void {
  scene.traverse((child) => {
    const anims = child.userData.animations as AnimationDef[] | undefined;
    if (!anims || anims.length === 0) return;

    for (const anim of anims) {
      applyAnimation(child, anim, delta);
    }
  });
}

/**
 * Reset all animation timers (call when scene changes).
 */
export function resetAnimationTimers(): void {
  // WeakMap clears automatically when objects are GC'd
  // For scene transitions, we just let old entries expire naturally
}

/**
 * Particle systems — rain, snow, fireflies, leaves, dust via THREE.Points.
 */

import * as THREE from 'three';

// ─── Types ─────────────────────────────────────────────────────────────────

export type ParticleEffect = 'rain' | 'snow' | 'fireflies' | 'leaves' | 'dust';

export interface ParticleConfig {
  effect: ParticleEffect;
  count?: number;
  spread?: number;
  height?: number;
}

// ─── Rain ───────────────────────────────────────────────────────────────────

function createRainParticles(config: Required<ParticleConfig>): { geometry: THREE.BufferGeometry; material: THREE.PointsMaterial } {
  const { count, spread, height } = config;
  const halfSpread = spread / 2;

  const positions = new Float32Array(count * 3);
  const velocities = new Float32Array(count);
  const segments = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * spread;
    positions[i * 3 + 1] = Math.random() * height;
    positions[i * 3 + 2] = (Math.random() - 0.5) * spread;
    velocities[i] = 2 + Math.random() * 3; // fall speed
    segments[i] = Math.random() * Math.PI * 2; // phase
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.userData.velocities = velocities;
  geometry.userData.height = height;
  geometry.userData.spread = halfSpread;

  const material = new THREE.PointsMaterial({
    color: 0x88aaff,
    size: 0.05,
    transparent: true,
    opacity: 0.6,
    sizeAttenuation: true,
  });

  return { geometry, material };
}

// ─── Snow ───────────────────────────────────────────────────────────────────

function createSnowParticles(config: Required<ParticleConfig>): { geometry: THREE.BufferGeometry; material: THREE.PointsMaterial } {
  const { count, spread, height } = config;

  const positions = new Float32Array(count * 3);
  const velocities = new Float32Array(count);
  const drifts = new Float32Array(count * 2);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * spread;
    positions[i * 3 + 1] = Math.random() * height;
    positions[i * 3 + 2] = (Math.random() - 0.5) * spread;
    velocities[i] = 0.3 + Math.random() * 0.5;
    drifts[i * 2] = (Math.random() - 0.5) * 0.3; // x drift
    drifts[i * 2 + 1] = (Math.random() - 0.5) * 0.3; // z drift
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.userData.velocities = velocities;
  geometry.userData.drifts = drifts;
  geometry.userData.height = height;
  geometry.userData.spread = spread / 2;

  const material = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.08,
    transparent: true,
    opacity: 0.7,
    sizeAttenuation: true,
  });

  return { geometry, material };
}

// ─── Fireflies ──────────────────────────────────────────────────────────────

function createFireflyParticles(config: Required<ParticleConfig>): { geometry: THREE.BufferGeometry; material: THREE.PointsMaterial } {
  const { count, spread, height } = config;

  const positions = new Float32Array(count * 3);
  const phases = new Float32Array(count);
  const baseY = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * spread;
    baseY[i] = 0.5 + Math.random() * (height - 0.5);
    positions[i * 3 + 1] = baseY[i];
    positions[i * 3 + 2] = (Math.random() - 0.5) * spread;
    phases[i] = Math.random() * Math.PI * 2;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.userData.phases = phases;
  geometry.userData.baseY = baseY;
  geometry.userData.spread = spread / 2;

  const material = new THREE.PointsMaterial({
    color: 0xffee44,
    size: 0.12,
    transparent: true,
    opacity: 1.0,
    sizeAttenuation: true,
  });

  return { geometry, material };
}

// ─── Leaves ─────────────────────────────────────────────────────────────────

function createLeaveParticles(config: Required<ParticleConfig>): { geometry: THREE.BufferGeometry; material: THREE.PointsMaterial } {
  const { count, spread, height } = config;
  const halfSpread = spread / 2;

  const positions = new Float32Array(count * 3);
  const velocities = new Float32Array(count * 3); // vx, vy, vz

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * spread;
    positions[i * 3 + 1] = Math.random() * height;
    positions[i * 3 + 2] = (Math.random() - 0.5) * spread;
    velocities[i * 3] = (Math.random() - 0.5) * 0.5; // x drift
    velocities[i * 3 + 1] = -(0.1 + Math.random() * 0.3); // fall
    velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.5; // z drift
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.userData.velocities = velocities;
  geometry.userData.height = height;
  geometry.userData.spread = halfSpread;

  const material = new THREE.PointsMaterial({
    color: 0x88aa44,
    size: 0.1,
    transparent: true,
    opacity: 0.8,
    sizeAttenuation: true,
  });

  return { geometry, material };
}

// ─── Dust ───────────────────────────────────────────────────────────────────

function createDustParticles(config: Required<ParticleConfig>): { geometry: THREE.BufferGeometry; material: THREE.PointsMaterial } {
  const { count, spread, height } = config;

  const positions = new Float32Array(count * 3);
  const phases = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * spread;
    positions[i * 3 + 1] = Math.random() * height;
    positions[i * 3 + 2] = (Math.random() - 0.5) * spread;
    phases[i * 3] = Math.random() * Math.PI * 2;
    phases[i * 3 + 1] = Math.random() * Math.PI * 2;
    phases[i * 3 + 2] = Math.random() * Math.PI * 2;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.userData.phases = phases;
  geometry.userData.height = height;
  geometry.userData.spread = spread / 2;

  const material = new THREE.PointsMaterial({
    color: 0xaaaacc,
    size: 0.04,
    transparent: true,
    opacity: 0.3,
    sizeAttenuation: true,
  });

  return { geometry, material };
}

// ─── Factory ────────────────────────────────────────────────────────────────

/**
 * Create a particle system.
 */
export function createParticles(config: ParticleConfig): THREE.Points {
  const defaults = { count: 200, spread: 20, height: 8 };
  const cfg = { ...defaults, ...config } as Required<ParticleConfig>;

  let result: { geometry: THREE.BufferGeometry; material: THREE.PointsMaterial };

  switch (cfg.effect) {
    case 'rain':
      result = createRainParticles(cfg);
      break;
    case 'snow':
      result = createSnowParticles(cfg);
      break;
    case 'fireflies':
      result = createFireflyParticles(cfg);
      break;
    case 'leaves':
      result = createLeaveParticles(cfg);
      break;
    case 'dust':
      result = createDustParticles(cfg);
      break;
    default:
      result = createDustParticles(cfg);
  }

  const points = new THREE.Points(result.geometry, result.material);
  points.name = `__particles_${config.effect}__`;
  return points;
}

// ─── Update ─────────────────────────────────────────────────────────────────

/**
 * Update particle animation (call from animation loop).
 */
export function updateParticles(points: THREE.Points, delta: number): void {
  const geo = points.geometry;
  const pos = geo.attributes.position;
  const data = geo.userData;

  if (!pos || !data) return;

  const positions = pos.array as Float32Array;
  const count = pos.count;

  switch (true) {
    case !!data.velocities && !data.drifts: {
      // Rain: fall and reset
      const vels = data.velocities as Float32Array;
      const height = data.height as number;
      const halfSpread = data.spread as number;
      for (let i = 0; i < count; i++) {
        positions[i * 3 + 1] -= vels[i] * delta;
        if (positions[i * 3 + 1] < -1) {
          positions[i * 3] = (Math.random() - 0.5) * halfSpread * 2;
          positions[i * 3 + 1] = height + Math.random();
          positions[i * 3 + 2] = (Math.random() - 0.5) * halfSpread * 2;
        }
      }
      break;
    }
    case !!data.drifts: {
      // Snow: fall + drift + reset
      const vels = data.velocities as Float32Array;
      const drifts = data.drifts as Float32Array;
      const h = data.height as number;
      const halfS = data.spread as number;
      for (let i = 0; i < count; i++) {
        positions[i * 3] += drifts[i * 2] * delta;
        positions[i * 3 + 1] -= vels[i] * delta;
        positions[i * 3 + 2] += drifts[i * 2 + 1] * delta;
        if (positions[i * 3 + 1] < -1) {
          positions[i * 3] = (Math.random() - 0.5) * halfS * 2;
          positions[i * 3 + 1] = h + Math.random();
          positions[i * 3 + 2] = (Math.random() - 0.5) * halfS * 2;
        }
      }
      break;
    }
    case !!data.phases && !!data.baseY: {
      // Fireflies: bob up/down + opacity pulse
      const phases = data.phases as Float32Array;
      const baseY = data.baseY as Float32Array;
      const time = performance.now() / 1000;
      for (let i = 0; i < count; i++) {
        positions[i * 3 + 1] = baseY[i] + Math.sin(time * 0.5 + phases[i]) * 0.5;
      }
      // Pulse opacity
      const mat = points.material as THREE.PointsMaterial;
      mat.opacity = 0.4 + Math.sin(time * 1.5) * 0.3 + Math.sin(time * 2.3) * 0.2;
      break;
    }
    case !!data.velocities && (data.velocities as Float32Array).length > count: {
      // Leaves: drift + fall + reset
      const lv = data.velocities as Float32Array;
      const lh = data.height as number;
      const lsp = data.spread as number;
      for (let i = 0; i < count; i++) {
        positions[i * 3] += lv[i * 3] * delta;
        positions[i * 3 + 1] += lv[i * 3 + 1] * delta;
        positions[i * 3 + 2] += lv[i * 3 + 2] * delta;
        if (positions[i * 3 + 1] < -1) {
          positions[i * 3] = (Math.random() - 0.5) * lsp * 2;
          positions[i * 3 + 1] = lh + Math.random();
          positions[i * 3 + 2] = (Math.random() - 0.5) * lsp * 2;
        }
      }
      break;
    }
    case !!data.phases && !data.baseY: {
      // Dust: gentle floating
      const dPhases = data.phases as Float32Array;
      const dt = performance.now() / 1000;
      const dH = data.height as number;
      for (let i = 0; i < count; i++) {
        positions[i * 3] += Math.sin(dt * 0.3 + dPhases[i * 3]) * 0.01;
        positions[i * 3 + 1] += Math.sin(dt * 0.2 + dPhases[i * 3 + 1]) * 0.005;
        positions[i * 3 + 2] += Math.sin(dt * 0.25 + dPhases[i * 3 + 2]) * 0.01;
        // Constrain to a box
        const halfDS = data.spread as number;
        positions[i * 3] = Math.max(-halfDS, Math.min(halfDS, positions[i * 3]));
        positions[i * 3 + 1] = Math.max(0, Math.min(dH, positions[i * 3 + 1]));
        positions[i * 3 + 2] = Math.max(-halfDS, Math.min(halfDS, positions[i * 3 + 2]));
      }
      break;
    }
  }

  pos.needsUpdate = true;
}

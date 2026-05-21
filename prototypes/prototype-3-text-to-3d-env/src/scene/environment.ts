/**
 * Environment builder — sky, ground, and fog from SceneSchema.
 */

import * as THREE from 'three';
import type { EnvironmentConfig, SkyConfig, GroundConfig } from '../types/scene.ts';

// ─── Sky ────────────────────────────────────────────────────────────────────

export function buildSky(scene: THREE.Scene, config: SkyConfig | undefined): void {
  if (!config || config.type === 'none') return;

  switch (config.type) {
    case 'color': {
      scene.background = new THREE.Color(config.color ?? '#111122');
      break;
    }
    case 'gradient': {
      const top = new THREE.Color(config.topColor ?? '#0a0a20');
      const bottom = new THREE.Color(config.bottomColor ?? '#4a6fa5');
      // Use a simple color average for the background
      const avg = top.clone().lerp(bottom, 0.5);
      scene.background = avg;

      // Store gradient info for future ShaderMaterial-based gradient skybox
      scene.userData.skyGradient = { top: top, bottom: bottom };
      break;
    }
    case 'sunset': {
      const top = new THREE.Color(config.topColor ?? '#ff6b35');
      const bottom = new THREE.Color(config.bottomColor ?? '#f7c948');
      const avg = top.clone().lerp(bottom, 0.5);
      scene.background = avg;
      scene.userData.skyGradient = { top, bottom };
      break;
    }
    case 'stars': {
      scene.background = new THREE.Color(config.color ?? '#050510');
      // Starfield particles
      const starCount = config.starCount ?? 500;
      const positions = new Float32Array(starCount * 3);
      const sizes = new Float32Array(starCount);
      for (let i = 0; i < starCount; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = 200 + Math.random() * 100;
        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = Math.abs(r * Math.cos(phi)); // only upper hemisphere
        positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
        sizes[i] = 0.5 + Math.random() * 1.5;
      }
      const starGeo = new THREE.BufferGeometry();
      starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const starMat = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.5,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true,
      });
      const stars = new THREE.Points(starGeo, starMat);
      stars.name = '__stars__';
      scene.add(stars);
      break;
    }
  }
}

// ─── Ground ─────────────────────────────────────────────────────────────────

export function buildGround(
  scene: THREE.Scene,
  config: GroundConfig | undefined,
): { height: number; isWaterGround?: boolean } {
  const defaultConfig: GroundConfig = { type: 'plane', color: '#2a2a4a' };
  const cfg = config ?? defaultConfig;

  if (cfg.type === 'none') return { height: 0 };

  const width = cfg.width ?? 40;
  const depth = cfg.height ?? 40;
  const color = cfg.color ?? '#2a2a4a';

  let yPos = 0;
  let mesh: THREE.Mesh;

  switch (cfg.type) {
    case 'terrain': {
      // Simple terrain via PlaneGeometry with vertex displacement
      const segW = 64;
      const segD = 64;
      const geo = new THREE.PlaneGeometry(width, depth, segW, segD);
      geo.rotateX(-Math.PI / 2);

      const pos = geo.attributes.position;
      const h = cfg.terrainHeight ?? 2;
      const scale = cfg.terrainScale ?? 3;

      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i) / (width / 2);
        const z = pos.getZ(i) / (depth / 2);
        // Layered noise approximation (simple sin/cos combination)
        const heightVal =
          Math.sin(x * scale + 0.3) * Math.cos(z * scale * 0.8 + 1.7) * 0.5 +
          Math.sin(x * scale * 2.1 + 2.4) * Math.cos(z * scale * 1.3 + 0.8) * 0.25 +
          Math.sin(x * scale * 4.3 + 5.1) * Math.cos(z * scale * 3.7 + 3.2) * 0.125;
        pos.setY(i, heightVal * h);
      }

      geo.computeVertexNormals();

      // Vertex coloring by height
      const colors = new Float32Array(pos.count * 3);
      for (let i = 0; i < pos.count; i++) {
        const y = pos.getY(i);
        const normalizedY = (y / h + 1) / 2; // 0-1 range

        let c: THREE.Color;
        if (normalizedY < 0.3) c = new THREE.Color(0x8B7355); // sand
        else if (normalizedY < 0.55) c = new THREE.Color(0x4a7c3f); // grass
        else if (normalizedY < 0.8) c = new THREE.Color(0x6b6b6b); // rock
        else c = new THREE.Color(0xffffff); // snow

        colors[i * 3] = c.r;
        colors[i * 3 + 1] = c.g;
        colors[i * 3 + 2] = c.b;
      }
      geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const mat = new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.9,
        metalness: 0.0,
        flatShading: true,
      });
      mesh = new THREE.Mesh(geo, mat);
      yPos = -h * 0.5;
      break;
    }
    case 'water': {
      yPos = -0.1;
      // Animated water created by builder.ts — skip static mesh
      return { height: yPos, isWaterGround: true };
    }
    default: {
      // Plane
      const geo = new THREE.PlaneGeometry(width, depth);
      geo.rotateX(-Math.PI / 2);
      const mat = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.8,
        side: THREE.DoubleSide,
      });
      mesh = new THREE.Mesh(geo, mat);
      yPos = -0.5;
      break;
    }
  }

  mesh.position.y = yPos;
  mesh.receiveShadow = true;
  mesh.name = '__ground__';
  scene.add(mesh);
  return { height: yPos };
}

// ─── Fog ─────────────────────────────────────────────────────────────────────

export function buildFog(
  scene: THREE.Scene,
  config: { type?: string; color?: string; near?: number; far?: number; density?: number } | undefined,
): void {
  if (!config || config.type === 'none') return;

  const fogColor = new THREE.Color(config.color ?? '#1a1a3e');

  if (config.type === 'exponential') {
    scene.fog = new THREE.FogExp2(fogColor, config.density ?? 0.008);
  } else {
    scene.fog = new THREE.Fog(fogColor, config.near ?? 15, config.far ?? 50);
  }
}

// ─── Master ─────────────────────────────────────────────────────────────────

export interface EnvironmentResult {
  groundY: number;
  isWaterGround?: boolean;
}

/**
 * Build the full environment (sky + ground + fog) from config.
 */
export function buildEnvironment(
  scene: THREE.Scene,
  config: EnvironmentConfig | undefined,
): EnvironmentResult {
  if (!config) {
    buildSky(scene, { type: 'gradient', topColor: '#0a0a20', bottomColor: '#4a6fa5' });
    buildGround(scene, undefined);
    return { groundY: -0.5 };
  }

  buildSky(scene, config.sky);
  const ground = buildGround(scene, config.ground);
  buildFog(scene, config.fog);
  return { groundY: ground.height };
}

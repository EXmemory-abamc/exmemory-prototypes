import * as THREE from 'three';

// ─────────────────────────────────────────────────────────────────────────────
// Deterministic "value noise" on a 2D canvas
// ─────────────────────────────────────────────────────────────────────────────
const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
const lerp = (a: number, b: number, t: number) => a + t * (b - a);

function generateValueNoise(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  seed: number,
  octaves: number,
  persistence: number,
  baseFreq: number,
  darkColor: [number, number, number],
  lightColor: [number, number, number],
) {
  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;

  // Pseudo-random gradient table seeded by `seed`
  const perm = new Uint8Array(512);
  for (let i = 0; i < 256; i++) {
    perm[i] = i;
  }
  // Fisher-Yates shuffle seeded
  let s = seed;
  for (let i = 255; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = (s >>> 0) % (i + 1);
    [perm[i], perm[j]] = [perm[j], perm[i]];
  }
  for (let i = 0; i < 256; i++) perm[i + 256] = perm[i];

  const grad = (hash: number, x: number, y: number) => {
    const h = hash & 3;
    const u = h < 2 ? x : y;
    const v = h < 2 ? y : x;
    return (h & 1 ? -u : u) + (h & 2 ? -v : v);
  };

  const noise2d = (x: number, y: number): number => {
    const xi = Math.floor(x) & 255;
    const yi = Math.floor(y) & 255;
    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);
    const u = fade(xf);
    const v = fade(yf);
    const aa = perm[perm[xi] + yi];
    const ab = perm[perm[xi] + yi + 1];
    const ba = perm[perm[xi + 1] + yi];
    const bb = perm[perm[xi + 1] + yi + 1];
    return lerp(
      lerp(grad(aa, xf, yf), grad(ba, xf - 1, yf), u),
      lerp(grad(ab, xf, yf - 1), grad(bb, xf - 1, yf - 1), u),
      v
    );
  };

  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      let value = 0;
      let amplitude = 1;
      let frequency = baseFreq;
      let maxValue = 0;
      for (let o = 0; o < octaves; o++) {
        value += noise2d(px * frequency, py * frequency) * amplitude;
        maxValue += amplitude;
        amplitude *= persistence;
        frequency *= 2;
      }
      const n = (value / maxValue + 1) * 0.5; // 0..1

      const r = Math.round(lerp(darkColor[0], lightColor[0], n));
      const g = Math.round(lerp(darkColor[1], lightColor[1], n));
      const b = Math.round(lerp(darkColor[2], lightColor[2], n));

      const idx = (py * width + px) * 4;
      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = 255;
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

// ─────────────────────────────────────────────────────────────────────────────
// Derive a normal map from a greyscale height map via finite differences
// ─────────────────────────────────────────────────────────────────────────────
function deriveNormalMap(
  src: CanvasRenderingContext2D,
  dst: CanvasRenderingContext2D,
  width: number,
  height: number,
  strength: number,
) {
  const srcData = src.getImageData(0, 0, width, height).data;
  const dstData = dst.createImageData(width, height);
  const out = dstData.data;

  const h = (px: number, py: number) => {
    const x = Math.max(0, Math.min(width - 1, px));
    const y = Math.max(0, Math.min(height - 1, py));
    return srcData[(y * width + x) * 4] / 255;
  };

  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      const dx = (h(px + 1, py) - h(px - 1, py)) * strength;
      const dy = (h(px, py + 1) - h(px, py - 1)) * strength;
      // Normal = normalize(-dx, -dy, 1)
      const len = Math.sqrt(dx * dx + dy * dy + 1);
      const nx = (-dx / len + 1) * 0.5;
      const ny = (-dy / len + 1) * 0.5;
      const nz = (1 / len + 1) * 0.5;

      const idx = (py * width + px) * 4;
      out[idx] = Math.round(nx * 255);
      out[idx + 1] = Math.round(ny * 255);
      out[idx + 2] = Math.round(nz * 255);
      out[idx + 3] = 255;
    }
  }
  dst.putImageData(dstData, 0, 0);
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────
export interface ProceduralTextures {
  colorMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
  normalMap: THREE.CanvasTexture;
}

const applyTextureSettings = (t: THREE.CanvasTexture, repeat = 2) => {
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat, repeat);
  t.needsUpdate = true;
};

/**
 * Generate a stone / concrete procedural texture set.
 * All computation is done once on the CPU canvas and uploaded as WebGL textures.
 */
export const generateStoneTextures = (
  seed = 42,
  size = 512,
  repeat = 2,
): ProceduralTextures => {
  // ── Height canvas (colour + roughness source) ──────────────────────────────
  const heightCanvas = document.createElement('canvas');
  heightCanvas.width = size;
  heightCanvas.height = size;
  const hCtx = heightCanvas.getContext('2d')!;

  generateValueNoise(
    hCtx, size, size, seed,
    6,          // octaves
    0.52,       // persistence
    1 / 80,     // base frequency (large pores)
    [20, 18, 16],   // dark: near-black charcoal
    [72, 68, 64],   // light: cold stone dust
  );

  // ── Fine detail overlay ────────────────────────────────────────────────────
  const detailCanvas = document.createElement('canvas');
  detailCanvas.width = size;
  detailCanvas.height = size;
  const dCtx = detailCanvas.getContext('2d')!;
  generateValueNoise(
    dCtx, size, size, seed + 1,
    4, 0.45, 1 / 20,
    [0, 0, 0],
    [255, 255, 255],
  );
  // Blend detail over height at low opacity for micro-porosity
  hCtx.globalAlpha = 0.18;
  hCtx.drawImage(detailCanvas, 0, 0);
  hCtx.globalAlpha = 1;

  // ── Crack overlay ──────────────────────────────────────────────────────────
  // Draw a handful of thin dark lines to simulate fractures
  hCtx.strokeStyle = 'rgba(10,8,6,0.6)';
  const rng = (n: number) => {
    const x = Math.sin(n + seed) * 43758.5453;
    return x - Math.floor(x);
  };
  for (let c = 0; c < 8; c++) {
    hCtx.beginPath();
    hCtx.lineWidth = 1 + rng(c * 7) * 2;
    hCtx.moveTo(rng(c * 3) * size, rng(c * 5) * size);
    hCtx.bezierCurveTo(
      rng(c * 11) * size, rng(c * 13) * size,
      rng(c * 17) * size, rng(c * 19) * size,
      rng(c * 23) * size, rng(c * 29) * size,
    );
    hCtx.stroke();
  }

  const colorMap = new THREE.CanvasTexture(heightCanvas);
  applyTextureSettings(colorMap, repeat);

  // ── Roughness map: invert + high-contrast ─────────────────────────────────
  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = size;
  roughCanvas.height = size;
  const rCtx = roughCanvas.getContext('2d')!;
  generateValueNoise(
    rCtx, size, size, seed + 99,
    5, 0.55, 1 / 60,
    [140, 140, 140],  // smooth areas → roughness 0.55
    [230, 230, 230],  // rough peaks  → roughness 0.90
  );
  const roughnessMap = new THREE.CanvasTexture(roughCanvas);
  applyTextureSettings(roughnessMap, repeat);

  // ── Normal map ─────────────────────────────────────────────────────────────
  const normCanvas = document.createElement('canvas');
  normCanvas.width = size;
  normCanvas.height = size;
  const nCtx = normCanvas.getContext('2d')!;
  deriveNormalMap(hCtx, nCtx, size, size, 3.5);
  const normalMap = new THREE.CanvasTexture(normCanvas);
  applyTextureSettings(normalMap, repeat);

  return { colorMap, roughnessMap, normalMap };
};

/**
 * A simpler, lighter "dust" texture for debris chunks.
 */
export const generateDustTextures = (seed = 200, size = 256): ProceduralTextures => {
  const c1 = document.createElement('canvas');
  c1.width = size; c1.height = size;
  const ctx1 = c1.getContext('2d')!;
  generateValueNoise(ctx1, size, size, seed, 5, 0.48, 1 / 40,
    [38, 35, 32], [90, 85, 80]);

  const c2 = document.createElement('canvas');
  c2.width = size; c2.height = size;
  const ctx2 = c2.getContext('2d')!;
  generateValueNoise(ctx2, size, size, seed + 50, 4, 0.5, 1 / 30,
    [160, 160, 160], [220, 220, 220]);

  const c3 = document.createElement('canvas');
  c3.width = size; c3.height = size;
  const ctx3 = c3.getContext('2d')!;
  deriveNormalMap(ctx1, ctx3, size, size, 2.5);

  const colorMap = new THREE.CanvasTexture(c1);
  applyTextureSettings(colorMap, 1);
  const roughnessMap = new THREE.CanvasTexture(c2);
  applyTextureSettings(roughnessMap, 1);
  const normalMap = new THREE.CanvasTexture(c3);
  applyTextureSettings(normalMap, 1);

  return { colorMap, roughnessMap, normalMap };
};

/**
 * Water shader — animated ShaderMaterial with sin wave displacement and Fresnel.
 */

import * as THREE from 'three';

export interface WaterConfig {
  color?: string;
  waveHeight?: number;
  waveSpeed?: number;
  waveFrequency?: number;
  opacity?: number;
  width?: number;
  depth?: number;
}

const DEFAULT_CONFIG: Required<WaterConfig> = {
  color: '#3a8fc9',
  waveHeight: 0.3,
  waveSpeed: 1.0,
  waveFrequency: 2.0,
  opacity: 0.7,
  width: 40,
  depth: 40,
};

// ─── Shader source ──────────────────────────────────────────────────────────

const vertexShader = `
  uniform float uTime;
  uniform float uWaveHeight;
  uniform float uWaveSpeed;
  uniform float uWaveFrequency;

  varying vec3 vWorldPosition;
  varying vec3 vNormal;
  varying float vHeight;

  void main() {
    vec3 pos = position;

    // Summed sin waves for organic water motion
    float wave1 = sin(pos.x * uWaveFrequency + uTime * uWaveSpeed) * uWaveHeight;
    float wave2 = sin(pos.z * uWaveFrequency * 1.3 + uTime * uWaveSpeed * 0.7) * uWaveHeight * 0.6;
    float wave3 = sin((pos.x + pos.z) * uWaveFrequency * 0.7 + uTime * uWaveSpeed * 1.2) * uWaveHeight * 0.3;
    pos.y += wave1 + wave2 + wave3;

    // Compute approximate normal for lighting
    float dx = cos(pos.x * uWaveFrequency + uTime * uWaveSpeed) * uWaveHeight * uWaveFrequency;
    float dz = cos(pos.z * uWaveFrequency * 1.3 + uTime * uWaveSpeed * 0.7) * uWaveHeight * 0.6 * uWaveFrequency * 1.3;
    vec3 normal = normalize(vec3(-dx, 1.0, -dz));

    vec4 worldPos = modelMatrix * vec4(pos, 1.0);
    vWorldPosition = worldPos.xyz;
    vNormal = normalize(normalMatrix * normal);
    vHeight = pos.y;

    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const fragmentShader = `
  uniform vec3 uColor;
  uniform float uOpacity;

  varying vec3 vWorldPosition;
  varying vec3 vNormal;
  varying float vHeight;

  void main() {
    // Fresnel effect
    vec3 viewDir = normalize(cameraPosition - vWorldPosition);
    float fresnel = 1.0 - max(dot(normalize(vNormal), viewDir), 0.0);
    fresnel = pow(fresnel, 3.0);

    // Base color with fresnel brightening
    vec3 color = mix(uColor, vec3(1.0, 1.0, 1.0), fresnel * 0.3);

    // Depth-based darkening (shallow = lighter, deep = darker)
    float depthFactor = 1.0 - smoothstep(-0.5, 0.5, vHeight);
    color = mix(color, color * 0.6, depthFactor * 0.3);

    // Specular highlight approximation
    vec3 halfDir = normalize(viewDir + vec3(0.0, 1.0, 0.0));
    float spec = pow(max(dot(normalize(vNormal), halfDir), 0.0), 32.0);
    color += vec3(1.0) * spec * 0.5;

    gl_FragColor = vec4(color, uOpacity);
  }
`;

// ─── Water Mesh ─────────────────────────────────────────────────────────────

/**
 * Create an animated water plane.
 */
export function createWater(config: WaterConfig = {}): THREE.Mesh {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  const geometry = new THREE.PlaneGeometry(cfg.width, cfg.depth, 64, 64);
  geometry.rotateX(-Math.PI / 2);

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(cfg.color) },
      uWaveHeight: { value: cfg.waveHeight },
      uWaveSpeed: { value: cfg.waveSpeed },
      uWaveFrequency: { value: cfg.waveFrequency },
      uOpacity: { value: cfg.opacity },
    },
    vertexShader,
    fragmentShader,
    transparent: true,
    side: THREE.DoubleSide,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = '__water__';
  mesh.receiveShadow = true;
  return mesh;
}

/**
 * Update water animation (call from animation loop).
 */
export function updateWater(mesh: THREE.Mesh, delta: number): void {
  const mat = mesh.material as THREE.ShaderMaterial;
  if (mat.uniforms?.uTime) {
    mat.uniforms.uTime.value += delta;
  }
}

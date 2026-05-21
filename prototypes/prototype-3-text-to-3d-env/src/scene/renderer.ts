/**
 * Three.js scene renderer — core setup and boilerplate.
 *
 * Responsibilities:
 * - Create and manage Scene, Camera, WebGLRenderer
 * - OrbitControls integration
 * - Window resize handling
 * - Animation loop
 * - Scene lifecycle (init, clear, dispose)
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export interface RendererState {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  animationId: number | null;
  clock: THREE.Clock;
}

export interface RendererOptions {
  container: HTMLElement;
  cameraPosition?: [number, number, number];
  cameraTarget?: [number, number, number];
  fov?: number;
  near?: number;
  far?: number;
  backgroundColor?: string;
}

/**
 * Initialize a Three.js scene with camera, renderer, controls and animation loop.
 */
export function initRenderer(options: RendererOptions): RendererState {
  const {
    container,
    cameraPosition = [10, 10, 10],
    cameraTarget = [0, 0, 0],
    fov = 60,
    near = 0.1,
    far = 1000,
    backgroundColor = '#111122',
  } = options;

  // ── Scene ──
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(backgroundColor);

  // ── Camera ──
  const aspect = container.clientWidth / container.clientHeight;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(...cameraPosition);

  // ── Renderer ──
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: 'high-performance',
  });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  container.appendChild(renderer.domElement);

  // ── Controls ──
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(...cameraTarget);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 1;
  controls.maxDistance = 500;
  controls.maxPolarAngle = Math.PI / 2.05; // prevent going below ground
  controls.update();

  // ── Clock ──
  const clock = new THREE.Clock();

  // ── Resize handler ──
  const onResize = () => {
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  };
  const resizeObserver = new ResizeObserver(onResize);
  resizeObserver.observe(container);

  // ── Animation loop ──
  const animationId = startLoop({ scene, camera, renderer, controls, animationId: null, clock });

  const state: RendererState = {
    scene,
    camera,
    renderer,
    controls,
    animationId,
    clock,
  };

  // Store resize observer cleanup on state for dispose
  (state as any)._resizeObserver = resizeObserver;

  return state;
}

/**
 * Start the requestAnimationFrame loop.
 */
function startLoop(state: RendererState): number {
  const loop = () => {
    state.animationId = requestAnimationFrame(loop);
    const delta = state.clock.getDelta();
    // Update controls (damping)
    state.controls.update();
    // Per-frame updates: water, particles, animations (registered by builder)
    const updaters = state.scene.userData._updaters as Array<(d: number) => void> | undefined;
    if (updaters) {
      for (const fn of updaters) {
        fn(delta);
      }
    }
    state.renderer.render(state.scene, state.camera);
  };
  return requestAnimationFrame(loop);
}

/**
 * Clear all objects from the scene (except lights if keepLights is true).
 */
export function clearScene(scene: THREE.Scene, keepLights = false): void {
  const toRemove: THREE.Object3D[] = [];
  scene.traverse((child) => {
    if (keepLights && (child as any).isLight) return;
    toRemove.push(child);
  });
  for (const child of toRemove) {
    scene.remove(child);
    if ((child as THREE.Mesh).geometry) {
      (child as THREE.Mesh).geometry.dispose();
    }
    if ((child as THREE.Mesh).material) {
      const mat = (child as THREE.Mesh).material;
      if (Array.isArray(mat)) {
        mat.forEach((m) => { m.dispose(); });
      } else {
        mat.dispose();
      }
    }
  }
}

/**
 * Full dispose of renderer state (cleanup).
 */
export function disposeRenderer(state: RendererState): void {
  if (state.animationId !== null) {
    cancelAnimationFrame(state.animationId);
  }
  state.renderer.dispose();
  state.controls.dispose();
  (state as any)._resizeObserver?.disconnect();
}

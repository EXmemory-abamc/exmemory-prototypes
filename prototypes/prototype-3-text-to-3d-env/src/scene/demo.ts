/**
 * Demo scene — temporary placeholder for Phase 1.
 *
 * Creates a simple environment to verify the renderer works:
 * - Ground plane
 * - Ambient + directional light
 * - A few primitive objects (box, sphere, torus)
 * - Basic grid helper
 *
 * Will be replaced by the LLM-driven scene generator in Phase 3.
 */

import * as THREE from 'three';

export function createDemoScene(scene: THREE.Scene): void {
  // ── Ground ──
  const groundGeo = new THREE.PlaneGeometry(20, 20);
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x2a2a4a,
    roughness: 0.8,
    metalness: 0.1,
    side: THREE.DoubleSide,
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.5;
  ground.receiveShadow = true;
  scene.add(ground);

  // ── Lights ──
  const ambient = new THREE.AmbientLight(0x333355, 0.6);
  scene.add(ambient);

  const dirLight = new THREE.DirectionalLight(0xffeedd, 1.5);
  dirLight.position.set(8, 15, 5);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 1024;
  dirLight.shadow.mapSize.height = 1024;
  dirLight.shadow.camera.near = 0.5;
  dirLight.shadow.camera.far = 50;
  dirLight.shadow.camera.left = -15;
  dirLight.shadow.camera.right = 15;
  dirLight.shadow.camera.top = 15;
  dirLight.shadow.camera.bottom = -15;
  scene.add(dirLight);

  const fillLight = new THREE.DirectionalLight(0x4444ff, 0.3);
  fillLight.position.set(-5, 3, -5);
  scene.add(fillLight);

  // ── Objects ──
  // Box
  const boxGeo = new THREE.BoxGeometry(1.2, 1.2, 1.2);
  const boxMat = new THREE.MeshStandardMaterial({
    color: 0x7c6af0,
    roughness: 0.3,
    metalness: 0.4,
  });
  const box = new THREE.Mesh(boxGeo, boxMat);
  box.position.set(-2, 0.6, 0);
  box.castShadow = true;
  box.receiveShadow = true;
  scene.add(box);

  // Sphere
  const sphereGeo = new THREE.SphereGeometry(0.8, 32, 32);
  const sphereMat = new THREE.MeshStandardMaterial({
    color: 0xf06a6a,
    roughness: 0.2,
    metalness: 0.6,
  });
  const sphere = new THREE.Mesh(sphereGeo, sphereMat);
  sphere.position.set(2, 0.8, 0);
  sphere.castShadow = true;
  sphere.receiveShadow = true;
  scene.add(sphere);

  // Torus
  const torusGeo = new THREE.TorusGeometry(0.6, 0.25, 16, 32);
  const torusMat = new THREE.MeshStandardMaterial({
    color: 0x6ac4f0,
    roughness: 0.1,
    metalness: 0.8,
  });
  const torus = new THREE.Mesh(torusGeo, torusMat);
  torus.position.set(0, 0.8, -2);
  torus.rotation.x = Math.PI / 3;
  torus.castShadow = true;
  torus.receiveShadow = true;
  scene.add(torus);

  // Cylinder
  const cylGeo = new THREE.CylinderGeometry(0.5, 0.7, 1.2, 16);
  const cylMat = new THREE.MeshStandardMaterial({
    color: 0x6af0a0,
    roughness: 0.5,
    metalness: 0.1,
  });
  const cyl = new THREE.Mesh(cylGeo, cylMat);
  cyl.position.set(0, 0.6, 2);
  cyl.castShadow = true;
  cyl.receiveShadow = true;
  scene.add(cyl);

  // ── Grid helper (subtle) ──
  const grid = new THREE.GridHelper(20, 20, 0x444466, 0x333355);
  grid.position.y = -0.49;
  scene.add(grid);
}

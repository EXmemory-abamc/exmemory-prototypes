import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useMemoryStore } from '../../store/useMemoryStore';
import { roomData, type WallData } from '../../data/roomData';
import { generateStoneTextures, generateDustTextures } from '../../utils/textureGenerator';

// ─────────────────────────────────────────────────────────────────────────────
// Deterministic PRNG
// ─────────────────────────────────────────────────────────────────────────────
const seededRandom = (seed: number) => {
  const x = Math.sin(seed + 1) * 43758.5453123;
  return x - Math.floor(x);
};

// ─────────────────────────────────────────────────────────────────────────────
// Individual Wall
// ─────────────────────────────────────────────────────────────────────────────
const Wall: React.FC<{ wall: WallData; entropy: number; textures: ReturnType<typeof generateStoneTextures> }> = ({
  wall, entropy, textures
}) => {
  const damaged = wall.integrity < 0.4;
  const severity = 1 - wall.integrity;

  const dynamicScale: [number, number, number] = [
    wall.scale[0],
    wall.scale[1] * (wall.integrity + 0.05),
    wall.scale[2],
  ];

  const dynamicRotation: [number, number, number] = [
    wall.rotation[0] + severity * 0.08,
    wall.rotation[1],
    wall.rotation[2] + severity * 0.05 + entropy * severity * 0.05,
  ];

  return (
    <group>
      {/* Solid wall mesh with stone material */}
      <mesh
        position={wall.position}
        rotation={dynamicRotation}
        scale={dynamicScale}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          map={textures.colorMap}
          roughnessMap={textures.roughnessMap}
          normalMap={textures.normalMap}
          normalScale={new THREE.Vector2(1.2, 1.2)}
          roughness={0.82}
          metalness={0.08}
          color={damaged ? '#2a2624' : '#302c2a'}
          envMapIntensity={0.3}
        />
      </mesh>

      {/* Wireframe overlay for heavily damaged walls (integrity < 0.4) */}
      {damaged && (
        <mesh
          position={wall.position}
          rotation={dynamicRotation}
          scale={[
            dynamicScale[0] * 1.001,
            dynamicScale[1] * 1.001,
            dynamicScale[2] * 1.001,
          ]}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial
            color="#5a4a3a"
            wireframe
            transparent
            opacity={0.12 + severity * 0.18}
          />
        </mesh>
      )}
    </group>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Instanced Debris System
// ─────────────────────────────────────────────────────────────────────────────
const DebrisSystem: React.FC<{ entropy: number }> = ({ entropy }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const textures = useMemo(() => generateDustTextures(200, 256), []);

  const transforms = useMemo(() => {
    const dummy = new THREE.Object3D();
    const result: { matrix: THREE.Matrix4; color: THREE.Color }[] = [];
    let idx = 0;

    for (const seed of roomData.debrisSeeds) {
      for (let i = 0; i < seed.density; i++) {
        const r = seededRandom(idx * 37 + 1) * seed.radius;
        const angle = seededRandom(idx * 17 + 2) * Math.PI * 2;

        const x = seed.center[0] + Math.cos(angle) * r;
        const z = seed.center[2] + Math.sin(angle) * r;
        const y = seededRandom(idx * 7 + 3) * 0.18;

        const sx = 0.04 + seededRandom(idx * 3 + 4) * 0.14;
        const sy = 0.03 + seededRandom(idx * 5 + 5) * 0.10;
        const sz = 0.04 + seededRandom(idx * 9 + 6) * 0.14;

        dummy.position.set(x, y, z);
        dummy.rotation.set(
          seededRandom(idx * 11) * Math.PI,
          seededRandom(idx * 13) * Math.PI,
          seededRandom(idx * 19) * Math.PI
        );
        dummy.scale.set(sx, sy, sz);
        dummy.updateMatrix();

        // Dusty debris: lighter than walls, with subtle variation
        // Range: dark charcoal (0.15) → cold stone dust (0.42)
        const t = seededRandom(idx * 23);
        const brightness = 0.15 + t * 0.27;
        const warmth = seededRandom(idx * 31) * 0.04; // slight warm tint
        result.push({
          matrix: dummy.matrix.clone(),
          color: new THREE.Color(brightness + warmth, brightness, brightness - warmth * 0.5),
        });
        idx++;
      }
    }
    return result;
  }, []);

  // Apply static matrices + per-instance colors on mount
  React.useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    transforms.forEach(({ matrix, color }, i) => {
      mesh.setMatrixAt(i, matrix);
      mesh.setColorAt(i, color);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [transforms]);

  // Entropy: levitate fragments
  React.useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh || entropy < 0.01) return;
    const dummy = new THREE.Object3D();
    const m = new THREE.Matrix4();
    transforms.forEach(({ matrix }, i) => {
      m.copy(matrix);
      dummy.matrix.copy(m);
      dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);
      dummy.position.y += entropy * seededRandom(i * 31) * 0.6;
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [entropy, transforms]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, transforms.length]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        map={textures.colorMap}
        roughnessMap={textures.roughnessMap}
        normalMap={textures.normalMap}
        normalScale={new THREE.Vector2(1.0, 1.0)}
        roughness={0.88}
        metalness={0.05}
        vertexColors
      />
    </instancedMesh>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Floor
// ─────────────────────────────────────────────────────────────────────────────
const Floor: React.FC<{ textures: ReturnType<typeof generateStoneTextures> }> = ({ textures }) => {
  const { width, depth } = roomData.floor;
  // Clone textures and change repeat for the large floor plane
  const floorColor = useMemo(() => {
    const t = textures.colorMap.clone();
    t.repeat.set(6, 6);
    t.needsUpdate = true;
    return t;
  }, [textures]);
  const floorRough = useMemo(() => {
    const t = textures.roughnessMap.clone();
    t.repeat.set(6, 6);
    t.needsUpdate = true;
    return t;
  }, [textures]);
  const floorNorm = useMemo(() => {
    const t = textures.normalMap.clone();
    t.repeat.set(6, 6);
    t.needsUpdate = true;
    return t;
  }, [textures]);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[width, depth, 4, 4]} />
        <meshStandardMaterial
          map={floorColor}
          roughnessMap={floorRough}
          normalMap={floorNorm}
          normalScale={new THREE.Vector2(0.8, 0.8)}
          roughness={0.95}
          metalness={0.02}
          color="#1e1c1a"
        />
      </mesh>
      <gridHelper
        args={[width, roomData.floor.gridDivisions, '#1a1818', '#141212']}
        position={[0, 0.003, 0]}
      />
    </group>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Export
// ─────────────────────────────────────────────────────────────────────────────
export const ProceduralRoom: React.FC = () => {
  const entropy = useMemoryStore((state) => state.collectiveEntropy);
  const stoneTextures = useMemo(() => generateStoneTextures(42, 512, 2), []);

  return (
    <group>
      {/* ── Primary forensic spotlight ──────────────────────────────────────── */}
      <spotLight
        position={[0, 8, 0]}
        angle={0.5}
        penumbra={0.85}
        intensity={10}
        color="#ddd4c0"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0005}
      />

      {/* ── Warm amber fill — debris field ─────────────────────────────────── */}
      <pointLight position={[0.5, 0.6, 1.2]} intensity={0.8} color="#ffccaa" castShadow={false} />

      {/* ── Cold fill from one corner ──────────────────────────────────────── */}
      <pointLight position={[-4.5, 2.5, -4]} intensity={0.25} color="#334466" />

      {/* ── Surfaces ───────────────────────────────────────────────────────── */}
      <Floor textures={stoneTextures} />

      {roomData.walls.map((wall) => (
        <Wall key={wall.id} wall={wall} entropy={entropy} textures={stoneTextures} />
      ))}

      <DebrisSystem entropy={entropy} />
    </group>
  );
};

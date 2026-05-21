import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useMemoryStore } from '../../store/useMemoryStore';
import { Hotspots } from './Hotspots';
import { ProceduralRoom } from './ProceduralRoom';

// ─────────────────────────────────────────────────────────────────────────────
// L1: Point-Cloud Globe — 2000 particles on a spherical shell
// ─────────────────────────────────────────────────────────────────────────────
const PointCloudGlobe: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);

  const { positions, sizes } = useMemo(() => {
    const count = 2200;
    const pos = new Float32Array(count * 3);
    const sz = new Float32Array(count);
    // Fibonacci sphere distribution for uniform coverage
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const theta = goldenAngle * i;
      const radius = 5 + (Math.sin(i * 137.5) * 0.5 + 0.5) * 0.18; // slight shell variance
      pos[i * 3]     = Math.cos(theta) * r * radius;
      pos[i * 3 + 1] = y * radius;
      pos[i * 3 + 2] = Math.sin(theta) * r * radius;
      sz[i] = 0.5 + (Math.sin(i * 53.7) * 0.5 + 0.5) * 1.5;
    }
    return { positions: pos, sizes: sz };
  }, []);

  // Slow rotation
  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.04;
  });

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    return g;
  }, [positions, sizes]);

  return (
    <group ref={groupRef}>
      <points geometry={geometry}>
        <pointsMaterial
          size={0.04}
          color="#a0c8ff"
          transparent
          opacity={0.75}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
      {/* Faint wireframe sphere beneath for subtle structure reference */}
      <mesh>
        <sphereGeometry args={[4.98, 32, 32]} />
        <meshBasicMaterial color="#0a1220" wireframe transparent opacity={0.04} />
      </mesh>
    </group>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Scanning line — moves across the plane every few seconds
// ─────────────────────────────────────────────────────────────────────────────
const ScanLine: React.FC<{ width: number; axis?: 'x' | 'z' }> = ({ width, axis = 'z' }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef  = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(({ clock }) => {
    if (!meshRef.current || !matRef.current) return;
    const t = clock.elapsedTime;
    const period = 4.0;
    const phase = (t % period) / period; // 0..1
    const pos = (phase * width) - width / 2;

    if (axis === 'z') meshRef.current.position.z = pos;
    else              meshRef.current.position.x = pos;

    // Fade at the edges of sweep
    matRef.current.opacity = Math.sin(phase * Math.PI) * 0.55;
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}>
      {axis === 'z'
        ? <planeGeometry args={[width, 0.12]} />
        : <planeGeometry args={[0.12, width]} />
      }
      <meshBasicMaterial
        ref={matRef}
        color="#4af0ff"
        transparent
        opacity={0}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// L2: Region — grid + scan
// ─────────────────────────────────────────────────────────────────────────────
const RegionLevel: React.FC = () => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[24, 24]} />
      <meshBasicMaterial color="#060a0f" />
    </mesh>
    <gridHelper args={[24, 24, '#1a3a5c', '#0d1f30']} position={[0, 0.01, 0]} />
    <ScanLine width={24} axis="z" />
    <ScanLine width={24} axis="x" />
  </group>
);

// ─────────────────────────────────────────────────────────────────────────────
// L3: City — buildings + scan
// ─────────────────────────────────────────────────────────────────────────────
const CityLevel: React.FC = () => {
  const cityBoxes = useMemo(() =>
    Array.from({ length: 45 }).map((_, i) => ({
      position: [
        Math.sin(i * 137.5) * 5,
        0,
        Math.sin(i * 73.1) * 5,
      ] as [number, number, number],
      scale: [
        0.25 + Math.abs(Math.sin(i * 53.7)) * 0.35,
        0.6 + Math.abs(Math.sin(i * 31.4)) * 1.2,
        0.25 + Math.abs(Math.sin(i * 67.9)) * 0.35,
      ] as [number, number, number],
    })), []);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshBasicMaterial color="#080c0e" />
      </mesh>
      <gridHelper args={[20, 40, '#152030', '#0c1520']} position={[0, 0.01, 0]} />
      <ScanLine width={20} axis="z" />
      {cityBoxes.map((box, i) => (
        <mesh key={i} position={[box.position[0], box.scale[1] / 2, box.position[2]]} scale={box.scale}>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial color={i % 5 === 0 ? '#1a3040' : '#0f1a22'} wireframe={i % 3 === 0} />
        </mesh>
      ))}
    </group>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Environment export
// ─────────────────────────────────────────────────────────────────────────────
export const Environment: React.FC = () => {
  const currentLevel = useMemoryStore((state) => state.currentLevel);

  return (
    <>
      {currentLevel === 1 && <PointCloudGlobe />}
      {currentLevel === 2 && <RegionLevel />}
      {currentLevel === 3 && <CityLevel />}
      {currentLevel === 4 && (
        <group>
          <ProceduralRoom />
          <Hotspots />
        </group>
      )}
    </>
  );
};

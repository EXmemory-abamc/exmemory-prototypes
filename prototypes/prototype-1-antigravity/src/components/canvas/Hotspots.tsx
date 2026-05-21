import React, { useRef } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { mockMemories, type MemoryAnchor } from '../../data/mockMemories';
import { useMemoryStore } from '../../store/useMemoryStore';

const getLayerColor = (layer: MemoryAnchor['realityLayer']) => {
  switch (layer) {
    case 'PHYSICAL':       return '#4ADE80';
    case 'PERCEPTIVE':     return '#FBBF24';
    case 'INTERPRETATIVE': return '#60A5FA';
    default:               return '#FFFFFF';
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Single animated hotspot
// ─────────────────────────────────────────────────────────────────────────────
const Hotspot: React.FC<{ memory: MemoryAnchor; phaseOffset: number }> = ({ memory, phaseOffset }) => {
  const meshRef   = useRef<THREE.Mesh>(null);
  const labelRef  = useRef<HTMLDivElement>(null);
  const ringRef   = useRef<THREE.Mesh>(null);
  const setActive = useMemoryStore((state) => state.setActiveHotspot);
  const activeId  = useMemoryStore((state) => state.activeHotspotId);
  const isActive  = activeId === memory.id;
  const color     = getLayerColor(memory.realityLayer);

  useFrame(({ clock }) => {
    const entropy = useMemoryStore.getState().collectiveEntropy;
    const t = clock.elapsedTime + phaseOffset;

    if (meshRef.current) {
      const base  = 0.05;
      const grow  = entropy * 0.09;
      const pulse = Math.sin(t * 2.2) * 0.015 * entropy;
      const activeBump = isActive ? 0.06 : 0;
      meshRef.current.scale.setScalar((base + grow + pulse + activeBump) / 0.05);
    }

    if (ringRef.current) {
      // Outer ring expands and fades — "sonar ping"
      const ringScale = 1 + ((t * 0.4) % 1) * 3;
      ringRef.current.scale.setScalar(ringScale);
      const mat = ringRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.max(0, 0.5 - ((t * 0.4) % 1) * 0.5);
    }

    if (labelRef.current) {
      if (entropy > 0.5) {
        const flicker = entropy > 0.7
          ? Math.abs(Math.sin(t * 18 + phaseOffset)) * (1 - entropy * 0.6) + 0.2
          : 0.7;
        labelRef.current.style.opacity = String(Math.max(0.1, flicker));
      } else {
        labelRef.current.style.opacity = '0.7';
      }
    }
  });

  return (
    <group position={memory.worldPosition}>
      {/* Sonar ring */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.05, 0.07, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.4} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>

      {/* Core sphere */}
      <mesh
        ref={meshRef}
        onClick={(e) => { e.stopPropagation(); setActive(isActive ? null : memory.id); }}
        onPointerOver={() => document.body.style.cursor = 'pointer'}
        onPointerOut={() => document.body.style.cursor = 'auto'}
      >
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          blending={THREE.AdditiveBlending}
          opacity={isActive ? 1.0 : 0.85}
        />
      </mesh>

      <Html center distanceFactor={5} zIndexRange={[100, 0]}>
        <div
          ref={labelRef}
          className="text-xs font-mono uppercase tracking-widest pointer-events-none select-none"
          style={{ color, opacity: 0.7, textShadow: `0 0 8px ${color}` }}
        >
          {memory.author}
        </div>
      </Html>
    </group>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Collection
// ─────────────────────────────────────────────────────────────────────────────
export const Hotspots: React.FC = () => (
  <>
    {mockMemories.map((memory, i) => (
      <Hotspot
        key={memory.id}
        memory={memory}
        phaseOffset={(i * Math.PI * 2) / mockMemories.length}
      />
    ))}
  </>
);

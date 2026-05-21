import React, { useRef } from 'react';
import { EffectComposer, Bloom, Noise, ChromaticAberration, Glitch, Vignette } from '@react-three/postprocessing';
import { BlendFunction, GlitchMode, VignetteTechnique } from 'postprocessing';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useMemoryStore } from '../../store/useMemoryStore';

// ─────────────────────────────────────────────────────────────────────────────
// Dynamic Bloom + Chromatic Aberration (runs inside useFrame — no re-renders)
// ─────────────────────────────────────────────────────────────────────────────
const DynamicEffects: React.FC = () => {
  const bloomRef = useRef<any>(null);
  const chromaRef = useRef<any>(null);

  useFrame(({ clock }) => {
    const entropy = useMemoryStore.getState().collectiveEntropy;
    const t = clock.elapsedTime;

    if (bloomRef.current) {
      const basePulse = Math.sin(t * 1.4) * 0.3;
      bloomRef.current.intensity = 1.2 + entropy * 2.2 + basePulse * entropy;
    }

    if (chromaRef.current) {
      const base   = 0.0005;
      const max    = 0.006;
      const jitter = entropy > 0.5 ? (Math.random() - 0.5) * entropy * 0.003 : 0;
      const offset = base + entropy * (max - base) + jitter;
      chromaRef.current.offset.set(offset, offset);
    }
  });

  return (
    <>
      <Bloom
        ref={bloomRef}
        intensity={1.2}
        luminanceThreshold={0.35}
        luminanceSmoothing={0.85}
        blendFunction={BlendFunction.ADD}
      />
      <Noise
        premultiply
        blendFunction={BlendFunction.ADD}
        opacity={0.12}
      />
      <ChromaticAberration
        ref={chromaRef}
        offset={new THREE.Vector2(0.0005, 0.0005) as any}
        blendFunction={BlendFunction.NORMAL}
      />
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Glitch — gated above entropy 0.8
// ─────────────────────────────────────────────────────────────────────────────
const GlitchLayer: React.FC = () => {
  const entropy = useMemoryStore((s) => s.collectiveEntropy);
  if (entropy <= 0.8) return null;
  const strength = (entropy - 0.8) / 0.2;
  return (
    <Glitch
      delay={new THREE.Vector2(0.3, 0.8) as any}
      duration={new THREE.Vector2(0.05, 0.2) as any}
      strength={new THREE.Vector2(strength * 0.03, strength * 0.08) as any}
      mode={GlitchMode.SPORADIC}
      active
      ratio={0.85}
    />
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Export
// ─────────────────────────────────────────────────────────────────────────────
export const PostProcessing: React.FC = () => (
  <EffectComposer>
    <DynamicEffects />
    <GlitchLayer />
    {/* Vignette: darkens the edges, pulls focus to the room center */}
    <Vignette
      offset={0.3}
      darkness={0.85}
      technique={VignetteTechnique.DEFAULT}
      blendFunction={BlendFunction.NORMAL}
    />
  </EffectComposer>
);

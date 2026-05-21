import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment } from './Environment';
import { CameraController } from './CameraController';
import { PostProcessing } from './PostProcessing';

export const Experience: React.FC = () => {
  return (
    <Canvas
      camera={{ position: [0, 0, 20], fov: 50 }}
      gl={{ antialias: true }}
      shadows
      className="w-full h-full"
    >
      <color attach="background" args={['#050505']} />
      <fogExp2 attach="fog" args={['#050505', 0.12]} />

      <ambientLight intensity={0.15} />

      <Environment />
      <CameraController />
      <PostProcessing />
    </Canvas>
  );
};


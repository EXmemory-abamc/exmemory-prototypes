import React, { useEffect, useRef } from 'react';
import { CameraControls } from '@react-three/drei';
import { useMemoryStore } from '../../store/useMemoryStore';

export const CameraController: React.FC = () => {
  const controlsRef = useRef<any>(null);
  const targetPosition = useMemoryStore((state) => state.targetPosition);
  const cameraTarget = useMemoryStore((state) => state.cameraTarget);

  useEffect(() => {
    if (controlsRef.current) {
      // Cinematic camera flight: smoothly transition to new position and look target
      controlsRef.current.setLookAt(
        targetPosition.x, targetPosition.y, targetPosition.z, // Position
        cameraTarget.x, cameraTarget.y, cameraTarget.z,       // Target
        true                                                  // Enable transition
      );
    }
  }, [targetPosition, cameraTarget]);

  return <CameraControls ref={controlsRef} makeDefault />;
};

/**
 * Scene schema types for the Text-to-3D Environment Generator.
 *
 * This is the intermediate representation produced by the LLM service
 * and consumed by the Three.js scene renderer. All fields are optional
 * with sensible defaults in the renderer.
 */

// ─── Environment ────────────────────────────────────────────────────────────

export type SkyType = 'gradient' | 'color' | 'sunset' | 'stars' | 'none';
export type GroundType = 'plane' | 'terrain' | 'water' | 'none';
export type FogType = 'linear' | 'exponential' | 'none';

export interface SkyConfig {
  type: SkyType;
  topColor?: string;      // CSS color (gradient top)
  bottomColor?: string;   // CSS color (gradient bottom)
  color?: string;         // CSS color (solid sky)
  starCount?: number;     // for stars type
}

export interface GroundConfig {
  type: GroundType;
  color?: string;
  texture?: string;       // texture URL (future)
  width?: number;
  height?: number;
  // terrain-specific
  terrainHeight?: number;
  terrainScale?: number;
  // water-specific
  waveHeight?: number;
  waveSpeed?: number;
  waveFrequency?: number;
  opacity?: number;
}

export interface FogConfig {
  type: FogType;
  color?: string;
  near?: number;          // for linear fog
  far?: number;           // for linear fog
  density?: number;       // for exponential fog
}

export interface EnvironmentConfig {
  sky?: SkyConfig;
  ground?: GroundConfig;
  fog?: FogConfig;
}

// ─── Lights ─────────────────────────────────────────────────────────────────

export type LightType = 'ambient' | 'directional' | 'point' | 'spot' | 'hemisphere';

export interface LightSource {
  type: LightType;
  color?: string;
  intensity?: number;
  position?: [number, number, number];
  target?: [number, number, number];
  castShadow?: boolean;
  shadowMapSize?: number;
  // spot-specific
  angle?: number;
  penumbra?: number;
  decay?: number;
  distance?: number;
  // hemisphere-specific
  groundColor?: string;
}

// ─── Materials ──────────────────────────────────────────────────────────────

export interface MaterialProps {
  color?: string;
  roughness?: number;
  metalness?: number;
  emissive?: string;
  emissiveIntensity?: number;
  transparent?: boolean;
  opacity?: number;
  wireframe?: boolean;
  side?: 'front' | 'back' | 'double';
}

// ─── Objects ────────────────────────────────────────────────────────────────

export type PrimitiveType =
  | 'box'
  | 'sphere'
  | 'cylinder'
  | 'cone'
  | 'torus'
  | 'plane'
  | 'ring'
  | 'torusKnot'
  | 'tree'
  | 'rock'
  | 'grass'
  | 'cloud';

export interface AnimationDef {
  type: 'rotate' | 'float' | 'orbit' | 'pulse';
  speed?: number;
  axis?: 'x' | 'y' | 'z';
  amplitude?: number;
}

export type ParticleEffect = 'rain' | 'snow' | 'fireflies' | 'leaves' | 'dust';

export interface ParticleEffectConfig {
  effect: ParticleEffect;
  count?: number;
  spread?: number;
  height?: number;
}

export interface InteractionConfig {
  interactive: boolean;
  interactionType?: 'click' | 'hover';
  action?: 'info' | 'animate' | 'transform';
  /** Description shown in info tooltip */
  description?: string;
}

export interface SceneObject {
  type: PrimitiveType;
  material?: MaterialProps;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  // primitive-specific dimensions (optional, renderer uses defaults)
  dimensions?: {
    width?: number;
    height?: number;
    depth?: number;
    radius?: number;
    radiusTop?: number;
    radiusBottom?: number;
    tube?: number;
    radialSegments?: number;
  };
  // composite object configuration
  color?: string;          // shorthand for simple objects
  count?: number;          // for instanced objects (grass, rocks)
  spread?: number;         // for instanced distribution
  interaction?: InteractionConfig;
  animations?: AnimationDef[];
}

// ─── Camera ─────────────────────────────────────────────────────────────────

export interface CameraConfig {
  position?: [number, number, number];
  target?: [number, number, number];
  fov?: number;
  near?: number;
  far?: number;
}

// ─── Root Schema ────────────────────────────────────────────────────────────

export interface SceneSchema {
  environment?: EnvironmentConfig;
  lights?: LightSource[];
  objects?: SceneObject[];
  particles?: ParticleEffectConfig[];
  camera?: CameraConfig;
  description?: string;        // original text description (for reference/caching)
}

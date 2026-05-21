/**
 * Prompt preset templates for the human-moderator workflow.
 *
 * Each template is designed to produce valid JSON output matching SceneSchema.
 * The moderator copies the prompt, sends it to their preferred LLM (free or paid),
 * and pastes the JSON response into the app.
 */

import type { SceneSchema } from '../types/scene.ts';

export interface PromptPreset {
  id: string;
  label: string;
  description: string;
  /** Build a prompt given the user's description. */
  buildPrompt: (userDescription: string) => string;
  /** An example of valid LLM output for this preset. */
  exampleOutput: SceneSchema;
}

// ─── Presets ────────────────────────────────────────────────────────────────

const SCHEMA_REFERENCE = `
Supported scene schema (output ONLY valid JSON matching this structure):
{
  "environment": {
    "sky": { "type": "gradient|color|sunset|stars", "topColor": "#hex", "bottomColor": "#hex", "color": "#hex" },
    "ground": { "type": "plane|terrain|water", "color": "#hex", "width": 20, "height": 20 },
    "fog": { "type": "linear|exponential|none", "color": "#hex", "near": 10, "far": 50, "density": 0.02 }
  },
  "lights": [
    { "type": "ambient|directional|point|spot|hemisphere", "color": "#hex", "intensity": 0.5,
      "position": [x, y, z], "castShadow": true, "shadowMapSize": 1024 }
  ],
  "objects": [
    { "type": "box|sphere|cylinder|cone|torus|plane|ring|torusKnot|tree|rock|grass|cloud",
      "material": { "color": "#hex", "roughness": 0.5, "metalness": 0.0, "emissive": "#hex", "transparent": false, "opacity": 1 },
      "position": [x, y, z], "rotation": [x, y, z], "scale": [x, y, z],
      "dimensions": { "width": 1, "height": 1, "depth": 1, "radius": 1 },
      "interaction": { "interactive": true, "interactionType": "click|hover", "action": "info|animate|transform", "description": "tooltip text" },
      "animations": [{ "type": "rotate|float|orbit|pulse", "speed": 1, "axis": "y", "amplitude": 0.5 }]
    }
  ],
  "camera": { "position": [x, y, z], "target": [x, y, z], "fov": 60 }
}
`;

const OUTPUT_INSTRUCTION = `
IMPORTANT: Output ONLY valid JSON. No markdown fences, no explanations, no extra text.
Use realistic colors, positions, and dimensions. Place objects on or above the ground plane (y=0).
`;

export const presets: PromptPreset[] = [
  {
    id: 'basic',
    label: '🌍 Basic Scene',
    description: 'Simple environment with primitives and basic lighting',
    buildPrompt: (desc) =>
      `You are a 3D scene generator. Create a Three.js scene JSON from this description:

"${desc}"

${SCHEMA_REFERENCE}
${OUTPUT_INSTRUCTION}

Example output:
{
  "environment": {
    "sky": { "type": "gradient", "topColor": "#1a1a3e", "bottomColor": "#4a6fa5" },
    "ground": { "type": "plane", "color": "#3a3a5a", "width": 20, "height": 20 },
    "fog": { "type": "linear", "color": "#1a1a3e", "near": 15, "far": 40 }
  },
  "lights": [
    { "type": "ambient", "color": "#404060", "intensity": 0.5 },
    { "type": "directional", "color": "#ffeebb", "intensity": 1.2, "position": [8, 15, 5], "castShadow": true }
  ],
  "objects": [
    { "type": "box", "material": { "color": "#7c6af0", "roughness": 0.3, "metalness": 0.4 }, "position": [-2, 0.6, 0] },
    { "type": "sphere", "material": { "color": "#f06a6a", "roughness": 0.2, "metalness": 0.6 }, "position": [2, 0.8, 0] }
  ],
  "camera": { "position": [10, 8, 10], "target": [0, 0, 0], "fov": 60 }
}`,
    exampleOutput: {
      environment: {
        sky: { type: 'gradient', topColor: '#1a1a3e', bottomColor: '#4a6fa5' },
        ground: { type: 'plane', color: '#3a3a5a' },
        fog: { type: 'linear', color: '#1a1a3e', near: 15, far: 40 },
      },
      lights: [
        { type: 'ambient', color: '#404060', intensity: 0.5 },
        { type: 'directional', color: '#ffeebb', intensity: 1.2, position: [8, 15, 5], castShadow: true },
      ],
      objects: [
        { type: 'box', material: { color: '#7c6af0', roughness: 0.3, metalness: 0.4 }, position: [-2, 0.6, 0] },
        { type: 'sphere', material: { color: '#f06a6a', roughness: 0.2, metalness: 0.6 }, position: [2, 0.8, 0] },
      ],
      camera: { position: [10, 8, 10], target: [0, 0, 0], fov: 60 },
    },
  },
  {
    id: 'nature',
    label: '🌲 Nature Scene',
    description: 'Terrain, vegetation, water, and atmospheric sky',
    buildPrompt: (desc) =>
      `You are a 3D environment designer. Create a nature scene JSON from this description:

"${desc}"

${SCHEMA_REFERENCE}
${OUTPUT_INSTRUCTION}

Guidelines for nature scenes:
- Use terrain for ground type when hills/mountains are described
- Use water ground type for lakes/rivers/oceans
- Add trees (composite: cylinder trunk + cone foliage) and rocks
- Use hemisphere light for outdoor scenes
- Use sunset or gradient sky types for atmospheric time-of-day
- Consider fog for misty/moody scenes`,
    exampleOutput: {
      environment: {
        sky: { type: 'sunset', topColor: '#ff6b35', bottomColor: '#f7c948' },
        ground: { type: 'terrain', color: '#4a7c3f', terrainHeight: 2, terrainScale: 3 },
        fog: { type: 'exponential', color: '#d4a373', density: 0.008 },
      },
      lights: [
        { type: 'hemisphere', color: '#ffddaa', intensity: 0.8, groundColor: '#445533' },
        { type: 'directional', color: '#ffaa66', intensity: 1.0, position: [5, 12, 8], castShadow: true },
      ],
      objects: [
        { type: 'tree', material: { color: '#5c8a3f' }, position: [-3, 0, 2], scale: [1, 1.5, 1] },
        { type: 'tree', material: { color: '#4a7a32' }, position: [4, 0, -1], scale: [0.8, 1.2, 0.8] },
        { type: 'rock', material: { color: '#666666', roughness: 0.9 }, position: [0, 0, 3], scale: [0.5, 0.3, 0.5] },
      ],
      camera: { position: [12, 10, 14], target: [0, 0, 0], fov: 55 },
    },
  },
  {
    id: 'interior',
    label: '🏠 Interior Scene',
    description: 'Rooms, furniture, architectural elements with warm lighting',
    buildPrompt: (desc) =>
      `You are an interior designer. Create a 3D room scene JSON from this description:

"${desc}"

${SCHEMA_REFERENCE}
${OUTPUT_INSTRUCTION}

Guidelines for interior scenes:
- Use plane ground type as the floor
- Objects should be at appropriate heights (chairs ~y=0.5, tables ~y=0.7, lamps ~y=1.5)
- Use point lights for lamps, spot lights for directional ceiling lights
- Fog density should be low for interiors
- Use warm colors for cozy atmospheres, cool colors for modern`,
    exampleOutput: {
      environment: {
        sky: { type: 'color', color: '#222233' },
        ground: { type: 'plane', color: '#5a4a3a' },
        fog: { type: 'linear', color: '#222233', near: 8, far: 20 },
      },
      lights: [
        { type: 'ambient', color: '#443355', intensity: 0.3 },
        { type: 'point', color: '#ffdd99', intensity: 1.0, position: [0, 2.5, 0] },
      ],
      objects: [
        { type: 'box', material: { color: '#8B5E3C', roughness: 0.7 }, position: [0, 0.4, 0], dimensions: { width: 2, height: 0.8, depth: 1 } },
        { type: 'box', material: { color: '#D4A574', roughness: 0.6 }, position: [-1.5, 0.25, 1.5], dimensions: { width: 0.6, height: 0.5, depth: 0.6 } },
        { type: 'cylinder', material: { color: '#A0C0D0', roughness: 0.1 }, position: [1.5, 0.5, 1], dimensions: { radius: 0.15, height: 1 } },
      ],
      camera: { position: [4, 3, 5], target: [0, 0.5, 0], fov: 65 },
    },
  },
  {
    id: 'abstract',
    label: '🎨 Abstract Scene',
    description: 'Geometric shapes, vibrant colors, artistic compositions',
    buildPrompt: (desc) =>
      `You are an abstract 3D artist. Create an artistic scene JSON from this description:

"${desc}"

${SCHEMA_REFERENCE}
${OUTPUT_INSTRUCTION}

Guidelines for abstract scenes:
- Use bold, vibrant colors
- Experiment with torus, torusKnot, ring, cone primitives
- Use rotation to create dynamic compositions
- Use metalness and emissive for striking materials
- Minimal environment (dark sky, subtle ground) to highlight objects`,
    exampleOutput: {
      environment: {
        sky: { type: 'color', color: '#0a0a12' },
        ground: { type: 'plane', color: '#1a1a2e' },
      },
      lights: [
        { type: 'ambient', color: '#222244', intensity: 0.3 },
        { type: 'directional', color: '#ff88ff', intensity: 1.0, position: [5, 10, 5] },
        { type: 'point', color: '#00ffff', intensity: 0.8, position: [-3, 2, -3] },
      ],
      objects: [
        { type: 'torusKnot', material: { color: '#ff4488', roughness: 0.1, metalness: 0.9, emissive: '#ff0044', emissiveIntensity: 0.2 }, position: [-1.5, 1, 0], rotation: [0.3, 0.5, 0], animations: [{ type: 'rotate', speed: 0.5, axis: 'y' }] },
        { type: 'sphere', material: { color: '#44ff88', roughness: 0.0, metalness: 0.3, emissive: '#00ff66', emissiveIntensity: 0.1 }, position: [1.5, 1, 0.5], animations: [{ type: 'float', speed: 1, amplitude: 0.3 }] },
        { type: 'ring', material: { color: '#ffaa00', roughness: 0.3, metalness: 0.7 }, position: [0, 0.5, -1.5], rotation: [Math.PI / 3, 0, 0] },
      ],
      camera: { position: [6, 4, 6], target: [0, 0.5, 0], fov: 55 },
    },
  },
];

/** Get a preset by ID. */
export function getPreset(id: string): PromptPreset | undefined {
  return presets.find((p) => p.id === id);
}

/** Get the default preset. */
export function getDefaultPreset(): PromptPreset {
  return presets[0];
}

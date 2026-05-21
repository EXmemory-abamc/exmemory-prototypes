/**
 * Structured input parser.
 *
 * Parses a simplified key-value or JSON-like input format directly into
 * a SceneSchema object, bypassing the LLM entirely.
 *
 * Supported input formats:
 *   sky: sunset
 *   ground: terrain
 *   add: box at (0, 0.5, 0) color #ff0000
 *   add: sphere at (2, 1, -1) color #00ff00
 *   light: directional from (5, 10, 5)
 *   camera: (8, 6, 8) looking at (0, 0, 0)
 */

import type { SceneSchema, PrimitiveType, LightType, SkyType } from '../types/scene.ts';

// ─── Pattern matching ───────────────────────────────────────────────────────

const patterns = {
  sky: /^sky:\s*(gradient|color|sunset|stars|none)(?:\s+top\s+(#[0-9a-fA-F]{3,8})(?:\s+bottom\s+(#[0-9a-fA-F]{3,8}))?)?/i,
  ground: /^ground:\s*(plane|terrain|water|none)(?:\s+color\s+(#[0-9a-fA-F]{3,8}))?/i,
  fog: /^fog:\s*(linear|exponential|none)(?:\s+color\s+(#[0-9a-fA-F]{3,8}))?(?:\s+near\s+(\d+))?(?:\s+far\s+(\d+))?(?:\s+density\s+([\d.]+))?/i,
  light: /^light:\s*(ambient|directional|point|spot|hemisphere)(?:\s+color\s+(#[0-9a-fA-F]{3,8}))?(?:\s+intensity\s+([\d.]+))?(?:\s+from\s+\(([-\d.,\s]+)\))?(?:\s+shadow)?/i,
  add: /^add:\s*(box|sphere|cylinder|cone|torus|plane|ring|torusKnot|tree|rock|grass|cloud)(?:\s+at\s+\(([-\d.,\s]+)\))?(?:\s+color\s+(#[0-9a-fA-F]{3,8}))?(?:\s+scale\s+\(([-\d.,\s]+)\))?(?:\s+interactive)?/i,
  camera: /^camera:\s*\(([-\d.,\s]+)\)(?:\s+looking\s+at\s+\(([-\d.,\s]+)\))?(?:\s+fov\s+(\d+))?/i,
} as const;

function parseVec3(s: string | undefined): [number, number, number] | undefined {
  if (!s) return undefined;
  const nums = s.split(',').map((n) => parseFloat(n.trim()));
  if (nums.length === 3 && nums.every((n) => !isNaN(n))) {
    return [nums[0], nums[1], nums[2]];
  }
  return undefined;
}

// ─── Parser ─────────────────────────────────────────────────────────────────

export interface ParseResult {
  schema: SceneSchema;
  errors: string[];
}

/**
 * Parse structured text input into a SceneSchema.
 * Each line should follow one of the supported patterns.
 * Lines that don't match any pattern are ignored (with a warning).
 */
export function parseStructured(input: string): ParseResult {
  const schema: SceneSchema = {
    environment: {},
    lights: [],
    objects: [],
  };
  const errors: string[] = [];

  const lines = input
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('//') && !l.startsWith('#'));

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let matched = false;

    // ── sky ──
    const skyMatch = line.match(patterns.sky);
    if (skyMatch) {
      matched = true;
      schema.environment = schema.environment || {};
      schema.environment.sky = {
        type: skyMatch[1].toLowerCase() as SkyType,
      };
      if (skyMatch[2]) schema.environment.sky.topColor = skyMatch[2];
      if (skyMatch[3]) schema.environment.sky.bottomColor = skyMatch[3];
      continue;
    }

    // ── ground ──
    const groundMatch = line.match(patterns.ground);
    if (groundMatch) {
      matched = true;
      schema.environment = schema.environment || {};
      const gtype = groundMatch[1].toLowerCase();
      schema.environment.ground = {
        type: gtype === 'terrain' ? 'terrain' : gtype === 'water' ? 'water' : 'plane',
      };
      if (groundMatch[2]) schema.environment.ground.color = groundMatch[2];
      continue;
    }

    // ── fog ──
    const fogMatch = line.match(patterns.fog);
    if (fogMatch) {
      matched = true;
      schema.environment = schema.environment || {};
      const ftype = fogMatch[1].toLowerCase();
      if (ftype !== 'none') {
        schema.environment.fog = {
          type: ftype === 'exponential' ? 'exponential' : 'linear',
        };
        if (fogMatch[2]) schema.environment.fog.color = fogMatch[2];
        if (fogMatch[3]) schema.environment.fog.near = parseFloat(fogMatch[3]);
        if (fogMatch[4]) schema.environment.fog.far = parseFloat(fogMatch[4]);
        if (fogMatch[5]) schema.environment.fog.density = parseFloat(fogMatch[5]);
      }
      continue;
    }

    // ── light ──
    const lightMatch = line.match(patterns.light);
    if (lightMatch) {
      matched = true;
      const light = {
        type: lightMatch[1].toLowerCase() as LightType,
        color: lightMatch[2] || '#ffffff',
        intensity: lightMatch[3] ? parseFloat(lightMatch[3]) : 1.0,
        position: parseVec3(lightMatch[4]) || [5, 10, 5],
        castShadow: !!lightMatch[5],
      };
      schema.lights = schema.lights || [];
      schema.lights.push(light);
      continue;
    }

    // ── add object ──
    const addMatch = line.match(patterns.add);
    if (addMatch) {
      matched = true;
      const obj = {
        type: addMatch[1].toLowerCase() as PrimitiveType,
        position: parseVec3(addMatch[2]) || [0, 0, 0],
        material: {
          color: addMatch[3] || '#cccccc',
          roughness: 0.5,
          metalness: 0.0,
        },
        scale: parseVec3(addMatch[4]),
        interaction: addMatch[5] ? { interactive: true, interactionType: 'click' as const, action: 'info' as const } : undefined,
      };
      // Clean up undefined fields
      if (!obj.scale) { delete obj.scale; }
      if (!obj.interaction) { delete obj.interaction; }

      schema.objects = schema.objects || [];
      schema.objects.push(obj);
      continue;
    }

    // ── camera ──
    const camMatch = line.match(patterns.camera);
    if (camMatch) {
      matched = true;
      schema.camera = {
        position: parseVec3(camMatch[1]) || [10, 8, 10],
        target: parseVec3(camMatch[2]) || [0, 0, 0],
        fov: camMatch[3] ? parseFloat(camMatch[3]) : 60,
      };
      continue;
    }

    if (!matched) {
      errors.push(`Line ${i + 1}: Unrecognized format — "${line}". Skipping.`);
    }
  }

  // Set defaults for empty scene
  if (!schema.environment?.sky) {
    schema.environment = schema.environment || {};
    schema.environment.sky = { type: 'gradient', topColor: '#1a1a3e', bottomColor: '#4a6fa5' };
  }
  if (!schema.environment?.ground) {
    schema.environment = schema.environment || {};
    schema.environment.ground = { type: 'plane', color: '#2a2a4a' };
  }
  if (!schema.lights || schema.lights.length === 0) {
    schema.lights = [
      { type: 'ambient', color: '#404060', intensity: 0.5 },
      { type: 'directional', color: '#ffeebb', intensity: 1.2, position: [8, 15, 5], castShadow: true },
    ];
  }
  if (!schema.camera) {
    schema.camera = { position: [10, 8, 10], target: [0, 0, 0], fov: 60 };
  }

  return { schema, errors };
}

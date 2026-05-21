/**
 * JSON validation system for LLM-produced scene schemas.
 *
 * Takes raw pasted JSON from the moderator, parses it,
 * validates against SceneSchema, and returns detailed error
 * messages with field paths.
 */

import type { SceneSchema } from '../types/scene.ts';

export interface ValidationResult {
  valid: boolean;
  /** Parsed schema (may be partial if some fields invalid). */
  schema: Partial<SceneSchema>;
  /** Human-readable error messages with field paths. */
  errors: string[];
  /** Warning messages for non-critical issues. */
  warnings: string[];
}

interface ValidationRule {
  path: string;
  test: (value: unknown, obj: Record<string, unknown>) => string | null;
}

// ─── Validation rules ───────────────────────────────────────────────────────

function isNumber(v: unknown): v is number {
  return typeof v === 'number' && !Number.isNaN(v);
}

function isNumberArray(v: unknown, len: number): v is [number, number, number] {
  return Array.isArray(v) && v.length === len && v.every((e) => typeof e === 'number');
}

const colorRegex = /^#[0-9a-fA-F]{3,8}$/;

const topLevelRules: ValidationRule[] = [
  {
    path: 'environment.sky.type',
    test: (v) =>
      v !== undefined && !['gradient', 'color', 'sunset', 'stars', 'none'].includes(v as string)
        ? `Must be one of: gradient, color, sunset, stars, none. Got "${v}".`
        : null,
  },
  {
    path: 'environment.sky.topColor',
    test: (v) =>
      v !== undefined && !colorRegex.test(v as string)
        ? `Must be a valid hex color (e.g. #ff6600). Got "${v}".`
        : null,
  },
  {
    path: 'environment.sky.bottomColor',
    test: (v) =>
      v !== undefined && !colorRegex.test(v as string)
        ? `Must be a valid hex color. Got "${v}".`
        : null,
  },
  {
    path: 'environment.ground.type',
    test: (v) =>
      v !== undefined && !['plane', 'terrain', 'water', 'none'].includes(v as string)
        ? `Must be one of: plane, terrain, water, none. Got "${v}".`
        : null,
  },
  {
    path: 'environment.fog.type',
    test: (v) =>
      v !== undefined && !['linear', 'exponential', 'none'].includes(v as string)
        ? `Must be one of: linear, exponential, none. Got "${v}".`
        : null,
  },
];

function validateLight(value: unknown, index: number): string[] {
  const errors: string[] = [];
  if (!value || typeof value !== 'object') {
    return [`lights[${index}]: must be an object.`];
  }
  const obj = value as Record<string, unknown>;
  const type = obj.type;
  const validTypes = ['ambient', 'directional', 'point', 'spot', 'hemisphere'];
  if (type && !validTypes.includes(type as string)) {
    errors.push(`lights[${index}].type: Must be one of ${validTypes.join(', ')}. Got "${type}".`);
  }
  if (obj.intensity !== undefined && !isNumber(obj.intensity)) {
    errors.push(`lights[${index}].intensity: Must be a number. Got "${obj.intensity}".`);
  }
  if (obj.position !== undefined && !isNumberArray(obj.position, 3)) {
    errors.push(`lights[${index}].position: Must be [x, y, z] array of numbers.`);
  }
  if (obj.color !== undefined && !colorRegex.test(obj.color as string)) {
    errors.push(`lights[${index}].color: Must be a valid hex color. Got "${obj.color}".`);
  }
  return errors;
}

function validateMaterial(path: string, value: unknown): string[] {
  const errors: string[] = [];
  if (!value || typeof value !== 'object') return errors;
  const obj = value as Record<string, unknown>;
  if (obj.color !== undefined && !colorRegex.test(obj.color as string)) {
    errors.push(`${path}.color: Must be a valid hex color. Got "${obj.color}".`);
  }
  if (obj.roughness !== undefined && (!isNumber(obj.roughness) || obj.roughness < 0 || obj.roughness > 1)) {
    errors.push(`${path}.roughness: Must be a number between 0 and 1.`);
  }
  if (obj.metalness !== undefined && (!isNumber(obj.metalness) || obj.metalness < 0 || obj.metalness > 1)) {
    errors.push(`${path}.metalness: Must be a number between 0 and 1.`);
  }
  if (obj.opacity !== undefined && (!isNumber(obj.opacity) || obj.opacity < 0 || obj.opacity > 1)) {
    errors.push(`${path}.opacity: Must be a number between 0 and 1.`);
  }
  if (obj.emissive !== undefined && !colorRegex.test(obj.emissive as string)) {
    errors.push(`${path}.emissive: Must be a valid hex color.`);
  }
  return errors;
}

const validPrimitives = [
  'box', 'sphere', 'cylinder', 'cone', 'torus', 'plane',
  'ring', 'torusKnot', 'tree', 'rock', 'grass', 'cloud',
];

const validInteractionTypes = ['click', 'hover'];
const validActions = ['info', 'animate', 'transform'];
const validAnimationTypes = ['rotate', 'float', 'orbit', 'pulse'];

function validateObject(value: unknown, index: number): string[] {
  const errors: string[] = [];
  if (!value || typeof value !== 'object') {
    return [`objects[${index}]: must be an object.`];
  }
  const obj = value as Record<string, unknown>;

  // type
  if (obj.type && !validPrimitives.includes(obj.type as string)) {
    errors.push(`objects[${index}].type: Must be one of ${validPrimitives.join(', ')}. Got "${obj.type}".`);
  }

  // position / rotation / scale
  if (obj.position !== undefined && !isNumberArray(obj.position, 3)) {
    errors.push(`objects[${index}].position: Must be [x, y, z] array of numbers.`);
  }
  if (obj.rotation !== undefined && !isNumberArray(obj.rotation, 3)) {
    errors.push(`objects[${index}].rotation: Must be [x, y, z] array of numbers.`);
  }
  if (obj.scale !== undefined && !isNumberArray(obj.scale, 3)) {
    errors.push(`objects[${index}].scale: Must be [x, y, z] array of numbers.`);
  }

  // material
  if (obj.material !== undefined) {
    errors.push(...validateMaterial(`objects[${index}].material`, obj.material));
  }

  // dimensions
  if (obj.dimensions !== undefined && typeof obj.dimensions === 'object') {
    const dim = obj.dimensions as Record<string, unknown>;
    if (dim.width !== undefined && !isNumber(dim.width)) errors.push(`objects[${index}].dimensions.width: Must be a number.`);
    if (dim.height !== undefined && !isNumber(dim.height)) errors.push(`objects[${index}].dimensions.height: Must be a number.`);
    if (dim.depth !== undefined && !isNumber(dim.depth)) errors.push(`objects[${index}].dimensions.depth: Must be a number.`);
    if (dim.radius !== undefined && !isNumber(dim.radius)) errors.push(`objects[${index}].dimensions.radius: Must be a number.`);
  }

  // interaction
  if (obj.interaction !== undefined && typeof obj.interaction === 'object') {
    const ia = obj.interaction as Record<string, unknown>;
    if (ia.interactionType && !validInteractionTypes.includes(ia.interactionType as string)) {
      errors.push(`objects[${index}].interaction.interactionType: Must be "click" or "hover".`);
    }
    if (ia.action && !validActions.includes(ia.action as string)) {
      errors.push(`objects[${index}].interaction.action: Must be "info", "animate", or "transform".`);
    }
  }

  // animations
  if (obj.animations !== undefined && Array.isArray(obj.animations)) {
    (obj.animations as unknown[]).forEach((anim, ai) => {
      if (!anim || typeof anim !== 'object') {
        errors.push(`objects[${index}].animations[${ai}]: must be an object.`);
        return;
      }
      const a = anim as Record<string, unknown>;
      if (a.type && !validAnimationTypes.includes(a.type as string)) {
        errors.push(`objects[${index}].animations[${ai}].type: Must be one of ${validAnimationTypes.join(', ')}.`);
      }
    });
  }

  return errors;
}

function validateCamera(value: unknown): string[] {
  const errors: string[] = [];
  if (!value || typeof value !== 'object') return [];
  const obj = value as Record<string, unknown>;
  if (obj.position !== undefined && !isNumberArray(obj.position, 3)) {
    errors.push('camera.position: Must be [x, y, z] array of numbers.');
  }
  if (obj.target !== undefined && !isNumberArray(obj.target, 3)) {
    errors.push('camera.target: Must be [x, y, z] array of numbers.');
  }
  if (obj.fov !== undefined && (!isNumber(obj.fov) || obj.fov < 1 || obj.fov > 180)) {
    errors.push('camera.fov: Must be a number between 1 and 180.');
  }
  return errors;
}

// ─── Main validator ─────────────────────────────────────────────────────────

/**
 * Parse and validate a JSON string against the SceneSchema.
 * Returns detailed errors with field paths, plus the partially-valid schema.
 */
export function validateSceneJSON(jsonString: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  let schema: Partial<SceneSchema> = {};

  // Step 1: Parse JSON
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown parse error';
    // Try to extract position info
    const posMatch = msg.match(/position\s+(\d+)/i);
    const lineCol = posMatch ? ` (around character ${posMatch[1]})` : '';
    return {
      valid: false,
      schema: {},
      errors: [`Invalid JSON${lineCol}: ${msg}`],
      warnings: [],
    };
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return {
      valid: false,
      schema: {},
      errors: ['Root value must be a JSON object (not an array or primitive).'],
      warnings: [],
    };
  }

  schema = parsed as Partial<SceneSchema>;
  const root = parsed as Record<string, unknown>;

  // Step 2: Type-level checks
  if (root.environment !== undefined && (typeof root.environment !== 'object' || root.environment === null)) {
    errors.push('environment: Must be an object.');
  }

  if (root.lights !== undefined) {
    if (!Array.isArray(root.lights)) {
      errors.push('lights: Must be an array.');
    } else {
      (root.lights as unknown[]).forEach((l, i) => { errors.push(...validateLight(l, i)); });
    }
  }

  if (root.objects !== undefined) {
    if (!Array.isArray(root.objects)) {
      errors.push('objects: Must be an array.');
    } else {
      (root.objects as unknown[]).forEach((o, i) => { errors.push(...validateObject(o, i)); });
    }
  }

  // Top-level field validation
  for (const rule of topLevelRules) {
    const parts = rule.path.split('.');
    let current: unknown = root;
    for (const part of parts) {
      if (current && typeof current === 'object') {
        current = (current as Record<string, unknown>)[part];
      } else {
        current = undefined;
        break;
      }
    }
    const err = rule.test(current, root);
    if (err) errors.push(err);
  }

  // Camera
  if (root.camera !== undefined) {
    errors.push(...validateCamera(root.camera));
  }

  // Warning: empty scene
  if (!root.objects || (Array.isArray(root.objects) && root.objects.length === 0)) {
    warnings.push('Scene has no objects — it will appear empty.');
  }

  // Warning: no lights
  if (!root.lights || (Array.isArray(root.lights) && root.lights.length === 0)) {
    warnings.push('Scene has no lights — objects may appear dark.');
  }

  return {
    valid: errors.length === 0,
    schema,
    errors,
    warnings,
  };
}

/**
 * Format validation errors into a single human-readable string.
 */
export function formatValidationErrors(result: ValidationResult): string {
  const parts: string[] = [];
  if (result.errors.length > 0) {
    parts.push('❌ Errors:');
    parts.push(...result.errors.map((e) => `  • ${e}`));
  }
  if (result.warnings.length > 0) {
    parts.push('⚠️  Warnings:');
    parts.push(...result.warnings.map((w) => `  • ${w}`));
  }
  if (result.errors.length === 0 && result.warnings.length === 0) {
    parts.push('✅ JSON is valid!');
  }
  return parts.join('\n');
}

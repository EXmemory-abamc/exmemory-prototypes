/**
 * Structured command presets — ready-to-use examples for the Structured mode.
 *
 * Each preset provides a complete structured input that can be loaded with
 * a single click, demonstrating the syntax and producing a valid scene.
 */

export interface StructuredPreset {
  id: string;
  label: string;
  content: string;
}

export const structuredPresets: StructuredPreset[] = [
  {
    id: 'basic',
    label: 'Basic Scene',
    content: `sky: gradient top #1a1a2e bottom #16213e
ground: plane color #2a2a4a
light: directional from (5, 10, 5) shadow
light: ambient intensity 0.3
add: box at (0, 0.5, 0) color #e94560 scale (1, 1, 1)
add: sphere at (2.5, 0.5, 0) color #0f3460 scale (1, 1, 1)
add: cylinder at (-2.5, 0.5, 0) color #533483 scale (0.8, 1, 0.8)
camera: (8, 6, 8) looking at (0, 0, 0)`,
  },
  {
    id: 'nature',
    label: 'Nature Scene',
    content: `sky: sunset top #ff6b35 bottom #f7c948
ground: terrain color #4a7c3f
light: directional from (8, 10, 6) shadow
light: hemisphere color #87ceeb groundColor #3a5f2b intensity 0.4
fog: exponential color #c4d4b0 density 0.008
add: tree at (-3, 0, 2) color #5c8a3f scale (1, 1.5, 1)
add: tree at (2, 0, -2) color #4d7a32 scale (1.2, 1.8, 1.2)
add: rock at (1, 0, 3) color #666666
add: rock at (-1, 0, -3) color #777777 scale (0.8, 0.6, 0.8)
camera: (10, 6, 10) looking at (0, 0, 0)`,
  },
  {
    id: 'interior',
    label: 'Interior Room',
    content: `sky: color color #f5f0e8
ground: plane color #8b7355
light: point from (-2, 3, 0) intensity 1.2 color #ffeedd
light: ambient intensity 0.2
fog: linear color #f5f0e8 near 8 far 20
add: box at (0, 0.5, 0) color #a0522d scale (2, 0.1, 1.5)
add: sphere at (0, 1.2, 0) color #ff6347 scale (0.4, 0.4, 0.4)
add: cylinder at (1.5, 0.3, 1) color #2f4f4f scale (0.3, 0.2, 0.3)
add: box at (-1.5, 0.5, 0.5) color #5f9ea0 scale (0.6, 0.8, 0.4)
camera: (4, 3, 6) looking at (0, 0, 0)`,
  },
  {
    id: 'abstract',
    label: 'Abstract Scene',
    content: `sky: stars top #000011 bottom #000033
ground: water color #1a5276
light: directional from (10, 15, 5) shadow
light: point from (-5, 3, 2) intensity 0.8 color #ff00ff
light: point from (5, 3, -2) intensity 0.8 color #00ffff
add: torus at (0, 2, 0) color #ff6b9d scale (1.5, 1, 1.5)
add: torusKnot at (3, 1.5, 1) color #c084fc scale (0.8, 0.8, 0.8)
add: cone at (-2.5, 1, -1) color #fbbf24 scale (1, 1.5, 1)
add: sphere at (0, 0.5, -3) color #34d399 scale (0.8, 0.8, 0.8) interactive
camera: (10, 8, 10) looking at (0, 0, 0) fov 50`,
  },
];

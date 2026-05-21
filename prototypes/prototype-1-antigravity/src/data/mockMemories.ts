export interface MemoryAnchor {
  id: string;
  author: string;
  age: number;
  location: string;
  worldPosition: [number, number, number];
  realityLayer: 'PHYSICAL' | 'PERCEPTIVE' | 'INTERPRETATIVE';
  emotionalIntensity: number; // 0.1 to 1.0
  emotionalProfile: {
    fear: number;      // 0.0 - 1.0
    confusion: number; // 0.0 - 1.0
    hope: number;      // 0.0 - 1.0
  };
  excerpt: string; // Spoken testimony fragment
  audioUrl: string; // Placeholder for spatial audio
  waveformSeeds: number[]; // 32 values for mock waveform
}

export const mockMemories: MemoryAnchor[] = [
  {
    id: 'mem-001',
    author: 'Elena M.',
    age: 44,
    location: 'Amatrice, RI — Via Battisti 12',
    worldPosition: [0, 1, 0],
    realityLayer: 'PHYSICAL',
    emotionalIntensity: 0.5,
    emotionalProfile: { fear: 0.72, confusion: 0.55, hope: 0.41 },
    excerpt: '"Il soffitto è sceso in silenzio. Non c\'era rumore, solo il bianco della polvere che riempiva tutto."',
    audioUrl: '/audio/mem-001.mp3',
    waveformSeeds: [0.3,0.5,0.8,0.6,0.9,0.4,0.7,0.3,0.5,0.8,0.6,0.9,0.4,0.7,0.3,0.5,0.8,0.6,0.9,0.4,0.7,0.3,0.5,0.8,0.6,0.9,0.4,0.7,0.3,0.5,0.8,0.6],
  },
  {
    id: 'mem-002',
    author: 'Marco R.',
    age: 31,
    location: 'Accumoli, RI — Piazza del Municipio',
    worldPosition: [2, 1.5, -2],
    realityLayer: 'PERCEPTIVE',
    emotionalIntensity: 0.8,
    emotionalProfile: { fear: 0.91, confusion: 0.78, hope: 0.12 },
    excerpt: '"Cercavo mia sorella tra le macerie. Chiamavo il suo nome e l\'eco mi rispondeva — era il mio stesso respiro."',
    audioUrl: '/audio/mem-002.mp3',
    waveformSeeds: [0.9,0.7,0.8,0.9,0.6,0.8,0.9,0.7,0.5,0.9,0.8,0.7,0.6,0.9,0.8,0.7,0.9,0.6,0.8,0.9,0.7,0.8,0.9,0.6,0.8,0.9,0.7,0.5,0.9,0.8,0.7,0.6],
  },
  {
    id: 'mem-003',
    author: 'Giulia B.',
    age: 67,
    location: 'Pescara del Tronto, AP',
    worldPosition: [-2, 0.5, 1],
    realityLayer: 'INTERPRETATIVE',
    emotionalIntensity: 0.3,
    emotionalProfile: { fear: 0.44, confusion: 0.88, hope: 0.62 },
    excerpt: '"Da quella notte non so più dove inizia il ricordo e dove inizia il sogno. Sono la stessa cosa adesso."',
    audioUrl: '/audio/mem-003.mp3',
    waveformSeeds: [0.2,0.3,0.4,0.3,0.5,0.4,0.3,0.4,0.5,0.3,0.4,0.5,0.3,0.2,0.4,0.5,0.3,0.4,0.2,0.3,0.4,0.3,0.5,0.4,0.3,0.4,0.5,0.3,0.4,0.5,0.3,0.2],
  },
  {
    id: 'mem-004',
    author: 'Luca F.',
    age: 22,
    location: 'Amatrice, RI — Via Roma 5',
    worldPosition: [1.5, 0.2, 1.5],
    realityLayer: 'PERCEPTIVE',
    emotionalIntensity: 0.9,
    emotionalProfile: { fear: 0.95, confusion: 0.60, hope: 0.05 },
    excerpt: '"Avevo 18 anni. Il paese che conoscevo non esiste più. Quello che vedo ora è solo il negativo di una fotografia."',
    audioUrl: '/audio/mem-004.mp3',
    waveformSeeds: [0.8,0.9,1.0,0.8,0.9,0.7,1.0,0.8,0.9,1.0,0.8,0.9,0.7,1.0,0.8,0.9,1.0,0.8,0.9,0.7,1.0,0.8,0.9,1.0,0.8,0.9,0.7,1.0,0.8,0.9,1.0,0.8],
  },
  {
    id: 'mem-005',
    author: 'Sofia D.',
    age: 55,
    location: 'Norcia, PG — Contrada Serravalle',
    worldPosition: [-1.5, 2, -1],
    realityLayer: 'PHYSICAL',
    emotionalIntensity: 0.4,
    emotionalProfile: { fear: 0.50, confusion: 0.35, hope: 0.78 },
    excerpt: '"Abbiamo ricominciato. È una parola piccola per una cosa enorme. Ma la mattina il sole batte ancora sulle stesse colline."',
    audioUrl: '/audio/mem-005.mp3',
    waveformSeeds: [0.4,0.5,0.3,0.6,0.4,0.5,0.6,0.4,0.5,0.3,0.6,0.4,0.5,0.6,0.4,0.5,0.3,0.6,0.4,0.5,0.6,0.4,0.5,0.3,0.6,0.4,0.5,0.6,0.4,0.5,0.3,0.6],
  },
];

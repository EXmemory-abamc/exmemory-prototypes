import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockMemories, type MemoryAnchor } from '../../data/mockMemories';
import { useMemoryStore } from '../../store/useMemoryStore';

// ─────────────────────────────────────────────────────────────────────────────
// Animated audio waveform (mock)
// ─────────────────────────────────────────────────────────────────────────────
const WaveformBar: React.FC<{ height: number; delay: number; color: string }> = ({ height, delay, color }) => (
  <motion.div
    className="w-[3px] rounded-full origin-bottom"
    style={{ backgroundColor: color, height: `${height * 32}px` }}
    animate={{ scaleY: [1, 0.3 + Math.random() * 0.7, 1] }}
    transition={{ duration: 1.2, repeat: Infinity, delay, ease: 'easeInOut' }}
  />
);

const MockWaveform: React.FC<{ seeds: number[]; color: string }> = ({ seeds, color }) => (
  <div className="flex items-end gap-[2px] h-8 py-1">
    {seeds.map((h, i) => (
      <WaveformBar key={i} height={h} delay={i * 0.04} color={color} />
    ))}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Emotional bar
// ─────────────────────────────────────────────────────────────────────────────
const EmotionBar: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
  <div className="flex flex-col gap-1">
    <div className="flex justify-between items-center">
      <span className="text-[10px] font-mono tracking-widest text-white/40 uppercase">{label}</span>
      <span className="text-[10px] font-mono text-white/60">{Math.round(value * 100)}%</span>
    </div>
    <div className="w-full h-[1px] bg-white/10 relative">
      <motion.div
        className="absolute left-0 top-0 h-full"
        style={{ backgroundColor: color }}
        initial={{ width: 0 }}
        animate={{ width: `${value * 100}%` }}
        transition={{ duration: 1.0, ease: 'easeOut', delay: 0.3 }}
      />
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Layer badge
// ─────────────────────────────────────────────────────────────────────────────
const layerColor = (layer: MemoryAnchor['realityLayer']) => {
  switch (layer) {
    case 'PHYSICAL':       return { color: '#4ADE80', label: 'PHYSICAL' };
    case 'PERCEPTIVE':     return { color: '#FBBF24', label: 'PERCEPTIVE' };
    case 'INTERPRETATIVE': return { color: '#60A5FA', label: 'INTERPRETATIVE' };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Panel content
// ─────────────────────────────────────────────────────────────────────────────
const PanelContent: React.FC<{ memory: MemoryAnchor }> = ({ memory }) => {
  const { color, label } = layerColor(memory.realityLayer);
  const setActive = useMemoryStore((s) => s.setActiveHotspot);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-start mb-5">
        <div>
          <div className="text-[9px] font-mono tracking-[0.3em] text-white/30 uppercase mb-1">
            Memory Archive // {memory.id.toUpperCase()}
          </div>
          <h2 className="text-lg font-mono font-bold text-white tracking-wide">{memory.author}</h2>
          <div className="text-xs font-mono text-white/50 mt-0.5">
            {memory.age} anni · {memory.location}
          </div>
        </div>
        <button
          onClick={() => setActive(null)}
          className="text-white/30 hover:text-white/70 text-lg font-mono transition-colors leading-none mt-1"
        >
          ✕
        </button>
      </div>

      {/* Layer badge */}
      <div
        className="inline-flex items-center gap-2 px-2 py-1 border mb-5 w-fit"
        style={{ borderColor: `${color}40`, backgroundColor: `${color}10` }}
      >
        <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: color }} />
        <span className="text-[9px] font-mono tracking-[0.25em]" style={{ color }}>{label}</span>
      </div>

      {/* Excerpt */}
      <div
        className="border-l-2 pl-3 mb-5 text-sm font-mono leading-relaxed italic text-white/70"
        style={{ borderColor: `${color}60` }}
      >
        {memory.excerpt}
      </div>

      {/* Waveform */}
      <div className="mb-5">
        <div className="text-[9px] font-mono tracking-widest text-white/30 uppercase mb-2">
          Audio · Testimonianza
        </div>
        <MockWaveform seeds={memory.waveformSeeds} color={color} />
        <div className="text-[9px] font-mono text-white/20 mt-1">3:42 // Archivio Orale 2016</div>
      </div>

      <div className="border-t border-white/10 pt-4">
        <div className="text-[9px] font-mono tracking-widest text-white/30 uppercase mb-3">
          Profilo Emotivo
        </div>
        <div className="flex flex-col gap-3">
          <EmotionBar label="Paura"      value={memory.emotionalProfile.fear}      color="#f87171" />
          <EmotionBar label="Confusione" value={memory.emotionalProfile.confusion}  color="#fbbf24" />
          <EmotionBar label="Speranza"   value={memory.emotionalProfile.hope}       color="#4ade80" />
        </div>
      </div>

      {/* Intensity */}
      <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
        <span className="text-[9px] font-mono tracking-widest text-white/30 uppercase">
          Intensità Emotiva
        </span>
        <span className="text-sm font-mono font-bold" style={{ color }}>
          {Math.round(memory.emotionalIntensity * 100)} / 100
        </span>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Panel export
// ─────────────────────────────────────────────────────────────────────────────
export const MemoryPanel: React.FC = () => {
  const activeHotspotId = useMemoryStore((s) => s.activeHotspotId);
  const memory = mockMemories.find((m) => m.id === activeHotspotId) ?? null;

  return (
    <AnimatePresence>
      {memory && (
        <motion.div
          key={memory.id}
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
          className="absolute top-0 right-0 h-full z-50 flex items-center"
        >
          <div
            className="h-full w-80 p-6 overflow-y-auto"
            style={{
              background: 'rgba(5,5,5,0.85)',
              backdropFilter: 'blur(16px)',
              borderLeft: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <PanelContent memory={memory} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

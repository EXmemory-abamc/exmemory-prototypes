import React from 'react';
import { useMemoryStore } from '../../store/useMemoryStore';

export const LevelSwitcher: React.FC = () => {
  const currentLevel = useMemoryStore((state) => state.currentLevel);
  const setLevel = useMemoryStore((state) => state.setLevel);
  const collectiveEntropy = useMemoryStore((state) => state.collectiveEntropy);
  const setCollectiveEntropy = useMemoryStore((state) => state.setCollectiveEntropy);

  const levels = [
    { id: 1, label: 'GLOBE' },
    { id: 2, label: 'REGION' },
    { id: 3, label: 'CITY' },
    { id: 4, label: 'ROOM' },
  ];

  const entropyLabel =
    collectiveEntropy < 0.15 ? 'INDIVIDUAL'
    : collectiveEntropy < 0.55 ? 'EMERGING'
    : collectiveEntropy < 0.85 ? 'COLLECTIVE'
    : 'CHAOS';

  return (
    <div className="absolute bottom-6 left-6 z-50 flex flex-col gap-3 font-mono text-xs select-none">
      {/* Level buttons */}
      <div className="flex flex-col gap-1">
        {levels.map((level) => (
          <button
            key={level.id}
            onClick={() => setLevel(level.id)}
            className={`px-4 py-2 text-left border uppercase tracking-widest transition-all duration-200 ${
              currentLevel === level.id
                ? 'border-white text-white bg-white/10'
                : 'border-white/20 text-white/40 hover:border-white/50 hover:text-white/70'
            }`}
          >
            {level.label}
          </button>
        ))}
      </div>

      {/* Entropy slider — only visible in Room */}
      {currentLevel === 4 && (
        <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
          <div className="flex justify-between items-center">
            <span className="text-white/40 tracking-widest uppercase">ENTROPY</span>
            <span
              className="tracking-widest"
              style={{
                color: collectiveEntropy < 0.5
                  ? `hsl(${120 - collectiveEntropy * 240}, 70%, 65%)`
                  : `hsl(${120 - collectiveEntropy * 240}, 80%, 60%)`
              }}
            >
              {entropyLabel}
            </span>
          </div>

          <input
            type="range"
            min={0} max={1} step={0.01}
            value={collectiveEntropy}
            onChange={(e) => setCollectiveEntropy(parseFloat(e.target.value))}
            className="w-40 accent-white cursor-pointer"
            style={{ accentColor: `hsl(${120 - collectiveEntropy * 120}, 70%, 65%)` }}
          />

          <div className="flex justify-between text-white/25 text-[10px]">
            <span>INDIVIDUAL</span>
            <span>COLLECTIVE</span>
          </div>
        </div>
      )}
    </div>
  );
};

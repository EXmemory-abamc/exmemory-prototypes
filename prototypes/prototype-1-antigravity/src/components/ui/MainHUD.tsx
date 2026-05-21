import React, { useEffect, useState } from 'react';
import { useMemoryStore } from '../../store/useMemoryStore';


const levelLabels: Record<number, string> = { 1: 'L1 // GLOBE', 2: 'L2 // REGION', 3: 'L3 // CITY', 4: 'L4 // ROOM' };

const SystemStatus: React.FC = () => {
  const currentLevel = useMemoryStore((s) => s.currentLevel);
  const [coords, setCoords] = useState({ x: 0, y: 0, z: 0 });

  // We can't use useThree here (outside Canvas), so we poll the store position
  const targetPos = useMemoryStore((s) => s.targetPosition);
  useEffect(() => {
    setCoords({
      x: parseFloat(targetPos.x.toFixed(2)),
      y: parseFloat(targetPos.y.toFixed(2)),
      z: parseFloat(targetPos.z.toFixed(2)),
    });
  }, [targetPos]);

  return (
    <div className="absolute bottom-6 right-6 z-50 font-mono text-[10px] text-white/30 flex flex-col items-end gap-1 select-none">
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
        <span className="tracking-widest text-green-400/70">SYSTEM ONLINE</span>
      </div>
      <div className="tracking-widest">{levelLabels[currentLevel]}</div>
      <div className="tracking-wider text-white/20">
        CAM [{coords.x.toFixed(1)}, {coords.y.toFixed(1)}, {coords.z.toFixed(1)}]
      </div>
    </div>
  );
};

export const MainHUD: React.FC = () => {
  const navLinks = ['EXPLORE', 'CONTRIBUTE', 'LAB', 'ABOUT'];

  return (
    <>
      {/* Top bar */}
      <div
        className="absolute top-0 left-0 right-0 z-50 flex justify-between items-center px-6 py-4 select-none"
        style={{
          background: 'linear-gradient(to bottom, rgba(5,5,5,0.7) 0%, transparent 100%)',
        }}
      >
        {/* Project Title */}
        <div className="font-mono">
          <div className="text-[9px] tracking-[0.35em] text-white/30 uppercase mb-0.5">
            Archive System v0.4
          </div>
          <div className="text-sm font-bold tracking-[0.15em] text-white">
            EXmemory
          </div>
          <div className="text-[9px] tracking-[0.2em] text-white/40 uppercase">
            // Immersive Collective Memory
          </div>
        </div>

        {/* Nav */}
        <nav className="flex gap-6 font-mono text-[10px] tracking-[0.25em]">
          {navLinks.map((link) => (
            <button
              key={link}
              className="text-white/40 hover:text-white/80 uppercase transition-colors duration-200 relative group"
            >
              {link}
              <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-white/50 group-hover:w-full transition-all duration-300" />
            </button>
          ))}
        </nav>
      </div>

      {/* Bottom-right system status */}
      <SystemStatus />
    </>
  );
};

import React from 'react';
import { Experience } from './components/canvas/Experience';
import { LevelSwitcher } from './components/ui/LevelSwitcher';
import { MainHUD } from './components/ui/MainHUD';
import { MemoryPanel } from './components/ui/MemoryPanel';

const App: React.FC = () => {
  return (
    <div className="w-screen h-screen overflow-hidden bg-[#050505] relative">
      {/* 3D Canvas — fills the full viewport */}
      <Experience />

      {/* HTML overlays — stacked above the canvas */}
      <MainHUD />
      <LevelSwitcher />
      <MemoryPanel />
    </div>
  );
};

export default App;

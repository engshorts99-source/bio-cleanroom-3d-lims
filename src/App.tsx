import React, { useState, useRef } from 'react';
import { LabProvider, useLab } from './context/LabContext';
import { Header } from './components/Header';
import { Viewport3D } from './components/Viewport3D';
import { LimsDatabasePanel } from './components/LimsDatabasePanel';
import { DetailModal } from './components/DetailModal';
import { NewItemModal } from './components/NewItemModal';
import { LabScene } from './three/LabScene';
import { CameraViewZone } from './types/lims';

const LabApp: React.FC = () => {
  const sceneRef = useRef<LabScene | null>(null);
  const { setSelectedZone } = useLab();
  const [newModalType, setNewModalType] = useState<'sample' | 'reagent' | null>(null);

  const handleSceneReady = (scene: LabScene) => {
    sceneRef.current = scene;
  };

  const handleSelectZone = (zone: CameraViewZone) => {
    setSelectedZone(zone);
    if (sceneRef.current) {
      sceneRef.current.setCameraView(zone);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans">
      {/* Top Header Bar */}
      <Header onSelectZone={handleSelectZone} />

      {/* 3D Cleanroom Canvas Viewport */}
      <main className="w-full h-full">
        <Viewport3D onSceneReady={handleSceneReady} />
      </main>

      {/* LIMS Database Bottom Dock */}
      <LimsDatabasePanel 
        onOpenNewModal={(type) => setNewModalType(type)}
        onNavigateToZone={handleSelectZone}
      />

      {/* Item Detail Inspector Modal */}
      <DetailModal />

      {/* New Sample/Reagent Registration Modal */}
      <NewItemModal 
        type={newModalType} 
        onClose={() => setNewModalType(null)} 
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <LabProvider>
      <LabApp />
    </LabProvider>
  );
};

export default App;

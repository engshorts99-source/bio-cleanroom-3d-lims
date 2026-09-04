import React, { useState, useRef } from 'react';
import * as THREE from 'three';
import { LabProvider, useLab } from './context/LabContext';
import { Header } from './components/Header';
import { Viewport3D } from './components/Viewport3D';
import { LimsDatabasePanel } from './components/LimsDatabasePanel';
import { DetailModal } from './components/DetailModal';
import { NewItemModal } from './components/NewItemModal';
import { ProtocolStudio, ActiveProtocolBanner } from './components/ProtocolStudio';
import { LabScene } from './three/LabScene';
import { CameraViewZone, ProtocolRun } from './types/lims';

const LabApp: React.FC = () => {
  const sceneRef = useRef<LabScene | null>(null);
  const { setSelectedZone } = useLab();
  
  const [newModalType, setNewModalType] = useState<'sample' | 'reagent' | null>(null);
  const [isProtocolStudioOpen, setIsProtocolStudioOpen] = useState<boolean>(false);
  const [activeRunningProtocol, setActiveRunningProtocol] = useState<ProtocolRun | null>(null);

  const handleSceneReady = (scene: LabScene) => {
    sceneRef.current = scene;
  };

  const handleSelectZone = (zone: CameraViewZone) => {
    setSelectedZone(zone);
    if (sceneRef.current) {
      sceneRef.current.setCameraView(zone);
    }
  };

  const handleStartProtocol = (protocol: ProtocolRun) => {
    setActiveRunningProtocol(protocol);
    // Draw guide path to first equipment (e.g. BSC at -8.8, 1.2, -5.8 or Centrifuge at -7.2, 1.2, 2.4)
    if (sceneRef.current) {
      sceneRef.current.setProtocolGuideTarget(new THREE.Vector3(-8.8, 0, -5.8));
    }
  };

  const handleCompleteProtocolStep = (stepOrder: number) => {
    if (!activeRunningProtocol) return;

    const updatedSteps = activeRunningProtocol.steps.map(s => 
      s.order === stepOrder ? { ...s, completed: true } : s
    );
    const updatedProtocol = { ...activeRunningProtocol, steps: updatedSteps };
    setActiveRunningProtocol(updatedProtocol);

    // Update 3D guide pathway to next station
    const nextStep = updatedSteps.find(s => !s.completed);
    if (sceneRef.current) {
      if (!nextStep) {
        sceneRef.current.setProtocolGuideTarget(null);
      } else if (nextStep.description.includes('원심분리') || nextStep.description.includes('스핀')) {
        sceneRef.current.setProtocolGuideTarget(new THREE.Vector3(-7.2, 0, 2.4));
      } else if (nextStep.description.includes('냉동') || nextStep.description.includes('보관')) {
        sceneRef.current.setProtocolGuideTarget(new THREE.Vector3(6.3, 0, -5.8));
      } else if (nextStep.description.includes('분주') || nextStep.description.includes('로봇')) {
        sceneRef.current.setProtocolGuideTarget(new THREE.Vector3(5.5, 0, 2.5));
      } else {
        sceneRef.current.setProtocolGuideTarget(new THREE.Vector3(-5.4, 0, -5.8));
      }
    }
  };

  const handleStopProtocol = () => {
    setActiveRunningProtocol(null);
    if (sceneRef.current) {
      sceneRef.current.setProtocolGuideTarget(null);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans">
      {/* Top Header Bar */}
      <Header onSelectZone={handleSelectZone} />

      {/* 3D Cleanroom Canvas Viewport */}
      <main className="w-full h-full">
        <Viewport3D 
          onSceneReady={handleSceneReady} 
          onOpenProtocolStudio={() => setIsProtocolStudioOpen(true)}
        />
      </main>

      {/* Active Running Protocol Banner (Top Right) */}
      <ActiveProtocolBanner
        protocol={activeRunningProtocol}
        onCompleteStep={handleCompleteProtocolStep}
        onStopProtocol={handleStopProtocol}
      />

      {/* Protocol Studio Modal */}
      <ProtocolStudio
        isOpen={isProtocolStudioOpen}
        onClose={() => setIsProtocolStudioOpen(false)}
        onStartProtocol={handleStartProtocol}
      />

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

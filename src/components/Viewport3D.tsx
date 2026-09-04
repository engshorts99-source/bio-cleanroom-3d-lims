import React, { useEffect, useRef, useState } from 'react';
import { LabScene, InteractiveObjectData } from '../three/LabScene';
import { useLab } from '../context/LabContext';
import { SoftLabHUD } from './SoftLabHUD';

interface Viewport3DProps {
  onSceneReady?: (scene: LabScene) => void;
  onOpenProtocolStudio: () => void;
}

export const Viewport3D: React.FC<Viewport3DProps> = ({ 
  onSceneReady, 
  onOpenProtocolStudio 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<LabScene | null>(null);
  const { 
    selectedZone, 
    setSelectedZone, 
    setSelectedItem, 
    samples, 
    reagents, 
    equipment,
    setActiveTab
  } = useLab();

  const [proximityTarget, setProximityTarget] = useState<InteractiveObjectData | null>(null);
  const [walkMode, setWalkMode] = useState<boolean>(true);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new LabScene(containerRef.current);
    sceneRef.current = scene;
    if (onSceneReady) onSceneReady(scene);

    scene.onProximityChange = (target) => {
      setProximityTarget(target);
    };

    scene.onObjectSelect = (data) => {
      setSelectedZone(data.zone);
      
      // Select appropriate item in context
      if (data.category === 'equipment') {
        const eq = equipment.find(e => e.id === data.id);
        if (eq) setSelectedItem({ type: 'equipment', data: eq });
        setActiveTab('equipment');
      } else if (data.category === 'cells') {
        const smp = samples.find(s => s.storageLocation.zone.includes('Zone B'));
        if (smp) setSelectedItem({ type: 'sample', data: smp });
        setActiveTab('cells');
      } else if (data.category === 'reagents') {
        const rgt = reagents[0];
        if (rgt) setSelectedItem({ type: 'reagent', data: rgt });
        setActiveTab('reagents');
      }
    };

    return () => {
      scene.destroy();
      sceneRef.current = null;
    };
  }, []);

  // Update camera when selectedZone changes from outside
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.setCameraView(selectedZone);
      setWalkMode(sceneRef.current.walkMode);
    }
  }, [selectedZone]);

  const handleTriggerInteraction = () => {
    if (sceneRef.current && proximityTarget) {
      sceneRef.current.triggerActionForTarget(proximityTarget);
    }
  };

  const handleToggleWalkMode = () => {
    if (sceneRef.current) {
      const next = !walkMode;
      sceneRef.current.walkMode = next;
      setWalkMode(next);
      if (!next) {
        sceneRef.current.setCameraView('overview');
      }
    }
  };

  return (
    <div className="relative w-full h-full select-none overflow-hidden">
      {/* 3D WebGL Canvas Container */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Refined Genshin / High-End Studio HUD Overlay */}
      <SoftLabHUD
        proximityTarget={proximityTarget}
        onTriggerInteraction={handleTriggerInteraction}
        walkMode={walkMode}
        onToggleWalkMode={handleToggleWalkMode}
        onOpenProtocolStudio={onOpenProtocolStudio}
      />
    </div>
  );
};

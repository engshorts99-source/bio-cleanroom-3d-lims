import React, { useEffect, useRef, useState } from 'react';
import { LabScene, InteractiveObjectData } from '../three/LabScene';
import { useLab } from '../context/LabContext';
import { 
  Play, 
  DoorOpen, 
  SunMedium, 
  RotateCw, 
  MousePointerClick, 
  HelpCircle,
  FlaskConical,
  Wind
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Viewport3DProps {
  onSceneReady?: (scene: LabScene) => void;
}

export const Viewport3D: React.FC<Viewport3DProps> = ({ onSceneReady }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<LabScene | null>(null);
  const { 
    selectedZone, 
    setSelectedZone, 
    setSelectedItem, 
    samples, 
    reagents, 
    equipment,
    updateEquipmentStatus,
    setActiveTab
  } = useLab();

  const [hoverData, setHoverData] = useState<{ data: InteractiveObjectData; x: number; y: number } | null>(null);
  const [showControlsHint, setShowControlsHint] = useState(true);

  // Local animated states for quick buttons
  const [centrifugeRunning, setCentrifugeRunning] = useState(false);
  const [robotRunning, setRobotRunning] = useState(false);
  const [uvActive, setUvActive] = useState(false);
  const [sashOpen, setSashOpen] = useState(false);
  const [incubatorDoorOpen, setIncubatorDoorOpen] = useState(false);
  const [freezerDoorOpen, setFreezerDoorOpen] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new LabScene(containerRef.current);
    sceneRef.current = scene;
    if (onSceneReady) onSceneReady(scene);

    scene.onObjectHover = (data, clientX, clientY) => {
      if (data) {
        setHoverData({ data, x: clientX, y: clientY });
      } else {
        setHoverData(null);
      }
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
    }
  }, [selectedZone]);

  // Centrifuge Action
  const handleRunCentrifuge = () => {
    if (!sceneRef.current || centrifugeRunning) return;
    setCentrifugeRunning(true);
    updateEquipmentStatus('EQP-CEN-01', 'Running', { rpm: 13500 });
    sceneRef.current.triggerCentrifugeRun(13500, 5);

    setTimeout(() => {
      setCentrifugeRunning(false);
      updateEquipmentStatus('EQP-CEN-01', 'Idle', { rpm: 0 });
      confetti({ particleCount: 30, spread: 60, origin: { y: 0.6 } });
    }, 5200);
  };

  // Robot Action
  const handleRunRobot = () => {
    if (!sceneRef.current || robotRunning) return;
    setRobotRunning(true);
    updateEquipmentStatus('EQP-ROB-01', 'Running');
    sceneRef.current.triggerRobotProtocol();

    setTimeout(() => {
      setRobotRunning(false);
      updateEquipmentStatus('EQP-ROB-01', 'Idle');
      confetti({ particleCount: 40, spread: 70, origin: { y: 0.7 } });
    }, 6200);
  };

  // BSC Toggles
  const handleToggleSash = () => {
    if (!sceneRef.current) return;
    sceneRef.current.toggleBscSash();
    setSashOpen(sceneRef.current.bscSashOpen);
  };

  const handleToggleUv = () => {
    if (!sceneRef.current) return;
    sceneRef.current.toggleBscUv();
    setUvActive(sceneRef.current.bscUvOn);
    updateEquipmentStatus('EQP-BSC-01', sceneRef.current.bscUvOn ? 'Sterilizing' : 'Idle', {
      uvSterilization: sceneRef.current.bscUvOn
    });
  };

  // Incubator Toggle
  const handleToggleIncubator = () => {
    if (!sceneRef.current) return;
    sceneRef.current.toggleIncubatorDoor();
    setIncubatorDoorOpen(sceneRef.current.incubatorDoorOpen);
  };

  // Freezer Toggle
  const handleToggleFreezer = () => {
    if (!sceneRef.current) return;
    sceneRef.current.toggleFreezerDoor();
    setFreezerDoorOpen(sceneRef.current.freezerDoorOpen);
  };

  return (
    <div className="relative w-full h-full select-none overflow-hidden">
      {/* 3D WebGL Canvas Container */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating 3D Hover Tooltip */}
      {hoverData && (
        <div
          className="fixed pointer-events-none z-50 transform -translate-x-1/2 -translate-y-full mb-3 px-3 py-2 bg-slate-900/95 border border-sky-500/50 rounded-lg shadow-xl shadow-sky-500/20 backdrop-blur-md text-xs transition-opacity duration-150 animate-in fade-in zoom-in-95"
          style={{ left: `${hoverData.x}px`, top: `${hoverData.y - 12}px` }}
        >
          <div className="flex items-center gap-1.5 text-sky-400 font-semibold mb-0.5">
            <MousePointerClick className="w-3.5 h-3.5" />
            <span>{hoverData.data.name}</span>
          </div>
          <p className="text-[11px] text-slate-300 max-w-xs">{hoverData.data.description}</p>
          <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800 pt-1">
            <span>ID: {hoverData.data.id}</span>
            <span className="text-sky-300 font-medium">클릭하여 세부조회</span>
          </div>
        </div>
      )}

      {/* Contextual Equipment Control Dock (Appears over 3D scene when specific equipment is in view) */}
      <div className="absolute top-24 left-4 z-20 flex flex-col gap-2">
        {selectedZone === 'centrifuge' && (
          <div className="bg-slate-900/90 border border-sky-500/40 rounded-xl p-3 shadow-lg shadow-black/50 backdrop-blur-md text-xs w-64 animate-in fade-in slide-in-from-left">
            <div className="flex items-center justify-between font-semibold text-slate-100 mb-2">
              <span className="flex items-center gap-1.5 text-sky-400">
                <RotateCw className="w-4 h-4" />
                원심분리기 실시간 제어
              </span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] ${centrifugeRunning ? 'bg-amber-500/20 text-amber-400 animate-pulse' : 'bg-slate-800 text-slate-400'}`}>
                {centrifugeRunning ? '13,500 RPM 회전중' : '대기 (0 RPM)'}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleRunCentrifuge}
                disabled={centrifugeRunning}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white font-medium rounded-lg shadow-md transition-all text-xs"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                {centrifugeRunning ? '원심분리 가속중...' : '13,500 RPM 스핀'}
              </button>
              <button
                onClick={() => sceneRef.current?.toggleCentrifugeLid()}
                disabled={centrifugeRunning}
                className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-lg border border-slate-700 transition-all"
                title="리드(뚜껑) 열기/닫기"
              >
                <DoorOpen className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {selectedZone === 'bsc' && (
          <div className="bg-slate-900/90 border border-sky-500/40 rounded-xl p-3 shadow-lg shadow-black/50 backdrop-blur-md text-xs w-64 animate-in fade-in slide-in-from-left">
            <div className="flex items-center justify-between font-semibold text-slate-100 mb-2">
              <span className="flex items-center gap-1.5 text-sky-400">
                <Wind className="w-4 h-4" />
                BSC 무균작업대 제어
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">기류 0.53 m/s</span>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={handleToggleSash}
                className="flex items-center justify-center gap-1.5 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg border border-slate-700 font-medium transition-all"
              >
                <DoorOpen className="w-3.5 h-3.5 text-sky-400" />
                {sashOpen ? '유리 새시(Sash) 내림 (작동)' : '유리 새시(Sash) 올림 (개방)'}
              </button>
              <button
                onClick={handleToggleUv}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg font-medium transition-all ${
                  uvActive 
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' 
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                }`}
              >
                <SunMedium className="w-3.5 h-3.5" />
                {uvActive ? '🟣 UV 멸균 소독 끄기' : 'UV 멸균 소독 켜기 (254nm)'}
              </button>
            </div>
          </div>
        )}

        {selectedZone === 'incubator' && (
          <div className="bg-slate-900/90 border border-emerald-500/40 rounded-xl p-3 shadow-lg shadow-black/50 backdrop-blur-md text-xs w-64 animate-in fade-in slide-in-from-left">
            <div className="flex items-center justify-between font-semibold text-slate-100 mb-2">
              <span className="text-emerald-400 font-mono">37.0°C / 5.0% CO2</span>
              <span className="text-[10px] text-slate-400">포유류 세포 배양기</span>
            </div>
            <button
              onClick={handleToggleIncubator}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg shadow-md transition-all"
            >
              <DoorOpen className="w-3.5 h-3.5" />
              {incubatorDoorOpen ? '인큐베이터 도어 닫기' : '인큐베이터 도어 열기 (트레이 확인)'}
            </button>
          </div>
        )}

        {selectedZone === 'freezer' && (
          <div className="bg-slate-900/90 border border-sky-400/40 rounded-xl p-3 shadow-lg shadow-black/50 backdrop-blur-md text-xs w-64 animate-in fade-in slide-in-from-left">
            <div className="flex items-center justify-between font-semibold text-slate-100 mb-2">
              <span className="text-sky-300 font-mono">-80.2°C 초저온 냉동고</span>
              <span className="text-[10px] text-slate-400">시료 60,000 바이알</span>
            </div>
            <button
              onClick={handleToggleFreezer}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-sky-600 hover:bg-sky-500 text-white font-medium rounded-lg shadow-md transition-all"
            >
              <DoorOpen className="w-3.5 h-3.5" />
              {freezerDoorOpen ? '초저온 도어 밀폐 닫기' : '-80°C 도어 열기 (냉기 방출)'}
            </button>
          </div>
        )}

        {selectedZone === 'liquid_handler' && (
          <div className="bg-slate-900/90 border border-amber-500/40 rounded-xl p-3 shadow-lg shadow-black/50 backdrop-blur-md text-xs w-64 animate-in fade-in slide-in-from-left">
            <div className="flex items-center justify-between font-semibold text-slate-100 mb-2">
              <span className="text-amber-400">자동화 분주 로봇 Biomek</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] ${robotRunning ? 'bg-amber-500/20 text-amber-300 animate-pulse' : 'bg-slate-800 text-slate-400'}`}>
                {robotRunning ? '피펫팅 분주중...' : '대기 상태'}
              </span>
            </div>
            <button
              onClick={handleRunRobot}
              disabled={robotRunning}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold rounded-lg shadow-md transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              {robotRunning ? '3축 갠트리 동작중...' : '96-Well 분주 루틴 시작'}
            </button>
          </div>
        )}

        {selectedZone === 'reagents_cabinet' && (
          <div className="bg-slate-900/90 border border-sky-500/40 rounded-xl p-3 shadow-lg shadow-black/50 backdrop-blur-md text-xs w-64 animate-in fade-in slide-in-from-left">
            <div className="flex items-center justify-between font-semibold text-slate-100 mb-2">
              <span className="text-sky-400">무균 배지 & 시약 보관장</span>
              <span className="text-[10px] text-slate-400">4°C & 실온</span>
            </div>
            <button
              onClick={() => setActiveTab('reagents')}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-100 font-medium rounded-lg border border-slate-700 transition-all"
            >
              <FlaskConical className="w-3.5 h-3.5 text-sky-400" />
              보관 시약 재고 목록 열기
            </button>
          </div>
        )}
      </div>

      {/* 3D Controls Guide (Bottom Left) */}
      <div className="absolute bottom-4 left-4 z-20">
        {showControlsHint ? (
          <div className="bg-slate-950/85 border border-slate-800/90 rounded-lg p-2.5 backdrop-blur-md text-[11px] text-slate-400 font-mono shadow-lg flex flex-col gap-1">
            <div className="flex items-center justify-between text-slate-300 font-bold mb-0.5">
              <span className="flex items-center gap-1 text-sky-400">
                <HelpCircle className="w-3.5 h-3.5" />
                3D 조작 가이드
              </span>
              <button 
                onClick={() => setShowControlsHint(false)}
                className="text-slate-500 hover:text-slate-300"
              >
                ✕
              </button>
            </div>
            <div>• <span className="text-slate-200">좌클릭 드래그</span>: 360° 시점 회전</div>
            <div>• <span className="text-slate-200">우클릭 드래그</span>: 공간 평행 이동</div>
            <div>• <span className="text-slate-200">마우스 휠</span>: 줌인 / 줌아웃</div>
            <div>• <span className="text-slate-200">오브젝트 클릭</span>: 장비/시약 인터랙션</div>
          </div>
        ) : (
          <button
            onClick={() => setShowControlsHint(true)}
            className="p-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-400 hover:text-sky-400 transition-all backdrop-blur-md"
            title="3D 조작 가이드 열기"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

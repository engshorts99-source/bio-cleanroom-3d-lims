import React from 'react';
import { InteractiveObjectData } from '../three/LabScene';
import { User, Camera, FileText } from 'lucide-react';

interface SoftLabHUDProps {
  proximityTarget: InteractiveObjectData | null;
  onTriggerInteraction: () => void;
  walkMode: boolean;
  onToggleWalkMode: () => void;
  onOpenProtocolStudio: () => void;
}

export const SoftLabHUD: React.FC<SoftLabHUDProps> = ({
  proximityTarget,
  onTriggerInteraction,
  walkMode,
  onToggleWalkMode,
  onOpenProtocolStudio
}) => {
  return (
    <>
      {/* 1. Diamond [F] Proximity Interaction Prompt (Center-Right in Genshin / High-End Game Style) */}
      {proximityTarget && (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-40 animate-in fade-in zoom-in-95 duration-200">
          <button
            onClick={onTriggerInteraction}
            className="flex items-center gap-3 px-5 py-2.5 bg-slate-950/90 hover:bg-slate-900 border border-sky-400/60 rounded-full shadow-2xl shadow-sky-500/30 backdrop-blur-xl group transition-all"
          >
            {/* Diamond [F] Key Tag */}
            <div className="w-7 h-7 rotate-45 bg-sky-500 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-sky-400/40 group-hover:scale-110 transition-transform">
              <span className="-rotate-45 font-mono">F</span>
            </div>
            <div className="text-left">
              <div className="text-sky-300 font-bold text-xs flex items-center gap-1">
                <span>{proximityTarget.name}</span>
                <span className="text-[10px] text-slate-400 font-normal">상호작용</span>
              </div>
              <p className="text-[11px] text-slate-300 max-w-xs line-clamp-1">{proximityTarget.description}</p>
            </div>
          </button>
        </div>
      )}

      {/* 2. Top-Right Mode & Protocol Action Bar */}
      <div className="fixed top-14 right-4 z-30 flex items-center gap-2">
        {/* Protocol Studio Trigger Button */}
        <button
          onClick={onOpenProtocolStudio}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 hover:border-sky-400 text-slate-100 text-xs font-semibold shadow-xl backdrop-blur-md transition-all group"
        >
          <FileText className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
          <span>프로토콜 스튜디오</span>
        </button>

        {/* Walk Mode / Studio Camera Toggle */}
        <button
          onClick={onToggleWalkMode}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold shadow-xl backdrop-blur-md transition-all ${
            walkMode
              ? 'bg-sky-500 text-white border-sky-400 shadow-sky-500/20'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-200 border-slate-700/80'
          }`}
          title={walkMode ? '3인칭 아바타 자유 탐험 중' : '스튜디오 궤도 카메라'}
        >
          {walkMode ? <User className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
          <span>{walkMode ? '아바타 탐험 (WASD)' : '스튜디오 뷰'}</span>
        </button>
      </div>

      {/* 3. Subtle Controls & Movement Indicator (Bottom Left) */}
      <div className="fixed bottom-4 left-4 z-20 pointer-events-none select-none">
        <div className="bg-slate-950/75 border border-slate-800/80 rounded-xl px-3 py-2 backdrop-blur-md text-[11px] text-slate-400 font-sans shadow-lg flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>
            <strong className="text-slate-200">W / A / S / D</strong> 이동 &nbsp;|&nbsp; 
            <strong className="text-slate-200">Shift</strong> 대시 &nbsp;|&nbsp; 
            <strong className="text-sky-300">[F]</strong> 근접 상호작용
          </span>
        </div>
      </div>
    </>
  );
};

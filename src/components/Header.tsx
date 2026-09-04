import React from 'react';
import { useLab } from '../context/LabContext';
import { 
  ShieldCheck, 
  Gauge, 
  Thermometer, 
  Droplets, 
  Search, 
  Volume2, 
  VolumeX, 
  Download, 
  RotateCcw,
  Sparkles,
  Layers
} from 'lucide-react';
import { CameraViewZone } from '../types/lims';

interface HeaderProps {
  onSelectZone: (zone: CameraViewZone) => void;
}

export const Header: React.FC<HeaderProps> = ({ onSelectZone }) => {
  const { 
    environment, 
    selectedZone, 
    setSelectedZone, 
    searchQuery, 
    setSearchQuery, 
    soundEnabled, 
    toggleSound,
    exportDataJSON,
    resetToDefaults,
    activeTab,
    setActiveTab
  } = useLab();

  const handleZoneClick = (zone: CameraViewZone) => {
    setSelectedZone(zone);
    onSelectZone(zone);
  };

  const zones: { id: CameraViewZone; label: string; icon: string }[] = [
    { id: 'overview', label: '클린룸 전경', icon: '🌐' },
    { id: 'bsc', label: '무균작업대 (BSC)', icon: '🔬' },
    { id: 'incubator', label: 'CO2 인큐베이터', icon: '🧬' },
    { id: 'freezer', label: '-80°C 냉동고', icon: '❄️' },
    { id: 'centrifuge', label: '원심분리기', icon: '🌀' },
    { id: 'liquid_handler', label: '자동화 로봇', icon: '🤖' },
    { id: 'reagents_cabinet', label: '무균 시약장', icon: '🧪' },
  ];

  return (
    <header className="absolute top-0 left-0 right-0 z-30 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 py-2.5 transition-all">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
        {/* Brand & Cleanroom Telemetry */}
        <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-bio-primary/20 border border-bio-primary/40 flex items-center justify-center text-bio-primary shadow-sm shadow-bio-primary/20">
              <Sparkles className="w-5 h-5 text-sky-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-wider text-slate-100 font-mono">BIOCLEAN 3D LIMS</span>
                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  ISO CLASS 5
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">생명과학 클린룸 디지털 트윈 & 데이터베이스</p>
            </div>
          </div>

          {/* Telemetry Chips */}
          <div className="hidden xl:flex items-center gap-2.5 pl-3 border-l border-slate-800 text-xs font-mono">
            <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 px-2.5 py-1 rounded-md text-sky-300" title="클린룸 차압 유지 (양압)">
              <Gauge className="w-3.5 h-3.5 text-sky-400" />
              <span>+{environment.differentialPressurePa.toFixed(1)} Pa</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 px-2.5 py-1 rounded-md text-emerald-300">
              <Thermometer className="w-3.5 h-3.5 text-emerald-400" />
              <span>{environment.temperatureC.toFixed(1)}°C</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 px-2.5 py-1 rounded-md text-amber-300">
              <Droplets className="w-3.5 h-3.5 text-amber-400" />
              <span>{environment.humidityPercent.toFixed(1)}% RH</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 px-2.5 py-1 rounded-md text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>HEPA 99.99%</span>
            </div>
          </div>
        </div>

        {/* Global Search & Zone Shortcuts */}
        <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64 max-w-xs">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="시약, 세포주, 장비 검색..."
              className="w-full bg-slate-900/90 border border-slate-700/70 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all font-sans"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-2 text-xs text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className={`p-2 rounded-lg border transition-all ${
              soundEnabled 
                ? 'bg-slate-900 border-slate-700 text-sky-400 hover:bg-slate-800' 
                : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:bg-slate-800'
            }`}
            title={soundEnabled ? '사운드 끄기' : '사운드 켜기'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Export JSON */}
          <button
            onClick={exportDataJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 hover:border-sky-500 text-slate-200 hover:text-sky-300 text-xs font-medium transition-all"
            title="LIMS 전체 데이터베이스 JSON 내보내기"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">DB 내보내기</span>
          </button>

          {/* Reset button */}
          <button
            onClick={resetToDefaults}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/50 transition-all"
            title="데이터베이스 초기화"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Zone Quick Navigator Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-1 mt-2 scrollbar-none text-xs">
        <span className="text-[11px] text-slate-400 flex items-center gap-1 mr-1 shrink-0 font-medium">
          <Layers className="w-3 h-3 text-sky-400" />
          3D 구역:
        </span>
        {zones.map((z) => {
          const isSelected = selectedZone === z.id;
          return (
            <button
              key={z.id}
              onClick={() => handleZoneClick(z.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all shrink-0 font-medium ${
                isSelected
                  ? 'bg-sky-500 text-white font-semibold shadow-md shadow-sky-500/30'
                  : 'bg-slate-900/70 hover:bg-slate-800 text-slate-300 border border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <span>{z.icon}</span>
              <span>{z.label}</span>
            </button>
          );
        })}

        <div className="h-4 w-px bg-slate-800 mx-2 shrink-0 hidden md:block" />

        {/* View mode toggle */}
        <div className="ml-auto hidden md:flex items-center gap-1 shrink-0 bg-slate-900/80 p-0.5 rounded-lg border border-slate-800 text-[11px]">
          <button
            onClick={() => setActiveTab('cells')}
            className={`px-2 py-0.5 rounded ${activeTab === 'cells' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            바이오시료
          </button>
          <button
            onClick={() => setActiveTab('reagents')}
            className={`px-2 py-0.5 rounded ${activeTab === 'reagents' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            시약/배지
          </button>
          <button
            onClick={() => setActiveTab('equipment')}
            className={`px-2 py-0.5 rounded ${activeTab === 'equipment' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            장비제어
          </button>
          <button
            onClick={() => setActiveTab('protocols')}
            className={`px-2 py-0.5 rounded ${activeTab === 'protocols' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            프로토콜
          </button>
          <button
            onClick={() => setActiveTab('environment')}
            className={`px-2 py-0.5 rounded ${activeTab === 'environment' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            클린룸센서
          </button>
        </div>
      </div>
    </header>
  );
};

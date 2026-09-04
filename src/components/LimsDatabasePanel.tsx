import React, { useState } from 'react';
import { useLab } from '../context/LabContext';
import { CameraViewZone } from '../types/lims';
import { 
  Dna, 
  FlaskConical, 
  Wrench, 
  FileText, 
  ShieldAlert, 
  Plus, 
  Download, 
  ChevronUp, 
  ChevronDown, 
  Maximize2, 
  Minimize2,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  Trash2,
  Eye
} from 'lucide-react';

interface LimsDatabasePanelProps {
  onOpenNewModal: (type: 'sample' | 'reagent') => void;
  onNavigateToZone: (zone: CameraViewZone) => void;
}

export const LimsDatabasePanel: React.FC<LimsDatabasePanelProps> = ({ 
  onOpenNewModal, 
  onNavigateToZone 
}) => {
  const { 
    samples, 
    reagents, 
    equipment, 
    protocols, 
    environment,
    activeTab, 
    setActiveTab, 
    searchQuery,
    setSelectedItem,
    deleteSample,
    deleteReagent,
    exportDataCSV
  } = useLab();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [sampleFilter, setSampleFilter] = useState<string>('all');
  const [reagentFilter, setReagentFilter] = useState<string>('all');

  // Filtered samples
  const filteredSamples = samples.filter(s => {
    const matchesSearch = 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.organism.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (!matchesSearch) return false;
    if (sampleFilter === 'all') return true;
    return s.type === sampleFilter;
  });

  // Filtered reagents
  const filteredReagents = reagents.filter(r => {
    const matchesSearch = 
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.lotNumber.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (reagentFilter === 'all') return true;
    return r.category === reagentFilter;
  });

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 z-20 bg-slate-950/95 border-t border-slate-800 backdrop-blur-xl shadow-2xl transition-all duration-300 flex flex-col ${
        isCollapsed 
          ? 'h-11' 
          : isExpanded 
            ? 'h-[85vh]' 
            : 'h-80 sm:h-96'
      }`}
    >
      {/* Panel Top Handle & Tabs */}
      <div className="flex items-center justify-between px-4 py-1.5 border-b border-slate-800/80 bg-slate-900/60 select-none">
        {/* Tab Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
          <button
            onClick={() => { setActiveTab('cells'); setIsCollapsed(false); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'cells' && !isCollapsed
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Dna className="w-3.5 h-3.5" />
            <span>바이오 시료 & 세포주</span>
            <span className="px-1.5 py-0.2 bg-slate-800 rounded-full text-[10px] text-slate-300">
              {samples.length}
            </span>
          </button>

          <button
            onClick={() => { setActiveTab('reagents'); setIsCollapsed(false); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'reagents' && !isCollapsed
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>무균 시약 & 배지</span>
            <span className="px-1.5 py-0.2 bg-slate-800 rounded-full text-[10px] text-slate-300">
              {reagents.length}
            </span>
          </button>

          <button
            onClick={() => { setActiveTab('equipment'); setIsCollapsed(false); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'equipment' && !isCollapsed
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>분석 장비 & 제어</span>
            <span className="px-1.5 py-0.2 bg-slate-800 rounded-full text-[10px] text-slate-300">
              {equipment.length}
            </span>
          </button>

          <button
            onClick={() => { setActiveTab('protocols'); setIsCollapsed(false); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'protocols' && !isCollapsed
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>실험 프로토콜 런</span>
            <span className="px-1.5 py-0.2 bg-slate-800 rounded-full text-[10px] text-slate-300">
              {protocols.length}
            </span>
          </button>

          <button
            onClick={() => { setActiveTab('environment'); setIsCollapsed(false); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'environment' && !isCollapsed
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>클린룸 환경 규격</span>
          </button>
        </div>

        {/* Expand / Collapse Controls */}
        <div className="flex items-center gap-1 text-slate-400">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition-all"
            title={isExpanded ? '패널 기본 크기' : '패널 전체 화면 확장'}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition-all"
            title={isCollapsed ? '패널 펼치기' : '패널 접기'}
          >
            {isCollapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Panel Body Content (Visible when not collapsed) */}
      {!isCollapsed && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* TAB 1: BIO SAMPLES */}
          {activeTab === 'cells' && (
            <div className="space-y-3">
              {/* Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                  {['all', 'Cell Line', 'Primary Cell', 'Plasmid', 'Antibody'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setSampleFilter(f)}
                      className={`px-2.5 py-1 rounded-md capitalize transition-all ${
                        sampleFilter === f
                          ? 'bg-sky-500 text-white font-medium shadow-sm'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      {f === 'all' ? '전체 시료' : f}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => exportDataCSV('cells')}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-md border border-slate-800 transition-all"
                  >
                    <Download className="w-3 h-3" />
                    <span>CSV</span>
                  </button>
                  <button
                    onClick={() => onOpenNewModal('sample')}
                    className="flex items-center gap-1 px-3 py-1 text-xs bg-sky-500 hover:bg-sky-400 text-white font-medium rounded-md shadow-sm transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>신규 시료 등록</span>
                  </button>
                </div>
              </div>

              {/* Table / Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {filteredSamples.map((s) => (
                  <div
                    key={s.id}
                    className="bg-slate-900/80 border border-slate-800/90 rounded-xl p-3.5 hover:border-sky-500/50 hover:bg-slate-900 transition-all shadow-sm flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            s.biosafetyLevel === 'BSL-2' 
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}>
                            {s.biosafetyLevel}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">{s.id}</span>
                        </div>
                        <span className={`text-[11px] font-medium ${s.status === 'Available' ? 'text-emerald-400' : 'text-amber-400'}`}>
                          ● {s.status}
                        </span>
                      </div>

                      <h4 className="font-semibold text-sm text-slate-100 group-hover:text-sky-400 transition-colors line-clamp-1">
                        {s.name}
                      </h4>
                      <p className="text-xs text-slate-400 italic mb-2">{s.organism} {s.passage ? `(Passage ${s.passage})` : ''}</p>

                      {/* Location Badge with Direct 3D Jump */}
                      <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-2 mb-2 text-xs flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-slate-500">동결 보관 위치</div>
                          <div className="text-sky-300 font-mono text-[11px]">
                            {s.storageLocation.unit} ➔ {s.storageLocation.box} ({s.storageLocation.well})
                          </div>
                        </div>
                        <button
                          onClick={() => onNavigateToZone('freezer')}
                          className="flex items-center gap-1 px-2 py-1 bg-sky-500/20 hover:bg-sky-500 text-sky-300 hover:text-white rounded text-[10px] font-medium transition-all"
                          title="3D 공간에서 -80°C 냉동고로 카메라 이동"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>3D 뷰</span>
                        </button>
                      </div>

                      {/* Viability & Quantity */}
                      <div className="flex items-center justify-between text-xs text-slate-300 mb-2">
                        <span>잔여 수량: <strong className="text-slate-100 font-mono">{s.quantity} {s.unit}</strong></span>
                        {s.viability && (
                          <span className="flex items-center gap-1 text-emerald-400 font-mono text-[11px]">
                            <Sparkles className="w-3 h-3" />
                            생존율 {s.viability}%
                          </span>
                        )}
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1">
                        {s.tags.map(t => (
                          <span key={t} className="px-1.5 py-0.5 bg-slate-800/80 rounded text-[10px] text-slate-400">
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-800/70 text-xs">
                      <span className="text-[10px] text-slate-500">담당: {s.researcher}</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setSelectedItem({ type: 'sample', data: s })}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs flex items-center gap-1 transition-all"
                        >
                          <Eye className="w-3 h-3" />
                          <span>상세</span>
                        </button>
                        <button
                          onClick={() => deleteSample(s.id)}
                          className="p-1 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 rounded transition-all"
                          title="시료 삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: REAGENTS & MEDIA */}
          {activeTab === 'reagents' && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                  {['all', 'Media & Serum', 'Enzymes & Kits', 'Antibiotics', 'Buffers & Salts'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setReagentFilter(f)}
                      className={`px-2.5 py-1 rounded-md capitalize transition-all ${
                        reagentFilter === f
                          ? 'bg-sky-500 text-white font-medium shadow-sm'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      {f === 'all' ? '전체 시약' : f}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => exportDataCSV('reagents')}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-md border border-slate-800 transition-all"
                  >
                    <Download className="w-3 h-3" />
                    <span>CSV</span>
                  </button>
                  <button
                    onClick={() => onOpenNewModal('reagent')}
                    className="flex items-center gap-1 px-3 py-1 text-xs bg-sky-500 hover:bg-sky-400 text-white font-medium rounded-md shadow-sm transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>신규 시약 등록</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {filteredReagents.map((r) => {
                  const percent = Math.round((r.volumeRemaining / r.totalVolume) * 100);
                  return (
                    <div
                      key={r.id}
                      className="bg-slate-900/80 border border-slate-800/90 rounded-xl p-3.5 hover:border-sky-500/50 hover:bg-slate-900 transition-all shadow-sm flex flex-col justify-between group"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            r.hazardClass === 'Biohazard' ? 'bg-amber-500/20 text-amber-400' :
                            r.hazardClass === 'Flammable' ? 'bg-rose-500/20 text-rose-400' :
                            r.hazardClass === 'Toxic' ? 'bg-purple-500/20 text-purple-400' :
                            'bg-emerald-500/20 text-emerald-400'
                          }`}>
                            {r.hazardClass}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">{r.id}</span>
                        </div>

                        <h4 className="font-semibold text-sm text-slate-100 group-hover:text-sky-400 transition-colors line-clamp-1">
                          {r.name}
                        </h4>
                        <p className="text-xs text-slate-400 mb-2">{r.vendor} • Cat#{r.catalogNumber}</p>

                        {/* Volume Remaining Bar */}
                        <div className="space-y-1 mb-2">
                          <div className="flex justify-between text-[11px] text-slate-300">
                            <span>잔여량 ({percent}%)</span>
                            <span className="font-mono">{r.volumeRemaining} / {r.totalVolume} {r.unit}</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                percent < 25 ? 'bg-rose-500' : percent < 50 ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>

                        {/* Location */}
                        <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-2 text-xs flex items-center justify-between">
                          <div>
                            <div className="text-[10px] text-slate-500">보관 조건 & 위치</div>
                            <div className="text-sky-300 text-[11px]">{r.storageTemp} • {r.location.shelf}</div>
                          </div>
                          <button
                            onClick={() => onNavigateToZone('reagents_cabinet')}
                            className="flex items-center gap-1 px-2 py-1 bg-sky-500/20 hover:bg-sky-500 text-sky-300 hover:text-white rounded text-[10px] font-medium transition-all"
                            title="3D 공간에서 시약장으로 이동"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>3D 뷰</span>
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-800/70 text-xs">
                        <span className="text-[10px] text-slate-500">유효기간: {r.expiryDate}</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setSelectedItem({ type: 'reagent', data: r })}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs flex items-center gap-1 transition-all"
                          >
                            <Eye className="w-3 h-3" />
                            <span>상세</span>
                          </button>
                          <button
                            onClick={() => deleteReagent(r.id)}
                            className="p-1 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 rounded transition-all"
                            title="시약 삭제"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: EQUIPMENT & CALIBRATION */}
          {activeTab === 'equipment' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">클린룸 실시간 기기 파라미터 & 센서 모니터링</span>
                <button
                  onClick={() => exportDataCSV('equipment')}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-md border border-slate-800 transition-all"
                >
                  <Download className="w-3 h-3" />
                  <span>장비 목록 CSV</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {equipment.map((eq) => (
                  <div
                    key={eq.id}
                    className="bg-slate-900/80 border border-slate-800/90 rounded-xl p-4 hover:border-sky-500/50 hover:bg-slate-900 transition-all shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          eq.status === 'Running' ? 'bg-amber-500/20 text-amber-400 animate-pulse' :
                          eq.status === 'Sterilizing' ? 'bg-purple-500/20 text-purple-400' :
                          'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          ● {eq.status}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">{eq.id}</span>
                      </div>

                      <h4 className="font-semibold text-sm text-slate-100 mb-0.5">{eq.name}</h4>
                      <p className="text-xs text-slate-400 mb-3">{eq.model} (S/N: {eq.serialNumber})</p>

                      {/* Live Sensor Values */}
                      <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-2.5 mb-3 grid grid-cols-2 gap-2 text-xs font-mono">
                        {eq.parameters.temperature !== undefined && (
                          <div>
                            <span className="text-[10px] text-slate-500 block">설정 / 현재 온도</span>
                            <span className="text-emerald-400 font-bold">{eq.parameters.temperature}°C</span>
                          </div>
                        )}
                        {eq.parameters.co2Percent !== undefined && (
                          <div>
                            <span className="text-[10px] text-slate-500 block">CO2 농도</span>
                            <span className="text-sky-400 font-bold">{eq.parameters.co2Percent}%</span>
                          </div>
                        )}
                        {eq.parameters.rpm !== undefined && (
                          <div>
                            <span className="text-[10px] text-slate-500 block">현재 로터 속도</span>
                            <span className="text-amber-400 font-bold">{eq.parameters.rpm} RPM</span>
                          </div>
                        )}
                        {eq.parameters.airflowVelocity !== undefined && (
                          <div>
                            <span className="text-[10px] text-slate-500 block">유입 기류 속도</span>
                            <span className="text-emerald-400 font-bold">{eq.parameters.airflowVelocity} m/s</span>
                          </div>
                        )}
                      </div>

                      {/* Calibration Info */}
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                        <span>최근 교정: {eq.lastCalibrated}</span>
                        <span className="text-sky-300">차기 교정: {eq.nextCalibration}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-800/70">
                      <button
                        onClick={() => {
                          const zoneMap: Record<string, CameraViewZone> = {
                            'EQP-BSC-01': 'bsc',
                            'EQP-INC-01': 'incubator',
                            'EQP-FRZ-01': 'freezer',
                            'EQP-CEN-01': 'centrifuge',
                            'EQP-ROB-01': 'liquid_handler',
                          };
                          if (zoneMap[eq.id]) onNavigateToZone(zoneMap[eq.id]);
                        }}
                        className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-medium"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>3D 공간 이동</span>
                      </button>

                      <button
                        onClick={() => setSelectedItem({ type: 'equipment', data: eq })}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs flex items-center gap-1 transition-all"
                      >
                        <Wrench className="w-3 h-3" />
                        <span>교정 이력 & 스펙</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: PROTOCOLS */}
          {activeTab === 'protocols' && (
            <div className="space-y-3">
              <span className="text-xs text-slate-400">실시간 생명과학 실험 프로토콜 진행 현황</span>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {protocols.map((p) => (
                  <div key={p.id} className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                          {p.id} • {p.protocolType}
                        </span>
                        <h4 className="font-semibold text-sm text-slate-100 mt-1">{p.title}</h4>
                        <p className="text-xs text-slate-400">연구원: {p.operator} • 시작: {p.startTime}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        p.status === 'In Progress' ? 'bg-amber-500/20 text-amber-400 animate-pulse' : 'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {p.status}
                      </span>
                    </div>

                    {/* Step list */}
                    <div className="space-y-1.5 bg-slate-950/70 p-3 rounded-lg border border-slate-800">
                      <div className="text-[11px] font-semibold text-slate-300 mb-1">실험 단계별 체크리스트</div>
                      {p.steps.map((step) => (
                        <div key={step.order} className="flex items-center gap-2 text-xs text-slate-300">
                          {step.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                          )}
                          <span className={step.completed ? 'line-through text-slate-500' : 'text-slate-200'}>
                            {step.order}. {step.description} ({step.durationMinutes}분)
                          </span>
                        </div>
                      ))}
                    </div>

                    {p.notes && (
                      <p className="text-xs text-slate-400 italic bg-slate-900/50 p-2 rounded border border-slate-800/60">
                        💬 메모: {p.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: CLEANROOM ENVIRONMENT */}
          {activeTab === 'environment' && (
            <div className="space-y-4 max-w-4xl mx-auto">
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                      <ShieldAlert className="w-5 h-5 text-emerald-400" />
                      ISO 14644-1 Class 5 (Grade B) 클린룸 환경 규격
                    </h3>
                    <p className="text-xs text-slate-400">무균 의약품 및 세포치료제 제조 환경 기준 부합 실시간 모니터링</p>
                  </div>
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold font-mono">
                    COMPLIANT (적합)
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-500 block">차압 (양압 유지)</span>
                    <span className="text-lg font-bold text-sky-400">+{environment.differentialPressurePa.toFixed(1)} Pa</span>
                    <span className="text-[10px] text-slate-500 block mt-1">기준: &gt; +15.0 Pa</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-500 block">0.5 µm 입자수</span>
                    <span className="text-lg font-bold text-emerald-400">{environment.particleCounts.size0_5um.toLocaleString()} /m³</span>
                    <span className="text-[10px] text-slate-500 block mt-1">한계: &lt; 3,520 /m³</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-500 block">5.0 µm 입자수</span>
                    <span className="text-lg font-bold text-emerald-400">{environment.particleCounts.size5_0um} /m³</span>
                    <span className="text-[10px] text-slate-500 block mt-1">한계: &lt; 29 /m³</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-500 block">시간당 공기교환</span>
                    <span className="text-lg font-bold text-purple-400">{environment.airChangesPerHour} ACH</span>
                    <span className="text-[10px] text-slate-500 block mt-1">기준: &gt; 40 ACH</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

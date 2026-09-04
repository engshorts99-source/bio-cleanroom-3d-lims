import React, { useState } from 'react';
import { useLab } from '../context/LabContext';
import { ProtocolRun } from '../types/lims';
import { 
  Plus, 
  Play, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  X, 
  Trash2, 
  Compass, 
  Check 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { labAudio } from '../audio/soundEffects';

interface ProtocolStudioProps {
  isOpen: boolean;
  onClose: () => void;
  onStartProtocol: (protocol: ProtocolRun) => void;
}

export const ProtocolStudio: React.FC<ProtocolStudioProps> = ({ 
  isOpen, 
  onClose,
  onStartProtocol
}) => {
  const { protocols, samples, reagents } = useLab();

  // Authoring state
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [protocolType, setProtocolType] = useState<ProtocolRun['protocolType']>('Cell Passage');
  const [operator, setOperator] = useState('Dr. User');
  const [notes] = useState('');

  // Selected links
  const [selectedSampleIds, setSelectedSampleIds] = useState<string[]>([]);
  const [selectedReagentIds, setSelectedReagentIds] = useState<string[]>([]);

  // Steps
  const [steps, setSteps] = useState<{ order: number; description: string; durationMinutes: number; completed: boolean }[]>([
    { order: 1, description: '무균 배양실 공조 안정화 및 BSC 유리 새시 개방', durationMinutes: 3, completed: false },
    { order: 2, description: 'DMEM 2mL 세척 및 0.25% 트립신 처리 (37°C 2분)', durationMinutes: 3, completed: false },
    { order: 3, description: '원심분리기 1,000 RPM (200 × g) 4분 침전 회전', durationMinutes: 4, completed: false }
  ]);

  const [newStepDesc, setNewStepDesc] = useState('');
  const [newStepDuration, setNewStepDuration] = useState(5);

  const handleAddStep = () => {
    if (!newStepDesc.trim()) return;
    setSteps(prev => [
      ...prev,
      { order: prev.length + 1, description: newStepDesc, durationMinutes: newStepDuration, completed: false }
    ]);
    setNewStepDesc('');
    labAudio.playClick();
  };

  const handleRemoveStep = (order: number) => {
    setSteps(prev => prev.filter(s => s.order !== order).map((s, idx) => ({ ...s, order: idx + 1 })));
  };

  const handleSaveProtocol = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || steps.length === 0) return;

    const newProtocol: ProtocolRun = {
      id: `PRT-2026-${String(protocols.length + 1).padStart(3, '0')}`,
      title,
      protocolType,
      operator,
      startTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
      status: 'In Progress',
      sampleIds: selectedSampleIds,
      reagentIds: selectedReagentIds,
      equipmentIds: [],
      steps,
      notes
    };

    onStartProtocol(newProtocol);
    setIsCreating(false);
    onClose();
    confetti({ particleCount: 35, spread: 60 });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="bg-slate-900/95 border border-slate-700/80 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] text-xs">
        {/* Studio Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-100">실험 프로토콜 스튜디오 (Protocol Studio)</h3>
              <p className="text-[11px] text-slate-400">다단계 생명과학 실험 설계 및 3D 실시간 가이드 연동</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {!isCreating ? (
            /* Protocol Library View */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-medium">등록된 연구 프로토콜 목록 ({protocols.length})</span>
                <button
                  onClick={() => setIsCreating(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-white font-medium rounded-lg shadow-sm transition-all text-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>새 프로토콜 작성</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {protocols.map((p) => (
                  <div
                    key={p.id}
                    className="bg-slate-950/70 border border-slate-800/90 hover:border-sky-500/50 rounded-xl p-4 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-mono text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                          {p.id} • {p.protocolType}
                        </span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          p.status === 'In Progress' ? 'bg-amber-500/20 text-amber-300 animate-pulse' : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {p.status}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-100 group-hover:text-sky-300 transition-colors">
                        {p.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-1">담당 연구원: {p.operator} • 시작: {p.startTime}</p>

                      {/* Step Progress overview */}
                      <div className="mt-3 flex items-center gap-1 text-[11px] text-slate-400">
                        <Clock className="w-3.5 h-3.5 text-sky-400" />
                        <span>총 {p.steps.length}단계 실험 </span>
                        <span>({p.steps.filter(s => s.completed).length} 완료)</span>
                      </div>
                    </div>

                    <div className="flex justify-end pt-3 mt-3 border-t border-slate-800/80">
                      <button
                        onClick={() => {
                          onStartProtocol(p);
                          onClose();
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-medium rounded-lg shadow-sm transition-all"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>3D 실험실에서 실행 시작</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Protocol Authoring Form */
            <form onSubmit={handleSaveProtocol} className="space-y-4">
              <div>
                <label className="block text-slate-400 font-medium mb-1">실험 프로토콜 명칭 *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="예: HEK293T Lentivirus Packaging & Centrifugation"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">실험 유형</label>
                  <select
                    value={protocolType}
                    onChange={e => setProtocolType(e.target.value as ProtocolRun['protocolType'])}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
                  >
                    <option value="Cell Passage">Cell Passage (세포 계대배양)</option>
                    <option value="Cryopreservation">Cryopreservation (동결 보존)</option>
                    <option value="Lentiviral Transfection">Lentiviral Transfection (형질감염)</option>
                    <option value="Plasmid MiniPrep">Plasmid MiniPrep (DNA 정제)</option>
                    <option value="Automated ELISA Dilution">Automated ELISA Dilution (자동화 분주)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">담당 연구원</label>
                  <input
                    type="text"
                    value={operator}
                    onChange={e => setOperator(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100"
                  />
                </div>
              </div>

              {/* Link Database Entities */}
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 space-y-3">
                <span className="text-slate-300 font-semibold block">LIMS 데이터베이스 연동</span>
                
                {/* Linked Samples */}
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">사용 바이오 시료 선택</label>
                  <div className="flex flex-wrap gap-1.5">
                    {samples.slice(0, 5).map(s => {
                      const selected = selectedSampleIds.includes(s.id);
                      return (
                        <button
                          type="button"
                          key={s.id}
                          onClick={() => {
                            setSelectedSampleIds(prev => 
                              selected ? prev.filter(id => id !== s.id) : [...prev, s.id]
                            );
                          }}
                          className={`px-2 py-1 rounded text-[10px] border transition-all ${
                            selected 
                              ? 'bg-sky-500/20 border-sky-500 text-sky-300 font-bold' 
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {selected && '✓ '} {s.name.slice(0, 18)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Linked Reagents */}
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">사용 시약/배지 선택</label>
                  <div className="flex flex-wrap gap-1.5">
                    {reagents.slice(0, 5).map(r => {
                      const selected = selectedReagentIds.includes(r.id);
                      return (
                        <button
                          type="button"
                          key={r.id}
                          onClick={() => {
                            setSelectedReagentIds(prev => 
                              selected ? prev.filter(id => id !== r.id) : [...prev, r.id]
                            );
                          }}
                          className={`px-2 py-1 rounded text-[10px] border transition-all ${
                            selected 
                              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold' 
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {selected && '✓ '} {r.name.slice(0, 20)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Step Builder */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">단계별 세부 실험 절차 (Step-by-Step)</span>
                  <span className="text-slate-500 text-[11px]">총 {steps.length}단계</span>
                </div>

                {/* Steps List */}
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {steps.map((step) => (
                    <div key={step.order} className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-[10px]">
                          {step.order}
                        </span>
                        <span className="text-slate-200">{step.description}</span>
                        <span className="text-slate-500 font-mono text-[10px]">({step.durationMinutes}분)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveStep(step.order)}
                        className="p-1 text-slate-500 hover:text-rose-400 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add new step input */}
                <div className="flex gap-2 pt-2">
                  <input
                    type="text"
                    value={newStepDesc}
                    onChange={e => setNewStepDesc(e.target.value)}
                    placeholder="새 단계 입력 (예: 1,000 RPM 원심분리 침전)"
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-100"
                  />
                  <input
                    type="number"
                    value={newStepDuration}
                    onChange={e => setNewStepDuration(Number(e.target.value))}
                    className="w-16 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-center text-slate-100"
                    title="소요 시간 (분)"
                  />
                  <button
                    type="button"
                    onClick={handleAddStep}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium"
                  >
                    추가
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                >
                  목록으로
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white font-bold rounded-lg shadow-md"
                >
                  <Check className="w-4 h-4" />
                  <span>프로토콜 저장 & 실행</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Floating HUD banner displayed on-screen when a protocol is actively running.
 */
export const ActiveProtocolBanner: React.FC<{
  protocol: ProtocolRun | null;
  onCompleteStep: (stepOrder: number) => void;
  onStopProtocol: () => void;
}> = ({ protocol, onCompleteStep, onStopProtocol }) => {
  if (!protocol) return null;

  const currentStep = protocol.steps.find(s => !s.completed);
  const totalSteps = protocol.steps.length;
  const completedCount = protocol.steps.filter(s => s.completed).length;

  return (
    <div className="fixed top-20 right-4 z-40 bg-slate-950/85 backdrop-blur-xl border border-sky-500/40 rounded-2xl p-4 shadow-2xl max-w-sm w-full animate-in slide-in-from-right text-xs">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-sky-400 font-bold">
          <Compass className="w-4 h-4 animate-spin text-sky-400" />
          <span>실험 프로토콜 진행중</span>
        </div>
        <button
          onClick={onStopProtocol}
          className="text-slate-400 hover:text-rose-400 font-semibold text-[11px]"
        >
          종료
        </button>
      </div>

      <h4 className="text-slate-100 font-semibold mb-1 line-clamp-1">{protocol.title}</h4>
      <div className="text-slate-400 text-[11px] mb-3">
        진행률: {completedCount} / {totalSteps} 단계 완료 ({Math.round((completedCount / totalSteps) * 100)}%)
      </div>

      {currentStep ? (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 space-y-2">
          <div className="text-[10px] text-sky-400 font-bold tracking-wider">
            STEP {currentStep.order} 진행 목표
          </div>
          <p className="text-slate-200 font-medium">{currentStep.description}</p>
          <div className="flex items-center justify-between pt-1">
            <span className="text-slate-400 text-[11px] flex items-center gap-1">
              <Clock className="w-3 h-3 text-sky-400" />
              {currentStep.durationMinutes}분 소요
            </span>
            <button
              onClick={() => {
                onCompleteStep(currentStep.order);
                labAudio.playClick();
                confetti({ particleCount: 20, spread: 50 });
              }}
              className="flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold shadow-md transition-all text-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>완료 처리</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-2 text-emerald-400 font-bold flex items-center justify-center gap-1">
          <CheckCircle2 className="w-4 h-4" />
          <span>모든 실험 단계가 성공적으로 완료되었습니다!</span>
        </div>
      )}
    </div>
  );
};

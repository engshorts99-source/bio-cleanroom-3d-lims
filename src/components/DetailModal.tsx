import React from 'react';
import { useLab } from '../context/LabContext';
import type { BioSample, Reagent, Equipment } from '../types/lims';
import { X, ExternalLink } from 'lucide-react';

export const DetailModal: React.FC = () => {
  const { selectedItem, setSelectedItem, setSelectedZone } = useLab();

  if (!selectedItem) return null;

  const { type, data } = selectedItem;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">
              {type === 'sample' ? 'BIO-SAMPLE' : type === 'reagent' ? 'REAGENT' : 'EQUIPMENT'}
            </span>
            <span className="text-xs font-mono text-slate-400">{data.id}</span>
          </div>
          <button
            onClick={() => setSelectedItem(null)}
            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          <div>
            <h3 className="text-lg font-bold text-slate-100">
              {'name' in data ? data.name : ''}
            </h3>
            {type === 'sample' && (
              <p className="text-slate-400 italic text-sm">{(data as BioSample).organism}</p>
            )}
            {type === 'reagent' && (
              <p className="text-slate-400 text-sm">{(data as Reagent).vendor} • Cat# {(data as Reagent).catalogNumber}</p>
            )}
            {type === 'equipment' && (
              <p className="text-slate-400 text-sm">{(data as Equipment).model} (S/N: {(data as Equipment).serialNumber})</p>
            )}
          </div>

          {/* Sample Specific Details */}
          {type === 'sample' && (() => {
            const s = data as BioSample;
            return (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-slate-500 block">생물안전등급 (BSL)</span>
                    <span className="text-slate-200 font-bold">{s.biosafetyLevel}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">계대수 (Passage)</span>
                    <span className="text-slate-200 font-bold">{s.passage ?? 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">보관 수량</span>
                    <span className="text-slate-200 font-bold">{s.quantity} {s.unit}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">세포 생존율 (Viability)</span>
                    <span className="text-emerald-400 font-bold">{s.viability ? `${s.viability}%` : 'N/A'}</span>
                  </div>
                </div>

                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                  <div className="text-slate-500 mb-1">3D 동결 보존 물리적 좌표</div>
                  <div className="text-sky-300 font-mono text-sm">
                    {s.storageLocation.zone} &gt; {s.storageLocation.unit} &gt; {s.storageLocation.rack} &gt; {s.storageLocation.box} &gt; Well {s.storageLocation.well}
                  </div>
                  <button
                    onClick={() => {
                      setSelectedZone('freezer');
                      setSelectedItem(null);
                    }}
                    className="mt-2.5 flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>3D 냉동고로 카메라 비행 & 도어 열기</span>
                  </button>
                </div>

                {s.notes && (
                  <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 font-semibold block mb-1">연구원 특이사항 및 프로토콜 노트</span>
                    <p className="text-slate-300">{s.notes}</p>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Reagent Specific Details */}
          {type === 'reagent' && (() => {
            const r = data as Reagent;
            return (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-slate-500 block">카테고리</span>
                    <span className="text-slate-200 font-bold">{r.category}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">위험 등급</span>
                    <span className="text-amber-400 font-bold">{r.hazardClass}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">잔여 볼륨</span>
                    <span className="text-slate-200 font-bold">{r.volumeRemaining} / {r.totalVolume} {r.unit}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">유효기간</span>
                    <span className="text-slate-200 font-bold">{r.expiryDate}</span>
                  </div>
                </div>

                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                  <div className="text-slate-500 mb-1">보관 위치 & 권장 조건</div>
                  <div className="text-sky-300 font-mono text-sm">
                    {r.location.zone} &gt; {r.location.cabinet} &gt; {r.location.shelf} ({r.storageTemp})
                  </div>
                  <button
                    onClick={() => {
                      setSelectedZone('reagents_cabinet');
                      setSelectedItem(null);
                    }}
                    className="mt-2.5 flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>3D 시약장으로 카메라 비행</span>
                  </button>
                </div>
              </div>
            );
          })()}

          {/* Equipment Specific Details */}
          {type === 'equipment' && (() => {
            const eq = data as Equipment;
            return (
              <div className="space-y-3">
                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 space-y-2">
                  <div className="text-slate-400 font-semibold mb-1">장비 사양 및 인증 (Specifications)</div>
                  {Object.entries(eq.specifications).map(([key, val]) => (
                    <div key={key} className="flex justify-between border-b border-slate-800/80 pb-1">
                      <span className="text-slate-500">{key}:</span>
                      <span className="text-slate-200 font-mono">{val}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                  <div className="text-slate-400 font-semibold mb-2">정기 점검 & 교정 이력 (Maintenance Logs)</div>
                  {eq.maintenanceLog.map((log, idx) => (
                    <div key={idx} className="space-y-1 text-slate-300 text-[11px]">
                      <div className="flex items-center justify-between text-slate-500">
                        <span>{log.date} • {log.performedBy}</span>
                        <span className="text-emerald-400 font-bold">{log.result}</span>
                      </div>
                      <p className="text-slate-400">{log.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end p-4 border-t border-slate-800 bg-slate-950/60">
          <button
            onClick={() => setSelectedItem(null)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg transition-all text-xs"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

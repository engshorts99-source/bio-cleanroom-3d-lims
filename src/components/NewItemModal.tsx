import React, { useState } from 'react';
import { useLab } from '../context/LabContext';
import { X, Plus, Sparkles } from 'lucide-react';

interface NewItemModalProps {
  type: 'sample' | 'reagent' | null;
  onClose: () => void;
}

export const NewItemModal: React.FC<NewItemModalProps> = ({ type, onClose }) => {
  const { addSample, addReagent } = useLab();

  // Sample form state
  const [sampleName, setSampleName] = useState('');
  const [sampleType, setSampleType] = useState<'Cell Line' | 'Primary Cell' | 'Plasmid' | 'Antibody' | 'Recombinant Protein'>('Cell Line');
  const [organism, setOrganism] = useState('Homo sapiens');
  const [passage, setPassage] = useState(1);
  const [bsl, setBsl] = useState<'BSL-1' | 'BSL-2'>('BSL-2');
  const [quantity, setQuantity] = useState(5);
  const [viability, setViability] = useState(95);
  const [rack, setRack] = useState('Rack 2');
  const [box, setBox] = useState('Cryobox B-01');
  const [well, setWell] = useState('A1');
  const [researcher, setResearcher] = useState('Dr. User');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState('Culture, Bio-clean');

  // Reagent form state
  const [reagentName, setReagentName] = useState('');
  const [category, setCategory] = useState<'Media & Serum' | 'Enzymes & Kits' | 'Antibiotics' | 'Buffers & Salts'>('Media & Serum');
  const [vendor, setVendor] = useState('Gibco');
  const [catNum, setCatNum] = useState('11995-065');
  const [lotNum, setLotNum] = useState('LOT-2026-99');
  const [volume, setVolume] = useState(500);
  const [unit, setUnit] = useState<'mL' | 'L' | 'g' | 'units'>('mL');
  const [storageTemp, setStorageTemp] = useState<'Room Temp (20-25°C)' | 'Cold (4°C)' | 'Frozen (-20°C)' | 'Deep Freeze (-80°C)'>('Cold (4°C)');
  const [hazard, setHazard] = useState<'Non-Hazardous' | 'Flammable' | 'Toxic' | 'Biohazard'>('Non-Hazardous');
  const [expiry, setExpiry] = useState('2027-12-31');

  if (!type) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (type === 'sample') {
      if (!sampleName) return;
      addSample({
        name: sampleName,
        type: sampleType,
        organism,
        passage: sampleType === 'Cell Line' ? passage : undefined,
        biosafetyLevel: bsl,
        storageLocation: {
          zone: 'Zone B: Cryo Storage',
          unit: '-80°C Freezer Alpha',
          rack,
          box,
          well,
          temperature: '-80°C'
        },
        quantity,
        unit: 'vials',
        viability,
        freezeDate: new Date().toISOString().slice(0, 10),
        researcher,
        notes,
        status: 'Available',
        tags: tags.split(',').map(t => t.trim()).filter(Boolean)
      });
    } else {
      if (!reagentName) return;
      addReagent({
        name: reagentName,
        category,
        vendor,
        catalogNumber: catNum,
        lotNumber: lotNum,
        storageTemp,
        volumeRemaining: volume,
        totalVolume: volume,
        unit,
        expiryDate: expiry,
        status: 'Optimal',
        hazardClass: hazard,
        location: {
          zone: 'Zone E: Clean Media Cabinet',
          cabinet: 'Cabinet Alpha',
          shelf: 'Middle Shelf'
        }
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sky-400" />
            <h3 className="font-bold text-sm text-slate-100">
              {type === 'sample' ? '새 생체 시료 / 세포주 등록' : '새 무균 시약 / 배지 등록'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 text-slate-400 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {type === 'sample' ? (
            <>
              <div>
                <label className="block text-slate-400 font-medium mb-1">시료 / 세포주 명칭 *</label>
                <input
                  type="text"
                  required
                  value={sampleName}
                  onChange={e => setSampleName(e.target.value)}
                  placeholder="예: HEK293T, Jurkat E6-1, pCas9-EGFP"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">시료 종류</label>
                  <select
                    value={sampleType}
                    onChange={e => setSampleType(e.target.value as unknown as typeof sampleType)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
                  >
                    <option value="Cell Line">Cell Line (세포주)</option>
                    <option value="Primary Cell">Primary Cell (일차세포)</option>
                    <option value="Plasmid">Plasmid (플라스미드 DNA)</option>
                    <option value="Antibody">Antibody (항체)</option>
                    <option value="Recombinant Protein">Recombinant Protein</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">생물안전등급</label>
                  <select
                    value={bsl}
                    onChange={e => setBsl(e.target.value as 'BSL-1' | 'BSL-2')}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
                  >
                    <option value="BSL-1">BSL-1</option>
                    <option value="BSL-2">BSL-2</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">계대수 (Passage)</label>
                  <input
                    type="number"
                    value={passage}
                    onChange={e => setPassage(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">수량 (바이알)</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={e => setQuantity(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">생존율 (%)</label>
                  <input
                    type="number"
                    value={viability}
                    onChange={e => setViability(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 space-y-2">
                <span className="text-slate-400 font-medium block">동결 냉동고 3D 위치 매핑</span>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={rack}
                    onChange={e => setRack(e.target.value)}
                    placeholder="Rack 2"
                    className="bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-slate-200"
                  />
                  <input
                    type="text"
                    value={box}
                    onChange={e => setBox(e.target.value)}
                    placeholder="Cryobox B-01"
                    className="bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-slate-200"
                  />
                  <input
                    type="text"
                    value={well}
                    onChange={e => setWell(e.target.value)}
                    placeholder="A1"
                    className="bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">숙주 / 기원 생물 (Organism)</label>
                <input
                  type="text"
                  value={organism}
                  onChange={e => setOrganism(e.target.value)}
                  placeholder="예: Homo sapiens, Cricetulus griseus"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">담당 연구원</label>
                <input
                  type="text"
                  value={researcher}
                  onChange={e => setResearcher(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">연구 메모 및 프로토콜 주의사항</label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="예: Mycoplasma negative, 37°C 5% CO2"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">태그 (쉼표 구분)</label>
                <input
                  type="text"
                  value={tags}
                  onChange={e => setTags(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-slate-400 font-medium mb-1">시약 명칭 *</label>
                <input
                  type="text"
                  required
                  value={reagentName}
                  onChange={e => setReagentName(e.target.value)}
                  placeholder="예: RPMI 1640 Medium, Pen/Strep, Trypsin"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">카테고리</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as unknown as typeof category)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
                  >
                    <option value="Media & Serum">Media & Serum (배지 및 혈청)</option>
                    <option value="Enzymes & Kits">Enzymes & Kits (효소/키트)</option>
                    <option value="Antibiotics">Antibiotics (항생제)</option>
                    <option value="Buffers & Salts">Buffers & Salts (완충액)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">위험물 등급</label>
                  <select
                    value={hazard}
                    onChange={e => setHazard(e.target.value as unknown as typeof hazard)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
                  >
                    <option value="Non-Hazardous">Non-Hazardous (일반)</option>
                    <option value="Biohazard">Biohazard (생물위해)</option>
                    <option value="Flammable">Flammable (인화성)</option>
                    <option value="Toxic">Toxic (독성)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">제조사 (Vendor)</label>
                  <input
                    type="text"
                    value={vendor}
                    onChange={e => setVendor(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">카탈로그 번호 (Cat No)</label>
                  <input
                    type="text"
                    value={catNum}
                    onChange={e => setCatNum(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">배치 번호 (Lot No)</label>
                  <input
                    type="text"
                    value={lotNum}
                    onChange={e => setLotNum(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">용량 / 단위</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={volume}
                      onChange={e => setVolume(Number(e.target.value))}
                      className="w-2/3 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100"
                    />
                    <select
                      value={unit}
                      onChange={e => setUnit(e.target.value as unknown as typeof unit)}
                      className="w-1/3 bg-slate-950 border border-slate-800 rounded-lg px-2 py-2 text-slate-100"
                    >
                      <option value="mL">mL</option>
                      <option value="L">L</option>
                      <option value="g">g</option>
                      <option value="units">units</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">보관 온도 조건</label>
                  <select
                    value={storageTemp}
                    onChange={e => setStorageTemp(e.target.value as unknown as typeof storageTemp)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100"
                  >
                    <option value="Room Temp (20-25°C)">실온 (20-25°C)</option>
                    <option value="Cold (4°C)">냉장 (4°C)</option>
                    <option value="Frozen (-20°C)">동결 (-20°C)</option>
                    <option value="Deep Freeze (-80°C)">초저온 (-80°C)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">유효기간</label>
                  <input
                    type="date"
                    value={expiry}
                    onChange={e => setExpiry(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100"
                  />
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white font-bold rounded-lg shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>등록 완료</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

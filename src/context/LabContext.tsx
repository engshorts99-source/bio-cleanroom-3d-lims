import React, { createContext, useContext, useState, useEffect } from 'react';
import { BioSample, Reagent, Equipment, ProtocolRun, CleanroomEnvironment, CameraViewZone } from '../types/lims';
import { INITIAL_SAMPLES, INITIAL_REAGENTS, INITIAL_EQUIPMENT, INITIAL_PROTOCOLS, INITIAL_ENVIRONMENT } from '../data/mockData';
import { labAudio } from '../audio/soundEffects';

interface LabContextType {
  samples: BioSample[];
  reagents: Reagent[];
  equipment: Equipment[];
  protocols: ProtocolRun[];
  environment: CleanroomEnvironment;
  
  selectedZone: CameraViewZone;
  setSelectedZone: (zone: CameraViewZone) => void;
  
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  
  activeTab: 'cells' | 'reagents' | 'equipment' | 'protocols' | 'environment';
  setActiveTab: (tab: 'cells' | 'reagents' | 'equipment' | 'protocols' | 'environment') => void;
  
  selectedItem: { type: 'sample' | 'reagent' | 'equipment'; data: BioSample | Reagent | Equipment } | null;
  setSelectedItem: (item: { type: 'sample' | 'reagent' | 'equipment'; data: BioSample | Reagent | Equipment } | null) => void;

  soundEnabled: boolean;
  toggleSound: () => void;

  // Database CRUD
  addSample: (sample: Omit<BioSample, 'id'>) => void;
  updateSample: (id: string, updates: Partial<BioSample>) => void;
  deleteSample: (id: string) => void;

  addReagent: (reagent: Omit<Reagent, 'id'>) => void;
  updateReagent: (id: string, updates: Partial<Reagent>) => void;
  deleteReagent: (id: string) => void;

  // Equipment Actions
  updateEquipmentStatus: (id: string, status: Equipment['status'], params?: Partial<Equipment['parameters']>) => void;

  // Export / Import
  exportDataJSON: () => void;
  exportDataCSV: (category: 'cells' | 'reagents' | 'equipment') => void;
  importDataJSON: (jsonStr: string) => boolean;
  resetToDefaults: () => void;
}

const LabContext = createContext<LabContextType | undefined>(undefined);

export const LabProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [samples, setSamples] = useState<BioSample[]>(() => {
    const saved = localStorage.getItem('bio_lims_samples');
    return saved ? JSON.parse(saved) : INITIAL_SAMPLES;
  });

  const [reagents, setReagents] = useState<Reagent[]>(() => {
    const saved = localStorage.getItem('bio_lims_reagents');
    return saved ? JSON.parse(saved) : INITIAL_REAGENTS;
  });

  const [equipment, setEquipment] = useState<Equipment[]>(() => {
    const saved = localStorage.getItem('bio_lims_equipment');
    return saved ? JSON.parse(saved) : INITIAL_EQUIPMENT;
  });

  const [protocols, setProtocols] = useState<ProtocolRun[]>(() => {
    const saved = localStorage.getItem('bio_lims_protocols');
    return saved ? JSON.parse(saved) : INITIAL_PROTOCOLS;
  });

  const [environment] = useState<CleanroomEnvironment>(INITIAL_ENVIRONMENT);
  const [selectedZone, setSelectedZone] = useState<CameraViewZone>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'cells' | 'reagents' | 'equipment' | 'protocols' | 'environment'>('cells');
  const [selectedItem, setSelectedItem] = useState<{ type: 'sample' | 'reagent' | 'equipment'; data: BioSample | Reagent | Equipment } | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('bio_lims_samples', JSON.stringify(samples));
  }, [samples]);

  useEffect(() => {
    localStorage.setItem('bio_lims_reagents', JSON.stringify(reagents));
  }, [reagents]);

  useEffect(() => {
    localStorage.setItem('bio_lims_equipment', JSON.stringify(equipment));
  }, [equipment]);

  useEffect(() => {
    localStorage.setItem('bio_lims_protocols', JSON.stringify(protocols));
  }, [protocols]);

  const toggleSound = () => {
    labAudio.enabled = !soundEnabled;
    setSoundEnabled(!soundEnabled);
  };

  const addSample = (newSampleData: Omit<BioSample, 'id'>) => {
    const newId = `SMP-2026-${String(samples.length + 1).padStart(3, '0')}`;
    const newSample: BioSample = { ...newSampleData, id: newId };
    setSamples(prev => [newSample, ...prev]);
    labAudio.playClick();
  };

  const updateSample = (id: string, updates: Partial<BioSample>) => {
    setSamples(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const deleteSample = (id: string) => {
    setSamples(prev => prev.filter(s => s.id !== id));
    if (selectedItem?.data.id === id) setSelectedItem(null);
  };

  const addReagent = (newReagentData: Omit<Reagent, 'id'>) => {
    const newId = `RGT-2026-${String(reagents.length + 101).padStart(3, '0')}`;
    const newReagent: Reagent = { ...newReagentData, id: newId };
    setReagents(prev => [newReagent, ...prev]);
    labAudio.playClick();
  };

  const updateReagent = (id: string, updates: Partial<Reagent>) => {
    setReagents(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const deleteReagent = (id: string) => {
    setReagents(prev => prev.filter(r => r.id !== id));
    if (selectedItem?.data.id === id) setSelectedItem(null);
  };

  const updateEquipmentStatus = (id: string, status: Equipment['status'], params?: Partial<Equipment['parameters']>) => {
    setEquipment(prev => prev.map(eq => {
      if (eq.id === id) {
        return {
          ...eq,
          status,
          parameters: { ...eq.parameters, ...(params || {}) }
        };
      }
      return eq;
    }));
  };

  const exportDataJSON = () => {
    const bundle = {
      exportedAt: new Date().toISOString(),
      cleanroom: environment,
      samples,
      reagents,
      equipment,
      protocols
    };
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BioCleanroom_LIMS_Export_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportDataCSV = (category: 'cells' | 'reagents' | 'equipment') => {
    let csvContent = '';
    let filename = '';

    if (category === 'cells') {
      filename = 'BioSamples_CellLines.csv';
      const headers = ['ID', 'Name', 'Type', 'Organism', 'Passage', 'BSL', 'Location', 'Quantity', 'Viability', 'FreezeDate'];
      const rows = samples.map(s => [
        s.id,
        `"${s.name}"`,
        s.type,
        `"${s.organism}"`,
        s.passage ?? '',
        s.biosafetyLevel,
        `"${s.storageLocation.box} (${s.storageLocation.well})"`,
        `${s.quantity} ${s.unit}`,
        s.viability ? `${s.viability}%` : '',
        s.freezeDate
      ]);
      csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    } else if (category === 'reagents') {
      filename = 'Reagents_Media.csv';
      const headers = ['ID', 'Name', 'Category', 'Vendor', 'CatalogNo', 'Remaining', 'Total', 'StorageTemp', 'ExpiryDate'];
      const rows = reagents.map(r => [
        r.id,
        `"${r.name}"`,
        r.category,
        `"${r.vendor}"`,
        r.catalogNumber,
        r.volumeRemaining,
        `${r.totalVolume} ${r.unit}`,
        r.storageTemp,
        r.expiryDate
      ]);
      csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    } else {
      filename = 'Equipment_Sensors.csv';
      const headers = ['ID', 'Name', 'Model', 'SerialNo', 'Category', 'Zone', 'Status', 'NextCalibration'];
      const rows = equipment.map(eq => [
        eq.id,
        `"${eq.name}"`,
        `"${eq.model}"`,
        eq.serialNumber,
        eq.category,
        `"${eq.locationZone}"`,
        eq.status,
        eq.nextCalibration
      ]);
      csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importDataJSON = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.samples && Array.isArray(data.samples)) setSamples(data.samples);
      if (data.reagents && Array.isArray(data.reagents)) setReagents(data.reagents);
      if (data.equipment && Array.isArray(data.equipment)) setEquipment(data.equipment);
      if (data.protocols && Array.isArray(data.protocols)) setProtocols(data.protocols);
      return true;
    } catch {
      return false;
    }
  };

  const resetToDefaults = () => {
    if (window.confirm('기본 생명과학 클린룸 데이터베이스로 초기화하시겠습니까?')) {
      setSamples(INITIAL_SAMPLES);
      setReagents(INITIAL_REAGENTS);
      setEquipment(INITIAL_EQUIPMENT);
      setProtocols(INITIAL_PROTOCOLS);
      localStorage.clear();
      labAudio.playClick();
    }
  };

  return (
    <LabContext.Provider
      value={{
        samples,
        reagents,
        equipment,
        protocols,
        environment,
        selectedZone,
        setSelectedZone,
        searchQuery,
        setSearchQuery,
        activeTab,
        setActiveTab,
        selectedItem,
        setSelectedItem,
        soundEnabled,
        toggleSound,
        addSample,
        updateSample,
        deleteSample,
        addReagent,
        updateReagent,
        deleteReagent,
        updateEquipmentStatus,
        exportDataJSON,
        exportDataCSV,
        importDataJSON,
        resetToDefaults
      }}
    >
      {children}
    </LabContext.Provider>
  );
};

export const useLab = () => {
  const context = useContext(LabContext);
  if (!context) throw new Error('useLab must be used within a LabProvider');
  return context;
};

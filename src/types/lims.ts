export type CategoryType = 'cells' | 'reagents' | 'equipment' | 'protocols' | 'environment';

export interface BioSample {
  id: string;
  name: string;
  type: 'Cell Line' | 'Primary Cell' | 'Plasmid' | 'Antibody' | 'Recombinant Protein';
  organism: string;
  passage?: number;
  biosafetyLevel: 'BSL-1' | 'BSL-2' | 'BSL-3';
  storageLocation: {
    zone: string;
    unit: string;
    rack: string;
    box: string;
    well: string;
    temperature: string;
  };
  quantity: number;
  unit: string;
  concentration?: string;
  viability?: number; // e.g. 96.5%
  thawDate?: string;
  freezeDate: string;
  researcher: string;
  notes: string;
  status: 'Available' | 'Low Stock' | 'Depleted' | 'Quarantine';
  tags: string[];
}

export interface Reagent {
  id: string;
  name: string;
  category: 'Media & Serum' | 'Enzymes & Kits' | 'Antibiotics' | 'Buffers & Salts' | 'Dyes & Probes';
  formula?: string;
  casNumber?: string;
  vendor: string;
  catalogNumber: string;
  lotNumber: string;
  storageTemp: 'Room Temp (20-25°C)' | 'Cold (4°C)' | 'Frozen (-20°C)' | 'Deep Freeze (-80°C)';
  volumeRemaining: number;
  totalVolume: number;
  unit: 'mL' | 'L' | 'g' | 'mg' | 'vials' | 'units';
  expiryDate: string;
  status: 'Optimal' | 'Expiring Soon' | 'Expired' | 'Depleted';
  hazardClass: 'Non-Hazardous' | 'Flammable' | 'Toxic' | 'Biohazard' | 'Corrosive';
  location: {
    zone: string;
    cabinet: string;
    shelf: string;
  };
}

export interface Equipment {
  id: string;
  name: string;
  model: string;
  serialNumber: string;
  category: 'Biosafety Cabinet' | 'CO2 Incubator' | 'Deep Freezer' | 'Centrifuge' | 'Liquid Handler' | 'PCR / Thermal Cycler';
  locationZone: string;
  status: 'Idle' | 'Running' | 'Sterilizing' | 'Calibration Due' | 'Maintenance';
  lastCalibrated: string;
  nextCalibration: string;
  parameters: {
    temperature?: number;
    targetTemp?: number;
    co2Percent?: number;
    rpm?: number;
    targetRpm?: number;
    sashHeightCm?: number;
    uvSterilization?: boolean;
    airflowVelocity?: number; // m/s
    cycleRemainingSeconds?: number;
    pressurePa?: number;
    humidityPercent?: number;
  };
  specifications: Record<string, string>;
  maintenanceLog: {
    date: string;
    performedBy: string;
    description: string;
    result: string;
  }[];
}

export interface ProtocolRun {
  id: string;
  title: string;
  protocolType: 'Cell Passage' | 'Cryopreservation' | 'Lentiviral Transfection' | 'Plasmid MiniPrep' | 'PCR Amplification' | 'Automated ELISA Dilution';
  operator: string;
  startTime: string;
  endTime?: string;
  status: 'In Progress' | 'Completed' | 'Aborted';
  sampleIds: string[];
  reagentIds: string[];
  equipmentIds: string[];
  steps: {
    order: number;
    description: string;
    durationMinutes: number;
    completed: boolean;
  }[];
  notes?: string;
}

export interface CleanroomEnvironment {
  cleanroomClass: 'ISO Class 5 (Grade A/B)' | 'ISO Class 7 (Grade C)';
  differentialPressurePa: number; // e.g. +18.5 Pa
  temperatureC: number;           // e.g. 21.2 °C
  humidityPercent: number;        // e.g. 46.5 %
  airChangesPerHour: number;      // e.g. 45 ACH
  particleCounts: {
    size0_5um: number; // particles/m3 (limit 3,520 for ISO 5)
    size5_0um: number; // particles/m3 (limit 29 for ISO 5)
  };
  hepaFilterEfficiency: number;   // e.g. 99.995%
  exhaustStatus: 'Optimal' | 'Warning' | 'Standby';
}

export type CameraViewZone = 
  | 'overview' 
  | 'bsc' 
  | 'incubator' 
  | 'freezer' 
  | 'centrifuge' 
  | 'liquid_handler' 
  | 'reagents_cabinet';

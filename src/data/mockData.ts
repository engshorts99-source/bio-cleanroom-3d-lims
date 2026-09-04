import { BioSample, Reagent, Equipment, ProtocolRun, CleanroomEnvironment } from '../types/lims';

export const INITIAL_SAMPLES: BioSample[] = [
  {
    id: 'SMP-2026-001',
    name: 'HEK293T (Human Embryonic Kidney)',
    type: 'Cell Line',
    organism: 'Homo sapiens',
    passage: 12,
    biosafetyLevel: 'BSL-2',
    storageLocation: {
      zone: 'Zone B: Cryo Storage',
      unit: '-80°C Freezer Alpha',
      rack: 'Rack 2',
      box: 'Cryobox B-04',
      well: 'C3',
      temperature: '-80°C'
    },
    quantity: 18,
    unit: 'vials',
    viability: 97.2,
    freezeDate: '2026-07-15',
    thawDate: '2026-08-20',
    researcher: 'Dr. Sarah Kim',
    notes: 'High SV40 large T-antigen expression. Tested negative for mycoplasma.',
    status: 'Available',
    tags: ['Transfection', 'Viral Packaging', 'Adherent']
  },
  {
    id: 'SMP-2026-002',
    name: 'HeLa-S3 (Cervical Carcinoma)',
    type: 'Cell Line',
    organism: 'Homo sapiens',
    passage: 18,
    biosafetyLevel: 'BSL-2',
    storageLocation: {
      zone: 'Zone B: Cryo Storage',
      unit: '-80°C Freezer Alpha',
      rack: 'Rack 1',
      box: 'Cryobox A-02',
      well: 'E5',
      temperature: '-80°C'
    },
    quantity: 8,
    unit: 'vials',
    viability: 94.8,
    freezeDate: '2026-06-11',
    researcher: 'Alex Park',
    notes: 'Clonal isolate adapted for suspension growth. Suitable for large-scale culture.',
    status: 'Available',
    tags: ['Suspension', 'Protein Expression']
  },
  {
    id: 'SMP-2026-003',
    name: 'Jurkat Clone E6-1 (T Lymphocyte)',
    type: 'Cell Line',
    organism: 'Homo sapiens',
    passage: 8,
    biosafetyLevel: 'BSL-2',
    storageLocation: {
      zone: 'Zone B: Cryo Storage',
      unit: '-80°C Freezer Alpha',
      rack: 'Rack 3',
      box: 'Cryobox C-01',
      well: 'A1',
      temperature: '-80°C'
    },
    quantity: 4,
    unit: 'vials',
    viability: 96.0,
    freezeDate: '2026-08-01',
    researcher: 'Dr. Michael Chen',
    notes: 'IL-2 producing upon stimulation with PHA and PMA. TCR signaling assay standard.',
    status: 'Low Stock',
    tags: ['Immunology', 'T-Cell', 'TCR']
  },
  {
    id: 'SMP-2026-004',
    name: 'CHO-K1 (Chinese Hamster Ovary)',
    type: 'Cell Line',
    organism: 'Cricetulus griseus',
    passage: 6,
    biosafetyLevel: 'BSL-1',
    storageLocation: {
      zone: 'Zone B: Cryo Storage',
      unit: '-80°C Freezer Alpha',
      rack: 'Rack 2',
      box: 'Cryobox B-02',
      well: 'D4',
      temperature: '-80°C'
    },
    quantity: 24,
    unit: 'vials',
    viability: 98.4,
    freezeDate: '2026-08-14',
    researcher: 'Elena Rostova',
    notes: 'Industrial monoclonal antibody production host. Chemically defined media adapted.',
    status: 'Available',
    tags: ['Biomanufacturing', 'mAb', 'Host']
  },
  {
    id: 'SMP-2026-005',
    name: 'pSpCas9(BB)-2A-Puro (PX459) V2.0',
    type: 'Plasmid',
    organism: 'Synthetic / S. pyogenes',
    biosafetyLevel: 'BSL-1',
    storageLocation: {
      zone: 'Zone B: Cryo Storage',
      unit: '-80°C Freezer Alpha',
      rack: 'Rack 4',
      box: 'PlasmidBox P-1',
      well: 'B2',
      temperature: '-20°C'
    },
    quantity: 150,
    unit: 'µL',
    concentration: '850 ng/µL (A260/280: 1.88)',
    freezeDate: '2026-05-10',
    researcher: 'Dr. Sarah Kim',
    notes: 'CRISPR Cas9 expression with Puromycin selection marker. BbsI cloning site.',
    status: 'Available',
    tags: ['CRISPR', 'Cas9', 'Genome Editing']
  },
  {
    id: 'SMP-2026-006',
    name: 'Anti-Human PD-1 Monoclonal IgG4 (Pembrolizumab Bio-similar)',
    type: 'Antibody',
    organism: 'Recombinant Humanized',
    biosafetyLevel: 'BSL-1',
    storageLocation: {
      zone: 'Zone B: Cryo Storage',
      unit: '-80°C Freezer Alpha',
      rack: 'Rack 4',
      box: 'AntibodyBox AB-01',
      well: 'F8',
      temperature: '-80°C'
    },
    quantity: 3,
    unit: 'mg',
    concentration: '2.5 mg/mL in sterile PBS (pH 7.4)',
    freezeDate: '2026-07-28',
    researcher: 'Dr. Michael Chen',
    notes: 'Endotoxin < 0.05 EU/mg. For immune checkpoint inhibition assays.',
    status: 'Available',
    tags: ['Checkpoint', 'Immunotherapy', 'Flow Cytometry']
  },
  {
    id: 'SMP-2026-007',
    name: 'Human iPSC Line (Induced Pluripotent Stem Cell - clone 04)',
    type: 'Primary Cell',
    organism: 'Homo sapiens',
    passage: 4,
    biosafetyLevel: 'BSL-2',
    storageLocation: {
      zone: 'Zone B: Cryo Storage',
      unit: '-80°C Freezer Alpha',
      rack: 'Rack 1',
      box: 'StemBox SC-01',
      well: 'H2',
      temperature: '-80°C'
    },
    quantity: 2,
    unit: 'vials',
    viability: 91.5,
    freezeDate: '2026-08-02',
    researcher: 'Dr. Sarah Kim',
    notes: 'Reprogrammed with non-integrating Sendai virus. Oct4/Nanog positive confirmed.',
    status: 'Low Stock',
    tags: ['Stem Cells', 'Pluripotent', 'Regenerative']
  }
];

export const INITIAL_REAGENTS: Reagent[] = [
  {
    id: 'RGT-2026-101',
    name: 'DMEM High Glucose (w/ L-Glutamine, Sodium Pyruvate)',
    category: 'Media & Serum',
    vendor: 'Gibco / Thermo Fisher',
    catalogNumber: '11995-065',
    lotNumber: 'GB-248901',
    storageTemp: 'Cold (4°C)',
    volumeRemaining: 450,
    totalVolume: 500,
    unit: 'mL',
    expiryDate: '2027-04-30',
    status: 'Optimal',
    hazardClass: 'Non-Hazardous',
    location: {
      zone: 'Zone E: Clean Media Cabinet',
      cabinet: 'Cabinet Alpha',
      shelf: 'Top Shelf (Media)'
    }
  },
  {
    id: 'RGT-2026-102',
    name: 'Fetal Bovine Serum (FBS) Premium Heat-Inactivated',
    category: 'Media & Serum',
    vendor: 'HyClone',
    catalogNumber: 'SH30071.03HI',
    lotNumber: 'HC-9812A',
    storageTemp: 'Frozen (-20°C)',
    volumeRemaining: 380,
    totalVolume: 500,
    unit: 'mL',
    expiryDate: '2028-01-15',
    status: 'Optimal',
    hazardClass: 'Biohazard',
    location: {
      zone: 'Zone B: Cryo Storage',
      cabinet: '-20°C Auxiliary Unit',
      shelf: 'Tray 2'
    }
  },
  {
    id: 'RGT-2026-103',
    name: 'Trypsin-EDTA (0.25%), phenol red',
    category: 'Enzymes & Kits',
    vendor: 'Gibco',
    catalogNumber: '25200-056',
    lotNumber: 'GB-556102',
    storageTemp: 'Frozen (-20°C)',
    volumeRemaining: 85,
    totalVolume: 100,
    unit: 'mL',
    expiryDate: '2026-12-31',
    status: 'Optimal',
    hazardClass: 'Non-Hazardous',
    location: {
      zone: 'Zone E: Clean Media Cabinet',
      cabinet: 'Cabinet Alpha',
      shelf: 'Middle Shelf'
    }
  },
  {
    id: 'RGT-2026-104',
    name: 'Lipofectamine™ 3000 Transfection Reagent',
    category: 'Enzymes & Kits',
    vendor: 'Invitrogen',
    catalogNumber: 'L3000015',
    lotNumber: 'INV-30009',
    storageTemp: 'Cold (4°C)',
    volumeRemaining: 0.8,
    totalVolume: 1.5,
    unit: 'mL',
    expiryDate: '2027-02-28',
    status: 'Optimal',
    hazardClass: 'Non-Hazardous',
    location: {
      zone: 'Zone E: Clean Media Cabinet',
      cabinet: 'Cabinet Alpha',
      shelf: 'Special Reagent Drawer'
    }
  },
  {
    id: 'RGT-2026-105',
    name: 'Penicillin-Streptomycin (10,000 U/mL)',
    category: 'Antibiotics',
    vendor: 'Sigma-Aldrich',
    catalogNumber: 'P4333-100ML',
    lotNumber: 'SIG-88741',
    storageTemp: 'Frozen (-20°C)',
    volumeRemaining: 20,
    totalVolume: 100,
    unit: 'mL',
    expiryDate: '2026-10-15',
    status: 'Expiring Soon',
    hazardClass: 'Toxic',
    location: {
      zone: 'Zone E: Clean Media Cabinet',
      cabinet: 'Cabinet Alpha',
      shelf: 'Antibiotic Safe'
    }
  },
  {
    id: 'RGT-2026-106',
    name: 'Phusion® High-Fidelity DNA Polymerase (2 U/µL)',
    category: 'Enzymes & Kits',
    vendor: 'New England Biolabs',
    catalogNumber: 'M0530L',
    lotNumber: 'NEB-00812',
    storageTemp: 'Frozen (-20°C)',
    volumeRemaining: 400,
    totalVolume: 500,
    unit: 'units',
    expiryDate: '2027-11-30',
    status: 'Optimal',
    hazardClass: 'Non-Hazardous',
    location: {
      zone: 'Zone C: Molecular Workstation',
      cabinet: 'Enzyme Cold Block',
      shelf: 'Rack Alpha'
    }
  },
  {
    id: 'RGT-2026-107',
    name: '70% Isopropanol Sterile Filtered USP Grade (Decontamination)',
    category: 'Buffers & Salts',
    formula: '(CH3)2CHOH',
    casNumber: '67-63-0',
    vendor: 'Contec Sterile Cleanroom',
    catalogNumber: 'SB3270',
    lotNumber: 'CTC-7729',
    storageTemp: 'Room Temp (20-25°C)',
    volumeRemaining: 850,
    totalVolume: 1000,
    unit: 'mL',
    expiryDate: '2028-06-30',
    status: 'Optimal',
    hazardClass: 'Flammable',
    location: {
      zone: 'Zone E: Clean Media Cabinet',
      cabinet: 'Flammables Safety Locker',
      shelf: 'Chemical Base'
    }
  }
];

export const INITIAL_EQUIPMENT: Equipment[] = [
  {
    id: 'EQP-BSC-01',
    name: 'Class II Type A2 Biosafety Cabinet',
    model: 'LabGard ES NU-540-400',
    serialNumber: 'NU-2025-99814',
    category: 'Biosafety Cabinet',
    locationZone: 'Zone A: Sterile Culture Bench',
    status: 'Idle',
    lastCalibrated: '2026-06-15',
    nextCalibration: '2026-12-15',
    parameters: {
      airflowVelocity: 0.53, // m/s inflow
      sashHeightCm: 25,
      uvSterilization: false,
      pressurePa: -12.4
    },
    specifications: {
      'HEPA Filter': '99.99% efficiency at 0.3 µm',
      'Air Recirculation': '70% Recirculated / 30% Exhausted',
      'Certifications': 'NSF/ANSI 49, EN12469 Class II'
    },
    maintenanceLog: [
      {
        date: '2026-06-15',
        performedBy: 'CertiTech Bio Inc.',
        description: 'Annual HEPA filter PAO aerosol leak test and velocity profile certification.',
        result: 'PASSED (0.002% penetration, velocity 105 fpm)'
      }
    ]
  },
  {
    id: 'EQP-INC-01',
    name: 'Direct Heat CO2 Cell Incubator',
    model: 'Forma Steri-Cycle i160',
    serialNumber: 'THM-882103',
    category: 'CO2 Incubator',
    locationZone: 'Zone A: Sterile Culture Bench',
    status: 'Running',
    lastCalibrated: '2026-07-10',
    nextCalibration: '2027-01-10',
    parameters: {
      temperature: 37.0,
      targetTemp: 37.0,
      co2Percent: 5.0,
      humidityPercent: 95
    },
    specifications: {
      'Chamber Volume': '165 Liters (Stainless Electropolished)',
      'CO2 Sensor': 'Dual-Beam Infrared (IR) Sensor',
      'Sterilization Cycle': '180°C High-temp decontamination'
    },
    maintenanceLog: [
      {
        date: '2026-07-10',
        performedBy: 'Thermo Fisher Service',
        description: 'CO2 zero-point IR calibration and temperature 9-point thermocouple mapping.',
        result: 'PASSED (Within ±0.1°C variance)'
      }
    ]
  },
  {
    id: 'EQP-FRZ-01',
    name: 'Ultra-Low Temperature -80°C Freezer',
    model: 'TSX Series Green Hydrocarbon -86°C',
    serialNumber: 'TSX-60086-K2',
    category: 'Deep Freezer',
    locationZone: 'Zone B: Cryo Storage',
    status: 'Running',
    lastCalibrated: '2026-05-20',
    nextCalibration: '2026-11-20',
    parameters: {
      temperature: -80.2,
      targetTemp: -80.0
    },
    specifications: {
      'Capacity': '600 Standard 2-inch Cryo Boxes (60,000 vials)',
      'Refrigerant': 'Natural R290 / R170 Hydrocarbon system',
      'Warm-up Reserve': '5.2 hours from -80°C to -50°C during power outage'
    },
    maintenanceLog: [
      {
        date: '2026-05-20',
        performedBy: 'CryoTech Engineering',
        description: 'Condenser filter vacuuming, gasket frost inspection and backup battery test.',
        result: 'PASSED (Hermetic seal integrity 100%)'
      }
    ]
  },
  {
    id: 'EQP-CEN-01',
    name: 'High-Speed Refrigerated Microcentrifuge',
    model: 'Eppendorf 5424 R',
    serialNumber: 'EPP-914022',
    category: 'Centrifuge',
    locationZone: 'Zone C: Molecular Workstation',
    status: 'Idle',
    lastCalibrated: '2026-08-05',
    nextCalibration: '2027-02-05',
    parameters: {
      rpm: 0,
      targetRpm: 12500,
      temperature: 4.0,
      cycleRemainingSeconds: 0
    },
    specifications: {
      'Max Speed': '15,000 RPM (21,130 × g)',
      'Rotor Capacity': '24 × 1.5/2.0 mL with aerosol-tight QuickLock lid',
      'Temperature Range': '-10°C to +40°C with FastTemp quick pre-cooling'
    },
    maintenanceLog: [
      {
        date: '2026-08-05',
        performedBy: 'Eppendorf Certified Lab',
        description: 'Optical tachometer speed verification and rotor imbalance sensor test.',
        result: 'PASSED (Deviation < 0.1%)'
      }
    ]
  },
  {
    id: 'EQP-ROB-01',
    name: 'Automated 96/384 Liquid Handling Robot',
    model: 'Biomek i5 Multichannel Workstation',
    serialNumber: 'BC-I5-70231',
    category: 'Liquid Handler',
    locationZone: 'Zone D: Automated Liquid Handling',
    status: 'Idle',
    lastCalibrated: '2026-08-18',
    nextCalibration: '2026-11-18',
    parameters: {
      cycleRemainingSeconds: 0
    },
    specifications: {
      'Pipetting Volume Range': '0.5 µL to 1,000 µL with dynamic volume tracking',
      'Deck Capacity': '25 Positions with integrated orbital shaker & peltier',
      'Positional Accuracy': '±0.05 mm XYZ repeatability'
    },
    maintenanceLog: [
      {
        date: '2026-08-18',
        performedBy: 'Beckman Coulter Specialist',
        description: 'Gravimetric calibration using dual-dye photometric system.',
        result: 'PASSED (CV < 1.2% at 2 µL)'
      }
    ]
  }
];

export const INITIAL_PROTOCOLS: ProtocolRun[] = [
  {
    id: 'PRT-2026-001',
    title: 'HEK293T Subculture & Viability Assays (Passage 12 -> 13)',
    protocolType: 'Cell Passage',
    operator: 'Dr. Sarah Kim',
    startTime: '2026-09-04 09:15:00',
    status: 'In Progress',
    sampleIds: ['SMP-2026-001'],
    reagentIds: ['RGT-2026-101', 'RGT-2026-102', 'RGT-2026-103'],
    equipmentIds: ['EQP-BSC-01', 'EQP-INC-01', 'EQP-CEN-01'],
    steps: [
      { order: 1, description: 'BSC Cleanroom airflow stabilization & UV turn-off', durationMinutes: 5, completed: true },
      { order: 2, description: 'Aspirate spent medium and gentle PBS wash', durationMinutes: 3, completed: true },
      { order: 3, description: 'Add 2mL 0.25% Trypsin-EDTA, incubate at 37°C for 2.5 min', durationMinutes: 4, completed: true },
      { order: 4, description: 'Neutralize with 8mL DMEM complete, harvest into 15mL falcon', durationMinutes: 3, completed: false },
      { order: 5, description: 'Centrifuge at 1,000 RPM (200 × g) for 4 minutes at 22°C', durationMinutes: 5, completed: false },
      { order: 6, description: 'Resuspend pellet in 5mL fresh media and perform Countess cell count', durationMinutes: 5, completed: false },
      { order: 7, description: 'Seed into two T-75 flasks at 1.5 × 10^6 cells/flask and place in incubator', durationMinutes: 5, completed: false }
    ],
    notes: 'Monitoring cell morphology after splitting. Seeded into incubator shelf 2.'
  },
  {
    id: 'PRT-2026-002',
    title: 'High-Throughput Automated Compound Dilution on 96-well Plate',
    protocolType: 'Automated ELISA Dilution',
    operator: 'Alex Park',
    startTime: '2026-09-03 14:00:00',
    endTime: '2026-09-03 14:42:00',
    status: 'Completed',
    sampleIds: ['SMP-2026-006'],
    reagentIds: ['RGT-2026-107'],
    equipmentIds: ['EQP-ROB-01'],
    steps: [
      { order: 1, description: 'Deck layout check & sterile tip box loading', durationMinutes: 10, completed: true },
      { order: 2, description: 'Pre-wetting pipetting channels with assay buffer', durationMinutes: 5, completed: true },
      { order: 3, description: '10-point serial 1:3 dilution across columns 1-10', durationMinutes: 15, completed: true },
      { order: 4, description: 'Automated barcode scan and data export to LIMS server', durationMinutes: 2, completed: true }
    ],
    notes: 'Completed with zero pipetting droplet errors. Plate barcode PLT-2026-0903 verified.'
  }
];

export const INITIAL_ENVIRONMENT: CleanroomEnvironment = {
  cleanroomClass: 'ISO Class 5 (Grade A/B)',
  differentialPressurePa: 18.5,
  temperatureC: 21.2,
  humidityPercent: 46.5,
  airChangesPerHour: 48,
  particleCounts: {
    size0_5um: 840,  // Well below ISO 5 threshold of 3,520
    size5_0um: 4     // Well below ISO 5 threshold of 29
  },
  hepaFilterEfficiency: 99.997,
  exhaustStatus: 'Optimal'
};

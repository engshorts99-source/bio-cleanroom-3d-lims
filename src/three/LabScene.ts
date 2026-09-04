import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CameraViewZone } from '../types/lims';
import { labAudio } from '../audio/soundEffects';

export interface InteractiveObjectData {
  id: string;
  name: string;
  zone: CameraViewZone;
  category: 'equipment' | 'cells' | 'reagents';
  description: string;
}

export class LabScene {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  private animationFrameId: number | null = null;
  private clock = new THREE.Clock();

  // Interactive Meshes mapping
  private interactiveObjects: THREE.Object3D[] = [];
  private hoveredObject: THREE.Object3D | null = null;
  public selectedObject: THREE.Object3D | null = null;

  // Camera animation target
  private cameraTargetPos = new THREE.Vector3(0, 10, 18);
  private cameraLookTarget = new THREE.Vector3(0, 2, 0);
  private isCameraTransitioning = false;

  // Equipment Animation States
  public bscSashOpen: boolean = false;
  public bscUvOn: boolean = false;
  private bscSashMesh: THREE.Mesh | null = null;
  private bscUvLight: THREE.PointLight | null = null;

  public incubatorDoorOpen: boolean = false;
  private incubatorDoorGroup: THREE.Group | null = null;
  private incubatorGlassDoorGroup: THREE.Group | null = null;

  public freezerDoorOpen: boolean = false;
  private freezerDoorGroup: THREE.Group | null = null;
  private frostParticles: THREE.Points | null = null;

  public centrifugeRunning: boolean = false;
  public centrifugeLidOpen: boolean = false;
  private centrifugeRotor: THREE.Group | null = null;
  private centrifugeLidGroup: THREE.Group | null = null;
  private centrifugeRpmCurrent: number = 0;
  private centrifugeRpmTarget: number = 0;

  public robotRunning: boolean = false;
  private robotGantry: THREE.Group | null = null;
  private robotHead: THREE.Group | null = null;
  private robotTimer: number = 0;

  private stirrerVortexMesh: THREE.Mesh | null = null;
  private stirrerBarMesh: THREE.Mesh | null = null;

  // Callbacks for UI interaction
  public onObjectSelect?: (data: InteractiveObjectData) => void;
  public onObjectHover?: (data: InteractiveObjectData | null, clientX: number, clientY: number) => void;

  constructor(container: HTMLElement) {
    this.container = container;

    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0c121e);
    this.scene.fog = new THREE.FogExp2(0x0c121e, 0.015);

    // 2. Camera
    const width = container.clientWidth;
    const height = container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 100);
    this.camera.position.copy(this.cameraTargetPos);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    container.appendChild(this.renderer.domElement);

    // 4. Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.02; // Don't go below floor
    this.controls.minDistance = 2;
    this.controls.maxDistance = 35;
    this.controls.target.copy(this.cameraLookTarget);

    // 5. Setup Scene Content
    this.setupLighting();
    this.buildCleanroomArchitecture();
    this.buildZoneA_CultureAndIncubator();
    this.buildZoneB_CryoStorage();
    this.buildZoneC_MolecularCentrifuge();
    this.buildZoneD_AutomatedLiquidHandler();
    this.buildZoneE_ReagentStorageAndStirrer();

    // 6. Events
    this.setupEvents();

    // 7. Start Loop
    this.animate();
  }

  /* -------------------------------------------------------------
     LIGHTING & ENVIRONMENT
  ------------------------------------------------------------- */
  private setupLighting() {
    // Ambient light - cleanroom cold white
    const ambientLight = new THREE.AmbientLight(0xdbeafe, 0.75);
    this.scene.add(ambientLight);

    // Main cleanroom overhead ceiling light panels
    const ceilingLights = [
      { x: -5, z: -3, color: 0xffffff, intensity: 1.2 },
      { x: 5, z: -3, color: 0xffffff, intensity: 1.2 },
      { x: -5, z: 3, color: 0xffffff, intensity: 1.2 },
      { x: 5, z: 3, color: 0xffffff, intensity: 1.2 },
      { x: 0, z: 0, color: 0xe0f2fe, intensity: 1.4 },
    ];

    ceilingLights.forEach((light) => {
      const pLight = new THREE.PointLight(light.color, light.intensity, 18, 1.2);
      pLight.position.set(light.x, 4.6, light.z);
      pLight.castShadow = true;
      pLight.shadow.mapSize.width = 1024;
      pLight.shadow.mapSize.height = 1024;
      pLight.shadow.bias = -0.001;
      this.scene.add(pLight);

      // Light fixture visual mesh
      const fixtureGeo = new THREE.BoxGeometry(2.4, 0.06, 1.2);
      const fixtureMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
      const fixture = new THREE.Mesh(fixtureGeo, fixtureMat);
      fixture.position.set(light.x, 4.95, light.z);
      this.scene.add(fixture);
    });

    // Gentle directional sunlight through high-security cleanroom window
    const sunLight = new THREE.DirectionalLight(0xe0f2fe, 0.4);
    sunLight.position.set(10, 12, 10);
    this.scene.add(sunLight);
  }

  /* -------------------------------------------------------------
     CLEANROOM ARCHITECTURE (WALLS, FLOOR, HEPA CEILING)
  ------------------------------------------------------------- */
  private buildCleanroomArchitecture() {
    const roomWidth = 24;
    const roomDepth = 18;
    const roomHeight = 5;

    // Epoxy Glossy Floor
    const floorGeo = new THREE.PlaneGeometry(roomWidth, roomDepth, 32, 32);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.15,
      metalness: 0.2,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Floor demarcation lines (Cleanroom zoning tape - yellow/cyan)
    const lineMat = new THREE.MeshBasicMaterial({ color: 0x0284c7, transparent: true, opacity: 0.7 });
    const line1 = new THREE.Mesh(new THREE.PlaneGeometry(0.08, roomDepth - 2), lineMat);
    line1.rotation.x = -Math.PI / 2;
    line1.position.set(-3.5, 0.005, 0);
    this.scene.add(line1);

    const line2 = new THREE.Mesh(new THREE.PlaneGeometry(0.08, roomDepth - 2), lineMat);
    line2.rotation.x = -Math.PI / 2;
    line2.position.set(3.5, 0.005, 0);
    this.scene.add(line2);

    // Ceiling - HEPA Filter Array
    const ceilingGeo = new THREE.PlaneGeometry(roomWidth, roomDepth);
    const ceilingMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.8,
      metalness: 0.1
    });
    const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = roomHeight;
    this.scene.add(ceiling);

    // Modular Cleanroom Wall Panels (Back & Sides)
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.35,
      metalness: 0.05
    });

    // Back wall
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(roomWidth, roomHeight, 0.2), wallMat);
    backWall.position.set(0, roomHeight / 2, -roomDepth / 2);
    backWall.receiveShadow = true;
    this.scene.add(backWall);

    // Left wall
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, roomHeight, roomDepth), wallMat);
    leftWall.position.set(-roomWidth / 2, roomHeight / 2, 0);
    leftWall.receiveShadow = true;
    this.scene.add(leftWall);

    // Right wall with Observation Glass Window
    const rightWall1 = new THREE.Mesh(new THREE.BoxGeometry(0.2, roomHeight, 5), wallMat);
    rightWall1.position.set(roomWidth / 2, roomHeight / 2, -6.5);
    this.scene.add(rightWall1);

    const rightWall2 = new THREE.Mesh(new THREE.BoxGeometry(0.2, roomHeight, 5), wallMat);
    rightWall2.position.set(roomWidth / 2, roomHeight / 2, 6.5);
    this.scene.add(rightWall2);

    // Glass Window in Right Wall
    const windowGlass = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 2.5, 7.8),
      new THREE.MeshPhysicalMaterial({
        color: 0xa5f3fc,
        transparent: true,
        opacity: 0.35,
        roughness: 0.05,
        metalness: 0.1,
        transmission: 0.85
      })
    );
    windowGlass.position.set(roomWidth / 2, 2.5, 0);
    this.scene.add(windowGlass);

    // Air Shower Interlock Door Frame (Left side)
    const airShowerDoor = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 3.2, 1.8),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.7, roughness: 0.3 })
    );
    airShowerDoor.position.set(-roomWidth / 2 + 0.2, 1.6, -6);
    this.scene.add(airShowerDoor);

    // Cleanroom BSL-2 & ISO 5 Sign
    const signCanvas = document.createElement('canvas');
    signCanvas.width = 512;
    signCanvas.height = 256;
    const ctx = signCanvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 512, 256);
      ctx.fillStyle = '#0ea5e9';
      ctx.fillRect(0, 0, 512, 12);
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 30px Inter, sans-serif';
      ctx.fillText('⚠ BIOHAZARD LEVEL 2', 40, 60);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px Inter, sans-serif';
      ctx.fillText('CLEANROOM SUITE A-102', 40, 110);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '20px Inter, sans-serif';
      ctx.fillText('ISO 14644-1 CLASS 5 / GRADE B', 40, 150);
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 22px monospace';
      ctx.fillText('STATUS: AIRFLOW OPTIMAL (+18.5 Pa)', 40, 200);
    }
    const signTexture = new THREE.CanvasTexture(signCanvas);
    const signMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(2.4, 1.2),
      new THREE.MeshBasicMaterial({ map: signTexture })
    );
    signMesh.position.set(-roomWidth / 2 + 0.15, 2.8, -3.5);
    signMesh.rotation.y = Math.PI / 2;
    this.scene.add(signMesh);
  }

  /* -------------------------------------------------------------
     ZONE A: BIOSAFETY CABINET (BSC) & CO2 INCUBATOR
  ------------------------------------------------------------- */
  private buildZoneA_CultureAndIncubator() {
    const zoneGroup = new THREE.Group();
    zoneGroup.position.set(-7, 0, -6);

    // Stainless Lab Bench (SUS304)
    const benchMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.85, roughness: 0.2 });
    const benchTop = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.1, 1.6), benchMat);
    benchTop.position.set(0, 1.1, 0);
    benchTop.castShadow = true;
    benchTop.receiveShadow = true;
    zoneGroup.add(benchTop);

    // Bench legs
    const legMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.9, roughness: 0.3 });
    const legPositions = [
      [-3.1, 0.55, -0.65], [3.1, 0.55, -0.65],
      [-3.1, 0.55, 0.65], [3.1, 0.55, 0.65],
      [0, 0.55, -0.65], [0, 0.55, 0.65]
    ];
    legPositions.forEach(([x, y, z]) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.1), legMat);
      leg.position.set(x, y, z);
      leg.castShadow = true;
      zoneGroup.add(leg);
    });

    // 1. Biosafety Cabinet (BSC Class II)
    const bscGroup = new THREE.Group();
    bscGroup.position.set(-1.6, 1.15, 0);

    // BSC Outer Shell
    const bscShellMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3, metalness: 0.1 });
    const bscBody = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.8, 1.3), bscShellMat);
    bscBody.position.y = 0.9;
    bscBody.castShadow = true;
    bscGroup.add(bscBody);

    // Interior Chamber (Cutout look)
    const bscChamberMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.9, roughness: 0.15 });
    const bscChamber = new THREE.Mesh(new THREE.BoxGeometry(2.1, 1.0, 1.0), bscChamberMat);
    bscChamber.position.set(0, 0.7, 0.12);
    bscGroup.add(bscChamber);

    // Glass Sash (Sliding Window)
    const sashMat = new THREE.MeshPhysicalMaterial({
      color: 0xe0f2fe,
      transparent: true,
      opacity: 0.4,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.9
    });
    this.bscSashMesh = new THREE.Mesh(new THREE.BoxGeometry(2.15, 0.8, 0.04), sashMat);
    this.bscSashMesh.position.set(0, 0.8, 0.62);
    bscGroup.add(this.bscSashMesh);

    // Sash Handle
    const sashHandle = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.04, 0.06),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.8, roughness: 0.2 })
    );
    sashHandle.position.set(0, -0.38, 0.04);
    this.bscSashMesh.add(sashHandle);

    // BSC Internal UV Light Tube
    const uvTube = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.015, 1.8),
      new THREE.MeshBasicMaterial({ color: 0xa855f7 })
    );
    uvTube.rotation.z = Math.PI / 2;
    uvTube.position.set(0, 1.15, 0);
    bscGroup.add(uvTube);

    this.bscUvLight = new THREE.PointLight(0xa855f7, 0, 3, 2);
    this.bscUvLight.position.set(0, 0.9, 0);
    bscGroup.add(this.bscUvLight);

    // Pipette Stand inside BSC
    const pipetteStand = this.createPipetteStand();
    pipetteStand.position.set(0.7, 0.2, 0.1);
    bscGroup.add(pipetteStand);

    // Media bottles inside BSC
    const mediaBottle = this.createMediaBottle(0xef4444, 'DMEM');
    mediaBottle.position.set(-0.6, 0.2, 0.1);
    bscGroup.add(mediaBottle);

    // Register interactive BSC
    this.registerInteractive(bscBody, {
      id: 'EQP-BSC-01',
      name: 'Class II Biosafety Cabinet',
      zone: 'bsc',
      category: 'equipment',
      description: '클린룸 무균 세포 배양용 BSC. 클릭 시 새시 도어 개폐 및 UV/형광 램프 토글.'
    });

    zoneGroup.add(bscGroup);

    // 2. CO2 Cell Incubator (Next to BSC)
    const incubatorGroup = new THREE.Group();
    incubatorGroup.position.set(1.8, 1.15, 0);

    const incBodyMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.7, roughness: 0.3 });
    const incBody = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.5, 1.1), incBodyMat);
    incBody.position.y = 0.75;
    incBody.castShadow = true;
    incubatorGroup.add(incBody);

    // Outer Heavy Door (Pivots from left)
    this.incubatorDoorGroup = new THREE.Group();
    this.incubatorDoorGroup.position.set(-0.7, 0.75, 0.55); // Left pivot edge

    const outerDoor = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 1.5, 0.08),
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.25 })
    );
    outerDoor.position.set(0.7, 0, 0); // centered from pivot
    outerDoor.castShadow = true;
    this.incubatorDoorGroup.add(outerDoor);

    // Digital LED Display on door (37.0°C / 5.0% CO2)
    const incCanvas = document.createElement('canvas');
    incCanvas.width = 256;
    incCanvas.height = 128;
    const incCtx = incCanvas.getContext('2d');
    if (incCtx) {
      incCtx.fillStyle = '#05070a';
      incCtx.fillRect(0, 0, 256, 128);
      incCtx.fillStyle = '#10b981';
      incCtx.font = 'bold 36px monospace';
      incCtx.fillText('37.0°C', 20, 50);
      incCtx.fillStyle = '#0ea5e9';
      incCtx.fillText('5.0% CO2', 20, 100);
    }
    const incTexture = new THREE.CanvasTexture(incCanvas);
    const incScreen = new THREE.Mesh(
      new THREE.PlaneGeometry(0.5, 0.25),
      new THREE.MeshBasicMaterial({ map: incTexture })
    );
    incScreen.position.set(0.7, 0.4, 0.05);
    this.incubatorDoorGroup.add(incScreen);

    // Door Handle
    const incHandle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 0.4),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.9, roughness: 0.1 })
    );
    incHandle.position.set(1.3, 0, 0.06);
    this.incubatorDoorGroup.add(incHandle);

    incubatorGroup.add(this.incubatorDoorGroup);

    // Inner Glass Door (behind outer door)
    this.incubatorGlassDoorGroup = new THREE.Group();
    this.incubatorGlassDoorGroup.position.set(-0.68, 0.75, 0.48);
    const innerGlass = new THREE.Mesh(
      new THREE.BoxGeometry(1.36, 1.4, 0.02),
      new THREE.MeshPhysicalMaterial({ color: 0xdcfce7, transparent: true, opacity: 0.5, roughness: 0.1, transmission: 0.9 })
    );
    innerGlass.position.set(0.68, 0, 0);
    this.incubatorGlassDoorGroup.add(innerGlass);
    incubatorGroup.add(this.incubatorGlassDoorGroup);

    // Internal Culture Flasks inside incubator
    const flaskGeo = new THREE.BoxGeometry(0.2, 0.06, 0.28);
    const flaskMat = new THREE.MeshStandardMaterial({ color: 0xf87171, transparent: true, opacity: 0.75 });
    for (let i = -1; i <= 1; i++) {
      const flask = new THREE.Mesh(flaskGeo, flaskMat);
      flask.position.set(i * 0.35, 0.5, 0);
      incubatorGroup.add(flask);
    }

    this.registerInteractive(incBody, {
      id: 'EQP-INC-01',
      name: 'Forma Steri-Cycle CO2 Incubator',
      zone: 'incubator',
      category: 'equipment',
      description: '포유류 세포 배양 인큐베이터 (37.0°C / 5.0% CO2). 클릭 시 멸균 도어 개폐.'
    });

    zoneGroup.add(incubatorGroup);
    this.scene.add(zoneGroup);
  }

  /* -------------------------------------------------------------
     ZONE B: CRYO STORAGE (-80°C ULTRA-LOW FREEZER & LN2)
  ------------------------------------------------------------- */
  private buildZoneB_CryoStorage() {
    const cryoGroup = new THREE.Group();
    cryoGroup.position.set(7.5, 0, -6);

    // 1. -80°C Deep Freezer
    const freezerGroup = new THREE.Group();
    freezerGroup.position.set(-1.2, 0, 0);

    const frzBodyMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.6, roughness: 0.3 });
    const frzBody = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.3, 1.4), frzBodyMat);
    frzBody.position.y = 1.15;
    frzBody.castShadow = true;
    freezerGroup.add(frzBody);

    // Door with Left Pivot
    this.freezerDoorGroup = new THREE.Group();
    this.freezerDoorGroup.position.set(-0.8, 1.15, 0.7);

    const frzDoor = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 2.2, 0.12),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.2 })
    );
    frzDoor.position.set(0.8, 0, 0);
    frzDoor.castShadow = true;
    this.freezerDoorGroup.add(frzDoor);

    // Blue Digital Temp Screen (-80.2°C)
    const frzCanvas = document.createElement('canvas');
    frzCanvas.width = 256;
    frzCanvas.height = 128;
    const frzCtx = frzCanvas.getContext('2d');
    if (frzCtx) {
      frzCtx.fillStyle = '#020617';
      frzCtx.fillRect(0, 0, 256, 128);
      frzCtx.fillStyle = '#38bdf8';
      frzCtx.font = 'bold 42px monospace';
      frzCtx.fillText('-80.2°C', 20, 60);
      frzCtx.fillStyle = '#10b981';
      frzCtx.font = '20px monospace';
      frzCtx.fillText('STATUS: LOCKED / SAFE', 20, 100);
    }
    const frzTexture = new THREE.CanvasTexture(frzCanvas);
    const frzDisplay = new THREE.Mesh(
      new THREE.PlaneGeometry(0.55, 0.28),
      new THREE.MeshBasicMaterial({ map: frzTexture })
    );
    frzDisplay.position.set(0.8, 0.65, 0.07);
    this.freezerDoorGroup.add(frzDisplay);

    // Heavy Industrial Latch
    const latch = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.5, 0.1),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.9, roughness: 0.15 })
    );
    latch.position.set(1.5, 0, 0.08);
    this.freezerDoorGroup.add(latch);

    freezerGroup.add(this.freezerDoorGroup);

    // Stainless Interior Cryoracks with Colorful Sample Boxes
    const rackMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.9, roughness: 0.2 });
    const colors = [0xef4444, 0x3b82f6, 0x10b981, 0xf59e0b, 0x8b5cf6];
    for (let shelf = -2; shelf <= 2; shelf++) {
      const shelfMesh = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.02, 1.1), rackMat);
      shelfMesh.position.set(0, 1.15 + shelf * 0.35, 0);
      freezerGroup.add(shelfMesh);

      for (let b = -2; b <= 2; b++) {
        const box = new THREE.Mesh(
          new THREE.BoxGeometry(0.22, 0.16, 0.22),
          new THREE.MeshStandardMaterial({ color: colors[Math.abs(shelf + b) % colors.length], roughness: 0.4 })
        );
        box.position.set(b * 0.26, 1.15 + shelf * 0.35 + 0.09, 0.2);
        freezerGroup.add(box);
      }
    }

    // Dynamic Frost / Cold Mist Particle System
    const particleCount = 200;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 1.2;
      positions[i + 1] = Math.random() * 1.5;
      positions[i + 2] = 0.6 + Math.random() * 0.8;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xe0f2fe,
      size: 0.05,
      transparent: true,
      opacity: 0, // initially hidden until door opens
      blending: THREE.AdditiveBlending
    });
    this.frostParticles = new THREE.Points(particleGeo, particleMat);
    freezerGroup.add(this.frostParticles);

    this.registerInteractive(frzBody, {
      id: 'EQP-FRZ-01',
      name: '-80°C Ultra-Low Freezer Alpha',
      zone: 'freezer',
      category: 'cells',
      description: '세포주/플라스미드/항체 동결 보존 초저온 냉동고. 클릭 시 도어 개폐 및 크라이오 랙 시료 확인.'
    });

    cryoGroup.add(freezerGroup);

    // 2. Liquid Nitrogen (LN2) Cryo Tank
    const ln2Group = new THREE.Group();
    ln2Group.position.set(1.4, 0, 0);

    const dewarBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.55, 0.55, 1.4, 32),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.2 })
    );
    dewarBody.position.y = 0.7;
    dewarBody.castShadow = true;
    ln2Group.add(dewarBody);

    const dewarNeck = new THREE.Mesh(
      new THREE.CylinderGeometry(0.25, 0.25, 0.3, 32),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.8, roughness: 0.3 })
    );
    dewarNeck.position.y = 1.55;
    ln2Group.add(dewarNeck);

    const pressureGauge = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 0.04, 16),
      new THREE.MeshBasicMaterial({ color: 0xef4444 })
    );
    pressureGauge.rotation.x = Math.PI / 2;
    pressureGauge.position.set(0, 1.7, 0.2);
    ln2Group.add(pressureGauge);

    cryoGroup.add(ln2Group);
    this.scene.add(cryoGroup);
  }

  /* -------------------------------------------------------------
     ZONE C: MOLECULAR WORKSTATION & HIGH-SPEED CENTRIFUGE
  ------------------------------------------------------------- */
  private buildZoneC_MolecularCentrifuge() {
    const zoneGroup = new THREE.Group();
    zoneGroup.position.set(-6, 0, 2);

    // Lab Bench
    const bench = new THREE.Mesh(
      new THREE.BoxGeometry(5.2, 0.1, 1.6),
      new THREE.MeshStandardMaterial({ color: 0xf1f5f9, metalness: 0.8, roughness: 0.25 })
    );
    bench.position.y = 1.1;
    bench.castShadow = true;
    bench.receiveShadow = true;
    zoneGroup.add(bench);

    // Bench supports
    const leg1 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.1, 1.4), new THREE.MeshStandardMaterial({ color: 0x475569 }));
    leg1.position.set(-2.4, 0.55, 0);
    zoneGroup.add(leg1);
    const leg2 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.1, 1.4), new THREE.MeshStandardMaterial({ color: 0x475569 }));
    leg2.position.set(2.4, 0.55, 0);
    zoneGroup.add(leg2);

    // 1. Eppendorf 5424 R Microcentrifuge
    const centGroup = new THREE.Group();
    centGroup.position.set(-1.2, 1.15, 0);

    // Centrifuge Base Housing
    const centBody = new THREE.Mesh(
      new THREE.BoxGeometry(1.1, 0.65, 1.1),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.35, metalness: 0.1 })
    );
    centBody.position.y = 0.32;
    centBody.castShadow = true;
    centGroup.add(centBody);

    // Rotor Bowl Cutout
    const rotorChamber = new THREE.Mesh(
      new THREE.CylinderGeometry(0.42, 0.42, 0.25, 32),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 })
    );
    rotorChamber.position.y = 0.55;
    centGroup.add(rotorChamber);

    // Rotor with 24 tube positions
    this.centrifugeRotor = new THREE.Group();
    this.centrifugeRotor.position.y = 0.52;

    const rotorDisc = new THREE.Mesh(
      new THREE.CylinderGeometry(0.38, 0.38, 0.12, 24),
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9, roughness: 0.2 })
    );
    this.centrifugeRotor.add(rotorDisc);

    // 1.5mL Microcentrifuge Tubes loaded around rotor
    const tubeGeo = new THREE.CylinderGeometry(0.018, 0.012, 0.08, 12);
    const tubeMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.85 });
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2;
      const tube = new THREE.Mesh(tubeGeo, tubeMat);
      tube.position.set(Math.cos(angle) * 0.3, 0.04, Math.sin(angle) * 0.3);
      tube.rotation.z = Math.cos(angle) * 0.6;
      tube.rotation.x = Math.sin(angle) * 0.6;
      this.centrifugeRotor.add(tube);
    }
    centGroup.add(this.centrifugeRotor);

    // Hinged Lid (Pivots from back)
    this.centrifugeLidGroup = new THREE.Group();
    this.centrifugeLidGroup.position.set(0, 0.65, -0.5);

    const lid = new THREE.Mesh(
      new THREE.BoxGeometry(1.08, 0.1, 1.05),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.6, roughness: 0.2 })
    );
    lid.position.set(0, 0.05, 0.5);
    lid.castShadow = true;
    this.centrifugeLidGroup.add(lid);

    centGroup.add(this.centrifugeLidGroup);

    // Front Control Panel & Display (RPM / Time)
    const centCanvas = document.createElement('canvas');
    centCanvas.width = 256;
    centCanvas.height = 128;
    const centCtx = centCanvas.getContext('2d');
    if (centCtx) {
      centCtx.fillStyle = '#0f172a';
      centCtx.fillRect(0, 0, 256, 128);
      centCtx.fillStyle = '#38bdf8';
      centCtx.font = 'bold 36px monospace';
      centCtx.fillText('12,500 RPM', 15, 50);
      centCtx.fillStyle = '#10b981';
      centCtx.fillText('4.0°C / 04:00', 15, 100);
    }
    const centTexture = new THREE.CanvasTexture(centCanvas);
    const centDisplay = new THREE.Mesh(
      new THREE.PlaneGeometry(0.45, 0.22),
      new THREE.MeshBasicMaterial({ map: centTexture })
    );
    centDisplay.position.set(0, 0.35, 0.56);
    centGroup.add(centDisplay);

    this.registerInteractive(centBody, {
      id: 'EQP-CEN-01',
      name: 'High-Speed Microcentrifuge 5424 R',
      zone: 'centrifuge',
      category: 'equipment',
      description: '초고속 냉장 원심분리기. 리드 개폐 및 RPM(최대 15,000) 가동 시뮬레이션 지원.'
    });

    zoneGroup.add(centGroup);

    // 2. Thermal Cycler (PCR Machine)
    const pcrGroup = new THREE.Group();
    pcrGroup.position.set(1.1, 1.15, 0);

    const pcrBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.85, 0.5, 0.9),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7, roughness: 0.3 })
    );
    pcrBody.position.y = 0.25;
    pcrBody.castShadow = true;
    pcrGroup.add(pcrBody);

    // Heated Lid Handle
    const pcrLid = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.12, 0.5),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.8, roughness: 0.2 })
    );
    pcrLid.position.set(0, 0.52, -0.15);
    pcrGroup.add(pcrLid);

    // PCR Touchscreen (Amplification graph)
    const pcrCanvas = document.createElement('canvas');
    pcrCanvas.width = 256;
    pcrCanvas.height = 160;
    const pcrCtx = pcrCanvas.getContext('2d');
    if (pcrCtx) {
      pcrCtx.fillStyle = '#090d16';
      pcrCtx.fillRect(0, 0, 256, 160);
      pcrCtx.strokeStyle = '#10b981';
      pcrCtx.lineWidth = 4;
      pcrCtx.beginPath();
      pcrCtx.moveTo(20, 130);
      pcrCtx.lineTo(70, 30);
      pcrCtx.lineTo(120, 90);
      pcrCtx.lineTo(180, 60);
      pcrCtx.lineTo(240, 60);
      pcrCtx.stroke();
      pcrCtx.fillStyle = '#ffffff';
      pcrCtx.font = 'bold 22px sans-serif';
      pcrCtx.fillText('CYCLE 28 / 35', 20, 150);
    }
    const pcrTexture = new THREE.CanvasTexture(pcrCanvas);
    const pcrScreen = new THREE.Mesh(
      new THREE.PlaneGeometry(0.48, 0.3),
      new THREE.MeshBasicMaterial({ map: pcrTexture })
    );
    pcrScreen.rotation.x = -Math.PI / 6;
    pcrScreen.position.set(0, 0.42, 0.3);
    pcrGroup.add(pcrScreen);

    zoneGroup.add(pcrGroup);
    this.scene.add(zoneGroup);
  }

  /* -------------------------------------------------------------
     ZONE D: AUTOMATED LIQUID HANDLER ROBOT
  ------------------------------------------------------------- */
  private buildZoneD_AutomatedLiquidHandler() {
    const robotWorkstation = new THREE.Group();
    robotWorkstation.position.set(5.5, 0, 2.5);

    // Large Heavy Automation Bench
    const bench = new THREE.Mesh(
      new THREE.BoxGeometry(4.8, 0.1, 2.0),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.2 })
    );
    bench.position.y = 1.1;
    bench.castShadow = true;
    bench.receiveShadow = true;
    robotWorkstation.add(bench);

    // Enclosure Frame (Transparent Acrylic Clean Safety Shield)
    const glassEnclosure = new THREE.Mesh(
      new THREE.BoxGeometry(4.6, 2.0, 1.8),
      new THREE.MeshPhysicalMaterial({
        color: 0x93c5fd,
        transparent: true,
        opacity: 0.25,
        roughness: 0.05,
        metalness: 0.1,
        transmission: 0.9
      })
    );
    glassEnclosure.position.y = 2.15;
    robotWorkstation.add(glassEnclosure);

    // Automation Deck Base Plate (25 positions grid)
    const deckMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.3 });
    const deck = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.05, 1.5), deckMat);
    deck.position.y = 1.16;
    robotWorkstation.add(deck);

    // Microplates (96-well) on the deck
    const plateGeo = new THREE.BoxGeometry(0.48, 0.06, 0.34);
    const plateMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2 });
    const plate1 = new THREE.Mesh(plateGeo, plateMat);
    plate1.position.set(-1.0, 1.22, 0);
    robotWorkstation.add(plate1);

    const plate2 = new THREE.Mesh(plateGeo, plateMat);
    plate2.position.set(0, 1.22, 0);
    robotWorkstation.add(plate2);

    // Pipette Tip Box
    const tipBox = new THREE.Mesh(
      new THREE.BoxGeometry(0.48, 0.18, 0.34),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, transparent: true, opacity: 0.85 })
    );
    tipBox.position.set(1.0, 1.28, 0);
    robotWorkstation.add(tipBox);

    // Gantry Frame (X-axis gantry moving across deck)
    this.robotGantry = new THREE.Group();
    this.robotGantry.position.set(-0.5, 1.8, 0);

    const gantryBeam = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.15, 1.6),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.9, roughness: 0.1 })
    );
    this.robotGantry.add(gantryBeam);

    // Pipetting Head (Y & Z moving carriage)
    this.robotHead = new THREE.Group();
    this.robotHead.position.set(0, -0.1, 0);

    const headBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.25, 0.45, 0.35),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.2 })
    );
    this.robotHead.add(headBody);

    // 8-channel multichannel pipetting nozzles
    const nozzleMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.1 });
    for (let n = -3.5; n <= 3.5; n++) {
      const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.003, 0.12, 12), nozzleMat);
      nozzle.position.set(0, -0.28, n * 0.035);
      this.robotHead.add(nozzle);
    }

    this.robotGantry.add(this.robotHead);
    robotWorkstation.add(this.robotGantry);

    this.registerInteractive(glassEnclosure, {
      id: 'EQP-ROB-01',
      name: 'Biomek i5 Automated Liquid Handler',
      zone: 'liquid_handler',
      category: 'equipment',
      description: '고속 자동화 분주 로봇. 96-well 플레이트와 시약 튜브 간 정밀 피펫팅 시뮬레이션.'
    });

    this.scene.add(robotWorkstation);
  }

  /* -------------------------------------------------------------
     ZONE E: CLEAN REAGENT STORAGE & MAGNETIC STIRRER
  ------------------------------------------------------------- */
  private buildZoneE_ReagentStorageAndStirrer() {
    const zoneGroup = new THREE.Group();
    zoneGroup.position.set(0, 0, -6.5);

    // 1. Heavy Cleanroom Stainless Reagent Cabinet
    const cabMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.85, roughness: 0.2 });
    const cabBody = new THREE.Mesh(new THREE.BoxGeometry(4.2, 2.5, 0.8), cabMat);
    cabBody.position.set(0, 1.25, 0);
    cabBody.castShadow = true;
    zoneGroup.add(cabBody);

    // Cabinet Sliding Glass Panels
    const glassDoor = new THREE.Mesh(
      new THREE.BoxGeometry(2.0, 2.2, 0.04),
      new THREE.MeshPhysicalMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.4, transmission: 0.85 })
    );
    glassDoor.position.set(-1.0, 1.25, 0.42);
    zoneGroup.add(glassDoor);

    const glassDoor2 = new THREE.Mesh(
      new THREE.BoxGeometry(2.0, 2.2, 0.04),
      new THREE.MeshPhysicalMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.4, transmission: 0.85 })
    );
    glassDoor2.position.set(1.0, 1.25, 0.45);
    zoneGroup.add(glassDoor2);

    // Reagent Bottles on Shelves (Colors: Media red, Buffer blue, Solvent amber)
    const shelfY = [0.6, 1.2, 1.8];
    const bottleColors = [0xef4444, 0x3b82f6, 0xf59e0b, 0x10b981, 0xec4899];
    shelfY.forEach((y, sIndex) => {
      for (let x = -1.7; x <= 1.7; x += 0.45) {
        const bottle = this.createMediaBottle(bottleColors[(sIndex + Math.floor(x * 2) + 10) % bottleColors.length]);
        bottle.position.set(x, y + 0.05, 0);
        zoneGroup.add(bottle);
      }
    });

    this.registerInteractive(cabBody, {
      id: 'RGT-CAB-01',
      name: 'Clean Media & Reagents Cabinet',
      zone: 'reagents_cabinet',
      category: 'reagents',
      description: '무균 배지(DMEM), 버퍼, 효소 및 무균 필터 시약 보관장. 시약 재고 및 잔여량 추적.'
    });

    // 2. Center Island Magnetic Stirrer Workstation
    const island = new THREE.Group();
    island.position.set(0, 0, 4.5);

    const islandTable = new THREE.Mesh(
      new THREE.BoxGeometry(3.0, 0.1, 1.6),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7, roughness: 0.3 })
    );
    islandTable.position.y = 1.1;
    islandTable.castShadow = true;
    islandTable.receiveShadow = true;
    island.add(islandTable);

    // Magnetic Stirrer Plate
    const stirrerPlate = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.12, 0.5),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2, metalness: 0.3 })
    );
    stirrerPlate.position.set(0, 1.21, 0);
    island.add(stirrerPlate);

    // Glass Erlenmeyer Flask with Liquid
    const flaskGlass = new THREE.Mesh(
      new THREE.ConeGeometry(0.18, 0.35, 24, 1, true),
      new THREE.MeshPhysicalMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.4, transmission: 0.9 })
    );
    flaskGlass.position.set(0, 1.44, 0);
    island.add(flaskGlass);

    // Stirring Liquid inside flask
    this.stirrerVortexMesh = new THREE.Mesh(
      new THREE.ConeGeometry(0.16, 0.22, 24),
      new THREE.MeshStandardMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.85 })
    );
    this.stirrerVortexMesh.position.set(0, 1.38, 0);
    island.add(this.stirrerVortexMesh);

    // Magnetic Stir Bar (Pill)
    this.stirrerBarMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.015, 0.08, 12),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1 })
    );
    this.stirrerBarMesh.rotation.z = Math.PI / 2;
    this.stirrerBarMesh.position.set(0, 1.28, 0);
    island.add(this.stirrerBarMesh);

    zoneGroup.add(island);
    this.scene.add(zoneGroup);
  }

  /* -------------------------------------------------------------
     HELPER PROCEDURAL MESH BUILDERS
  ------------------------------------------------------------- */
  private createMediaBottle(colorHex: number, labelText: string = 'BIO-REAGENT'): THREE.Group {
    const group = new THREE.Group();

    // Glass Bottle Body (Square Boston Round bottle)
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 0.3, 0.16),
      new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.4, transmission: 0.85 })
    );
    group.add(body);

    // Colored Liquid inside
    const liquid = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.24, 0.14),
      new THREE.MeshStandardMaterial({ color: colorHex, transparent: true, opacity: 0.85 })
    );
    liquid.position.y = -0.02;
    group.add(liquid);

    // Blue Screw Cap
    const cap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 0.06, 16),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.5, roughness: 0.3 })
    );
    cap.position.y = 0.18;
    group.add(cap);

    // Label
    const labelCanvas = document.createElement('canvas');
    labelCanvas.width = 128;
    labelCanvas.height = 64;
    const lCtx = labelCanvas.getContext('2d');
    if (lCtx) {
      lCtx.fillStyle = '#ffffff';
      lCtx.fillRect(0, 0, 128, 64);
      lCtx.fillStyle = '#0f172a';
      lCtx.font = 'bold 16px sans-serif';
      lCtx.fillText(labelText, 8, 36);
    }
    const labelTex = new THREE.CanvasTexture(labelCanvas);
    const labelMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.08), new THREE.MeshBasicMaterial({ map: labelTex }));
    labelMesh.position.set(0, 0, 0.082);
    group.add(labelMesh);

    return group;
  }

  private createPipetteStand(): THREE.Group {
    const stand = new THREE.Group();
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.02, 24), new THREE.MeshStandardMaterial({ color: 0x1e293b }));
    stand.add(base);

    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.45, 16), new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.9 }));
    rod.position.y = 0.22;
    stand.add(rod);

    // 4 pipettes hung on carousel
    const pColors = [0xef4444, 0x3b82f6, 0xf59e0b, 0x10b981];
    pColors.forEach((col, idx) => {
      const angle = (idx / 4) * Math.PI * 2;
      const pipette = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.24, 0.04), new THREE.MeshStandardMaterial({ color: col }));
      pipette.position.set(Math.cos(angle) * 0.12, 0.35, Math.sin(angle) * 0.12);
      stand.add(pipette);
    });

    return stand;
  }

  /* -------------------------------------------------------------
     INTERACTION & RAYCASTING REGISTRATION
  ------------------------------------------------------------- */
  private registerInteractive(mesh: THREE.Object3D, data: InteractiveObjectData) {
    mesh.userData = data;
    this.interactiveObjects.push(mesh);
  }

  private setupEvents() {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerMove = (e: MouseEvent) => {
      const rect = this.container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, this.camera);
      const intersects = raycaster.intersectObjects(this.interactiveObjects, true);

      if (intersects.length > 0) {
        let hitObj: THREE.Object3D | null = intersects[0].object;
        while (hitObj && !hitObj.userData?.id && hitObj.parent) {
          hitObj = hitObj.parent;
        }

        if (hitObj && hitObj.userData?.id) {
          if (this.hoveredObject !== hitObj) {
            this.hoveredObject = hitObj;
            this.container.style.cursor = 'pointer';
            if (this.onObjectHover) {
              this.onObjectHover(hitObj.userData as InteractiveObjectData, e.clientX, e.clientY);
            }
          }
          return;
        }
      }

      if (this.hoveredObject) {
        this.hoveredObject = null;
        this.container.style.cursor = 'default';
        if (this.onObjectHover) {
          this.onObjectHover(null, 0, 0);
        }
      }
    };

    const onClick = (e: MouseEvent) => {
      const rect = this.container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, this.camera);
      const intersects = raycaster.intersectObjects(this.interactiveObjects, true);

      if (intersects.length > 0) {
        let hitObj: THREE.Object3D | null = intersects[0].object;
        while (hitObj && !hitObj.userData?.id && hitObj.parent) {
          hitObj = hitObj.parent;
        }

        if (hitObj && hitObj.userData?.id) {
          this.selectedObject = hitObj;
          const data = hitObj.userData as InteractiveObjectData;
          labAudio.playClick();

          // Action dispatch based on object
          if (data.id === 'EQP-BSC-01') {
            this.toggleBscSash();
          } else if (data.id === 'EQP-INC-01') {
            this.toggleIncubatorDoor();
          } else if (data.id === 'EQP-FRZ-01') {
            this.toggleFreezerDoor();
          } else if (data.id === 'EQP-CEN-01') {
            this.toggleCentrifugeLid();
          }

          if (this.onObjectSelect) {
            this.onObjectSelect(data);
          }
        }
      }
    };

    const onResize = () => {
      if (!this.container) return;
      const w = this.container.clientWidth;
      const h = this.container.clientHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    };

    this.container.addEventListener('mousemove', onPointerMove);
    this.container.addEventListener('click', onClick);
    window.addEventListener('resize', onResize);
  }

  /* -------------------------------------------------------------
     EQUIPMENT ACTIONS & ANIMATION CONTROLLERS
  ------------------------------------------------------------- */
  public toggleBscSash() {
    this.bscSashOpen = !this.bscSashOpen;
    labAudio.playDoor(this.bscSashOpen);
  }

  public toggleBscUv() {
    this.bscUvOn = !this.bscUvOn;
    labAudio.playRobotBeep();
  }

  public toggleIncubatorDoor() {
    this.incubatorDoorOpen = !this.incubatorDoorOpen;
    labAudio.playDoor(this.incubatorDoorOpen);
  }

  public toggleFreezerDoor() {
    this.freezerDoorOpen = !this.freezerDoorOpen;
    labAudio.playDoor(this.freezerDoorOpen);
  }

  public toggleCentrifugeLid() {
    if (this.centrifugeRunning) return; // Locked during spin
    this.centrifugeLidOpen = !this.centrifugeLidOpen;
    labAudio.playDoor(this.centrifugeLidOpen);
  }

  public triggerCentrifugeRun(rpm: number = 13000, durationSec: number = 6) {
    if (this.centrifugeRunning) return;
    this.centrifugeLidOpen = false; // Must close lid to run
    this.centrifugeRunning = true;
    this.centrifugeRpmTarget = rpm;
    labAudio.playCentrifugeSpin(durationSec);

    setTimeout(() => {
      this.centrifugeRunning = false;
      this.centrifugeRpmTarget = 0;
      labAudio.playRobotBeep();
    }, durationSec * 1000);
  }

  public triggerRobotProtocol() {
    this.robotRunning = true;
    labAudio.playRobotBeep();
    setTimeout(() => {
      labAudio.playPipetteAspirate();
    }, 1200);
    setTimeout(() => {
      labAudio.playPipetteAspirate();
    }, 3200);
    setTimeout(() => {
      this.robotRunning = false;
      labAudio.playRobotBeep();
    }, 6000);
  }

  /* -------------------------------------------------------------
     CAMERA VIEW TRANSITION SYSTEM
  ------------------------------------------------------------- */
  public setCameraView(zone: CameraViewZone) {
    this.isCameraTransitioning = true;
    labAudio.playClick();

    switch (zone) {
      case 'overview':
        this.cameraTargetPos.set(0, 10, 18);
        this.cameraLookTarget.set(0, 2, 0);
        break;
      case 'bsc':
        this.cameraTargetPos.set(-8.6, 2.3, -4.2);
        this.cameraLookTarget.set(-8.6, 2.0, -6.0);
        break;
      case 'incubator':
        this.cameraTargetPos.set(-5.2, 2.1, -4.5);
        this.cameraLookTarget.set(-5.2, 1.8, -6.0);
        break;
      case 'freezer':
        this.cameraTargetPos.set(6.3, 2.2, -4.3);
        this.cameraLookTarget.set(6.3, 1.8, -6.0);
        break;
      case 'centrifuge':
        this.cameraTargetPos.set(-7.2, 2.4, 3.2);
        this.cameraLookTarget.set(-7.2, 1.5, 2.0);
        break;
      case 'liquid_handler':
        this.cameraTargetPos.set(5.5, 3.4, 4.8);
        this.cameraLookTarget.set(5.5, 1.8, 2.5);
        break;
      case 'reagents_cabinet':
        this.cameraTargetPos.set(0, 2.2, -4.4);
        this.cameraLookTarget.set(0, 1.8, -6.5);
        break;
    }
  }

  /* -------------------------------------------------------------
     RENDER & ANIMATION LOOP
  ------------------------------------------------------------- */
  private animate = () => {
    this.animationFrameId = requestAnimationFrame(this.animate);
    const delta = this.clock.getDelta();

    // 1. Camera Transition Interpolation (Smooth Lerp)
    if (this.isCameraTransitioning) {
      this.camera.position.lerp(this.cameraTargetPos, 0.06);
      this.controls.target.lerp(this.cameraLookTarget, 0.06);
      if (this.camera.position.distanceTo(this.cameraTargetPos) < 0.08) {
        this.isCameraTransitioning = false;
      }
    }
    this.controls.update();

    // 2. BSC Sash Sliding Animation
    if (this.bscSashMesh) {
      const targetY = this.bscSashOpen ? 1.3 : 0.8;
      this.bscSashMesh.position.y += (targetY - this.bscSashMesh.position.y) * 0.1;
    }
    if (this.bscUvLight) {
      this.bscUvLight.intensity = this.bscUvOn ? 2.5 : 0;
    }

    // 3. Incubator Door Pivot Animation
    if (this.incubatorDoorGroup) {
      const targetAngle = this.incubatorDoorOpen ? -Math.PI * 0.55 : 0;
      this.incubatorDoorGroup.rotation.y += (targetAngle - this.incubatorDoorGroup.rotation.y) * 0.08;
    }

    // 4. Freezer Door Pivot & Frost Mist Animation
    if (this.freezerDoorGroup) {
      const targetAngle = this.freezerDoorOpen ? -Math.PI * 0.55 : 0;
      this.freezerDoorGroup.rotation.y += (targetAngle - this.freezerDoorGroup.rotation.y) * 0.08;
    }
    if (this.frostParticles) {
      const pMat = this.frostParticles.material as THREE.PointsMaterial;
      const targetOpacity = this.freezerDoorOpen ? 0.6 : 0;
      pMat.opacity += (targetOpacity - pMat.opacity) * 0.08;

      if (this.freezerDoorOpen) {
        const positions = this.frostParticles.geometry.attributes.position.array as Float32Array;
        for (let i = 1; i < positions.length; i += 3) {
          positions[i] -= 0.01; // falling vapor
          if (positions[i] < 0) positions[i] = 1.6;
        }
        this.frostParticles.geometry.attributes.position.needsUpdate = true;
      }
    }

    // 5. Centrifuge Rotor Spin Physics & Lid Animation
    if (this.centrifugeLidGroup) {
      const targetLidAngle = this.centrifugeLidOpen ? Math.PI * 0.45 : 0;
      this.centrifugeLidGroup.rotation.x += (targetLidAngle - this.centrifugeLidGroup.rotation.x) * 0.1;
    }
    if (this.centrifugeRotor) {
      const targetRpm = this.centrifugeRunning ? this.centrifugeRpmTarget : 0;
      this.centrifugeRpmCurrent += (targetRpm - this.centrifugeRpmCurrent) * 0.05;

      const rotSpeed = (this.centrifugeRpmCurrent / 60) * Math.PI * 2 * delta;
      this.centrifugeRotor.rotation.y += rotSpeed;
    }

    // 6. Automated Liquid Handler Robot Motion
    if (this.robotGantry && this.robotHead) {
      if (this.robotRunning) {
        this.robotTimer += delta * 1.5;
        // Gantry X moves across deck
        this.robotGantry.position.x = Math.sin(this.robotTimer) * 1.2;
        // Head Y moves front/back
        this.robotHead.position.z = Math.cos(this.robotTimer * 0.8) * 0.4;
        // Head Z dips down for aspiration/dispense
        this.robotHead.position.y = -0.1 + Math.abs(Math.sin(this.robotTimer * 2)) * -0.15;
      }
    }

    // 7. Magnetic Stirrer Vortex & Bar Rotation
    if (this.stirrerBarMesh && this.stirrerVortexMesh) {
      this.stirrerBarMesh.rotation.y += 25 * delta;
      this.stirrerVortexMesh.rotation.y += 15 * delta;
    }

    // Render Scene
    this.renderer.render(this.scene, this.camera);
  };

  /* -------------------------------------------------------------
     CLEANUP
  ------------------------------------------------------------- */
  public destroy() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.controls.dispose();
    this.renderer.dispose();
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }
}

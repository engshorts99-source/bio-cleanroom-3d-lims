import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CameraViewZone } from '../types/lims';
import { labAudio } from '../audio/soundEffects';
import { createRoundedBox, createRevolvedChamber, createCapsuleGeometry } from './geomUtils';
import { createBrushedMetalTexture, createSoftMistParticleTexture, createOledTexture } from './textureUtils';
import { SmoothCharacter } from './SmoothCharacter';

export interface InteractiveObjectData {
  id: string;
  name: string;
  zone: CameraViewZone;
  category: 'equipment' | 'cells' | 'reagents';
  description: string;
  position: THREE.Vector3;
}

export class LabScene {
  private container: HTMLElement;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  public controls: OrbitControls;
  private animationFrameId: number | null = null;
  private clock = new THREE.Clock();

  // Avatar & Character controller
  public character: SmoothCharacter;
  public walkMode: boolean = true; // True: 3rd person follow avatar, False: Studio Orbit Camera

  // Interactive targets
  private interactiveObjects: THREE.Object3D[] = [];
  public activeProximityTarget: InteractiveObjectData | null = null;
  public selectedObject: THREE.Object3D | null = null;

  // Camera targets & transitions
  private cameraTargetPos = new THREE.Vector3(0, 3, 7);
  private cameraLookTarget = new THREE.Vector3(0, 1.2, 0);
  private isCameraTransitioning = false;

  // Equipment Animation States
  public bscSashOpen: boolean = false;
  public bscUvOn: boolean = false;
  private bscSashMesh: THREE.Mesh | null = null;
  private bscUvLight: THREE.PointLight | null = null;

  public incubatorDoorOpen: boolean = false;
  private incubatorDoorGroup: THREE.Group | null = null;

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

  // 3D Protocol Guide Pathway Line
  private guidePathLine: THREE.Line | null = null;

  // Callbacks
  public onObjectSelect?: (data: InteractiveObjectData) => void;
  public onProximityChange?: (target: InteractiveObjectData | null) => void;

  constructor(container: HTMLElement) {
    this.container = container;

    // 1. Scene with soft cleanroom background & gentle atmospheric fog
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a101d);
    this.scene.fog = new THREE.FogExp2(0x0a101d, 0.018);

    // 2. Camera
    const width = container.clientWidth;
    const height = container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 100);
    this.camera.position.set(0, 3.2, 8);

    // 3. Renderer with ACES Filmic tone mapping for soft studio rendering
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;
    container.appendChild(this.renderer.domElement);

    // 4. Orbit Controls (configured for smooth damping)
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.02;
    this.controls.minDistance = 1.8;
    this.controls.maxDistance = 28;
    this.controls.target.set(0, 1.2, 0);

    // 5. Stylized Smooth Character Avatar
    this.character = new SmoothCharacter(this.camera);
    this.scene.add(this.character.group);

    // 6. Build Cleanroom & Beveled Equipment
    this.setupSoftLighting();
    this.buildCleanroomArchitecture();
    this.buildBeveledZoneA_CultureAndIncubator();
    this.buildBeveledZoneB_CryoStorage();
    this.buildBeveledZoneC_AerodynamicCentrifuge();
    this.buildBeveledZoneD_AutomatedLiquidHandler();
    this.buildBeveledZoneE_ReagentsAndStirrer();

    // 7. Input Events
    this.setupEvents();

    // 8. Animation Loop
    this.animate();
  }

  /* -------------------------------------------------------------
     SOFT STUDIO LIGHTING (WARM-COOL RIM LIGHTS & SPECULAR)
  ------------------------------------------------------------- */
  private setupSoftLighting() {
    // Ambient light - gentle sky blue
    const ambientLight = new THREE.AmbientLight(0xe0f2fe, 0.9);
    this.scene.add(ambientLight);

    // Soft warm key sunlight through observation cleanroom window
    const keySun = new THREE.DirectionalLight(0xfff7ed, 0.9);
    keySun.position.set(12, 14, 10);
    keySun.castShadow = true;
    keySun.shadow.mapSize.width = 2048;
    keySun.shadow.mapSize.height = 2048;
    keySun.shadow.camera.near = 0.5;
    keySun.shadow.camera.far = 40;
    keySun.shadow.camera.left = -15;
    keySun.shadow.camera.right = 15;
    keySun.shadow.camera.top = 15;
    keySun.shadow.camera.bottom = -15;
    keySun.shadow.bias = -0.0004;
    this.scene.add(keySun);

    // Cool cyan fill light from opposite corner
    const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.4);
    fillLight.position.set(-12, 8, -10);
    this.scene.add(fillLight);

    // Soft ceiling recessed LED troffers
    const ceilingLights = [
      { x: -5, z: -3 }, { x: 5, z: -3 },
      { x: -5, z: 3 }, { x: 5, z: 3 },
      { x: 0, z: 0 }
    ];
    ceilingLights.forEach((pos) => {
      const pLight = new THREE.PointLight(0xf8fafc, 0.8, 14, 1.4);
      pLight.position.set(pos.x, 4.6, pos.z);
      this.scene.add(pLight);

      // Glowing panel mesh with rounded bevel
      const panel = new THREE.Mesh(
        createRoundedBox(2.2, 0.04, 1.2, 0.04),
        new THREE.MeshBasicMaterial({ color: 0xf8fafc })
      );
      panel.position.set(pos.x, 4.95, pos.z);
      this.scene.add(panel);
    });
  }

  /* -------------------------------------------------------------
     CLEANROOM ARCHITECTURE (EPOXY REFLECTIONS & WALL PANELS)
  ------------------------------------------------------------- */
  private buildCleanroomArchitecture() {
    const roomWidth = 24;
    const roomDepth = 18;
    const roomHeight = 5;

    // Floor with glossy soft specular reflections
    const floorGeo = new THREE.PlaneGeometry(roomWidth, roomDepth, 32, 32);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.18,
      metalness: 0.15
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Soft cleanroom zoning line markings
    const lineMat = new THREE.MeshBasicMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.6 });
    const lineL = new THREE.Mesh(new THREE.PlaneGeometry(0.06, roomDepth - 2), lineMat);
    lineL.rotation.x = -Math.PI / 2;
    lineL.position.set(-3.6, 0.005, 0);
    this.scene.add(lineL);

    const lineR = new THREE.Mesh(new THREE.PlaneGeometry(0.06, roomDepth - 2), lineMat);
    lineR.rotation.x = -Math.PI / 2;
    lineR.position.set(3.6, 0.005, 0);
    this.scene.add(lineR);

    // Cleanroom modular wall panels (Satin white with silicone joint grooves)
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.4,
      metalness: 0.05
    });

    const backWall = new THREE.Mesh(new THREE.BoxGeometry(roomWidth, roomHeight, 0.2), wallMat);
    backWall.position.set(0, roomHeight / 2, -roomDepth / 2);
    backWall.receiveShadow = true;
    this.scene.add(backWall);

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, roomHeight, roomDepth), wallMat);
    leftWall.position.set(-roomWidth / 2, roomHeight / 2, 0);
    leftWall.receiveShadow = true;
    this.scene.add(leftWall);

    // Right wall with rounded corner observation viewport
    const rightWall1 = new THREE.Mesh(new THREE.BoxGeometry(0.2, roomHeight, 5), wallMat);
    rightWall1.position.set(roomWidth / 2, roomHeight / 2, -6.5);
    this.scene.add(rightWall1);

    const rightWall2 = new THREE.Mesh(new THREE.BoxGeometry(0.2, roomHeight, 5), wallMat);
    rightWall2.position.set(roomWidth / 2, roomHeight / 2, 6.5);
    this.scene.add(rightWall2);

    const windowGlass = new THREE.Mesh(
      createRoundedBox(0.08, 2.6, 7.8, 0.1),
      new THREE.MeshPhysicalMaterial({
        color: 0xe0f2fe,
        transparent: true,
        opacity: 0.3,
        roughness: 0.05,
        transmission: 0.92
      })
    );
    windowGlass.position.set(roomWidth / 2, 2.5, 0);
    this.scene.add(windowGlass);

    // Ceiling
    const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(roomWidth, roomDepth), new THREE.MeshStandardMaterial({ color: 0xf1f5f9 }));
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = roomHeight;
    this.scene.add(ceiling);
  }

  /* -------------------------------------------------------------
     ZONE A: BIOSAFETY CABINET (BSC) & CO2 INCUBATOR (BEVELED)
  ------------------------------------------------------------- */
  private buildBeveledZoneA_CultureAndIncubator() {
    const zoneGroup = new THREE.Group();
    zoneGroup.position.set(-7.2, 0, -5.8);

    // Stainless Lab Bench (Rounded edges)
    const benchTop = new THREE.Mesh(
      createRoundedBox(6.6, 0.12, 1.8, 0.04),
      new THREE.MeshStandardMaterial({
        color: 0xe2e8f0,
        metalness: 0.88,
        roughness: 0.22,
        roughnessMap: createBrushedMetalTexture()
      })
    );
    benchTop.position.set(0, 1.1, 0);
    benchTop.castShadow = true;
    benchTop.receiveShadow = true;
    zoneGroup.add(benchTop);

    // Bench Legs
    const legMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.9, roughness: 0.3 });
    [-3.0, 3.0, 0].forEach((x) => {
      [-0.75, 0.75].forEach((z) => {
        const leg = new THREE.Mesh(createCapsuleGeometry(0.045, 1.05), legMat);
        leg.position.set(x, 0.55, z);
        leg.castShadow = true;
        zoneGroup.add(leg);
      });
    });

    // 1. Biosafety Cabinet (BSC Class II) with rounded chassis
    const bscGroup = new THREE.Group();
    bscGroup.position.set(-1.6, 1.16, 0);

    const bscBody = new THREE.Mesh(
      createRoundedBox(2.4, 1.8, 1.35, 0.06),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3, metalness: 0.1 })
    );
    bscBody.position.y = 0.9;
    bscBody.castShadow = true;
    bscGroup.add(bscBody);

    // Interior Chamber Cutout with Brushed Steel
    const bscChamber = new THREE.Mesh(
      createRoundedBox(2.1, 1.05, 1.05, 0.03),
      new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.92, roughness: 0.18 })
    );
    bscChamber.position.set(0, 0.72, 0.12);
    bscGroup.add(bscChamber);

    // Sliding Glass Sash with rounded handle
    this.bscSashMesh = new THREE.Mesh(
      createRoundedBox(2.14, 0.82, 0.03, 0.02),
      new THREE.MeshPhysicalMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.35, transmission: 0.92 })
    );
    this.bscSashMesh.position.set(0, 0.8, 0.64);

    const sashHandle = new THREE.Mesh(
      createCapsuleGeometry(0.02, 1.6),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.9, roughness: 0.2 })
    );
    sashHandle.rotation.z = Math.PI / 2;
    sashHandle.position.set(0, -0.38, 0.03);
    this.bscSashMesh.add(sashHandle);
    bscGroup.add(this.bscSashMesh);

    // Soft UV Sterilization Lamp
    const uvTube = new THREE.Mesh(
      createCapsuleGeometry(0.015, 1.8),
      new THREE.MeshBasicMaterial({ color: 0xa855f7 })
    );
    uvTube.rotation.z = Math.PI / 2;
    uvTube.position.set(0, 1.15, 0);
    bscGroup.add(uvTube);

    this.bscUvLight = new THREE.PointLight(0xa855f7, 0, 3.5, 2);
    this.bscUvLight.position.set(0, 0.9, 0);
    bscGroup.add(this.bscUvLight);

    // Media bottle inside BSC
    const mediaBottle = this.createCurvedMediaBottle(0xef4444, 'DMEM High Glucose');
    mediaBottle.position.set(-0.6, 0.22, 0.1);
    bscGroup.add(mediaBottle);

    this.registerInteractive(bscBody, {
      id: 'EQP-BSC-01',
      name: 'Class II Biosafety Cabinet',
      zone: 'bsc',
      category: 'equipment',
      description: '클린룸 무균 배양 작업대. [F] 키로 새시 도어 개폐 및 UV 살균 램프 토글.',
      position: new THREE.Vector3(-8.8, 1.2, -5.8)
    });

    zoneGroup.add(bscGroup);

    // 2. CO2 Incubator with rounded corners & OLED Panel
    const incubatorGroup = new THREE.Group();
    incubatorGroup.position.set(1.8, 1.16, 0);

    const incBody = new THREE.Mesh(
      createRoundedBox(1.4, 1.5, 1.1, 0.06),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.75, roughness: 0.25 })
    );
    incBody.position.y = 0.75;
    incBody.castShadow = true;
    incubatorGroup.add(incBody);

    // Heavy Insulated Door with Beveled Pivot
    this.incubatorDoorGroup = new THREE.Group();
    this.incubatorDoorGroup.position.set(-0.7, 0.75, 0.55);

    const outerDoor = new THREE.Mesh(
      createRoundedBox(1.38, 1.48, 0.08, 0.04),
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.25 })
    );
    outerDoor.position.set(0.69, 0, 0);
    outerDoor.castShadow = true;
    this.incubatorDoorGroup.add(outerDoor);

    // Curved Ergonomic Handle
    const incHandle = new THREE.Mesh(
      createCapsuleGeometry(0.02, 0.45),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.95, roughness: 0.1 })
    );
    incHandle.position.set(1.3, 0, 0.06);
    this.incubatorDoorGroup.add(incHandle);

    // OLED Screen on door (37.0°C / 5.0% CO2)
    const oledScreen = new THREE.Mesh(
      new THREE.PlaneGeometry(0.5, 0.25),
      new THREE.MeshBasicMaterial({ map: createOledTexture('CO2 INCUBATOR', '37.0°C', '5.0% CO2', '#10b981') })
    );
    oledScreen.position.set(0.69, 0.38, 0.045);
    this.incubatorDoorGroup.add(oledScreen);

    incubatorGroup.add(this.incubatorDoorGroup);

    this.registerInteractive(incBody, {
      id: 'EQP-INC-01',
      name: 'Forma Steri-Cycle CO2 Incubator',
      zone: 'incubator',
      category: 'equipment',
      description: '포유류 세포 배양기. [F] 키로 멸균 도어 개폐 및 트레이 확인.',
      position: new THREE.Vector3(-5.4, 1.2, -5.8)
    });

    zoneGroup.add(incubatorGroup);
    this.scene.add(zoneGroup);
  }

  /* -------------------------------------------------------------
     ZONE B: CRYO STORAGE (-80°C ULTRA-LOW FREEZER & LN2)
  ------------------------------------------------------------- */
  private buildBeveledZoneB_CryoStorage() {
    const cryoGroup = new THREE.Group();
    cryoGroup.position.set(7.5, 0, -5.8);

    // 1. -80°C Ultra-Low Freezer with rounded edges
    const freezerGroup = new THREE.Group();
    freezerGroup.position.set(-1.2, 0, 0);

    const frzBody = new THREE.Mesh(
      createRoundedBox(1.6, 2.3, 1.4, 0.08),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.65, roughness: 0.28 })
    );
    frzBody.position.y = 1.15;
    frzBody.castShadow = true;
    freezerGroup.add(frzBody);

    // Door with Left Pivot & Gasket
    this.freezerDoorGroup = new THREE.Group();
    this.freezerDoorGroup.position.set(-0.8, 1.15, 0.7);

    const frzDoor = new THREE.Mesh(
      createRoundedBox(1.58, 2.22, 0.14, 0.05),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.2 })
    );
    frzDoor.position.set(0.79, 0, 0);
    frzDoor.castShadow = true;
    this.freezerDoorGroup.add(frzDoor);

    // Glowing OLED Screen (-80.2°C)
    const frzScreen = new THREE.Mesh(
      new THREE.PlaneGeometry(0.55, 0.28),
      new THREE.MeshBasicMaterial({ map: createOledTexture('ULTRA-LOW CRYO', '-80.2°C', 'OPTIMAL / LOCKED', '#38bdf8') })
    );
    frzScreen.position.set(0.79, 0.65, 0.075);
    this.freezerDoorGroup.add(frzScreen);

    // Ergonomic Latch Handle
    const latch = new THREE.Mesh(
      createCapsuleGeometry(0.04, 0.45),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.9, roughness: 0.15 })
    );
    latch.position.set(1.48, 0, 0.08);
    this.freezerDoorGroup.add(latch);

    freezerGroup.add(this.freezerDoorGroup);

    // Soft Gaussian Volumetric Frost Mist (Billowing out smoothly)
    const particleCount = 240;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 1.3;
      positions[i + 1] = 0.2 + Math.random() * 1.5;
      positions[i + 2] = 0.6 + Math.random() * 0.9;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xdbeafe,
      size: 0.35, // Soft cloud size
      map: createSoftMistParticleTexture(),
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    this.frostParticles = new THREE.Points(particleGeo, particleMat);
    freezerGroup.add(this.frostParticles);

    this.registerInteractive(frzBody, {
      id: 'EQP-FRZ-01',
      name: '-80°C Ultra-Low Freezer',
      zone: 'freezer',
      category: 'cells',
      description: '세포주/플라스미드 동결 보존 냉동고. [F] 키로 도어 개방 및 냉기 연무 방출.',
      position: new THREE.Vector3(6.3, 1.2, -5.8)
    });

    cryoGroup.add(freezerGroup);
    this.scene.add(cryoGroup);
  }

  /* -------------------------------------------------------------
     ZONE C: AERODYNAMIC CURVED CENTRIFUGE (EPPENDORF MASTER)
  ------------------------------------------------------------- */
  private buildBeveledZoneC_AerodynamicCentrifuge() {
    const zoneGroup = new THREE.Group();
    zoneGroup.position.set(-6, 0, 2.4);

    // Stainless Lab Bench with rounded edges
    const bench = new THREE.Mesh(
      createRoundedBox(5.2, 0.12, 1.7, 0.04),
      new THREE.MeshStandardMaterial({ color: 0xf1f5f9, metalness: 0.85, roughness: 0.25 })
    );
    bench.position.y = 1.1;
    bench.castShadow = true;
    bench.receiveShadow = true;
    zoneGroup.add(bench);

    // 1. Aerodynamic Curved Centrifuge (Filleted housing & Lathe chamber bowl)
    const centGroup = new THREE.Group();
    centGroup.position.set(-1.2, 1.16, 0);

    // Sleek White Satin Body with Rounded Fillets
    const centBody = new THREE.Mesh(
      createRoundedBox(1.15, 0.62, 1.15, 0.08, 6),
      new THREE.MeshStandardMaterial({
        color: 0xf8fafc,
        roughness: 0.28,
        metalness: 0.15
      })
    );
    centBody.position.y = 0.31;
    centBody.castShadow = true;
    centGroup.add(centBody);

    // Revolved Chamber Bowl using LatheGeometry
    const rotorChamber = new THREE.Mesh(
      createRevolvedChamber(0.44, 0.40, 0.26, 36),
      new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        metalness: 0.95,
        roughness: 0.18,
        roughnessMap: createBrushedMetalTexture()
      })
    );
    rotorChamber.position.y = 0.42;
    centGroup.add(rotorChamber);

    // Rotor with 24 angled 1.5mL tubes
    this.centrifugeRotor = new THREE.Group();
    this.centrifugeRotor.position.y = 0.52;

    const rotorDisc = new THREE.Mesh(
      new THREE.CylinderGeometry(0.38, 0.38, 0.1, 28),
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9, roughness: 0.2 })
    );
    this.centrifugeRotor.add(rotorDisc);

    // Microcentrifuge tubes with soft translucency
    const tubeGeo = createCapsuleGeometry(0.016, 0.07, 4, 8);
    const tubeMat = new THREE.MeshPhysicalMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.85, transmission: 0.6 });
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2;
      const tube = new THREE.Mesh(tubeGeo, tubeMat);
      tube.position.set(Math.cos(angle) * 0.3, 0.04, Math.sin(angle) * 0.3);
      tube.rotation.z = Math.cos(angle) * 0.55;
      tube.rotation.x = Math.sin(angle) * 0.55;
      this.centrifugeRotor.add(tube);
    }
    centGroup.add(this.centrifugeRotor);

    // Aerodynamic Hinged Lid with Beveled Handle
    this.centrifugeLidGroup = new THREE.Group();
    this.centrifugeLidGroup.position.set(0, 0.62, -0.52);

    const lid = new THREE.Mesh(
      createRoundedBox(1.12, 0.1, 1.1, 0.06),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.7, roughness: 0.22 })
    );
    lid.position.set(0, 0.05, 0.52);
    lid.castShadow = true;
    this.centrifugeLidGroup.add(lid);
    centGroup.add(this.centrifugeLidGroup);

    // Front OLED Display & Rotary Dial
    const centScreen = new THREE.Mesh(
      new THREE.PlaneGeometry(0.48, 0.22),
      new THREE.MeshBasicMaterial({ map: createOledTexture('EPPENDORF 5424R', '13,500 RPM', '4.0°C / 04:00', '#38bdf8') })
    );
    centScreen.position.set(0, 0.34, 0.58);
    centGroup.add(centScreen);

    // Rotary Dial Knob
    const dialKnob = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045, 0.045, 0.03, 24),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.9, roughness: 0.2 })
    );
    dialKnob.rotation.x = Math.PI / 2;
    dialKnob.position.set(0.38, 0.34, 0.59);
    centGroup.add(dialKnob);

    this.registerInteractive(centBody, {
      id: 'EQP-CEN-01',
      name: 'High-Speed Microcentrifuge 5424 R',
      zone: 'centrifuge',
      category: 'equipment',
      description: '초고속 원심분리기. [F] 키로 뚜껑 개폐 및 13,500 RPM 회전 가속.',
      position: new THREE.Vector3(-7.2, 1.2, 2.4)
    });

    zoneGroup.add(centGroup);
    this.scene.add(zoneGroup);
  }

  /* -------------------------------------------------------------
     ZONE D: AUTOMATED LIQUID HANDLER ROBOT
  ------------------------------------------------------------- */
  private buildBeveledZoneD_AutomatedLiquidHandler() {
    const robotWorkstation = new THREE.Group();
    robotWorkstation.position.set(5.5, 0, 2.5);

    const bench = new THREE.Mesh(
      createRoundedBox(4.8, 0.12, 2.0, 0.05),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.2 })
    );
    bench.position.y = 1.1;
    bench.castShadow = true;
    bench.receiveShadow = true;
    robotWorkstation.add(bench);

    // Transparent Shield Enclosure with Rounded Bevel
    const glassEnclosure = new THREE.Mesh(
      createRoundedBox(4.6, 2.0, 1.8, 0.06),
      new THREE.MeshPhysicalMaterial({
        color: 0x93c5fd,
        transparent: true,
        opacity: 0.22,
        roughness: 0.05,
        transmission: 0.94
      })
    );
    glassEnclosure.position.y = 2.15;
    robotWorkstation.add(glassEnclosure);

    // Gantry Frame
    this.robotGantry = new THREE.Group();
    this.robotGantry.position.set(-0.5, 1.8, 0);

    const gantryBeam = new THREE.Mesh(
      createRoundedBox(0.18, 0.15, 1.6, 0.02),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.9, roughness: 0.15 })
    );
    this.robotGantry.add(gantryBeam);

    // Pipetting Head
    this.robotHead = new THREE.Group();
    this.robotHead.position.set(0, -0.1, 0);

    const headBody = new THREE.Mesh(
      createRoundedBox(0.26, 0.45, 0.36, 0.03),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.2 })
    );
    this.robotHead.add(headBody);

    // 8-channel Pipette Tips
    const tipMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.1 });
    for (let n = -3.5; n <= 3.5; n++) {
      const tip = new THREE.Mesh(createCapsuleGeometry(0.007, 0.12), tipMat);
      tip.position.set(0, -0.28, n * 0.036);
      this.robotHead.add(tip);
    }
    this.robotGantry.add(this.robotHead);
    robotWorkstation.add(this.robotGantry);

    this.registerInteractive(glassEnclosure, {
      id: 'EQP-ROB-01',
      name: 'Biomek i5 Automated Liquid Handler',
      zone: 'liquid_handler',
      category: 'equipment',
      description: '고속 자동화 분주 로봇. [F] 키로 96-well 플레이트 분주 시뮬레이션.',
      position: new THREE.Vector3(5.5, 1.2, 2.5)
    });

    this.scene.add(robotWorkstation);
  }

  /* -------------------------------------------------------------
     ZONE E: REAGENTS & MAGNETIC STIRRER
  ------------------------------------------------------------- */
  private buildBeveledZoneE_ReagentsAndStirrer() {
    const zoneGroup = new THREE.Group();
    zoneGroup.position.set(0, 0, -6.5);

    // Stainless Reagent Cabinet with Rounded Fillets
    const cabBody = new THREE.Mesh(
      createRoundedBox(4.2, 2.5, 0.8, 0.06),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.88, roughness: 0.22 })
    );
    cabBody.position.set(0, 1.25, 0);
    cabBody.castShadow = true;
    zoneGroup.add(cabBody);

    // Transparent Glass Sliding Panels
    const glassDoor = new THREE.Mesh(
      createRoundedBox(2.0, 2.2, 0.03, 0.02),
      new THREE.MeshPhysicalMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.35, transmission: 0.92 })
    );
    glassDoor.position.set(-1.0, 1.25, 0.42);
    zoneGroup.add(glassDoor);

    this.registerInteractive(cabBody, {
      id: 'RGT-CAB-01',
      name: 'Clean Media & Reagents Cabinet',
      zone: 'reagents_cabinet',
      category: 'reagents',
      description: '무균 배지(DMEM, FBS), 버퍼 및 효소 보관장. [F] 키로 시약 재고 확인.',
      position: new THREE.Vector3(0, 1.2, -6.5)
    });

    // Center Island with Magnetic Stirrer
    const island = new THREE.Group();
    island.position.set(0, 0, 4.2);

    const islandTable = new THREE.Mesh(
      createRoundedBox(3.2, 0.12, 1.7, 0.04),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7, roughness: 0.3 })
    );
    islandTable.position.y = 1.1;
    islandTable.castShadow = true;
    islandTable.receiveShadow = true;
    island.add(islandTable);

    // Erlenmeyer Flask with Liquid Vortex
    const flaskGlass = new THREE.Mesh(
      new THREE.ConeGeometry(0.18, 0.35, 24, 1, true),
      new THREE.MeshPhysicalMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.4, transmission: 0.92 })
    );
    flaskGlass.position.set(0, 1.45, 0);
    island.add(flaskGlass);

    this.stirrerVortexMesh = new THREE.Mesh(
      new THREE.ConeGeometry(0.16, 0.22, 24),
      new THREE.MeshStandardMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.85 })
    );
    this.stirrerVortexMesh.position.set(0, 1.38, 0);
    island.add(this.stirrerVortexMesh);

    this.stirrerBarMesh = new THREE.Mesh(
      createCapsuleGeometry(0.015, 0.06),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1 })
    );
    this.stirrerBarMesh.rotation.z = Math.PI / 2;
    this.stirrerBarMesh.position.set(0, 1.28, 0);
    island.add(this.stirrerBarMesh);

    zoneGroup.add(island);
    this.scene.add(zoneGroup);
  }

  private createCurvedMediaBottle(colorHex: number, _labelText?: string): THREE.Group {
    const group = new THREE.Group();

    const body = new THREE.Mesh(
      createRoundedBox(0.16, 0.3, 0.16, 0.03),
      new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.4, transmission: 0.9 })
    );
    group.add(body);

    const liquid = new THREE.Mesh(
      createRoundedBox(0.14, 0.24, 0.14, 0.02),
      new THREE.MeshStandardMaterial({ color: colorHex, transparent: true, opacity: 0.85 })
    );
    liquid.position.y = -0.02;
    group.add(liquid);

    const cap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 0.06, 16),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.5, roughness: 0.3 })
    );
    cap.position.y = 0.18;
    group.add(cap);

    return group;
  }

  /* -------------------------------------------------------------
     3D PROTOCOL GUIDE PATHWAY
  ------------------------------------------------------------- */
  public setProtocolGuideTarget(targetPos: THREE.Vector3 | null) {
    if (this.guidePathLine) {
      this.scene.remove(this.guidePathLine);
      this.guidePathLine = null;
    }

    if (!targetPos) return;

    // Create a smooth glowing cubic spline path from character to target
    const start = this.character.position.clone();
    start.y = 0.04;
    const end = targetPos.clone();
    end.y = 0.04;

    const mid = new THREE.Vector3(
      (start.x + end.x) / 2,
      0.04,
      (start.z + end.z) / 2
    );

    const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
    const points = curve.getPoints(30);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      linewidth: 3,
      transparent: true,
      opacity: 0.8
    });

    this.guidePathLine = new THREE.Line(geometry, material);
    this.scene.add(this.guidePathLine);
  }

  /* -------------------------------------------------------------
     INTERACTIVE REGISTRATION & EVENTS
  ------------------------------------------------------------- */
  private registerInteractive(mesh: THREE.Object3D, data: InteractiveObjectData) {
    mesh.userData = data;
    this.interactiveObjects.push(mesh);
  }

  private setupEvents() {
    const onKeyDown = (e: KeyboardEvent) => {
      // WASD / Arrow keys
      if (e.code === 'KeyW' || e.code === 'ArrowUp') this.character.keys.forward = true;
      if (e.code === 'KeyS' || e.code === 'ArrowDown') this.character.keys.backward = true;
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') this.character.keys.left = true;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') this.character.keys.right = true;
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') this.character.keys.sprint = true;

      // Interaction Key [F] or [E]
      if (e.code === 'KeyF' || e.code === 'KeyE') {
        if (this.activeProximityTarget) {
          this.triggerActionForTarget(this.activeProximityTarget);
        }
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'KeyW' || e.code === 'ArrowUp') this.character.keys.forward = false;
      if (e.code === 'KeyS' || e.code === 'ArrowDown') this.character.keys.backward = false;
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') this.character.keys.left = false;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') this.character.keys.right = false;
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') this.character.keys.sprint = false;
    };

    const onResize = () => {
      if (!this.container) return;
      const w = this.container.clientWidth;
      const h = this.container.clientHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('resize', onResize);
  }

  public triggerActionForTarget(target: InteractiveObjectData) {
    labAudio.playClick();
    if (target.id === 'EQP-BSC-01') {
      this.toggleBscSash();
    } else if (target.id === 'EQP-INC-01') {
      this.toggleIncubatorDoor();
    } else if (target.id === 'EQP-FRZ-01') {
      this.toggleFreezerDoor();
    } else if (target.id === 'EQP-CEN-01') {
      if (this.centrifugeRunning) {
        this.toggleCentrifugeLid();
      } else {
        this.triggerCentrifugeRun(13500, 5);
      }
    } else if (target.id === 'EQP-ROB-01') {
      this.triggerRobotProtocol();
    }

    if (this.onObjectSelect) {
      this.onObjectSelect(target);
    }
  }

  /* -------------------------------------------------------------
     EQUIPMENT ACTIONS & DAMPED TWEEN ANIMATIONS
  ------------------------------------------------------------- */
  public toggleBscSash() {
    this.bscSashOpen = !this.bscSashOpen;
    labAudio.playDoor(this.bscSashOpen);
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
    if (this.centrifugeRunning) return;
    this.centrifugeLidOpen = !this.centrifugeLidOpen;
    labAudio.playDoor(this.centrifugeLidOpen);
  }

  public triggerCentrifugeRun(rpm: number = 13500, durationSec: number = 5) {
    if (this.centrifugeRunning) return;
    this.centrifugeLidOpen = false;
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
    setTimeout(() => labAudio.playPipetteAspirate(), 1200);
    setTimeout(() => labAudio.playPipetteAspirate(), 3200);
    setTimeout(() => {
      this.robotRunning = false;
      labAudio.playRobotBeep();
    }, 5500);
  }

  /* -------------------------------------------------------------
     CAMERA VIEW PRESETS
  ------------------------------------------------------------- */
  public setCameraView(zone: CameraViewZone) {
    this.isCameraTransitioning = true;
    this.walkMode = (zone === 'overview');
    labAudio.playClick();

    switch (zone) {
      case 'overview':
        this.cameraTargetPos.set(0, 3.2, 7.5);
        this.cameraLookTarget.set(0, 1.2, 0);
        break;
      case 'bsc':
        this.cameraTargetPos.set(-8.8, 2.2, -4.2);
        this.cameraLookTarget.set(-8.8, 1.8, -5.8);
        break;
      case 'incubator':
        this.cameraTargetPos.set(-5.4, 2.0, -4.4);
        this.cameraLookTarget.set(-5.4, 1.8, -5.8);
        break;
      case 'freezer':
        this.cameraTargetPos.set(6.3, 2.1, -4.2);
        this.cameraLookTarget.set(6.3, 1.8, -5.8);
        break;
      case 'centrifuge':
        this.cameraTargetPos.set(-7.2, 2.3, 3.5);
        this.cameraLookTarget.set(-7.2, 1.5, 2.4);
        break;
      case 'liquid_handler':
        this.cameraTargetPos.set(5.5, 3.2, 4.6);
        this.cameraLookTarget.set(5.5, 1.8, 2.5);
        break;
      case 'reagents_cabinet':
        this.cameraTargetPos.set(0, 2.2, -4.5);
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

    // 1. Update Character Movement & Physics
    this.character.update(delta, this.walkMode);

    // 2. Proximity Detection (Distance to nearest interactive equipment)
    let closestTarget: InteractiveObjectData | null = null;
    let closestDist = 2.8; // 2.8m interaction radius

    for (const obj of this.interactiveObjects) {
      const data = obj.userData as InteractiveObjectData;
      if (data && data.position) {
        const d = this.character.position.distanceTo(data.position);
        if (d < closestDist) {
          closestDist = d;
          closestTarget = data;
        }
      }
    }

    if (closestTarget !== this.activeProximityTarget) {
      this.activeProximityTarget = closestTarget;
      if (this.onProximityChange) {
        this.onProximityChange(closestTarget);
      }
    }

    // 3. Camera Smooth Glide Interpolation
    if (this.isCameraTransitioning) {
      this.camera.position.lerp(this.cameraTargetPos, delta * 4);
      this.controls.target.lerp(this.cameraLookTarget, delta * 4);
      if (this.camera.position.distanceTo(this.cameraTargetPos) < 0.05) {
        this.isCameraTransitioning = false;
      }
    } else if (this.walkMode) {
      // In walk mode, controls target softly tracks character
      const targetLook = this.character.position.clone().add(new THREE.Vector3(0, 1.3, 0));
      this.controls.target.lerp(targetLook, delta * 6);
    }
    this.controls.update();

    // 4. Equipment Damped Motion
    if (this.bscSashMesh) {
      const targetY = this.bscSashOpen ? 1.32 : 0.8;
      this.bscSashMesh.position.y += (targetY - this.bscSashMesh.position.y) * delta * 8;
    }

    if (this.incubatorDoorGroup) {
      const targetAngle = this.incubatorDoorOpen ? -Math.PI * 0.55 : 0;
      this.incubatorDoorGroup.rotation.y += (targetAngle - this.incubatorDoorGroup.rotation.y) * delta * 6;
    }

    if (this.freezerDoorGroup) {
      const targetAngle = this.freezerDoorOpen ? -Math.PI * 0.55 : 0;
      this.freezerDoorGroup.rotation.y += (targetAngle - this.freezerDoorGroup.rotation.y) * delta * 6;
    }

    // Frost mist particle flow
    if (this.frostParticles) {
      const pMat = this.frostParticles.material as THREE.PointsMaterial;
      const targetOpacity = this.freezerDoorOpen ? 0.7 : 0;
      pMat.opacity += (targetOpacity - pMat.opacity) * delta * 4;

      if (this.freezerDoorOpen) {
        const positions = this.frostParticles.geometry.attributes.position.array as Float32Array;
        for (let i = 1; i < positions.length; i += 3) {
          positions[i] -= 0.015; // Soft falling cloud
          if (positions[i] < 0) positions[i] = 1.6;
        }
        this.frostParticles.geometry.attributes.position.needsUpdate = true;
      }
    }

    // Centrifuge rotor spin & lid
    if (this.centrifugeLidGroup) {
      const targetLidAngle = this.centrifugeLidOpen ? Math.PI * 0.45 : 0;
      this.centrifugeLidGroup.rotation.x += (targetLidAngle - this.centrifugeLidGroup.rotation.x) * delta * 8;
    }

    if (this.centrifugeRotor) {
      const targetRpm = this.centrifugeRunning ? this.centrifugeRpmTarget : 0;
      this.centrifugeRpmCurrent += (targetRpm - this.centrifugeRpmCurrent) * delta * 4;
      const rotSpeed = (this.centrifugeRpmCurrent / 60) * Math.PI * 2 * delta;
      this.centrifugeRotor.rotation.y += rotSpeed;
    }

    // Liquid handler motion
    if (this.robotGantry && this.robotHead && this.robotRunning) {
      this.robotTimer += delta * 1.5;
      this.robotGantry.position.x = Math.sin(this.robotTimer) * 1.2;
      this.robotHead.position.z = Math.cos(this.robotTimer * 0.8) * 0.4;
      this.robotHead.position.y = -0.1 + Math.abs(Math.sin(this.robotTimer * 2)) * -0.15;
    }

    // Magnetic stirrer vortex
    if (this.stirrerBarMesh && this.stirrerVortexMesh) {
      this.stirrerBarMesh.rotation.y += 25 * delta;
      this.stirrerVortexMesh.rotation.y += 15 * delta;
    }

    this.renderer.render(this.scene, this.camera);
  };

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

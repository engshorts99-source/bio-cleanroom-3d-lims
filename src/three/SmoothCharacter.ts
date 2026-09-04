import * as THREE from 'three';
import { createCapsuleGeometry } from './geomUtils';

export class SmoothCharacter {
  public group: THREE.Group;
  private camera: THREE.PerspectiveCamera;

  // Body parts for walking animation
  private leftLeg: THREE.Group;
  private rightLeg: THREE.Group;
  private leftArm: THREE.Group;
  private rightArm: THREE.Group;
  private headGroup: THREE.Group;

  // Movement & Physics
  public position: THREE.Vector3 = new THREE.Vector3(0, 0, 4);
  private velocity: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  private targetRotation: number = 0;
  private currentRotation: number = 0;
  private walkTime: number = 0;

  // Input states
  public keys = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    sprint: false
  };

  public isMoving: boolean = false;
  public enabled: boolean = true;

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
    this.group = new THREE.Group();
    this.group.position.copy(this.position);

    // 1. Materials (Satin Cleanroom White + Visor Glass + Cyan Accents)
    const suitMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.35,
      metalness: 0.1
    });

    const bootGloveMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.4,
      metalness: 0.3
    });

    const visorMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.75,
      roughness: 0.05,
      metalness: 0.2,
      transmission: 0.7,
      emissive: 0x0284c7,
      emissiveIntensity: 0.25
    });

    // 2. Torso (Slim tapered cleanroom suit)
    const torso = new THREE.Mesh(
      createCapsuleGeometry(0.24, 0.48, 8, 16),
      suitMat
    );
    torso.position.y = 1.05;
    torso.castShadow = true;
    this.group.add(torso);

    // Cyan glowing belt/seamline
    const belt = new THREE.Mesh(
      new THREE.CylinderGeometry(0.25, 0.25, 0.03, 24),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    );
    belt.position.y = 0.88;
    this.group.add(belt);

    // 3. Backpack Air Respirator (Cleanroom HEPA filtration pack)
    const backpack = new THREE.Mesh(
      createCapsuleGeometry(0.14, 0.3, 6, 12),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 })
    );
    backpack.position.set(0, 1.1, -0.24);
    backpack.castShadow = true;
    this.group.add(backpack);

    // 4. Head & Aerodynamic Visor
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 1.5, 0);

    const helmet = new THREE.Mesh(
      new THREE.SphereGeometry(0.21, 24, 24),
      suitMat
    );
    helmet.castShadow = true;
    this.headGroup.add(helmet);

    // Curved Visor on face
    const visor = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 20, 20, 0, Math.PI, 0, Math.PI * 0.55),
      visorMat
    );
    visor.rotation.x = Math.PI / 2;
    visor.position.set(0, 0.02, 0.08);
    this.headGroup.add(visor);

    this.group.add(this.headGroup);

    // 5. Left & Right Arms (Pivoting at shoulders)
    this.leftArm = new THREE.Group();
    this.leftArm.position.set(-0.32, 1.25, 0);
    const lArmMesh = new THREE.Mesh(createCapsuleGeometry(0.065, 0.38, 6, 12), suitMat);
    lArmMesh.position.y = -0.2;
    const lGlove = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 12), bootGloveMat);
    lGlove.position.y = -0.4;
    this.leftArm.add(lArmMesh, lGlove);
    this.group.add(this.leftArm);

    this.rightArm = new THREE.Group();
    this.rightArm.position.set(0.32, 1.25, 0);
    const rArmMesh = new THREE.Mesh(createCapsuleGeometry(0.065, 0.38, 6, 12), suitMat);
    rArmMesh.position.y = -0.2;
    const rGlove = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 12), bootGloveMat);
    rGlove.position.y = -0.4;
    this.rightArm.add(rArmMesh, rGlove);
    this.group.add(this.rightArm);

    // 6. Left & Right Legs (Pivoting at hips)
    this.leftLeg = new THREE.Group();
    this.leftLeg.position.set(-0.13, 0.8, 0);
    const lLegMesh = new THREE.Mesh(createCapsuleGeometry(0.08, 0.5, 6, 12), suitMat);
    lLegMesh.position.y = -0.28;
    const lBoot = new THREE.Mesh(createCapsuleGeometry(0.085, 0.16, 6, 12), bootGloveMat);
    lBoot.rotation.x = Math.PI / 2;
    lBoot.position.set(0, -0.6, 0.05);
    this.leftLeg.add(lLegMesh, lBoot);
    this.group.add(this.leftLeg);

    this.rightLeg = new THREE.Group();
    this.rightLeg.position.set(0.13, 0.8, 0);
    const rLegMesh = new THREE.Mesh(createCapsuleGeometry(0.08, 0.5, 6, 12), suitMat);
    rLegMesh.position.y = -0.28;
    const rBoot = new THREE.Mesh(createCapsuleGeometry(0.085, 0.16, 6, 12), bootGloveMat);
    rBoot.rotation.x = Math.PI / 2;
    rBoot.position.set(0, -0.6, 0.05);
    this.rightLeg.add(rLegMesh, rBoot);
    this.group.add(this.rightLeg);

    // 7. Soft Shadow Disc on Floor
    const shadowGeo = new THREE.PlaneGeometry(0.75, 0.75);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.35,
      map: this.createSoftShadowTexture()
    });
    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.01;
    this.group.add(shadow);
  }

  private createSoftShadowTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(64, 64, 10, 64, 64, 64);
      grad.addColorStop(0, 'rgba(0,0,0,1)');
      grad.addColorStop(0.5, 'rgba(0,0,0,0.5)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 128, 128);
    }
    return new THREE.CanvasTexture(canvas);
  }

  public update(delta: number, followCamera: boolean = true) {
    if (!this.enabled) return;

    // Calculate move direction relative to camera angle
    const moveDir = new THREE.Vector3();
    if (this.keys.forward) moveDir.z -= 1;
    if (this.keys.backward) moveDir.z += 1;
    if (this.keys.left) moveDir.x -= 1;
    if (this.keys.right) moveDir.x += 1;

    this.isMoving = moveDir.lengthSq() > 0.01;

    if (this.isMoving) {
      moveDir.normalize();

      // Transform direction relative to camera yaw
      const camEuler = new THREE.Euler(0, this.camera.rotation.y, 0, 'YXZ');
      moveDir.applyEuler(camEuler);
      moveDir.y = 0;
      moveDir.normalize();

      // Acceleration with sprint
      const speed = this.keys.sprint ? 5.5 : 3.2;
      const targetVel = moveDir.clone().multiplyScalar(speed);
      this.velocity.lerp(targetVel, delta * 12);

      // Smooth turn to movement direction
      this.targetRotation = Math.atan2(this.velocity.x, this.velocity.z);
      // Angular interpolation
      const diff = this.targetRotation - this.currentRotation;
      const wrappedDiff = Math.atan2(Math.sin(diff), Math.cos(diff));
      this.currentRotation += wrappedDiff * Math.min(1, delta * 14);
      this.group.rotation.y = this.currentRotation;

      // Limb walking motion (fluid sine-wave cycle)
      const walkFreq = this.keys.sprint ? 14 : 9;
      this.walkTime += delta * walkFreq;
      const swing = Math.sin(this.walkTime) * 0.65;

      this.leftLeg.rotation.x = swing;
      this.rightLeg.rotation.x = -swing;
      this.leftArm.rotation.x = -swing * 0.7;
      this.rightArm.rotation.x = swing * 0.7;
      this.headGroup.position.y = 1.5 + Math.abs(Math.sin(this.walkTime * 2)) * 0.03;
    } else {
      // Gentle deceleration to stop
      this.velocity.lerp(new THREE.Vector3(0, 0, 0), delta * 10);
      this.leftLeg.rotation.x = THREE.MathUtils.lerp(this.leftLeg.rotation.x, 0, delta * 10);
      this.rightLeg.rotation.x = THREE.MathUtils.lerp(this.rightLeg.rotation.x, 0, delta * 10);
      this.leftArm.rotation.x = THREE.MathUtils.lerp(this.leftArm.rotation.x, 0, delta * 10);
      this.rightArm.rotation.x = THREE.MathUtils.lerp(this.rightArm.rotation.x, 0, delta * 10);
      this.headGroup.position.y = THREE.MathUtils.lerp(this.headGroup.position.y, 1.5, delta * 10);
    }

    // Apply movement with room bounds collision check
    this.position.addScaledVector(this.velocity, delta);

    // Cleanroom boundaries (-11 to +11 X, -8 to +8 Z)
    this.position.x = Math.max(-10.5, Math.min(10.5, this.position.x));
    this.position.z = Math.max(-7.5, Math.min(7.5, this.position.z));
    this.group.position.copy(this.position);

    // Smooth follow camera in free walk mode
    if (followCamera && this.isMoving) {
      const camOffset = new THREE.Vector3(0, 2.4, 4.2);
      camOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.currentRotation);
      const desiredCamPos = this.position.clone().add(camOffset);
      this.camera.position.lerp(desiredCamPos, delta * 4);
    }
  }
}

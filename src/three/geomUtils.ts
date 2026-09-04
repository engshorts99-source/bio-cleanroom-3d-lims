import * as THREE from 'three';

/**
 * Creates a smoothly beveled and rounded box geometry using ExtrudeGeometry with fillets.
 * Prevents harsh polygonal edges on cleanroom instruments and furniture.
 */
export function createRoundedBox(
  width: number,
  height: number,
  depth: number,
  radius: number = 0.04,
  smoothness: number = 5
): THREE.BufferGeometry {
  const w = width / 2 - radius;
  const h = height / 2 - radius;
  const d = depth - radius * 2;

  const shape = new THREE.Shape();
  shape.moveTo(-w, -h + radius);
  shape.lineTo(-w, h - radius);
  shape.absarc(-w + radius, h - radius, radius, Math.PI, Math.PI / 2, true);
  shape.lineTo(w - radius, h);
  shape.absarc(w - radius, h - radius, radius, Math.PI / 2, 0, true);
  shape.lineTo(w, -h + radius);
  shape.absarc(w - radius, -h + radius, radius, 0, -Math.PI / 2, true);
  shape.lineTo(-w + radius, -h);
  shape.absarc(-w + radius, -h + radius, radius, -Math.PI / 2, Math.PI, true);

  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    depth: d > 0 ? d : 0.01,
    bevelEnabled: true,
    bevelSegments: smoothness,
    steps: 1,
    bevelSize: radius,
    bevelThickness: radius,
    curveSegments: smoothness * 2
  };

  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geometry.center();
  geometry.computeVertexNormals();
  return geometry;
}

/**
 * Creates a smooth aerodynamic revolved bowl geometry (used for centrifuge rotor chamber).
 */
export function createRevolvedChamber(
  outerRadius: number,
  innerRadius: number,
  depth: number,
  segments: number = 32
): THREE.BufferGeometry {
  const points: THREE.Vector2[] = [];
  const rBevel = 0.03;

  // Outer edge -> Rim -> Inner cavity -> Bottom center
  points.push(new THREE.Vector2(outerRadius, 0));
  points.push(new THREE.Vector2(outerRadius, depth));
  points.push(new THREE.Vector2(innerRadius + rBevel, depth));
  points.push(new THREE.Vector2(innerRadius, depth - rBevel));
  points.push(new THREE.Vector2(innerRadius * 0.7, rBevel));
  points.push(new THREE.Vector2(0, 0));

  const geometry = new THREE.LatheGeometry(points, segments);
  geometry.computeVertexNormals();
  return geometry;
}

/**
 * Creates smooth capsule geometry with seamless end-caps.
 */
export function createCapsuleGeometry(
  radius: number,
  length: number,
  capSegments: number = 8,
  radialSegments: number = 16
): THREE.BufferGeometry {
  return new THREE.CapsuleGeometry(radius, length, capSegments, radialSegments);
}

import * as THREE from 'three';

/**
 * Generates a seamless procedural brushed stainless steel normal & roughness texture.
 */
export function createBrushedMetalTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, 512, 512);

    // Fine linear horizontal brushing streaks
    for (let i = 0; i < 6000; i++) {
      const y = Math.random() * 512;
      const x = Math.random() * 512;
      const length = 40 + Math.random() * 120;
      const opacity = 0.03 + Math.random() * 0.08;
      const shade = Math.random() > 0.5 ? 255 : 0;
      ctx.strokeStyle = `rgba(${shade}, ${shade}, ${shade}, ${opacity})`;
      ctx.lineWidth = 1 + Math.random() * 1.5;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo((x + length) % 512, y);
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  return texture;
}

/**
 * Generates a soft circular gaussian particle texture for realistic rolling frost mist.
 */
export function createSoftMistParticleTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, 'rgba(235, 248, 255, 1.0)');
    gradient.addColorStop(0.2, 'rgba(215, 240, 255, 0.7)');
    gradient.addColorStop(0.5, 'rgba(195, 230, 255, 0.25)');
    gradient.addColorStop(1, 'rgba(180, 220, 255, 0.0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);
  }

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

/**
 * Creates high-resolution procedural OLED display texture for equipment panels.
 */
export function createOledTexture(
  title: string,
  primaryValue: string,
  secondaryValue: string,
  accentColor: string = '#38bdf8'
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Deep OLED black background
    ctx.fillStyle = '#05070e';
    ctx.fillRect(0, 0, 512, 256);

    // Subtle blue edge backlight
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, 508, 252);

    // Title / Brand
    ctx.fillStyle = '#64748b';
    ctx.font = '600 24px -apple-system, Inter, sans-serif';
    ctx.fillText(title, 28, 48);

    // Primary Value (Large glowing font)
    ctx.fillStyle = accentColor;
    ctx.font = 'bold 64px -apple-system, monospace';
    ctx.shadowColor = accentColor;
    ctx.shadowBlur = 12;
    ctx.fillText(primaryValue, 28, 135);
    ctx.shadowBlur = 0;

    // Secondary Value
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 32px -apple-system, monospace';
    ctx.fillText(secondaryValue, 28, 205);
  }

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

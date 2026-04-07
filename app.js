const sourceCanvas = document.getElementById('sourceCanvas');
const renderCanvas = document.getElementById('renderCanvas');
const srcCtx = sourceCanvas.getContext('2d', { willReadFrequently: true });
const outCtx = renderCanvas.getContext('2d', { willReadFrequently: true });

const controls = {
  mode: document.getElementById('mode'),
  corridor: document.getElementById('corridor'),
  power: document.getElementById('power'),
  swim: document.getElementById('swim'),
  blur: document.getElementById('blur'),
  chromatic: document.getElementById('chromatic'),
  headTilt: document.getElementById('headTilt')
};

const outputs = {
  corridor: document.getElementById('corridorValue'),
  power: document.getElementById('powerValue'),
  swim: document.getElementById('swimValue'),
  blur: document.getElementById('blurValue'),
  chromatic: document.getElementById('chromaticValue'),
  headTilt: document.getElementById('headTiltValue')
};

let showGrid = true;

function clamp(val, min, max) {
  return Math.min(max, Math.max(min, val));
}

function smoothstep(edge0, edge1, x) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function updateOutputLabels() {
  outputs.corridor.textContent = `${Math.round(lerp(8, 20, Number(controls.corridor.value)))} mm`;
  outputs.power.textContent = `+${(Number(controls.power.value) * 3).toFixed(2)} D`;
  outputs.swim.textContent = `${Math.round(Number(controls.swim.value) * 100)} %`;
  outputs.blur.textContent = `${Math.round(Number(controls.blur.value) * 100)} %`;
  outputs.chromatic.textContent = `${Math.round(Number(controls.chromatic.value) * 100)} %`;
  outputs.headTilt.textContent = `${(Number(controls.headTilt.value) * 15).toFixed(1)}°`;
}

function applyModePreset() {
  const mode = controls.mode.value;
  if (mode === 'newWearer') {
    controls.corridor.value = 0.46;
    controls.power.value = 0.78;
    controls.swim.value = 0.66;
    controls.blur.value = 0.6;
    controls.chromatic.value = 0.34;
  } else if (mode === 'adapted') {
    controls.corridor.value = 0.72;
    controls.power.value = 0.5;
    controls.swim.value = 0.26;
    controls.blur.value = 0.24;
    controls.chromatic.value = 0.14;
  }

  updateOutputLabels();
  render();
}

function drawDemoScene() {
  const w = sourceCanvas.width;
  const h = sourceCanvas.height;

  srcCtx.clearRect(0, 0, w, h);
  const sky = srcCtx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, '#9dd6ff');
  sky.addColorStop(1, '#f4f8ff');
  srcCtx.fillStyle = sky;
  srcCtx.fillRect(0, 0, w, h);

  srcCtx.fillStyle = '#5f7f4e';
  srcCtx.fillRect(0, h * 0.64, w, h * 0.36);

  for (let i = 0; i < 14; i += 1) {
    const x = 20 + i * 70;
    const y = h * 0.62 - Math.sin(i) * 8;
    srcCtx.fillStyle = '#5c4631';
    srcCtx.fillRect(x, y - 70, 10, 70);
    srcCtx.beginPath();
    srcCtx.arc(x + 5, y - 90, 30, 0, Math.PI * 2);
    srcCtx.fillStyle = '#2f773b';
    srcCtx.fill();
  }

  srcCtx.fillStyle = '#404040';
  srcCtx.beginPath();
  srcCtx.moveTo(w * 0.35, h);
  srcCtx.lineTo(w * 0.48, h * 0.58);
  srcCtx.lineTo(w * 0.58, h * 0.58);
  srcCtx.lineTo(w * 0.5, h);
  srcCtx.closePath();
  srcCtx.fill();

  srcCtx.strokeStyle = '#ffd36f';
  srcCtx.lineWidth = 4;
  srcCtx.beginPath();
  srcCtx.moveTo(w * 0.43, h);
  srcCtx.lineTo(w * 0.53, h * 0.58);
  srcCtx.stroke();

  srcCtx.fillStyle = '#0c2b57';
  srcCtx.font = '700 44px Inter, sans-serif';
  srcCtx.fillText('SIMULATION VISION PROGRESSIVE', 60, 70);

  srcCtx.fillStyle = '#123';
  srcCtx.font = '500 28px Inter, sans-serif';
  srcCtx.fillText('Regardez sur les côtés de la route : distorsions latérales', 60, h - 40);
}

function sampleNearest(data, width, height, x, y) {
  const sx = clamp(Math.round(x), 0, width - 1);
  const sy = clamp(Math.round(y), 0, height - 1);
  const i = (sy * width + sx) * 4;
  return [data[i], data[i + 1], data[i + 2], data[i + 3]];
}

function render() {
  const w = sourceCanvas.width;
  const h = sourceCanvas.height;
  const src = srcCtx.getImageData(0, 0, w, h);
  const dst = outCtx.createImageData(w, h);

  const { data: s } = src;
  const d = dst.data;

  const corridor = Number(controls.corridor.value);
  const power = Number(controls.power.value);
  const swim = Number(controls.swim.value);
  const blur = Number(controls.blur.value);
  const chromatic = Number(controls.chromatic.value);
  const headTilt = Number(controls.headTilt.value) * 0.25;

  const cx = w * 0.5;
  const cy = h * (0.54 + headTilt * 0.1);

  const corridorHalf = lerp(0.08, 0.2, corridor) * w;

  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const nx = (x - cx) / w;
      const ny = (y - cy) / h;
      const radial = Math.hypot(nx * 1.25, ny);

      const lateral = smoothstep(corridorHalf / w, 0.48, Math.abs(nx));
      const nearZone = smoothstep(0.08, 0.36, ny);
      const midZone = 1 - Math.abs(ny + 0.08) * 2.1;
      const mid = clamp(midZone, 0, 1);

      const baseShift = swim * lateral * (1 + power * 0.7);
      const warpX = x + Math.sign(nx) * baseShift * 80 * (0.35 + nearZone * 0.65) + Math.sin(y * 0.022) * 2.5 * swim;
      const warpY = y + Math.cos(x * 0.018) * 1.5 * swim * (0.6 + radial) + nearZone * power * 16;

      const blurRadius = Math.round(blur * 3.8 * lateral + power * 1.4 * nearZone);
      const chromaShift = chromatic * lateral * 5;

      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      let count = 0;

      for (let oy = -blurRadius; oy <= blurRadius; oy += 1) {
        for (let ox = -blurRadius; ox <= blurRadius; ox += 1) {
          const dist = Math.hypot(ox, oy);
          if (dist > blurRadius + 0.001) continue;

          const rr = sampleNearest(s, w, h, warpX + ox + chromaShift, warpY + oy);
          const gg = sampleNearest(s, w, h, warpX + ox, warpY + oy);
          const bb = sampleNearest(s, w, h, warpX + ox - chromaShift, warpY + oy);

          r += rr[0];
          g += gg[1];
          b += bb[2];
          a += gg[3];
          count += 1;
        }
      }

      if (count === 0) {
        const p = sampleNearest(s, w, h, warpX, warpY);
        [r, g, b, a] = p;
        count = 1;
      }

      const i = (y * w + x) * 4;
      d[i] = r / count;
      d[i + 1] = g / count;
      d[i + 2] = b / count;
      d[i + 3] = a / count;

      if (showGrid) {
        const gridX = (x - cx) / corridorHalf;
        const onGuide = (Math.abs(gridX) > 0.98 && Math.abs(gridX) < 1.03) || (Math.abs(ny - 0.07) < 0.0025) || (Math.abs(ny + 0.18) < 0.0025);
        if (onGuide) {
          d[i] = lerp(d[i], 255, 0.45);
          d[i + 1] = lerp(d[i + 1], mid > nearZone ? 210 : 90, 0.45);
          d[i + 2] = lerp(d[i + 2], nearZone > 0.5 ? 120 : 255, 0.45);
        }
      }
    }
  }

  outCtx.putImageData(dst, 0, 0);
}

function handleUpload(event) {
  const [file] = event.target.files;
  if (!file) return;

  const img = new Image();
  img.onload = () => {
    const w = sourceCanvas.width;
    const h = sourceCanvas.height;
    srcCtx.clearRect(0, 0, w, h);

    const ratio = Math.min(w / img.width, h / img.height);
    const drawW = img.width * ratio;
    const drawH = img.height * ratio;
    const dx = (w - drawW) / 2;
    const dy = (h - drawH) / 2;

    srcCtx.fillStyle = '#000';
    srcCtx.fillRect(0, 0, w, h);
    srcCtx.drawImage(img, dx, dy, drawW, drawH);
    render();
  };

  img.src = URL.createObjectURL(file);
}

Object.values(controls).forEach((control) => {
  control.addEventListener('input', () => {
    updateOutputLabels();
    if (control === controls.mode) {
      applyModePreset();
      return;
    }
    controls.mode.value = 'custom';
    render();
  });
});

document.getElementById('toggleGrid').addEventListener('click', () => {
  showGrid = !showGrid;
  render();
});

document.getElementById('loadDemo').addEventListener('click', () => {
  drawDemoScene();
  render();
});

document.getElementById('imageUpload').addEventListener('change', handleUpload);

updateOutputLabels();
drawDemoScene();
render();

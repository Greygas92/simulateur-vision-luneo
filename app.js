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

function ellipseFalloff(x, y, cx, cy, rx, ry, softness = 0.18) {
  const nx = (x - cx) / rx;
  const ny = (y - cy) / ry;
  const dist = Math.hypot(nx, ny);
  return 1 - smoothstep(1 - softness, 1 + softness, dist);
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
    controls.corridor.value = 0.44;
    controls.power.value = 0.8;
    controls.swim.value = 0.68;
    controls.blur.value = 0.62;
    controls.chromatic.value = 0.36;
  } else if (mode === 'adapted') {
    controls.corridor.value = 0.74;
    controls.power.value = 0.46;
    controls.swim.value = 0.24;
    controls.blur.value = 0.22;
    controls.chromatic.value = 0.12;
  }

  updateOutputLabels();
  render();
}

function drawDemoScene() {
  const w = sourceCanvas.width;
  const h = sourceCanvas.height;

  srcCtx.clearRect(0, 0, w, h);
  const sky = srcCtx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, '#a9dcff');
  sky.addColorStop(1, '#eff6ff');
  srcCtx.fillStyle = sky;
  srcCtx.fillRect(0, 0, w, h);

  srcCtx.fillStyle = '#4e6f48';
  srcCtx.fillRect(0, h * 0.65, w, h * 0.35);

  for (let i = 0; i < 14; i += 1) {
    const x = 20 + i * 70;
    const y = h * 0.62 - Math.sin(i) * 8;
    srcCtx.fillStyle = '#594635';
    srcCtx.fillRect(x, y - 70, 10, 70);
    srcCtx.beginPath();
    srcCtx.arc(x + 5, y - 90, 30, 0, Math.PI * 2);
    srcCtx.fillStyle = '#28733e';
    srcCtx.fill();
  }

  srcCtx.fillStyle = '#3d3d3f';
  srcCtx.beginPath();
  srcCtx.moveTo(w * 0.34, h);
  srcCtx.lineTo(w * 0.48, h * 0.57);
  srcCtx.lineTo(w * 0.59, h * 0.57);
  srcCtx.lineTo(w * 0.51, h);
  srcCtx.closePath();
  srcCtx.fill();

  srcCtx.strokeStyle = '#ffd36f';
  srcCtx.lineWidth = 4;
  srcCtx.beginPath();
  srcCtx.moveTo(w * 0.43, h);
  srcCtx.lineTo(w * 0.53, h * 0.57);
  srcCtx.stroke();

  srcCtx.fillStyle = '#0c2b57';
  srcCtx.font = '700 44px Inter, sans-serif';
  srcCtx.fillText('VISION PROGRESSIVE • DEMO', 70, 68);

  srcCtx.fillStyle = '#143156';
  srcCtx.font = '500 26px Inter, sans-serif';
  srcCtx.fillText('Les zones latérales montrent l’astigmatisme périphérique', 60, h - 40);
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
  const headTilt = Number(controls.headTilt.value) * 0.24;

  const cx = w * 0.5;
  const cy = h * (0.53 + headTilt * 0.12);

  const corridorHalf = lerp(0.085, 0.22, corridor) * w;
  const nearCy = cy + h * 0.24;
  const farCy = cy - h * 0.24;

  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const nx = (x - cx) / w;
      const ny = (y - cy) / h;
      const radial = Math.hypot(nx * 1.35, ny);

      const farFocus = ellipseFalloff(x, y, cx, farCy, corridorHalf * 0.95, h * 0.22, 0.22);
      const nearFocus = ellipseFalloff(x, y, cx, nearCy, corridorHalf * 1.08, h * 0.27, 0.22);

      const corridorShape = Math.exp(-Math.pow((x - cx) / (corridorHalf * 0.72), 2));
      const corridorVertical = Math.exp(-Math.pow((y - cy) / (h * 0.29), 2));
      const midFocus = clamp(corridorShape * corridorVertical * 1.15, 0, 1);

      const focusBlend = clamp(Math.max(farFocus, nearFocus * 0.92, midFocus), 0, 1);
      const lateralArc = smoothstep(0.22, 1.1, radial) * (1 - corridorShape * 0.45);

      const baseShift = swim * (0.35 + lateralArc * 1.08) * (0.78 + power * 0.55);
      const warpX = x + Math.sign(nx) * baseShift * 74 + Math.sin(y * 0.022 + ny * 6) * 2.6 * swim;
      const warpY = y + Math.cos(x * 0.018 + nx * 4) * (1.2 + radial * 3.5) * swim + nearFocus * power * 14;

      const blurWeight = clamp((1 - focusBlend) * (0.7 + lateralArc * 0.9), 0, 1);
      const blurRadius = Math.round(blur * (1.1 + 4.4 * blurWeight) + power * 1.3 * nearFocus + lateralArc * 1.3);
      const chromaShift = chromatic * (1 + lateralArc * 2.3) * 2.1;

      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      let count = 0;

      for (let oy = -blurRadius; oy <= blurRadius; oy += 1) {
        for (let ox = -blurRadius; ox <= blurRadius; ox += 1) {
          if (Math.hypot(ox, oy) > blurRadius + 0.001) continue;

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

      let finalR = r / count;
      let finalG = g / count;
      let finalB = b / count;

      const vignette = smoothstep(0.52, 1.06, radial);
      finalR *= 1 - vignette * 0.08;
      finalG *= 1 - vignette * 0.08;
      finalB *= 1 - vignette * 0.08;

      d[i] = finalR;
      d[i + 1] = finalG;
      d[i + 2] = finalB;
      d[i + 3] = a / count;

      if (showGrid) {
        const farGuide = Math.abs(Math.hypot((x - cx) / (corridorHalf * 0.95), (y - farCy) / (h * 0.22)) - 1) < 0.012;
        const nearGuide = Math.abs(Math.hypot((x - cx) / (corridorHalf * 1.08), (y - nearCy) / (h * 0.27)) - 1) < 0.012;
        const corridorGuide = Math.abs(x - cx) < corridorHalf * 0.06 && y > farCy - h * 0.03 && y < nearCy + h * 0.03;

        if (farGuide || nearGuide || corridorGuide) {
          d[i] = lerp(d[i], farGuide ? 60 : nearGuide ? 255 : 255, 0.48);
          d[i + 1] = lerp(d[i + 1], farGuide ? 220 : nearGuide ? 95 : 214, 0.48);
          d[i + 2] = lerp(d[i + 2], farGuide ? 255 : nearGuide ? 125 : 80, 0.48);
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

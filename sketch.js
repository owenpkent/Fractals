// Fractal Explorer (p5.js)
// An interactive explorer for several escape-time fractals.
//
// Controls:
//   1 2 3 4     choose fractal: Mandelbrot, Burning Ship, Tricorn, Multibrot
//   [ / ]       Multibrot power down / up (switches to Multibrot)
//   j           toggle Julia mode (uses the point under the cursor as the seed)
//   drag        pan
//   scroll      zoom toward the cursor
//   r           reset the view
//   + / -       more / fewer iterations (sharper detail vs. faster)
//   s           save a PNG screenshot
//
// This is a starting point. Tweak the palette, the math, and the controls
// to make the fractals your own. The iteration step in renderFractal() is
// where each fractal is defined. Add your own there.

// Each fractal type plus a pleasing default view onto the complex plane.
// `scale` is the width of that view in complex units.
const FRACTALS = [
  { name: "Mandelbrot", home: { centerX: -0.5, centerY: 0, scale: 3.5 } },
  { name: "Burning Ship", home: { centerX: -0.4, centerY: -0.5, scale: 3.5 } },
  { name: "Tricorn", home: { centerX: -0.25, centerY: 0, scale: 4.0 } },
  { name: "Multibrot", home: { centerX: 0, centerY: 0, scale: 3.0 } },
];
const JULIA_HOME = { centerX: 0, centerY: 0, scale: 3.5 };

// Famous locations to jump to with the `p` key. Mandelbrot zooms reveal named
// valleys and the deep structure tied to open problems (MLC, self-similarity);
// the Julia presets are classic named sets seeded by a constant c.
const PRESETS = [
  { name: "Seahorse Valley", type: 0, view: { centerX: -0.748, centerY: 0.107, scale: 0.06 }, iter: 400 },
  { name: "Elephant Valley", type: 0, view: { centerX: 0.295, centerY: 0.012, scale: 0.05 }, iter: 400 },
  { name: "Triple Spiral", type: 0, view: { centerX: -0.0885, centerY: 0.6537, scale: 0.018 }, iter: 600 },
  { name: "Feigenbaum Point", type: 0, view: { centerX: -1.401155, centerY: 0, scale: 0.08 }, iter: 700 },
  { name: "Mini Mandelbrot (period 3)", type: 0, view: { centerX: -1.7549, centerY: 0, scale: 0.18 }, iter: 700 },
  { name: "Misiurewicz Spiral", type: 0, view: { centerX: -0.10109636, centerY: 0.95628651, scale: 0.025 }, iter: 600 },
  { name: "Douady Rabbit (Julia)", type: 0, julia: { re: -0.122565, im: 0.744862 }, view: { centerX: 0, centerY: 0, scale: 3.0 }, iter: 300 },
  { name: "Basilica (Julia)", type: 0, julia: { re: -1, im: 0 }, view: { centerX: 0, centerY: 0, scale: 3.0 }, iter: 300 },
  { name: "Dendrite (Julia)", type: 0, julia: { re: 0, im: 1 }, view: { centerX: 0, centerY: 0, scale: 3.0 }, iter: 400 },
  { name: "Siegel Disk (Julia)", type: 0, julia: { re: -0.390541, im: -0.586788 }, view: { centerX: 0, centerY: 0, scale: 3.0 }, iter: 800 },
];

let fractalType = 0; // index into FRACTALS
let multibrotPower = 3; // exponent used by the Multibrot
let view = { ...FRACTALS[0].home };

let maxIter = 200;
let juliaMode = false;
let juliaC = { re: -0.8, im: 0.156 };

let fractal; // off-screen buffer holding the rendered image
let needsRender = true;
const palette = [];
let zoomButtons = [];
let presetIndex = -1; // index into PRESETS, or -1 when off the tour
let presetName = ""; // label shown in the HUD while a preset is active

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  fractal = createGraphics(width, height);
  fractal.pixelDensity(1);
  buildPalette();
  makeButtons();
  needsRender = true;
}

function draw() {
  if (needsRender) {
    renderFractal();
    needsRender = false;
  }
  image(fractal, 0, 0);
  drawHud();
}

// ---- Fractal rendering -----------------------------------------------------

function renderFractal() {
  fractal.loadPixels();
  const px = fractal.pixels;
  const w = width;
  const h = height;
  const aspect = h / w;
  const halfW = view.scale / 2;
  const halfH = halfW * aspect;
  const minX = view.centerX - halfW;
  const minY = view.centerY - halfH;
  const stepX = view.scale / w;
  const stepY = (halfH * 2) / h;

  // Resolve the active fractal once, outside the hot loop.
  const isShip = fractalType === 1;
  const isTricorn = fractalType === 2;
  const isMulti = fractalType === 3;
  const power = multibrotPower;
  const LOG2 = Math.log(2);
  const logDeg = Math.log(isMulti ? power : 2);

  for (let y = 0; y < h; y++) {
    const cy0 = minY + y * stepY;
    for (let x = 0; x < w; x++) {
      const cx0 = minX + x * stepX;

      // Mandelbrot family: z starts at 0, c is the pixel.
      // Julia:            z starts at the pixel, c is a fixed seed.
      let zx, zy, cx, cy;
      if (juliaMode) {
        zx = cx0;
        zy = cy0;
        cx = juliaC.re;
        cy = juliaC.im;
      } else {
        zx = 0;
        zy = 0;
        cx = cx0;
        cy = cy0;
      }

      let zx2 = zx * zx;
      let zy2 = zy * zy;
      let iter = 0;

      if (isMulti) {
        // z -> z^power + c, via polar form (handles any exponent).
        while (zx2 + zy2 <= 4 && iter < maxIter) {
          const r = Math.pow(zx2 + zy2, power * 0.5);
          const theta = Math.atan2(zy, zx) * power;
          zx = r * Math.cos(theta) + cx;
          zy = r * Math.sin(theta) + cy;
          zx2 = zx * zx;
          zy2 = zy * zy;
          iter++;
        }
      } else {
        // Degree-2 maps. The real part is shared; only the imaginary
        // part differs between Mandelbrot, Burning Ship, and Tricorn.
        while (zx2 + zy2 <= 4 && iter < maxIter) {
          let ny;
          if (isShip) {
            ny = 2 * Math.abs(zx * zy) + cy; // (|x| + i|y|)^2 + c
          } else if (isTricorn) {
            ny = -2 * zx * zy + cy; // conj(z)^2 + c
          } else {
            ny = 2 * zx * zy + cy; // z^2 + c
          }
          zx = zx2 - zy2 + cx;
          zy = ny;
          zx2 = zx * zx;
          zy2 = zy * zy;
          iter++;
        }
      }

      const idx = 4 * (y * w + x);
      if (iter === maxIter) {
        px[idx] = 0;
        px[idx + 1] = 0;
        px[idx + 2] = 0;
        px[idx + 3] = 255;
      } else {
        // Smooth (continuous) coloring removes the harsh iteration bands.
        const logZn = Math.log(zx2 + zy2) * 0.5;
        const nu = Math.log(logZn / LOG2) / logDeg;
        const smooth = iter + 1 - nu;
        const c = palette[((Math.floor(smooth * 5) % 256) + 256) % 256];
        px[idx] = c[0];
        px[idx + 1] = c[1];
        px[idx + 2] = c[2];
        px[idx + 3] = 255;
      }
    }
  }
  fractal.updatePixels();
}

// A smooth gradient via Bernstein polynomials. Swap these lines to recolor.
function buildPalette() {
  palette.length = 0;
  for (let i = 0; i < 256; i++) {
    const t = i / 255;
    const r = Math.floor(9 * (1 - t) * t * t * t * 255);
    const g = Math.floor(15 * (1 - t) * (1 - t) * t * t * 255);
    const b = Math.floor(8.5 * (1 - t) * (1 - t) * (1 - t) * t * 255);
    palette.push([r, g, b]);
  }
}

// ---- HUD -------------------------------------------------------------------

function drawHud() {
  const f = FRACTALS[fractalType];
  const ref = juliaMode ? JULIA_HOME : f.home;
  const zoom = (ref.scale / view.scale).toFixed(2);

  let title = presetName ? `★ ${presetName}` : juliaMode ? `Julia · ${f.name}` : f.name;
  if (!presetName && fractalType === 3) title += `  power ${multibrotPower}`;
  if (juliaMode) title += `   c = ${fmt(juliaC.re)} + ${fmt(juliaC.im)}i`;

  const lines = [
    title,
    `zoom ${zoom}x   iter ${maxIter}`,
    "p presets · 1-4 type · [ ] power · j julia · r reset",
    "drag pan · scroll/buttons zoom · +/- detail · s save",
  ];

  noStroke();
  textFont("monospace");
  textSize(13);
  for (let i = 0; i < lines.length; i++) {
    const y = 22 + i * 18;
    fill(0, 160);
    text(lines[i], 13, y + 1);
    fill(255);
    text(lines[i], 12, y);
  }
}

function fmt(n) {
  return (n >= 0 ? " " : "") + n.toFixed(4);
}

// ---- Interaction -----------------------------------------------------------

function homeView() {
  return juliaMode ? { ...JULIA_HOME } : { ...FRACTALS[fractalType].home };
}

// Jump to a featured location. Wraps around in both directions.
function applyPreset(i) {
  presetIndex = ((i % PRESETS.length) + PRESETS.length) % PRESETS.length;
  const p = PRESETS[presetIndex];
  fractalType = p.type;
  if (p.julia) {
    juliaMode = true;
    juliaC = { re: p.julia.re, im: p.julia.im };
  } else {
    juliaMode = false;
  }
  view = { ...p.view };
  if (p.iter) maxIter = p.iter;
  presetName = p.name;
  needsRender = true;
}

// Manual navigation drops the preset label (you have left the tour).
function leaveTour() {
  presetName = "";
  needsRender = true;
}

function screenToComplex(sx, sy) {
  const aspect = height / width;
  return {
    re: view.centerX + (sx / width - 0.5) * view.scale,
    im: view.centerY + (sy / height - 0.5) * view.scale * aspect,
  };
}

function mouseDragged() {
  view.centerX -= (movedX / width) * view.scale;
  view.centerY -= (movedY / height) * view.scale * (height / width);
  needsRender = true;
}

// Zoom by `factor` (< 1 zooms in) while keeping the point at (sx, sy) fixed.
function zoomAt(sx, sy, factor) {
  const before = screenToComplex(sx, sy);
  view.scale *= factor;
  const after = screenToComplex(sx, sy);
  view.centerX += before.re - after.re;
  view.centerY += before.im - after.im;
  needsRender = true;
}

function mouseWheel(event) {
  zoomAt(mouseX, mouseY, event.delta > 0 ? 1.12 : 0.89);
  return false; // stop the page from scrolling
}

function keyPressed() {
  if (key === "p") {
    applyPreset(presetIndex + 1);
    return;
  } else if (key === "P") {
    applyPreset(presetIndex - 1);
    return;
  } else if (key >= "1" && key <= "4") {
    fractalType = Number(key) - 1;
    juliaMode = false;
    view = homeView();
    leaveTour();
  } else if (key === "]") {
    if (fractalType !== 3) {
      fractalType = 3;
      juliaMode = false;
      view = homeView();
    }
    multibrotPower = Math.min(multibrotPower + 1, 8);
    leaveTour();
  } else if (key === "[") {
    if (fractalType !== 3) {
      fractalType = 3;
      juliaMode = false;
      view = homeView();
    }
    multibrotPower = Math.max(multibrotPower - 1, 2);
    leaveTour();
  } else if (key === "j" || key === "J") {
    if (!juliaMode) {
      // Seed the Julia set from the point currently under the cursor.
      juliaC = screenToComplex(mouseX, mouseY);
      juliaMode = true;
    } else {
      juliaMode = false;
    }
    view = homeView();
    leaveTour();
  } else if (key === "r" || key === "R") {
    view = homeView();
    leaveTour();
  } else if (key === "+" || key === "=") {
    maxIter = Math.min(maxIter + 50, 2000);
    needsRender = true;
  } else if (key === "-" || key === "_") {
    maxIter = Math.max(maxIter - 50, 50);
    needsRender = true;
  } else if (key === "s" || key === "S") {
    saveCanvas("fractal", "png");
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  fractal = createGraphics(width, height);
  fractal.pixelDensity(1);
  layoutButtons();
  needsRender = true;
}

// ---- On-screen zoom buttons ------------------------------------------------

function makeButtons() {
  const zin = createButton("+");
  styleZoomButton(zin);
  zin.attribute("title", "Zoom in");
  zin.attribute("aria-label", "Zoom in");
  zin.mousePressed(() => zoomAt(width / 2, height / 2, 0.8));

  const zout = createButton("−"); // minus sign
  styleZoomButton(zout);
  zout.attribute("title", "Zoom out");
  zout.attribute("aria-label", "Zoom out");
  zout.mousePressed(() => zoomAt(width / 2, height / 2, 1.25));

  zoomButtons = [zin, zout];
  layoutButtons();
}

function styleZoomButton(b) {
  b.size(48, 48);
  b.style("font-size", "26px");
  b.style("font-family", "monospace");
  b.style("color", "#fff");
  b.style("background", "rgba(0, 0, 0, 0.55)");
  b.style("border", "1px solid rgba(255, 255, 255, 0.4)");
  b.style("border-radius", "8px");
  b.style("cursor", "pointer");
  b.style("user-select", "none");
}

function layoutButtons() {
  if (zoomButtons.length < 2) return;
  const size = 48;
  const gap = 10;
  const margin = 20;
  const x = width - size - margin;
  zoomButtons[0].position(x, height - size * 2 - gap - margin); // +
  zoomButtons[1].position(x, height - size - margin); // −
}

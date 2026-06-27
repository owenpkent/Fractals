// Fractal Explorer — p5.js
// An interactive Mandelbrot / Julia set explorer.
//
// Controls:
//   drag        pan
//   scroll      zoom toward the cursor
//   j           toggle Julia mode (uses the point under the cursor as the seed)
//   r           reset the view
//   + / -       more / fewer iterations (sharper detail vs. faster)
//   s           save a PNG screenshot
//
// This is a starting point. Tweak the palette, the math, and the controls
// to make the fractals your own.

// The view is a window onto the complex plane.
// `scale` is the width of that window in complex units.
const HOME = { centerX: -0.5, centerY: 0, scale: 3.5 };
let view = { ...HOME };

let maxIter = 200;
let juliaMode = false;
let juliaC = { re: -0.8, im: 0.156 };

let fractal; // off-screen buffer holding the rendered image
let needsRender = true;
const palette = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  fractal = createGraphics(width, height);
  fractal.pixelDensity(1);
  buildPalette();
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
  const log2 = Math.log(2);

  for (let y = 0; y < h; y++) {
    const cy0 = minY + y * stepY;
    for (let x = 0; x < w; x++) {
      const cx0 = minX + x * stepX;

      // Mandelbrot: z starts at 0, c is the pixel.
      // Julia:      z starts at the pixel, c is a fixed seed.
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
      while (zx2 + zy2 <= 4 && iter < maxIter) {
        zy = 2 * zx * zy + cy;
        zx = zx2 - zy2 + cx;
        zx2 = zx * zx;
        zy2 = zy * zy;
        iter++;
      }

      const idx = 4 * (y * w + x);
      if (iter === maxIter) {
        px[idx] = 0;
        px[idx + 1] = 0;
        px[idx + 2] = 0;
        px[idx + 3] = 255;
      } else {
        // Smooth (continuous) coloring removes the harsh iteration bands.
        const logZn = Math.log(zx2 + zy2) / 2;
        const nu = Math.log(logZn / log2) / log2;
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
  const zoom = (HOME.scale / view.scale).toFixed(2);
  const lines = [
    juliaMode ? `Julia  c = ${fmt(juliaC.re)} + ${fmt(juliaC.im)}i` : "Mandelbrot",
    `zoom ${zoom}x   iter ${maxIter}`,
    "drag pan · scroll zoom · j julia · r reset · +/- detail · s save",
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

function mouseWheel(event) {
  const before = screenToComplex(mouseX, mouseY);
  view.scale *= event.delta > 0 ? 1.12 : 0.89;
  const after = screenToComplex(mouseX, mouseY);
  // Keep the point under the cursor fixed while zooming.
  view.centerX += before.re - after.re;
  view.centerY += before.im - after.im;
  needsRender = true;
  return false; // stop the page from scrolling
}

function keyPressed() {
  if (key === "j" || key === "J") {
    if (!juliaMode) {
      // Seed the Julia set from the point currently under the cursor.
      const c = screenToComplex(mouseX, mouseY);
      juliaC = c;
      juliaMode = true;
      view = { centerX: 0, centerY: 0, scale: 3.5 };
    } else {
      juliaMode = false;
      view = { ...HOME };
    }
    needsRender = true;
  } else if (key === "r" || key === "R") {
    view = juliaMode ? { centerX: 0, centerY: 0, scale: 3.5 } : { ...HOME };
    needsRender = true;
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
  needsRender = true;
}

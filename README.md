# Fractals

Interactive fractals built with [p5.js](https://p5js.org/). A playground for
exploring escape-time fractals in the browser, with smooth coloring and live
zoom. Includes the Mandelbrot set, the Burning Ship, the Tricorn, and the
Multibrot, plus a Julia set for any of them.

## Run it

No build step, no install. Either:

- Open `index.html` directly in a browser, or
- Serve the folder (better for some browsers):

  ```bash
  python -m http.server 8000
  # then visit http://localhost:8000
  ```

## Controls

| Action      | What it does                                          |
| ----------- | ----------------------------------------------------- |
| `p` / `P`   | jump to next / previous featured location             |
| `1` `2` `3` `4` | Mandelbrot / Burning Ship / Tricorn / Multibrot   |
| `[` / `]`   | Multibrot power down / up (switches to Multibrot)     |
| drag        | pan                                                   |
| scroll      | zoom toward the cursor                                |
| `j`         | toggle Julia mode (seeded from the point you hover)   |
| `r`         | reset the view                                        |
| `+` / `-`   | more / fewer iterations (detail vs. speed)            |
| `s`         | save a PNG screenshot                                 |

No mouse wheel? Use the on-screen **+ / −** buttons in the bottom-right corner
to zoom in and out.

Tip: explore any set, hover over an interesting edge, then press `j` to see
the Julia set that corresponds to that exact point.

## Featured locations

Press `p` to tour these (and `P` to step back). The first group are deep
zooms into the Mandelbrot set; the rest are classic named Julia sets.

- **Seahorse Valley**, **Elephant Valley**, **Triple Spiral**: the famous
  decorated valleys around the main cardioid.
- **Feigenbaum Point** (c ≈ -1.401155): the period-doubling accumulation
  point. This is an infinitely renormalizable parameter, exactly the kind of
  place where the "is the Mandelbrot set locally connected?" question lives.
- **Mini Mandelbrot (period 3)**: a tiny self-similar copy on the antenna.
- **Misiurewicz Spiral** (c ≈ -0.1011 + 0.9563i): near a Misiurewicz point,
  where the Mandelbrot set looks like the Julia set seeded by that same point.
- **Douady Rabbit**, **Basilica**, **Dendrite**, **Siegel Disk**: classic
  Julia sets, each defined by a single constant c.

## Make it your own

`sketch.js` is small and commented. Good first experiments:

- **Recolor it.** Edit `buildPalette()` to change the gradient.
- **More fractals.** The escape-time loop in `renderFractal()` is the heart of
  it. Mandelbrot, Burning Ship, Tricorn, and Multibrot already live there.
  Add your own iteration formula next to them (a Phoenix or a Newton fractal
  are good next steps).
- **Animate.** Slowly drift `juliaC` in `draw()` for a morphing Julia set.
- **Go faster.** Render at lower resolution while dragging, then sharpen when
  the view settles.

## License

MIT. See [LICENSE](LICENSE).

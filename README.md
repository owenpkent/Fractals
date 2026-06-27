# Fractals

Interactive fractals built with [p5.js](https://p5js.org/). A playground for
exploring escape-time fractals in the browser, with smooth coloring and live
zoom. Includes the Mandelbrot set, the Burning Ship, the Tricorn, and the
Multibrot — plus a Julia set for any of them.

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
| `1` `2` `3` `4` | Mandelbrot / Burning Ship / Tricorn / Multibrot   |
| `[` / `]`   | Multibrot power down / up (switches to Multibrot)     |
| drag        | pan                                                   |
| scroll      | zoom toward the cursor                                |
| `j`         | toggle Julia mode (seeded from the point you hover)   |
| `r`         | reset the view                                        |
| `+` / `-`   | more / fewer iterations (detail vs. speed)            |
| `s`         | save a PNG screenshot                                 |

Tip: explore any set, hover over an interesting edge, then press `j` to see
the Julia set that corresponds to that exact point.

## Make it your own

`sketch.js` is small and commented. Good first experiments:

- **Recolor it.** Edit `buildPalette()` to change the gradient.
- **More fractals.** The escape-time loop in `renderFractal()` is the heart of
  it. Mandelbrot, Burning Ship, Tricorn, and Multibrot already live there —
  add your own iteration formula next to them (a Phoenix or a Newton fractal
  are good next steps).
- **Animate.** Slowly drift `juliaC` in `draw()` for a morphing Julia set.
- **Go faster.** Render at lower resolution while dragging, then sharpen when
  the view settles.

## License

MIT — see [LICENSE](LICENSE).

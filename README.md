# Fractals

Interactive fractals built with [p5.js](https://p5js.org/). A playground for
exploring the Mandelbrot and Julia sets in the browser, with smooth coloring
and live zoom.

## Run it

No build step, no install. Either:

- Open `index.html` directly in a browser, or
- Serve the folder (better for some browsers):

  ```bash
  python -m http.server 8000
  # then visit http://localhost:8000
  ```

## Controls

| Action      | What it does                                      |
| ----------- | ------------------------------------------------- |
| drag        | pan                                               |
| scroll      | zoom toward the cursor                            |
| `j`         | toggle Julia mode (seeded from the point you hover) |
| `r`         | reset the view                                    |
| `+` / `-`   | more / fewer iterations (detail vs. speed)        |
| `s`         | save a PNG screenshot                             |

Tip: explore the Mandelbrot set, hover over an interesting edge, then press
`j` to see the Julia set that corresponds to that exact point.

## Make it your own

`sketch.js` is small and commented. Good first experiments:

- **Recolor it.** Edit `buildPalette()` to change the gradient.
- **New fractals.** The escape-time loop in `renderFractal()` is the heart of
  it. Swap the iteration formula for a Burning Ship, a Tricorn, or a higher
  power of `z` to make a Multibrot.
- **Animate.** Slowly drift `juliaC` in `draw()` for a morphing Julia set.
- **Go faster.** Render at lower resolution while dragging, then sharpen when
  the view settles.

## License

MIT — see [LICENSE](LICENSE).

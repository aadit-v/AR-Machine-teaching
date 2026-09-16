# Machine Guide AR

A phone-camera AR site: point your phone at a sticker/label/marker on a
machine, and it shows an overlay explaining every button and knob. Built
with **MindAR** (image tracking) + **A-Frame**, no app install needed —
it just runs in the phone's browser.

## Files
- `index.html` — camera view + AR scene + the guide/admin panel markup
- `style.css` — all styling
- `data.js` — the built-in ("default") guide content, e.g. the DNM
  8Z100A amplifier from your photos
- `app.js` — recognizes markers, shows the guide, and runs the "⚙️"
  admin panel for adding new machines/instructions
- `targets.mind` — **you generate this yourself, see step 1 below.**
  It is not included because it has to be compiled from your own
  marker photos.

## 1. Compile your marker image(s) — required, one-time per marker
MindAR can't recognize a live photo of a whole amplifier reliably —
it needs a **flat, high-contrast, textured image** compiled into a
`.mind` file. Two good options:

- **Use a printed marker/sticker** (recommended, most reliable): design
  or print a distinctive image/QR-style graphic and stick it to the
  machine — e.g. that "90's" boombox sticker already on this amp's
  volume knob is a decent candidate since it's flat and detailed.
- **Use an existing label already on the machine**, like the
  `DNM 4 STEREO ZONE AMPLIFIER 8Z100A` faceplate text/logo area, as
  long as it's flat and has enough visual detail (plain single-color
  panels don't track well).

Steps:
1. Take a clean, well-lit, straight-on photo of the marker/sticker/label.
2. Go to the official MindAR compiler (runs in-browser, nothing to
   install): **https://hiukim.github.io/mind-ar-js-doc/tools/compile**
3. Upload your image(s). Each image you add becomes one **target
   index**, in the order you add them (first image = target 0, second
   = target 1, etc.) — that index is what you'll enter in the admin
   panel and in `data.js`.
4. Download the resulting `targets.mind` file and place it in this
   same folder, next to `index.html`.

If you later want to recognize a new machine, add its marker photo to
the *same* compiler batch (so it gets the next index) and re-download
`targets.mind` — or recompile from scratch with all marker images
included so far.

## 2. Run it
Browsers require **HTTPS** (or `localhost`) to access the camera, so
you can't just double-click `index.html`. Easiest options:
- Host the folder on any static host (GitHub Pages, Netlify, Vercel, etc.)
- Or locally for testing: `npx serve .` (or any local HTTPS static
  server) and open it on your phone over your LAN with HTTPS.

Open the site on your phone, allow camera access, and point it at a
compiled marker.

## 3. Adding more instructions
Two ways:

**A. In the app (no coding), on your phone:**
Tap the **⚙️** button (bottom-right) →
- Pick an existing machine to edit its buttons/knobs, or
- Choose **"+ New machine…"**, give it the **target index** that
  matches a marker you compiled, name it, and add a row per
  button/knob (name + what it does).
- Tap **Save**. This is stored in the browser's `localStorage`, so
  it's per-device. Use **Export guides (.json)** to back it up or
  move it to another device, and **Import guides (.json)** to load it
  there.

**B. By editing `data.js` directly (for guides you want built in for
everyone, no per-device setup):**
Add another object to the `DEFAULT_MACHINES` array with the next
`targetIndex` and a `controls` array of `{ label, description }` pairs
— follow the existing DNM amplifier entry as a template.

## Notes / limits
- Up to **10 machines** are wired up out of the box (`target-0`
  through `target-9` in `index.html`). To support more, copy one more
  `<a-entity id="target-N" mindar-image-target="targetIndex: N">` line
  in `index.html`, add a matching `targetFound`/`targetLost` listener
  loop already handles it automatically up to `MAX_TARGETS` in
  `app.js` — just bump that constant too.
- MindAR tracks flat images best. Curved, reflective, or low-contrast
  surfaces (bare metal, glossy plastic) track poorly — a printed
  paper/sticker marker is the reliable fallback.
- Guides saved via the admin panel live in that browser's
  `localStorage` only — they won't sync across phones unless you
  export/import the JSON.

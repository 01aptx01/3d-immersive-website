# Elsewhere — 3D Immersive Worlds

An evolving collection of interactive worlds. **Mechanical Garden** explores a custom mechanical keyboard, and **Kigumi Pavilion** guides visitors through an illustrated timber assembly. The earlier home and world directory are preserved as interactive HTML wireframes.

Visit the [published Site](https://elsewhere-keyboard-world.teerananpakdeekhan.chatgpt.site/) or open [World 02 — Kigumi Pavilion](https://elsewhere-keyboard-world.teerananpakdeekhan.chatgpt.site/?world=kigumi) directly.

> Status: experimental prototype. The interactive 3D worlds require WebGL 2. Kigumi Pavilion shows an illustrated fallback when the renderer cannot start. Wireframe content and planned worlds are examples, not finished experiences.

## Worlds

| World | Status | Description |
| --- | --- | --- |
| Mechanical Garden | Prototype | An interactive mechanical keyboard with an exploded view and customization. |
| Kigumi Pavilion | Prototype | A Japanese timber pavilion assembled in seven stages, with visible connection studies and a time-of-day control. |
| Aurora Drift | Planned | Placeholder in the world catalog. |
| Mosslight Grove | Planned | Placeholder in the world catalog. |

## Mechanical Garden features

- **Exploded view:** Drag the bottom slider to separate the keyboard layers.
- **Layer isolation:** Select any of six layers from the scene rail or click a part in the scene. Double-click a keycap to isolate the keycap layer; other layers stay visible as 15% ghosts.
- **Switch anatomy:** Hover over a key to reveal its switch components.
- **Keyboard input:** Printable characters follow the browser's active keyboard layout and highlight the matching English key legend. Modifiers, arrows, and other special keys use physical key positions. Thai/IME characters and symbols without an English legend do not highlight a key.
- **Customization:** Choose from five pastel keycap palettes, seven case colors, and three plate materials. Switch travel remains adjustable in the customization panel.
- **Sound:** Toggle sound and choose Thock or Clack from the top controls.
- **Navigation:** Drag to rotate the scene; use the world menu to browse the catalog.

Actual feature screenshots are not yet available in this repository. The other catalog worlds do not yet have implemented scenes.

## Kigumi Pavilion

- **Assembly:** Hold Build to advance through foundation stones, pillars, beams, six timber interlocks, rafters, roof tiles, and shoji screens. Scroll over the 3D scene or swipe vertically to move between unlocked stages.
- **Joinery study:** At the interlocking-joints stage, each connection is focused and animated through an exploded, rotate, slide, and lock sequence. Click a numbered completed connection to replay it and read its explanatory note. The modeled tenon and cross wedge are illustrative geometry, not a claim about a named joint or a specific historic pavilion.
- **Time and sound:** The slider moves from dawn through sunset to night, shifting the light, shadows, and lanterns. Optional ambient wind uses a locally bundled generated OGG loop and starts muted.
- **Materials and assets:** The pavilion is built from procedural Three.js geometry and materials. No source texture assets or KTX2 encoder were available for this prototype, so it does not include KTX2 textures.
- **Accessibility and performance:** The interface adapts to tablet and phone layouts, supports keyboard activation for the hold control, honors reduced-motion preferences, and instances the bamboo foliage and falling leaves.
- **Graphics fallback:** If WebGL 2 is unavailable or the renderer fails, an illustrated pavilion and navigation remain available. Interactive assembly and time controls are disabled in that state.

## Getting started

Requirements: Node.js and npm, plus a WebGL-capable browser. Use a recent Node.js LTS version.

```bash
git clone https://github.com/01aptx01/3d-immersive-website.git
cd 3d-immersive-website
npm install
npm run dev
```

Open the URL printed by Vite. Run `npm run build` to create a production build and `npm run preview` to preview it locally.

## Wireframes

The [wireframe archive](wireframes/) contains the full-screen home, directory, detail, settings, and about pages. Its favorites are stored in browser local storage. Run the Vite development server and open `/wireframes/index.html` to use its links to the React world.

## Technology

React, Vite, Three.js, React Three Fiber, Drei, Zustand, and GSAP. Keycaps and switch components use instanced meshes.

## Project structure

```text
src/
  main.jsx                 App entry point
  worlds/catalog.js        World metadata
  worlds/keyboard/         Scene, controls, styles, and state
  worlds/kigumi/           Pavilion scene, assembly state, audio, and styles
wireframes/                Earlier HTML prototypes
```

The catalog keeps world metadata separate from scene modules, and each implemented world loads through its own route. World 01 remains the default; World 02 is available at `/?world=kigumi` and `/world/kigumi`. The Site is deployed, while the home and directory remain wireframes that can be developed into production navigation as more worlds arrive.

## Contributing

Open an issue to discuss substantial changes. Keep pull requests focused and include screenshots or recordings for visual changes. Use Conventional Commits for new commits, for example `feat: add a world` or `fix: correct key input`.

## License

[MIT](LICENSE)

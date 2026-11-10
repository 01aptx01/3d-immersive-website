# Elsewhere — 3D Immersive Worlds

An evolving collection of interactive worlds. **Mechanical Garden**, the first world, explores a custom mechanical keyboard in 3D. The earlier home and world directory are preserved as interactive HTML wireframes.

> Status: experimental prototype. The keyboard world requires a browser with WebGL support. Wireframe content and future worlds are examples, not finished experiences.

## Worlds

| World | Status | Description |
| --- | --- | --- |
| Mechanical Garden | Prototype | An interactive mechanical keyboard with an exploded view and customization. |
| Aurora Drift | Planned | Placeholder in the world catalog. |
| Mosslight Grove | Planned | Placeholder in the world catalog. |

## Mechanical Garden features

- **Exploded view:** Drag the bottom slider to separate the keyboard layers.
- **Layer isolation:** Select a layer in settings, or click parts in the scene; double-click a keycap to isolate keycaps. Other layers fade.
- **Switch anatomy:** Hover over a key to reveal its switch components.
- **Keyboard input:** Press supported physical keys or click a keycap. Sound can be switched on or off and set to Thock or Clack.
- **Customization:** Change the keycap palette and case finish in the settings panel.
- **Navigation:** Drag to rotate the scene; use the world menu to browse the catalog.

Actual feature screenshots are not yet available in this repository. The other catalog worlds do not yet have implemented scenes.

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
wireframes/                Earlier HTML prototypes
```

The catalog is a starting point for additional worlds; future routing and production hosting are still to be developed.

## Contributing

Open an issue to discuss substantial changes. Keep pull requests focused and include screenshots or recordings for visual changes. Use Conventional Commits for new commits, for example `feat: add a world` or `fix: correct key input`.

## License

[MIT](LICENSE)

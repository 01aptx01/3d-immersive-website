# Elsewhere — 3D Immersive Website

A browser-based collection of small interactive worlds. The first implemented world, **Mechanical Garden**, is a real-time 3D keyboard study built with React Three Fiber, Drei, Zustand, and GSAP.

## Run the 3D world

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. Use the pointer to rotate the keyboard, hover to lift a keycap and reveal its switch housing and spring, and click a key or press a physical keyboard key to hear its selected sound. The continuous 0–100 exploded-view slider sits in the bottom bar. **Customize this world** opens the keycap and case colors, sound style, switch travel, and layer isolation; unselected layers remain visible at 15% opacity.

The world list lives in `src/worlds/catalog.js`; the keyboard scene and interaction state are isolated under `src/worlds/keyboard/` so future worlds can add their own scene module.

## Wireframe archive

Open [wireframes/index.html](wireframes/index.html) to view the responsive home concept. It links to the interactive 3D world at the site root. The static home and directory still include their original CSS scene prototypes and browser-local favorites.

### Pages

| Page | Description |
| --- | --- |
| [Home](wireframes/index.html) | Full-screen world showcase with timed crossfade, controls, and favorite action |
| [Explore](wireframes/explore.html) | Browse and search worlds, filter favorites, and open a selected world |
| [World detail](wireframes/world-detail.html) | View details for a selected world and favorite it |
| [Settings](wireframes/settings.html) | Prototype preferences for sound, motion, and display |
| [About & updates](wireframes/about-updates.html) | Project introduction and sample update history |

Each HTML file is self-contained with inline CSS and JavaScript. For the complete linked experience, keep the files together in the `wireframes/` directory and open them through a local static server.

## View the static wireframes

```bash
python -m http.server 8000
```

Run that command from the repository root and visit [http://localhost:8000/wireframes/](http://localhost:8000/wireframes/). Static pages link to the React world at the root when served together.

## Project structure

```text
.
├── src/
│   ├── main.jsx
│   └── worlds/
│       ├── catalog.js
│       └── keyboard/
├── wireframes/
└── package.json
```

## Interactions

- The 3D keyboard responds to orbit controls, key hover, click, sound, color, isolation, and exploded-view controls.
- The wireframe home crossfades between sample worlds on a four-second interval.
- Pause playback by using the control, hovering, or moving keyboard focus into the scene.
- Use previous/next controls or the world directory to choose a scene manually.
- Favorite state is saved in `localStorage` and shared by Home, Explore, and World detail in the same browser.
- Respect for the browser's reduced-motion preference is included in the prototype.

## Roadmap

- [ ] Confirm the visual theme and the real list of worlds.
- [ ] Build the production full-screen home experience.
- [ ] Replace sample scenes with optimized 3D assets.
- [ ] Add responsive interaction and accessibility checks across target devices.
- [ ] Decide whether world content should be maintained in code or through a content-management interface.
- [ ] Add production hosting and performance monitoring.

## Contributing

Issues and pull requests are welcome. For substantial changes, open an issue first to discuss the proposed direction. Keep pull requests focused and include screenshots or a short recording for visual changes.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE).

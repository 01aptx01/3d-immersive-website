# 3D Immersive Website

A browser-based 3D immersive website concept designed as a growing collection of worlds. The home screen presents one world at a time with a full-screen scene and a gentle crossfade every four seconds. Visitors can open the world directory, enter any listed world, and save favorites.

> **Project status:** This repository currently contains interactive HTML/CSS wireframes. The scenes are visual prototypes; a production 3D renderer, world content, and backend are not included yet.

## Wireframe preview

Open [wireframes/index.html](wireframes/index.html) to view the full-screen home concept. The home scene rotates through sample worlds, supports pause and manual navigation, and links to the world directory. Favorites are stored in the browser and shared across the included pages.

### Pages

| Page | Description |
| --- | --- |
| [Home](wireframes/index.html) | Full-screen world showcase with timed crossfade, controls, and favorite action |
| [Explore](wireframes/explore.html) | Browse and search worlds, filter favorites, and open a selected world |
| [World detail](wireframes/world-detail.html) | View details for a selected world and favorite it |
| [Settings](wireframes/settings.html) | Prototype preferences for sound, motion, and display |
| [About & updates](wireframes/about-updates.html) | Project introduction and sample update history |

Each HTML file is self-contained with inline CSS and JavaScript. For the complete linked experience, keep the files together in the `wireframes/` directory and open them through a local static server.

## Run locally

No build step or package installation is required for the wireframes.

```bash
git clone https://github.com/01aptx01/3d-immersive-website.git
cd 3d-immersive-website
python -m http.server 8000
```

Then visit [http://localhost:8000/wireframes/](http://localhost:8000/wireframes/). You can also open `wireframes/index.html` directly, though a local server gives the most consistent behavior.

## Interactions

- Home crossfades between sample worlds on a four-second interval.
- Pause playback by using the control, hovering, or moving keyboard focus into the scene.
- Use previous/next controls or the world directory to choose a scene manually.
- Favorite state is saved in `localStorage` and shared by Home, Explore, and World detail in the same browser.
- Respect for the browser's reduced-motion preference is included in the prototype.

## Project structure

```text
.
├── LICENSE
├── README.md
└── wireframes/
    ├── index.html
    ├── explore.html
    ├── world-detail.html
    ├── settings.html
    ├── about-updates.html
    └── README.md
```

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

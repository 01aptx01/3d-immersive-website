<div align="center">

# Immersive-Craft

### Interactive 3D studies

**Take objects apart. Build spaces from the ground up. Discover how things fit together.**

[Open the experience](https://immersive.teerananpakdeekhan.chatgpt.site/) · [Browse the worlds](#features) · [Run locally](#getting-started)

![Mechanical Garden: an interactive pastel mechanical keyboard study](docs/images/mechanical-garden.jpg)

[![Version](https://img.shields.io/badge/version-0.1.0-informational)](package.json)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.4.6-646CFF?logo=vite&logoColor=white)](https://vite.dev/)

</div>

Immersive-Craft is a browser-based collection of interactive studies about objects, materials, and architecture. Explore how a mechanical keyboard fits together, or assemble a Japanese-inspired timber pavilion one stage at a time.

> **Project status:** Experimental frontend prototype. Two interactive 3D worlds are implemented. Two more are catalog concepts only. There is no backend, account system, or cloud-saved progress.

The application UI and separate design archive still use the earlier **Elsewhere** branding. The project name and repository URL remain **Immersive-Craft** and `3d-immersive-website`.

## Table of Contents

- [About](#about)
- [Features](#features)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Configuration](#configuration)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

## About

This project turns construction details into hands-on browser experiences. Each world has its own interface, scene, and interaction model. The current build uses React, Three.js, and React Three Fiber, with no server or service credentials required.

**Live experience:** [immersive.teerananpakdeekhan.chatgpt.site](https://immersive.teerananpakdeekhan.chatgpt.site/)

The live site and GitHub source can change independently. The descriptions below document the current repository source.

## Features

### Mechanical Garden

An interactive study of a 65%-style mechanical keyboard.

![Keyboard layers separated in an exploded view](docs/images/keyboard-exploded.jpg)

- Drag the **Explode** control to separate the keyboard layers continuously.
- Select **Keycaps, Switches, Plate, Foam, PCB,** or **Case** to inspect a layer while keeping the rest visible.
- Double-click a keycap to isolate the keycap layer.
- Change keycap palettes, case finishes, plate materials, and switch travel.
- Type on a physical keyboard to press matching virtual keys. Optional synthesized sound offers **Thock** and **Clack** styles.

Customization and interaction state are held for the current page session; they are not saved after a reload. Keyboard legends match English characters. Thai/IME input and characters without a matching legend do not press a key.

### Kigumi Pavilion

A Japanese-inspired timber pavilion assembled from its foundation through the roof and shoji screens, set on a dark raised platform in a misty bamboo garden.

![Timber pavilion frame before roof assembly](docs/images/pavilion-frame.jpg)

| Stage | Part | Study |
| --- | --- | --- |
| 01 | Foundation stones | Footprint and support points |
| 02 | Pillars | Six posts supporting the frame |
| 03 | Beams | Longitudinal and crosswise frame |
| 04 | Interlocking joints | Six illustrated timber connections |
| 05 | Rafters | Roof span and slope |
| 06 | Roof tiles | Overlapping roof cover |
| 07 | Shoji screens | Timber-and-paper-inspired enclosure |

Hold the circular **築 / Build** button for approximately 0.85 seconds to advance, or hold **Space** or **Enter** while the button is focused. Scroll over the scene or swipe vertically to move through stages. Complete the six connection studies before continuing to the roof. To replay a completed joint after adding the roof, return to **Interlocking joints** on the stage rail.

![The timber frame and six completed joint markers with a connection study card](docs/images/pavilion-joinery.jpg)

The status card shows six modeled posts and six joints; its pieces figure counts posts only. Assembly is a seven-stage study rather than a continuous simulation of every individual component.

![The completed pavilion at dawn with roof tiles and shoji screens](docs/images/pavilion-dawn.jpg)

The joint geometry is an illustrative through-tenon and cross-wedge study. It is not a reconstruction of a particular historic building. Optional garden wind is muted by default; time-of-day controls change the lighting and atmosphere. If WebGL 2 is unavailable or the renderer fails, browse stage descriptions in the illustrated fallback and select **Retry 3D view** to try again. Interrupted joint animations do not count as completed.

### World catalog and design archive

The application catalog lists two implemented worlds and two planned concepts:

| World | Status | Local route |
| --- | --- | --- |
| Mechanical Garden | Implemented | `/` or `/?world=mechanical-garden` |
| Kigumi Pavilion | Implemented | `/?world=kigumi` or `/world/kigumi` |
| Aurora Drift | Planned concept | Not available |
| Mosslight Grove | Planned concept | Not available |

The `wireframes/` folder contains separate standalone HTML concepts for Home, Explore, world details, Settings, and About & Updates. These are not the production catalog or additional 3D worlds. See [wireframes/README.md](wireframes/README.md) for details.

## Getting Started

### Prerequisites

- Node.js 20 or newer with npm
- Git
- A modern browser with WebGL 2 support for the 3D scenes

No `.env` file, API key, or external service account is needed.

### Installation

```bash
git clone https://github.com/01aptx01/3d-immersive-website.git
cd 3d-immersive-website
npm ci
npm run dev
```

Open the local URL printed by Vite, normally [http://localhost:5173](http://localhost:5173).

### Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server with live reload. |
| `npm run build` | Build the application into `dist/`. |
| `npm run preview` | Serve the production build locally for review. |

## Usage

Open the default route to explore Mechanical Garden. Visit `/?world=kigumi` for Kigumi Pavilion.

**Mechanical Garden:** drag **Explode** to reveal the assembly, choose a layer to inspect it, and use the customization drawer to change materials. Hover over keys to reveal switch anatomy. Keyboard input can press matching keys.

**Kigumi Pavilion:** hold **築 / Build** to progress through the seven assembly stages. Use the stage rail to revisit unlocked stages, return to **Interlocking joints** and select a completed marker to replay a connection, and adjust **Time of day** to change the scene lighting. Wind audio is optional and starts muted.

For a quick tour:

1. Open `/`, move the Explode control, and select a keyboard layer.
2. Change a keycap palette or case finish.
3. Open `/?world=kigumi`, advance through the assembly, and replay a completed joint.
4. Move the time control toward night and enable wind if desired.

## Configuration

### Routes and state

The app entry in [src/main.jsx](src/main.jsx) selects the world from the URL. The pavilion is selected by `?world=kigumi` or the exact path `/world/kigumi`; other values open Mechanical Garden. React lazy-loads each world.

World state uses Zustand in the browser session. The React worlds do not persist preferences or progress across reloads. The standalone wireframes use their own local storage keys and do not configure the 3D application.

### Build and static hosting

Build and preview locally:

```bash
npm ci
npm run build
npm run preview
```

Deploy the generated `dist/` directory to a static host. The wireframe archive is outside Vite's `public/` directory, so copy it into the build output if you want to host those pages too:

```bash
node -e "require('node:fs').cpSync('wireframes', 'dist/wireframes', { recursive: true })"
```

For direct visits to `/world/kigumi`, configure the host to serve `index.html` as the SPA fallback. The query route `/?world=kigumi` works without that path rewrite. The repository does not include an automated publishing pipeline for the linked ChatGPT Site; pushing to GitHub does not publish that site.

### Technology and project structure

| Area | Technology |
| --- | --- |
| UI and build | React 18, Vite 6 |
| 3D rendering | Three.js, React Three Fiber, Drei |
| State | Zustand |
| Animation | GSAP |
| Pavilion ambience | Howler.js with a bundled OGG loop |
| Keyboard sound | Browser Web Audio API |
| Design archive | Standalone HTML, CSS, and JavaScript |

```text
.
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
├── src/
│   ├── main.jsx                 # World routing and lazy imports
│   └── worlds/
│       ├── catalog.js           # Available and planned world metadata
│       ├── keyboard/            # Keyboard UI, scene, state, and styles
│       └── kigumi/              # Pavilion UI, scene, state, and styles
├── wireframes/                  # Standalone product concept pages
├── docs/images/                 # Screenshots and documentation diagrams
└── LICENSE
```

To add a world, implement its scene and interface, register its route in `src/main.jsx`, and add its metadata to `src/worlds/catalog.js`. A catalog entry by itself does not create a working world.

## Roadmap

| Area | Current state | Potential next step |
| --- | --- | --- |
| Interactive worlds | Keyboard and pavilion are implemented | Improve interaction and performance on more devices |
| New worlds | Aurora Drift and Mosslight Grove are catalog concepts | Build independent scene modules |
| Discovery | In-app world selector; archive concepts are separate | Bring discovery pages into the application |
| Branding | Project name differs from existing app/archive branding | Align product UI and metadata |
| Delivery | Vite build works; archive copy is manual | Automate archive packaging and review bundle size |
| Quality | No test or lint scripts are configured | Add focused checks for core interactions |

Roadmap items are possibilities, not released features or delivery commitments.

## Contributing

For substantial changes, open an [issue](https://github.com/01aptx01/3d-immersive-website/issues) to discuss the scope, then submit a focused pull request.

Before submitting a change:

- Run `npm ci` and `npm run build`.
- Check both implemented world routes and any archive pages you changed.
- For visual or interaction changes, include screenshots or a recording with viewport and steps to reproduce.
- Keep documentation aligned with the code and label concepts separately from implemented features.

## License

This project is distributed under the [MIT License](LICENSE).

**Author:** [Teeranan Pakdeekhan / 01aptx01](https://github.com/01aptx01)

**Historical context:** [Kiyomizu-dera architecture history](https://www.kiyomizudera.or.jp/en/learn/). This reference does not imply endorsement or historical reconstruction accuracy.

**Project images:** Browser captures and diagram sources are documented in [docs/images/README.md](docs/images/README.md).

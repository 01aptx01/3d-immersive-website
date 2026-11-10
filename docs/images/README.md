# Documentation image manifest

These images accompany the root [README](../../README.md). Application images are actual browser captures, not generated product mockups. Keep them in the repository so the README does not depend on expiring image-host links.

## Capture context

- **Source revision:** `b8c035017b37993e7b7b452120d7f5da8c32362c`.
- **Subsequent compatibility review:** `4bf8008c47913d0a75743eb135fb61b29887b16f`. Its pavilion instancing, interaction, shadow, and short-landscape improvements are preserved and documented. These captures record the earlier revision above, whose illustrated subjects and assembly sequence remain applicable.
- **Capture date:** 11 November 2026, Asia/Bangkok.
- **Local application:** Vite development server at `http://localhost:5173`.
- **Browser:** Chromium, automated with Playwright, using a WebGL 2 software renderer in the capture environment.
- **Desktop viewport:** 1440 × 960, device scale factor 1.
- **Mobile viewport:** 390 × 844, device scale factor 1; viewport emulation, not a physical-device performance test.
- **Motion preference:** pavilion captures use the browser's reduced-motion setting to keep assembly transitions short in the software-rendering environment.
- **Published Site:** <https://immersive.teerananpakdeekhan.chatgpt.site/>.
- **External assets:** original font and scene-asset responses were relayed through the environment's HTTP client for browser access. Application source, rendering parameters, and asset contents were not changed for the screenshots.

## Application screenshots

| File | Source / state | Reproduce |
| --- | --- | --- |
| `mechanical-garden.jpg` | `/`, default assembled keyboard | Open the default world with the customization drawer visible. |
| `keyboard-exploded.jpg` | `/`, exploded view | Close the drawer and set Explode to 65%. |
| `keyboard-isolation.jpg` | `/`, isolated switches | From the exploded view, select Switches in the layer rail. |
| `keyboard-customization.jpg` | `/`, customized keyboard | Show all layers, set Explode to 0, choose Matcha, Mint, and Brass. |
| `keyboard-input.jpg` | `/`, active key | With the drawer closed, hold the physical A key. |
| `world-directory.jpg` | `/`, world selector | Open Worlds from the top controls. |
| `pavilion-frame.jpg` | `/?world=kigumi`, stage 04 | Hold Build through foundation, pillars, beams, and the joint stage. |
| `pavilion-joinery.jpg` | `/?world=kigumi`, completed connections | Complete all six connection animations at stage 04. |
| `pavilion-dawn.jpg` | `/?world=kigumi`, complete | Continue through rafters, roof tiles, and shoji screens. Keep Time of day at 0. |
| `pavilion-night.jpg` | `/?world=kigumi`, complete at night | Move Time of day to 100. |
| `pavilion-mobile.jpg` | Complete pavilion, narrow viewport | Use the night state at 390 × 844. |
| `wireframe-home.jpg` | `/wireframes/index.html` | Open the standalone home archive page. |
| `wireframe-explore.jpg` | `/wireframes/explore.html` | Open the archive directory with its default filters. |
| `wireframe-about.jpg` | `/wireframes/about-updates.html` | Open the archive's About and updates page. |
| `published-site.jpg` | Public ChatGPT Site | Open the published URL above. This is a separate deployment and may differ from local source. |

The wireframe screenshots show the actual HTML/CSS prototype; their scenery is 2D artwork, not implemented 3D scenes. Their example world data and visitor figures are not production analytics.

## Documentation diagrams

| File | Basis |
| --- | --- |
| `tech-stack.svg` | Dependency versions from `package-lock.json`, plus imports and behavior in the world modules. |
| `architecture.svg` | Routing in `src/main.jsx`, metadata in `src/worlds/catalog.js`, independent world folders, and the separate HTML archive. |

Both SVGs are authored explanatory diagrams with fixed backgrounds and accessible titles/descriptions. They are not application screenshots.

## Updating the images

Capture the feature through its real controls, keep the existing filenames when the subject remains the same, and update the root README's alt text when behavior changes. Check that the scene has finished loading and that the image matches its caption. Record the new source revision and viewport here. Do not substitute placeholder illustrations for application evidence.

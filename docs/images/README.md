# Documentation image manifest

These images accompany the root [README](../../README.md). Application images are actual browser captures, not generated product mockups. Keep them in the repository so the README does not depend on expiring image-host links.

## Capture context

- **Local source revisions:** `worlds-home.jpg`, `mechanical-garden.jpg`, `keyboard-exploded.jpg`, `keyboard-isolation.jpg`, and `world-directory.jpg` were captured from `162962e60e5c0cec15e1d462630463361f8f55dd`; pavilion images use `c568fd23ffe49e21d09c9c9a0832385bd17670b1`; the remaining keyboard and archive images use `9d7306f7ad7d704f1fc7e89b306dd6eaa1e84121`.
- **Deployed Site capture:** `published-site.jpg` documents an earlier deployment and may differ from the current Site.
- **Capture dates:** Updated home and keyboard images: 12 November 2026; earlier captures: 11 November 2026, Asia/Bangkok.
- **Local application:** Vite development server; port 5185 for the latest captures and 5173 for the earlier set.
- **Browser:** Chromium, automated with Playwright, using a WebGL 2 software renderer in the capture environment.
- **Desktop viewport:** 1440 × 960, device scale factor 1.
- **Mobile viewport:** 390 × 844, device scale factor 1; viewport emulation, not a physical-device performance test.
- **Motion preference:** the latest home and keyboard images and the pavilion captures use the browser's reduced-motion setting.
- **Published Site:** <https://immersive.teerananpakdeekhan.chatgpt.site/>.
- **External assets:** original font and scene-asset responses were relayed through the environment's HTTP client for browser access. Application source, rendering parameters, and asset contents were not changed for the screenshots.

## Application screenshots

| File | Source / state | Reproduce |
| --- | --- | --- |
| `worlds-home.jpg` | `/`, world previews | Open the home page with Mechanical Garden selected. |
| `mechanical-garden.jpg` | `/?world=mechanical-garden`, default assembled keyboard | Open the keyboard world with the customization drawer visible. |
| `keyboard-exploded.jpg` | `/?world=mechanical-garden`, exploded view | Close the drawer and set Explode to 65%. |
| `keyboard-isolation.jpg` | `/?world=mechanical-garden`, isolated switches | From the exploded view, select Switches in the layer rail. |
| `keyboard-customization.jpg` | `/`, customized keyboard | Show all layers, set Explode to 0, choose Matcha, Mint, and Brass. |
| `keyboard-input.jpg` | `/`, active key | With the drawer closed, hold the physical A key. |
| `world-directory.jpg` | `/?world=mechanical-garden`, world selector | Open Worlds from the top controls. |
| `pavilion-frame.jpg` | `/?world=kigumi`, stage 04 | Start Build and pause at the joint stage, or step through the first four stages. |
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

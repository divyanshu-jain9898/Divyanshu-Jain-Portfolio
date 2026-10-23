# Divyanshu Jain — Interactive Showcase

A full-screen, chapter-by-chapter presentation of my SP3D / Smart 3D work. It is a separate app from the main portfolio in the repository root and does not share any files with it.

Each section is its own animated page. Use **Next / Previous**, the arrow keys, the mouse wheel, a swipe, or the **Chapters** menu to move between them. A 3D particle field (Three.js) behind every chapter morphs into a new shape on each transition.

## Chapters

| # | Chapter | What's interactive |
|---|---------|--------------------|
| 01 | Introduction | Portrait reveal, floating tags, particle plant model |
| 02 | About | Holographic portrait scan, animated counters |
| 03 | Skills | Rotating skill orbit — pick a node to open its panel |
| 04 | Experience | 3D flip cards |
| 05 | SP3D AI Assistant | Chat simulation with an approval step + demo video |
| 06 | AI Assistant · Mobile | Phone mock-up playing the Android demo, animated data flow |
| 07 | SP3D → Web3D | Opens the real exported plant in a live 3D viewer; simulation filmstrip |
| 08 | CAD → SP3D | Before/after slider for Plant 3D → SP3D and Revit → SP3D |
| 09 | Admin & modeling tools | Tool launcher with auto-cycling app window |
| 10 | Bulkload & catalog data | Live pipeline diagram, screenshot galleries |
| 11 | Symbols & supports | Flange bolt resolver (Class 150 / 300 / 600), clickable support-library board |
| 12 | Demo theater | 3D cover-flow of every demo video |
| 13 | Beyond SP3D | Hologram assistant video, AI & software builds |
| 14 | Motion & avatars | Skeleton motion capture, avatar assistant and a body-controlled game (muted videos); a particle skeleton that switches poses |
| 15 | IoT & robotics | "Power on" the hardware builds, photo galleries |
| 16 | Contact | Copy-to-clipboard email, phone, LinkedIn |

SP3D work comes first; non-SP3D projects are at the end.

## Controls

| Action | Input |
|--------|-------|
| Next / previous chapter | `→` / `←`, `Space`, `Page Down` / `Page Up`, mouse wheel, swipe, or the buttons |
| First / last chapter | `Home` / `End` |
| Jump to any chapter | **Chapters** button, the progress bar, or a link like `#/web3d` |
| Hands-free tour | **Auto-play** |
| Close a video or gallery | `Esc` |

## Run locally

It is a static site with no build step:

```bash
# from the repository root
python3 -m http.server 8000
# open http://localhost:8000/showcase/
```

## Deploy (GitHub Pages)

When GitHub Pages is enabled for the repository, this app is served at `/showcase/` next to the main portfolio, for example:

`https://<user>.github.io/<repository>/showcase/`

Everything it needs lives in this folder: Three.js and GSAP are vendored in `vendor/`, and the media is in `media/`. The folder can also be copied into its own repository and published from that repository's root.

## Structure

```
showcase/
├── index.html          16 chapter sections, chrome, overlays
├── css/app.css         design tokens, layouts, responsive rules
├── js/data.js          content (skills, tools, videos, galleries…)
├── js/app.js           navigation, transitions, autoplay, interactions
├── js/scene.js         Three.js particle stage (GPU morphing)
├── vendor/             three.module.min.js (r160), gsap.min.js (3.12.5)
├── media/              posters, screenshots, demo videos, previews
└── demo/sp3d-to-web3d/ self-contained live 3D viewer of a sample plant
```

## Notes

- Respects `prefers-reduced-motion`: transitions get shorter, and the looping effects and auto-playing previews are turned off.
- If WebGL isn't available, the particle background is skipped and everything else works.
- Smart 3D is a trademark of Hexagon. Revit and AutoCAD Plant 3D are trademarks of Autodesk.

# Divyanshu Jain — SP3D Developer Portfolio

A static, animated portfolio that showcases Smart 3D (SP3D) development work: the SP3D AI Assistant (MCP), admin and bulkload tools, CAD → SP3D conversion pipelines, the SP3D → Web3D live viewer, and other software projects.

## Structure

```
index.html                  Single-page site
assets/css/style.css        Design tokens, layout, components, motion
assets/js/data.js           All project / skills / gallery content (edit this to update the site)
assets/js/main.js           Interactions: nav, reveals, filters, modal, tabs, contact form
assets/js/hero3d.js         Three.js interactive plant model in the hero
assets/img/                 Portrait, posters, screenshots
assets/video/               Demo videos + short hover previews
demos/sp3d-to-web3d/        Self-contained SP3D → Web3D viewer export (live demo)
```

No build step. Everything is plain HTML, CSS and JavaScript; Three.js loads from the jsDelivr CDN.

## Run locally

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

## Publish on GitHub Pages

1. Repository **Settings → Pages**.
2. **Build and deployment → Source:** *Deploy from a branch*.
3. **Branch:** the branch holding this site, folder **/ (root)** → **Save**.

The site is live a minute later at the URL GitHub shows on that page.

## Updating content

- Projects, skills, other work and gallery items live in `assets/js/data.js`.
- New demo videos go in `assets/video/` (H.264 MP4 with `+faststart`); add a 6–8 s muted preview in `assets/video/previews/` for the hover effect.

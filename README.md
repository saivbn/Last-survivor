# Last Survivor — Three.js Battle Royale Prototype

A standalone, local single-player third-person battle-royale prototype built with Three.js and Vite. It uses procedural 3D geometry, generated terrain, lighting, real-time shadows, a third-person follow camera, basic enemy AI, projectiles, pickups, health/armor/ammo, a shrinking safe zone and a tactical minimap.

> This is an original PUBG-inspired learning prototype, not PUBG, not an online multiplayer game, and not a commercial-grade asset pack. The environment and characters are procedural placeholder art. The upgraded build adds terrain color variation, instanced grass detail, island water, stronger lighting/shadows, roof silhouettes, basic obstacle collision, camera-reticle shooting and mobile touch controls. Replace the placeholders with licensed GLB/GLTF models, PBR textures, animation clips and audio to reach a higher visual fidelity.

## Requirements

- Ubuntu 22.04 or newer (other Linux distributions should also work)
- Node.js 20 LTS or newer
- npm
- A browser with WebGL 2 enabled 

## Install Node.js on Ubuntu

Recommended using NodeSource Node.js 22 LTS:

```bash
sudo apt update
sudo apt install -y curl ca-certificates
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
node --version
npm --version
```

## Run the game

Extract the ZIP, then:

```bash
cd last-survivor-3d
npm install
npm run dev
```

Open the local URL Vite prints, usually `http://localhost:5173`.

## Controls

| Input | Action |
|---|---|
| W / A / S / D | Move relative to camera direction |
| Mouse | Rotate third-person camera / aim direction |
| Left mouse button | Fire assault rifle |
| Shift | Sprint |
| Space | Jump |
| R | Reload |
| H | Use medkit |
| P / Esc | Pause (Esc also releases pointer lock) |

Click the game viewport to capture the mouse. Press Esc to release it. Click the viewport again to recapture.

### Mobile / touchscreen
- Left virtual joystick — Move
- Drag the right side of the game view — Look / aim
- FIRE — Shoot (hold for automatic fire)
- ↑ — Jump
- ↻ — Reload
- ✚ — Use medkit

Touch-first devices automatically use a lighter render scale and fewer scenery objects to help performance.

## Production build

```bash
npm run build
npm run preview
```

The production site is generated in `dist/` and can be hosted on any static web server.

## Project structure

```text
last-survivor-3d/
├── index.html
├── package.json
├── README.md
└── src/
    ├── main.js
    └── style.css
```

## Notes and next upgrades

- The game currently uses simple capsule-based operator meshes and procedural scenery. Add properly licensed GLB/GLTF characters, weapons, vehicles and building assets for production visuals.
- Add animation clips through `THREE.AnimationMixer` for locomotion, reload, recoil and hit reactions.
- Add collision/physics with Rapier or cannon-es before adding complex indoor spaces and vehicles.
- Add spatial audio, weapon sounds, footsteps, ambient wind and impact effects.
- Online multiplayer requires a separate authoritative server, networking, synchronization, matchmaking and anti-cheat; it is not included here.
- If the browser is slow, reduce renderer pixel ratio, tree count and shadow map size in `src/main.js`.

## Troubleshooting

**Blank screen / WebGL error:** Update your GPU driver and browser, then ensure hardware acceleration and WebGL are enabled.

**`npm: command not found`:** Install Node.js using the commands above, close and reopen the terminal, then check `node --version` and `npm --version`.

**Port 5173 is busy:** Run `npm run dev -- --port 5174` and open the URL shown.

**Mouse does not rotate camera:** Click inside the 3D viewport to enable pointer lock. Press Esc to release it.

## Free live deployment

See [DEPLOY_FREE.md](./DEPLOY_FREE.md) for Cloudflare Pages deployment using GitHub (automatic updates) or direct upload. For Vite, the production build command is `npm run build` and the output folder is `dist`.

# Aetherbound

Original browser battle demo inspired by elemental squad RPGs. Phaser 3.90 + TypeScript + Vite. All five heroes and the Hollowguard use original hand-painted raster artwork, with an original SVG environment; no Brave Frontier artwork is used.

## Complete roster artwork

Kael, Lyra, Orin, Ren, Mira and the Hollowguard each have six illustrated key poses created with the built-in Imagegen tool. Phaser sequences the poses with anticipation, attacks, hit reactions and recovery. Lyra casts water, Orin uses shield and root effects, Ren uses twin lightning slashes, Mira casts light and healing, and the boss charges Cataclysm. These are pose-based animation prototypes, not full frame-by-frame animation sets.

**Meet the characters**, **View design** on a card, or the boss name opens a gallery with character tabs, all six poses and an Original / New design comparison. Source artwork and prompts are in `art-source/kael-brief.md` and `art-source/party/`; runtime WebP atlases and portraits are in `public/assets/kael/` and `public/assets/characters/`.

To repack source images, install the optional `sharp` package or point `SHARP_MODULE` at an existing Sharp installation, then run `node scripts/prepare-kael.mjs` or `node scripts/prepare-party.mjs`. These scripts only slice, resize and pack the original images, preserving alpha. Normal development and production builds do not need Sharp.

## Run

```sh
npm install
npm run dev
```

Open the URL printed by Vite. Production: `npm run build`; deploy `dist/`. Checks: `npm test` and the TypeScript check included in build.

## Play

Each living hero acts once per turn. Use Attack (keys 1–5) or a charged Brave Burst. All-out attack (Space) coordinates all remaining heroes, using ready BBs. Hits from different heroes within 140 ms trigger Spark (+50% damage). Orin's BB gives a 50% squad damage reduction for the next enemy action. Mira heals living allies for 650 HP. Guard (G) ends the turn with a 65% squad reduction; it multiplies with Orin's shield. The boss attacks the squad every third turn. Auto, 2× playback, optional synthesized sound, instructions, victory/defeat and restart are included.

Prototype only: one encounter, five fixed heroes, no account or persistent progression. Mechanics are original demo rules, not a faithful reproduction of Brave Frontier formulas.

`src/battle.ts`: battle rules independent of graphics. `src/scene.ts`: Phaser pose animation and effects. `src/characters.ts`: character metadata and asset paths. `src/gallery.ts`: design gallery. `src/art.ts`: environment and original comparison art. `src/main.ts`: battle UI and orchestration.

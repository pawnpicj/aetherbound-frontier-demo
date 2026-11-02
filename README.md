# Aetherbound

Original browser battle demo inspired by elemental squad RPGs. Phaser 3.90 + TypeScript + Vite. Original SVG environment and squad art, plus a generated hand-painted Kael redesign; no Brave Frontier artwork is used.

## Kael redesign

Kael now uses original hand-painted raster art generated with the built-in Imagegen tool. Six illustrated key poses are sequenced with Phaser movement, anticipation, impact and recovery timing. His card has a dedicated portrait, and **Explore his new look** opens a showcase with all six poses and an Original / New design comparison. The other four heroes retain their initial SVG artwork.

Source artwork and the generation brief are in `art-source/`; runtime WebP assets are in `public/assets/kael/`. `scripts/prepare-kael.mjs` slices and packs the source atlas with alpha preserved. To regenerate the packed assets, install the optional `sharp` package or point `SHARP_MODULE` at an existing Sharp installation, then run `node scripts/prepare-kael.mjs`. Normal development and production builds do not need Sharp.

## Run

```sh
npm install
npm run dev
```

Open the URL printed by Vite. Production: `npm run build`; deploy `dist/`. Checks: `npm test` and the TypeScript check included in build.

## Play

Each living hero acts once per turn. Use Attack (keys 1–5) or a charged Brave Burst. All-out attack (Space) coordinates all remaining heroes, using ready BBs. Hits from different heroes within 140 ms trigger Spark (+50% damage). Orin's BB gives a 50% squad damage reduction for the next enemy action. Mira heals living allies for 650 HP. Guard (G) ends the turn with a 65% squad reduction; it multiplies with Orin's shield. The boss attacks the squad every third turn. Auto, 2× playback, optional synthesized sound, instructions, victory/defeat and restart are included.

Prototype only: one encounter, five fixed heroes, no account or persistent progression. Mechanics are original demo rules, not a faithful reproduction of Brave Frontier formulas.

`src/battle.ts`: battle rules independent of graphics. `src/art.ts`: SVG artwork. `src/main.ts`: Phaser animation and HTML controls. `src/style.css`: responsive interface.

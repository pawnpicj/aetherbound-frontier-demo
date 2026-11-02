# Aetherbound

Original browser battle demo inspired by elemental squad RPGs. Phaser 3.90 + TypeScript + Vite. All characters and environment illustrations are original code-generated SVGs; no Brave Frontier artwork is used.

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

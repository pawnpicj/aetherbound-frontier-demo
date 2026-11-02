# Aetherbound

Original browser battle demo inspired by elemental squad RPGs. Phaser 3.90 + TypeScript + Vite. All five heroes, the Hollowguard and the sanctuary background use original illustrated raster artwork; no Brave Frontier artwork is used.

## Sanctuary environment

The battle arena uses a painted forest cathedral ruin with an open stone terrace, distant waterfall and mist. The 2400×960 WebP is cropped behind a 1200×640 battlefield. Three heroes occupy the left column with two staggered to their right. Each round has its own enemy formation: five monsters, a solo boss, then five monsters with the boss behind their middle row. Foot positions determine sprite depth. Source artwork and the Imagegen prompt are in `art-source/environments/`; the runtime asset is in `public/assets/environments/`. Re-encode with `node scripts/prepare-environment.mjs` using the same optional Sharp setup described below.

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

The expedition has three sequential rounds: Forest ambush (five monsters, no boss), The ancient guardian (boss only), and The final stand (five monsters with the boss behind their middle row). The progress strip identifies the current round. Clearing an early round pauses the battle and reveals Next round; only clearing the final round shows victory. Auto continues through all three rounds automatically. Surviving heroes carry their HP and BB forward, recover 35% of maximum HP and gain 20 BB between rounds; fallen heroes remain fallen. Guard, shield, action flags and Spark timing reset. Cataclysm's three-turn cycle restarts each round. Restart always begins the entire expedition again.

Select any living enemy by clicking its sprite or its target button. Defeat every enemy in the current round; defeating the boss alone in the mixed round does not clear it. The game selects another living enemy when the current target falls. Each surviving monster attacks during the enemy phase; defeated enemies cannot attack. Three Bramble Imps and two Rift Wisps use original six-pose artwork generated with built-in Imagegen; see `art-source/monsters/README.md` for prompts and `scripts/prepare-monsters.mjs` for packing.

Each living hero acts once per turn. Use Attack (keys 1–5) or a charged Brave Burst. All-out attack (Space) coordinates all remaining heroes, using ready BBs. Hits from different heroes on the same target within 140 ms trigger Spark (+50% damage). Damage-role BBs splash 15% damage to other living enemies. Orin's BB gives a 50% squad damage reduction for the next enemy action. Mira heals living allies for 650 HP. Guard (G) ends the turn with a 65% squad reduction; it multiplies with Orin's shield. The living boss attacks the entire squad every third turn. Auto, 2× playback, optional synthesized sound, instructions, victory/defeat and restart are included.

Prototype only: one three-round expedition, five fixed heroes, no account or persistent progression. Mechanics are original demo rules, not a faithful reproduction of Brave Frontier formulas.

`src/battle.ts`: battle rules independent of graphics. `src/scene.ts`: Phaser pose animation and effects. `src/characters.ts`: character metadata and asset paths. `src/gallery.ts`: design gallery. `src/art.ts`: environment and original comparison art. `src/main.ts`: battle UI and orchestration.

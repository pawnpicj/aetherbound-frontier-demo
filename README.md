# aetherbound-frontier-demo

Original browser battle demo inspired by elemental squad RPGs. Phaser 3.90 + TypeScript + Vite. All five heroes, the Hollowguard and the sanctuary background use original illustrated raster artwork; no Brave Frontier artwork is used.

## Sanctuary environment

The battle arena uses a painted forest cathedral ruin with an open stone terrace, distant waterfall and mist. The PC version serves the original 1983×793 PNG without an additional lossy encode. Formations use a 1200×600 design grid. Three heroes occupy the left column with two staggered to their right. Each round has its own enemy formation: five monsters placed farther back on the right when there is no boss, a solo boss, then five monsters with the boss behind their middle row. Foot positions determine sprite depth. Source artwork and the Imagegen prompt are in `art-source/environments/`; the runtime asset is in `public/assets/environments/`.

## PC rendering

The visible world is 600 units tall, with its width following the arena's aspect ratio. Formation X coordinates map proportionally from the 1200-unit design grid; sprite aspect ratios stay intact. `src/rendering.ts` chooses a backing-canvas scale from the displayed width and device pixel ratio: at least 2× on desktop-sized arenas, capped at 3×. Phaser's game size and camera zoom use the same scale, preserving input coordinates. ResizeObserver updates width and density when the arena changes size. Labels and floating combat text rasterize at that scale. Smooth texture filtering is retained for painted artwork. This does not invent additional detail in source illustrations.

## Combat screen and action icons

The PC screen follows `art-source/ui/combat-screen-reference-v9.png`: a wide battlefield with individual HP/BB panels above the five heroes, and five portrait action cards immediately below it. The battlefield height adapts to leave room for all cards in a normal PC viewport. Guard, All-out and Auto remain available in the arena toolbar. Secondary controls, target buttons and round progress remain below the main combat screen. Mobile uses horizontally scrollable cards.

`src/combat-ui.ts` renders live hero HUDs and action buttons, including disabled, acted, fallen, BB charging and BB-ready states. New action tiles use Crossed swords and Crystal shine by Lorc from Game-icons.net (CC BY 3.0), with gold Attack treatment and elemental BB colors. Original SVG paths are preserved; credits and source links are in `public/assets/ui/CREDITS.md` and the app footer. `src/combat-ui.css` contains the screen layout. `design-qa.md` records visual comparisons and interaction checks.

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

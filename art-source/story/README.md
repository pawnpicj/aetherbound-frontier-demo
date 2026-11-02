# Chapter 1 — จุดเริ่มต้นของอัศวิน

Three original backgrounds generated with the built-in Imagegen tool for this project. Runtime WebP copies are in `public/assets/story/`; original PNGs remain here. Existing hero pose artwork is layered over these environments by `src/chapter-ui.ts`.

The opening is an illustrated, interactive story sequence, including a scripted defeat and one persistent random first summon. The existing three-round combat demo follows it. Repeat crystal collection and later summons are described in the story but are not implemented by this opening.

Repack with `node scripts/prepare-story.mjs` after installing optional Sharp, or set `SHARP_MODULE` to its existing installation.

## Final prompts

### forest

Use case: illustration-story. Generate a polished wide 16:9 cinematic environment for an original illustrated fantasy JRPG. A young novice swordsman is traveling to a distant royal capital, and a formidable goblin chieftain ambushes the forest path. Show only the goblin chieftain, on the right third: muscular moss-green goblin with tusks, battered iron armor, animal-hide mantle and a heavy chipped axe, aggressive stance. The left half is an empty mossy road for a game character sprite overlay. Ancient trees, distant ruined watchtower, glimpses of a deep gorge, late amber sunlight, teal forest shadows, painterly detailed anime RPG artwork, beautiful atmospheric depth. No other characters, no text, no UI, no logo. Full-bleed standalone scene.

### river

Use case: illustration-story. Generate a polished wide 16:9 cinematic environment for an original illustrated fantasy JRPG. A perilous forest gorge at twilight: a broken rocky precipice on upper left, rushing dark turquoise river far below, white spray and curling mist, ancient stone shrine steps at the far right riverbank half hidden by mossy trees. Dramatic diagonal composition from high cliff to river toward shrine. A somber, vulnerable turning point, magical teal shadows and last warm sunset. Painterly detailed anime JRPG environment, cohesive with a forest cathedral fantasy setting. No people or creatures, no text, no UI, no logo. Full-bleed standalone scene.

### shrine

Use case: illustration-story. Generate a polished wide 16:9 cinematic story environment for an original illustrated fantasy JRPG. Inside an abandoned mossy riverside shrine open to the forest: stone stairs emerge from turquoise water in lower left, fractured stone altar at center, an elegant luminous ghostly guardian deity floating behind the altar, made of translucent ivory and muted gold light with delicate long flowing robes and indistinct benevolent face, no angel wings. A tall slender dark stone summoning obelisk assembled from floating fragments hovers before the altar, its inset black-violet crystal glowing with restrained amethyst light, gold runic channels. Cinematic resurrection and pact mood, mysterious and hopeful, painterly detailed anime RPG artwork, forest-green teal palette with gold and violet focal lights. Leave lower third visually calm for dialogue overlay. No other people, no text, no UI or logo. Full-bleed standalone scene.

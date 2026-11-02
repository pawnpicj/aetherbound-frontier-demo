# Combat screen v9 design QA

final result: passed

## Target and evidence

- Source visual truth: `art-source/ui/combat-screen-reference-v9.png` (user-supplied reference, 1819×1094 pixels).
- Final implementation: `output/playwright/combat-ui-v9-desktop.png` (1819×1094 CSS pixels, device scale factor 1).
- State: round 1, turn 1, five living heroes, five monsters, idle. Initial HP and BB use actual game state rather than the reference's repeated placeholder values.
- Density: source and implementation were compared at the same 1819×1094 viewport and 1× screenshot density. The Phaser canvas itself uses a denser backing buffer.
- Full-view evidence: source and implementation were opened together in the same comparison tool result. Earlier captures: `combat-ui-v9-reference-size.png`, `combat-ui-v9-final.png`, `combat-ui-v9-approved.png`.
- Focused evidence: paired 740×224 crops from the bottom-left action-card region, `output/playwright/source-cards-v9.png` and `output/playwright/implementation-cards-v9.png`, reviewed together after the portrait scaling fix.
- Browser: existing Playwright browser session. The in-app UI tool failed to initialize with Windows CreateProcessWithLogonW error 1385; actual rendered screenshots and interactions were verified through the working browser session instead.

## Comparison history

1. **[P1, fixed] HUDs obscured the preceding hero's lower body.** The first capture used the old 640-unit field and placed the next row's HUD too high. Changed the field to 600 units, positioned HUDs relative to each hero's visible head, and kept the bottom monster's name/HP inside the arena. Post-fix paired full views show clear separation between each preceding hero and the next HUD.
2. **[P2, fixed] Portraits were too small compared with the source.** The gallery stylesheet overrode the combat portrait dimensions. Scoped the combat selector above that specificity and adjusted the final portrait crop to 270px. The paired card crops show large face/upper-body portraits in the same visual hierarchy as the reference.
3. **[P2, fixed] New HUD layer could cover combat numbers.** Moved hero damage/healing floats below the fixed HUD region and skill names above it. Enemy-phase rendering now updates the HUD immediately when damage resolves.

## Required fidelity surfaces

- **Fonts and typography:** retains Cormorant Garamond for hero names and DM Sans for combat UI. Hero names, role labels, HP values and button labels remain readable at the reference viewport. Live HP/BB copy differs intentionally from repeated placeholder numbers in the source.
- **Spacing and layout rhythm:** wide arena starts near the window edge; portrait cards attach directly below it. Five complete cards fit within 1819×1094 and 1366×768. No intervening target/command section breaks the arena-to-card composition. The compact top toolbar retains existing game controls; secondary utilities and round progress sit below the combat surface.
- **Colors and tokens:** preserves the dark teal/gold palette, green HP and elemental BB colors. Attack uses warm gold; ready BBs use their hero's accent, a readiness badge and restrained glow. Locked actions are visibly dimmed and disabled.
- **Image quality and assets:** original scene and all five hero images are reused. Painted sprites remain proportional as the arena widens. Attack and BB use real Game-icons.net SVG assets rather than emoji or drawn placeholders. Portrait crops are intentionally tighter than the prior UI. Source art remains unmodified.
- **Copy and content:** names, roles, current HP/maximum HP, BB percentages, READY, Attack and BB are tied to live state. Author/license attribution is present in the footer. Gallery, restart, help and audio remain available.

## Interaction and responsive checks

- Five Attack and five BB controls mount with descriptive accessible names.
- Attack disables once its hero has acted.
- A locked Lyra BB cannot be activated at 72%.
- Orin's BB activates and its field gauge drops from READY to 0%.
- Auto completes all three rounds and reaches victory with 43,600 total damage. All five HUDs show updated final HP and BB.
- Resizing from 1819×1094 to 1366×768 preserves target picking; clicking Bramble II selects Bramble II. Card bottom is 763px in the 768px-high viewport.
- At 390×844, page scroll width equals viewport width and all five action cards remain available through horizontal scrolling.
- Browser console: zero errors and warnings in the checked session.
- TypeScript check passed. Existing ten encounter/rule tests passed.

## Accepted differences and follow-up polish

- The user requested an approximate screen plus redesigned icons. New action tiles deliberately replace the reference's white sword square and large outlined BB lettering.
- The top Guard/All-out/Auto toolbar is retained for a fully playable game.
- P3: phone-sized HUD text is compact; this pass prioritizes the requested PC experience.

## Implementation checklist

- [x] Match the battlefield/card hierarchy.
- [x] Show five live HP/BB HUDs without obscuring adjacent heroes.
- [x] Replace both action icons and support all action states.
- [x] Preserve combat, target selection, gallery and round transitions.
- [x] Recompare corrected full view and focused card regions.
- [x] Verify the complete three-round battle and PC resize behavior.

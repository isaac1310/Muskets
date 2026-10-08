# Battle scene art sweep

The October 2026 sweep inspected live field, river, forest and fort screenshots against the drawing code. The latest checks are `screenshots/review-final-battle.png`, `screenshots/review-final-fort.png` and `screenshots/review-final-phone.png`.

| Area | Current state | Optional future refinement |
|---|---|---|
| Trees | Painted transparent oak and pine stand above cast shadows; both are embedded in the offline game. | Check scale and frame rate on a phone; add seasonal variants. |
| Houses | Painted timber cottages and stone townhouses appear in forts and city streets. Shell strikes swap in matching ruined paintings. Two houses stand outside the star fort so they remain visible when the garrison fills the interior. | Add more civilian building types and check city density at phone size. |
| Road and river | Road has ruts and scattered stones. River has banks, moving ripples, crossing wakes, reeds and a shallow ford. | Vary bank vegetation. |
| Hills | The hill raises the projected ground surface; figures, trees, markers and shots follow the same height, and ground clicks map back to the right place. The front slope now covers figures behind its crest. | Inspect frame rate on physical phones and refine slope texture at different zoom levels. |
| Forts and walls | Stone, timber and city defenses have 3D-style faces, masonry joints or timber grain, guns, stores, breaches and painted rubble. | Dedicated stone and timber paintings are integrated; physical-phone performance remains unmeasured. |
| Figures | National regulars, militia, cavalry and hussars have action poses; all seven armies have painted standards. Gun crews are separate targets and each casualty disappears from the gun. Infantry and militia now use four distinct painted walking frames; gun crews move during reloads. | Additional running and galloping frames could expand the animation library. |
| Effects | Smoke, wrecked guns, craters and wall gaps persist. Impact dust, cannon flashes and rubble use painted cutouts; projectiles have motion trails. | Staged flashes and ballistic fragments are integrated; additional impact variants are optional. |
| Controls | Selection and target rings have translucent fills; move goals use pennants, wall strength changes colour, banners have brass trim. | Pause/orders and half-speed added; 390×844 layout verified in desktop browser emulation. |

The desktop field remains narrow because its 400×600 battle canvas fits the available screen height. Dense starting formations still obscure some buildings inside forts, although the outer houses stay visible in **View fort**. A real 390-pixel mobile viewport check found the standalone game missing a viewport tag; that is fixed and the canvas and controls fit within 390 pixels. The 10-campaign smoke test, battle-control check, gun-crew casualty check and hill click check passed. Physical-phone frame rate and subjective listening remain unverified. A 20-second offline audio render had zero clipped samples (peak 0.524). This implementation pass is complete; the optional refinements above are not release gates.

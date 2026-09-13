# Stillwater redesign — release verification

Date: 2026-09-13. Status: implementation complete; visual/device acceptance pending.

## Design and behavior

The desktop uses a restrained slate, cream and sage palette, consistent window chrome, compact circular traffic lights, a shared local clock, personal introduction and listening room. The side app shortcuts are removed; the Dock retains every application. Dock captions are centered on an unscaled wrapper so PNG icons and drawn icons use the same label position. The document stays within one viewport; long content scrolls inside its application. Interface text is not selectable; text inputs and terminal content remain usable.

Stillwater renders a layered landscape with a Three.js shader. Sky, horizon, terrain and sunlight interpolate continuously through a 24-hour cycle. This is artistic local-clock lighting, not a location-based sunrise model. Settings offer an exact-minute preview, automatic time, static photo/blue/shuffle alternatives, reduced movement, lower GPU resolution, and an optional hemisphere-aware seasonal tint. Existing photo choices remain preserved. Older day-cycle preferences migrate to the living scene. Unsupported graphics retain the bundled image background. Hidden documents stop wallpaper animation; the wallpaper drops to low power behind Arcade.

The night sky now uses correctly converted colour values, two layers of varied stars, subtle twinkling and occasional meteor tracks. Meteors follow straight, constant-speed paths with growing tapered wakes and a fade envelope, measured in viewport-height units to preserve their trajectory angle. These are artistic animations, not astronomical observations. Daylight reveals instanced spring blossom petals, summer motes, lobed autumn oak leaves with veins, or soft winter snow. Particle positions wrap beyond the screen and do not accumulate numerical drift. Season changes blend; automatic calendar selection supports either hemisphere and manual previews. Atmosphere is enabled by default while existing palette and motion preferences remain preserved.

The wallpaper targets 60 frames per second with a capped pixel ratio, pauses while hidden, freezes continuous motion in low-power/reduced-motion mode, and applies static setting changes immediately. Stalled/resumed frames cannot produce a large particle jump. Particle rendering adds one instanced draw, without downloaded sprites or per-particle DOM elements. Actual frame pacing still requires device verification.

The coastal revision opens a visible bay between layered, textured headlands, with small pines and shoreline detail. Land remains anchored while mist, clouds, wave bands and light move slowly. Water has its own dark palette, filtered ripple frequencies, a broken sunlight path and restrained, distorted reflections from the same star field. It does not mirror the full sky. The scene is mirrored by default; Settings can restore the original orientation, including photo backgrounds. Sky, land and reflections use the same mirrored coordinates. Meteor starts are now 8–16 seconds apart, about 50% more frequent than the previous 18-second slots. Version-4 wallpaper and season selections survive the new mirror preference migration.

The listening room supports official Spotify embeds and full local-file playback without a new paid service. Audio queues provide play/pause, skip, seek, volume, repeat and removal. Source handoff prevents simultaneous local/embedded audio, including stale media events. File object URLs are released on removal/unmount. A native modal contains keyboard shortcuts and restores focus on close. Spotify previews remain service-controlled; credentialless-capable isolated browsers can embed, while other isolated browsers retain an external Spotify link. The real terminal's isolation headers are unchanged. No default playlist or audio files have been supplied. Owner configuration and browser limitations are documented in [MUSIC_SETUP.md](MUSIC_SETUP.md).

After Hours replaces the old 2D canvas loop with three separate components: pure game state/physics, Three.js rendering, and accessible React controls. Orbit Pinball has mirrored physical flippers and bumper collisions; Rally Room has paddle reflection and rally scoring; Nightshift has a 3D road, bike models, traffic, braking, boost energy and collision immunity. The simulation runs at 120 Hz independently of display refresh. GPU resources are released on game change and close. The three games are original small games, not copies or emulations of commercial titles.

## Functional repairs

- Wallpaper preload and fade cleanup no longer cancel one another.
- Failed photo loads fall back to a bundled phase image; obsolete image callbacks cannot overwrite the current choice.
- Shader shape math avoids negative-base exponent operations that are undefined on some graphics drivers.
- Arcade normalizes shifted keys so boosting cannot latch steering or braking. Game selection has keyboard-operable tabs and labelled panels. Initial HUD state no longer reads refs during render.
- Keyboard-only focus covers custom controls while window containers keep their unobtrusive active styling. Device connection status has accessible text.
- The menu and desktop clock share one minute-aligned subscription and refresh on focus/visibility changes.
- Exact minute display avoids floating-point rounding errors.
- Real device connection status replaces the simulated Wi-Fi switch that hid the portfolio.
- Window focus follows keyboard and pointer interaction. Titlebar double click maximizes/restores. Mobile keyboard resizing does not overwrite saved desktop dimensions.
- Spotlight does not restore focus to the old window after launching an app.
- Finder Escape applies only when Finder is active and no modal is open. Search, history and view controls remain intact. Curated repository visibility was checked again; Safari supplies recently updated public repositories.
- Photos uses a varied, rotated masonry collection. Undo restores image position, favorite, photo wallpaper and the previous automatic/manual time preference. Wallpaper state accounts for the current scene.
- GitHub profile/repositories render before optional stars finish loading. Failed star refreshes preserve the last loaded collection. Timeouts, partial-data warnings, refresh errors and full-collection links are explicit.
- The real WebContainer/xterm shell remains the default. Restoring/focusing Terminal refits and focuses the shell. Unexpected shell-exit rejection produces a retry state.

## Verified automatically

`npm test`: 55 passed. `npm run build`: passed. `npm run lint`: no errors or rule warnings. `git diff --check`: passed.

Tests cover equivalent simulation results at 30/60/120 display FPS; stalled-frame bounds; actual bumper/paddle points; life loss/game over; boost/brake behavior; road bounds; collision immunity; finite long-run state; pause/resume/restart/app switch; day-cycle continuity including midnight; all 1,440 minute values; legacy/corrupt preferences; Finder navigation; photo deletion/Undo; photo scene switching; shared window controls; Spotlight focus; partial GitHub loading; safe browser URLs; blocked storage; window geometry and z-order.

Additional checks cover 30 meteor events over six simulated minutes and trajectories across four viewport shapes, 8–16 second event intervals, linear heads and trailing wakes, fade envelopes, particle bounds/wrapping over 24 simulated hours, every calendar month in both hemispheres, saved season overrides, mirror migration/renderer updates, renderer suspension/resumption/disposal, immediate static lighting updates, shifted steering release during boost, accessible game-tab navigation, failed wallpaper loads and preservation of cached stars. Music coverage includes URL validation, file limits, import/deduplication, queue controls, seek/volume, source handoff, stale media events/rejections, blocked playback, storage, iframe isolation fallbacks and resource cleanup.

The DOM tests use JSDOM with mocked graphics and audio. They prove event/state behavior, not appearance, GPU compilation, audio output, real pointer capture, mobile keyboard behavior, network provider availability or WebContainer boot. The new coastal vertex/fragment pair also passed offline `glslangValidator -l` language/link checks with Three.js r186's WebGL2 conventions and actual colour-space chunks. That check does not render the scene or establish device performance.

The Three.js chunk is lazy loaded and approximately 132 kB gzip. Vite reports a nonfatal 500 kB uncompressed chunk-size advisory. The baseline-browser metadata package also reports stale metadata. Neither is an application runtime error; neither has been hidden by relaxing validation.

## Remaining acceptance gate

The available browser rejected the local preview under its URL policy. No replacement browser, hidden browser command or other bypass was used. No screenshots or successful live gameplay session are claimed for this revision. Keep this release in review until these checks are completed:

1. Desktop Chrome/Firefox/Safari: inspect the home composition, all window controls, drag/resize/maximize, keyboard focus and Dock state. Confirm no document scroll at 1440×900, 1024×768, 390×844 and landscape phone sizes.
2. Settings: scrub dawn/day/evening/night, reset to local time, cross midnight or change the device time zone, suspend/resume the tab, toggle motion and low power, inspect both hemispheres and all four season previews. At night watch at least 30 seconds for shooting stars; during daylight inspect petal/oak silhouettes, flutter and off-screen wrapping. Check mirrored/unmirrored coastlines, sun alignment, restrained night-water reflections and filtered wave motion. Confirm smooth colour/season transitions, stable performance, no shader errors and a usable fallback without WebGL.
3. Arcade: visually inspect each 3D scene, play at least two full runs each, use simultaneous touch flippers, test steering/boost/brake, pause/resume, switch apps, minimize, close and reopen. Confirm real scoring, fair collisions, frame pacing and no accumulating WebGL contexts. Tune game feel from these real sessions.
4. Terminal over deployed HTTPS: run `node --version`, `npm --version`, `npx --version`, a small Node expression, and shell commands. Resize, minimize/restore, exit/restart and retry failures. Repeat with an Android keyboard and Safari. Preserve existing cross-origin isolation headers.
5. Photos: load actual image assets, open/step the lightbox, favorite, set a wallpaper, delete/Undo, restore originals, reload preferences. Verify optional upload success/failure if credentials are configured.
6. Finder/Safari/Contact/Résumé: inspect current source links, GitHub refresh/search/partial outage, copy email, actual PDF rendering/download, image preview, and Spotlight launches from an already-focused app.
7. Music: play actual local audio, import/remove tracks, seek, adjust device volume, reach queue end, repeat, switch to/from a real Spotify link and close the library. Confirm no overlapping sound, readable compact layouts and working external fallback under cross-origin isolation. Verify that media preferences do not change the owner's published playlist.

Merge only after the visual/device gate is satisfied. Production remains on the previous release until then.

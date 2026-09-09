# Desktop release — 2026-09-09

Implemented:
- Viewport-sized desktop with no page scrolling; long app content scrolls inside its window.
- Non-selectable interface text, with selection retained for inputs and terminal output.
- Desktop app shortcuts, show-desktop menu action, Settings and Arcade search entries.
- Round Photos traffic lights and a varied masonry photo collection.
- Current curated public GitHub projects, with source links instead of unverified demo links.
- Immediately available portfolio Terminal commands; optional Node runtime with bounded boot and shell startup.
- Saved wallpaper controls: device-local clock phases, five-minute phase rotation, motion, manual phase, photo choice and hemisphere-based seasonal colour grading.
- Original simple pinball, paddle-ball and traffic-dodging games, keyboard/pointer controls and device-local best scores. Games stop on blur/minimize; Start begins a new run.

Validation:
- Production TypeScript/Vite build passed.
- Nine automated regressions passed, covering geometry, window state, URL safety, storage, phase boundaries and seasons.
- Desktop browser checks: no page overflow, interface selection disabled, Terminal projects command, Photos layout and round controls, maximize/minimize/restore, all three game start controls, racer score increments, Settings persistence across reload, Finder source link.

Limits:
- Wallpaper uses colour grading and animated movement of existing imagery, not separate live video scenes, solar-position calculations or weather.
- Arcade titles are small original games, not commercial emulators or a full Road Rash recreation.
- Node shell depends on browser/runtime support; portfolio commands remain available independently.
- Physical mobile-device interaction, uploads, and third-party deployments were not exhaustively tested.
- MASTER_PLAN.md remains a roadmap; its other proposals are not implicitly complete.

## Terminal correction

The limited portfolio command desk was a regression and has been removed. Terminal now opens the real WebContainer Node shell directly. Startup and shell-spawn timeouts are 60 seconds; failures show the runtime error and a reload action. A real runtime session is required for node/npm/npx; this correction does not claim compatibility with every mobile browser. Build and regression checks do not substitute for successful runtime execution.

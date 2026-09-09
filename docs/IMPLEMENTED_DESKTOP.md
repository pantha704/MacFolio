# Desktop implementation — 2026-09-09

This document records what is implemented on `codex/macfolio-upgrade`. The broader ideas in `MASTER_PLAN.md` remain a roadmap, not a blanket completion claim.

## Delivered in this release

- A viewport-sized desktop with no document-level horizontal or vertical scrolling. Long content scrolls only inside its application window.
- Non-selectable interface copy, while form fields remain selectable and usable.
- Native-like window behavior: consistent open/focus/minimize/maximize/restore/close actions, bounded dragging/resizing, saved geometry, finite stacking, Dock toggles, and reversible Show Desktop.
- Consistent round traffic-light controls without the browser-looking focus ring reported in review.
- One typed app registry shared by the Dock, desktop shortcuts, and Spotlight.
- Finder history, back/forward, breadcrumbs, project search, sorting, icon/list views, project detail, About, Résumé, and Archive locations.
- Photos as a stable three-column masonry collection with varied image heights and subtle rotation, plus favorites, local removal with Undo, non-destructive original restoration, lightbox viewing, and wallpaper selection.
- Safari’s portfolio GitHub view with cached public profile data, repository and star tabs, search, real outbound links, cancellation, timeout, retry, and partial failure handling.
- A real WebContainer `jsh` terminal only—no simulated `npm`/`npx` command desk. Startup is singleton-backed and bounded; exit and failure states retain output and offer restart/recovery actions.
- A versioned wallpaper preference model with four local-clock phases, manual phase choice, slow shuffle, photo mode, subtle motion, low-data mode, and hemisphere-aware seasonal colour treatment. Wallpaper changes preload and crossfade without blanking the desktop.
- Three original, lazy-loaded arcade prototypes: pinball, paddle ball, and a traffic-dodging racer. They support keyboard/touch controls, lives, local best scores, restart, and pause on app switch, minimize, blur, or hidden tab.
- Direct Contact actions with a selectable email field and a copy fallback that selects the address when clipboard permission is unavailable.

## Verification evidence

- `npm run lint`: passed.
- `npm test`: 12/12 regression tests passed, including phase/season boundaries, safe storage, URL routing, window geometry, Dock behavior, Show Desktop restoration, and compact z-ordering.
- `npm run build`: production TypeScript and Vite build passed.
- Browser interaction checks passed for Finder history, GitHub API rendering, repository tabs, Photos masonry, round controls, wallpaper phase switching, document overflow, global text selection, Contact fallback, Dock focus, Show Desktop restoration, and Arcade pause/resume.
- The HTTP test environment correctly showed the Terminal’s secure-runtime compatibility state instead of a fake prompt. No application console exception or Vite error overlay was observed.

## Honest remaining boundaries

- The four phase images are distinct landscapes, not yet a commissioned same-composition scene across dawn/day/evening/night. There is no live video, weather, location, or solar-position mode.
- The arcade is a set of original portfolio-scale games, not a commercial emulator or a full Road Rash recreation. Its physics and art can still be taken much further.
- The real WebContainer shell still needs deployment-level validation over HTTPS with the required cross-origin-isolation headers; the local preview intentionally cannot provide that runtime.
- Physical iOS/Android interaction, Cloudinary uploads, and a full cross-browser matrix still require device/deployment testing.
- Shareable project routes, prerendered SEO pages, richer case-study content, albums/local photo imports, Finder Quick Look, context menus, window tiling, sound, and live-wallpaper media remain later roadmap work.

## Terminal correction

The limited portfolio command desk was a regression and is gone. Terminal now opens the genuine browser-hosted Node shell when the browser and deployment support it. If those requirements are absent, it explains the incompatibility and leaves every other portfolio app usable.

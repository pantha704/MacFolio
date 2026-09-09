# MacFolio: a living personal desktop

> Historical roadmap. See [IMPLEMENTATION_BLUEPRINT.md](./IMPLEMENTATION_BLUEPRINT.md) for the current source audit, requirement contracts, and release gates. In particular, the old recommendation below for a default simulated portfolio Terminal is superseded: the real Node shell remains the default.

Status: implementation roadmap, not a claim that the planned features already exist.
Prepared 2026-09-08. Baseline: master c9ccf24 and upgrade PR #3 at 7af0e3a. Continue on codex/macfolio-upgrade as requested. The current PR is an interim foundation; its landing-style introduction is not the final desktop direction.

## 1. Product direction and boundaries

Build an inviting, macOS-inspired personal world with useful applications, changing scenery, and a small retro arcade. Visitors should discover the owner’s work through the desktop itself. Preserve immediate access to Projects, About, Résumé, and Contact without a forced boot animation, login screen, or game.

Two equally valid journeys:
- A recruiter finds relevant work, understands the owner’s contribution, opens the résumé, and makes contact within a few obvious actions.
- A curious visitor explores windows, wallpapers, photos, developer tools, and games, discovering personality along the way.

Desktop-first does not mean desktop-only. Mobile uses full available application panels, large controls, touch navigation, and a reachable app switcher. Avoid shrinking a literal desktop to fit a phone.

Use macOS interaction principles as inspiration. Establish one coherent baseline for title bars, controls, spacing, menus, icons, and motion; do not mix generations of macOS indiscriminately. Use original or appropriately licensed assets. Do not imply this web experience can change the visitor’s real operating-system settings.

## 2. Repository findings and decisions

These are source-level findings, not browser observations. Original implementation and PR improvements are distinguished below.

| Surface | Evidence and present condition | Decision and next action |
| --- | --- | --- |
| Entry and loading | Original main.tsx booted WebContainer around the whole app. PR App.tsx lazy-loads application windows and Terminal owns its provider. | Keep deferred loading. Add lifecycle hooks for app focus, visibility, suspend, resume, and dispose before introducing games. |
| Window manager | Original hoc/WindowWrapper.tsx used imperative GSAP geometry without restoring saved normal dimensions. PR replaces this with bounded pointer interactions and saved component geometry. | Refactor into a tested desktop core. Geometry is not yet persisted across sessions; app instances are still one per WindowKey. |
| Window state | store/useWindowStore.ts uses broad data types, separate overlapping actions, and an ever-increasing z-index counter. | Introduce typed app payloads, a single activation policy, normalized stack ordering, and reserved overlay layers. Add multi-window support only for apps that need it. |
| Desktop identity | Original Welcome.tsx is decorative typography; PR adds a prominent introduction and project cards. | Evolve the introduction into a dismissible Welcome window. Restore a spacious desktop with folders, pinned apps, and optional small widgets. Keep a visible direct Work action. |
| Dock and menu bar | PR improves buttons/search; current menus are limited and Dock launch rules remain separate from the store. | Centralize commands. Add context menus, active-app menu, app switcher, Show Desktop, and settings. Keep browser-reserved shortcuts intact. |
| Finder and content | Original file actions omitted most preview types. PR Finder exposes project summaries and previews, but lacks a general virtual filesystem/history model. | Keep useful project content. Build typed folders/files, breadcrumbs, back/forward, sorting, list/icon views, and Quick Look. |
| Wallpaper preferences | systemStore.ts persists one wallpaper URL and gallery URLs. No time, season, video, or wallpaper manifest exists. | Create an explicit wallpaper subsystem; do not extend a single URL with scattered effects. |
| Gallery | PR adds lazy loading, modal viewer, favorites, upload limits, and failures. initialImages.json still depends on external URLs. | Keep and extend. Add albums, descriptive metadata, thumbnails, retry states, and local imports before expanding public uploads. |
| Safari | PR browserUrl.ts rejects unsafe schemes and correctly distinguishes the owner’s GitHub profile. GitHubProfile.tsx handles failures but still has large presentation code and three coupled requests. | Split data/presentation, cache successful responses, tolerate optional starred-repo failure, and add curated bookmarks/reading list. External browsing stays in real tabs. |
| Terminal | PR defers the real shell and cleans up streams/processes; stackfetch.ts still contains static resolution and synthetic uptime. | Default to honest portfolio commands. Keep a clearly labeled optional real shell; replace synthetic system facts with real session facts or remove them. |
| Contact and résumé | PR provides email/copy/social links and a PDF viewer. Identity is Pratham Jaiswal in source; résumé correctness is not verified. | Keep direct links. Confirm identity, résumé, and availability before adding claims. Do not invent achievements or client outcomes. |
| Styling | index.css retains extensive old ID-based styles alongside desktop.css; compact TSX and generated declarations remain. | Consolidate design tokens and app-scoped styles, format components, remove verified-dead scaffolding and generated declarations deliberately. |
| Build/dependencies | npm and Bun locks coexist. Vite/React/TS/Zustand already support the requested direction. Older xterm package and broad dependency inventory need maintenance review. | Keep stack and npm lock baseline. Audit before targeted upgrades; no ground-up framework migration without measured benefit. |
| Setup script | scripts/init-cloudinary.js contained a hardcoded API secret, unrestricted SVG acceptance, and could replace the gallery manifest after partial failure. | Immediate fix: environment credentials, image restrictions, fail-closed manifest update. Rotate exposed credentials outside Git; removal is not revocation. |
| Tests and release | PR has seven geometry/state/URL/storage tests plus CI; no browser suite or visual evidence. | Treat these as baseline logic checks. Add real browser coverage and measurable release budgets, not a blanket production-ready claim. |

Also inspect/remove unused App.css, duplicate GitHubProfile components, placeholder WindowManager.tsx, disabled menus, stale declarations, and unused public tutorial assets after checking imports. Do not delete source gallery originals merely because production currently references Cloudinary. Record licensing and attribution first.

## 3. Target architecture

Keep React, TypeScript, Vite, Zustand, and existing static hosting. Most requested features need no accounts, database, paid API, or server.

Proposed modules (future paths):
- src/desktop/: window geometry, stacking, focus, app registry, menu/command routing, docking and workspace persistence.
- src/apps/: Finder, About, Settings, Photos, Safari, Terminal, Arcade. Each app owns its UI and disposes its resources.
- src/wallpapers/: manifests, clock/solar resolver, renderer, transitions, resource budget.
- src/content/: owner profile, project records, case studies, credits; one source of truth for app views and direct pages.
- src/services/: optional GitHub/weather providers with cancellation, timeouts, cache policy, and typed results.
- src/preferences/: versioned settings and migrations. Store lightweight preferences in localStorage; use IndexedDB for local image blobs/notes/saves when needed.

App registry fields: id, name, icon, lazy loader, default/minimum window dimensions, supported commands, lifecycle capabilities, singleton/multiple-instance policy. Spotlight, Dock, desktop icons, and menus use this same registry.

Keep ephemeral drag position updates local; commit final geometry on pointer release. Do not write storage or render the whole desktop at every animation frame. Keep content data separate from runtime window state. Use a versioned session snapshot and an always-available reset-layout action.

## 4. Native-like desktop behavior

Priority 1: consistent activate/minimize/restore/close semantics, bounded windows, saved normal geometry, focus restoration, keyboard navigation, reduced-motion equivalents, and clear application loading/errors.

Priority 2: desktop folder selection, double-click convention with touch/keyboard equivalents, context menus, drag-to-arrange icons, breadcrumbs, window title double-click, dock open indicators and menus, Show Desktop, and a window overview.

Priority 3: tiling/snap previews, multiple Finder windows, desktop stacks, optional screen saver, and reusable animations. Do not add a decorative control that implies functionality it lacks.

Motion specifications should identify intent, duration, easing, interruption behavior, and reduced-motion replacement. Minimize should visually relate to its Dock icon. Restore returns to previous geometry. Rapid repeated actions must settle into the last requested state, with no invisible window intercepting clicks.

Sound is off by default and enabled through an explicit action. Settings only affect website audio. Simulated Wi-Fi must never be presented as a real network control.

## 5. Living wallpaper engine

Separate four concepts: scene (e.g. coast), time variant (dawn/day/dusk/night), season variant, and render mode (still/video). This avoids treating every preference combination as a new feature.

Initial art scope: one coherent scene with four time variants and mobile crops. Use original/licensed imagery. Later add short seamless videos with matching static posters, then optional seasonal scene packs. Avoid committing dozens of large videos before establishing budgets.

Modes:
1. Automatic local clock: proposed default buckets 05:00–08:00 dawn, 08:00–17:00 day, 17:00–20:00 dusk, otherwise night. These are an artistic approximation, not actual sunrise/sunset.
2. Solar mode: optional explicit city/coordinates or permission-based location. Calculate sun position locally where practical. Handle polar day/night and denied/unavailable location by falling back to the clock.
3. Manual: visitor selects a time or wallpaper; automatic changes stop until re-enabled.
4. Rotation: selected collection, explicit interval, no immediate repetition; manual selection takes priority. Suspend rotation while hidden, recompute on return instead of replaying missed changes.

Seasons: do not infer hemisphere from language or timezone. Offer Off, Northern, Southern, and manual selection. Near-equatorial climates do not map neatly to four temperate seasons; keep season mode optional and describe it as visual personalization. Weather integration is a later, separately enabled feature with stale-data indication and no dependency for normal rendering.

Manifest fields: scene ID, variant ID, phase, season/hemisphere applicability, image/video sources and formats, poster, dimensions, focal point, mobile crop, credit/license, average contrast/scrim preference. Validate duplicate IDs and missing asset files at build time.

Resolver precedence: explicit manual override → selected automatic mode → available matching variant → nearest phase in the same scene → scene default → bundled fallback. Failed preloads must leave the current wallpaper visible. Prepare the next image before crossfading; retain at most current and next decoded frames and release previous video resources.

Run one shared clock, not one timer per app. Recompute on minute boundaries, document visibility return, and relevant preference changes. Re-read device time/timezone so DST, midnight, travel, and sleep/resume work. Do not depend on an always-running interval.

Live mode: muted, plays-inline, short looping media; catch play() failure and keep poster. Reduced motion, explicit low-power preference, or unsupported media gets a still. Do not promise reliable automatic battery detection across browsers. Pause hidden-tab video and unnecessary covered-background motion. Keep sufficient contrast across every scene.

Acceptance: simulated clock tests for every boundary, DST dates, timezone changes, missing variants, failed decode, location denial, polar conditions, manual override, storage corruption, hidden-tab return, and reduced motion. Browser tests verify there is never a blank wallpaper during transition.

## 6. Applications with real purpose

| App | First complete slice | Growth after the slice works |
| --- | --- | --- |
| Finder | Typed virtual filesystem; history; breadcrumbs; list/icon view; search/sort; preview/open actions | Multi-select, drag organization, multiple windows, downloadable project bundles |
| About | Real biography, interests, skills linked to evidence, résumé/contact | Timeline, uses/setup page, selected learning notes |
| Projects | Two detailed case studies: problem, contribution, approach, trade-offs, screenshots, code/demo, status | Shareable routes, filters, measured results with provenance |
| Photos | Albums, accessible slideshow, favorites, image metadata, wallpaper integration | Local device imports in IndexedDB, export, optional public uploads only with quotas/moderation |
| Safari | Useful curated bookmarks, GitHub, clear external-tab behavior | Local reading list and curated project demo previews; no arbitrary scraping proxy |
| Terminal | help/about/projects/open/contact/theme/clear, history and completion, readable mobile output | Explicit advanced WebContainer shell, sandbox filesystem demos, downloadable command transcript |
| Settings | Wallpaper mode, appearance, motion, app sound, local data controls, reset layout | Import/export non-sensitive preferences, per-app options |
| Arcade | One polished game with start/pause/restart/mute/instructions/high score | Second game and achievements after measuring actual use |
| Notes / Music / Calculator | Optional backlog; add only if they enrich this portfolio | Notes can contain public dev notes plus clearly local scratchpad; music uses licensed tracks; calculator must actually calculate |

New controls need loading, empty, success, failure, keyboard, and touch behavior. For local data, state explicitly that it stays in this browser and can be cleared. A local high score is editable by the visitor and must not be marketed as a trusted global leaderboard.

## 7. Retro arcade

Start with original pinball: one table, convincing flippers/ball physics, score, lives, pause/restart, keyboard and touch controls, and optional sound. Keep physics simulation independent from React rendering. Use a fixed timestep with a capped catch-up budget; pause on blur/minimize/hidden tab and require explicit resume. Prevent game input from scrolling the page only while the game is active.

Evaluate Canvas plus a small physics library against a game framework in one bounded spike. Record bundle size, collision reliability, touch response, and cleanup. Do not choose a large engine purely for one table.

Then consider a Road Rash-inspired arcade racer with original name, art, music, and tracks: start with steering, speed, road curvature, obstacle collisions, checkpoints, and restart. Opponents/combat/multiple tracks are later scope. Recreating the entire original game would be a substantial separate project.

Do not bundle commercial ROMs, ripped music, or copied game assets without permission. If an open-source game is adapted, review both code and asset licenses and ship required attribution. Emulator support is an optional future decision, not the default implementation.

Acceptance: deterministic scoring/collision scenarios, pause does not advance time, high scores survive reload safely, touch/keyboard work, repeated open/close does not leak animation loops/audio, and game code is absent from initial loading.

## 8. Performance, accessibility, content, and operations

Proposed release budgets, to measure rather than claim today: initial JS <=150 KB gzip, initial still wallpaper <=400 KB on mobile and <=800 KB on desktop, optional game and video requests deferred until use. Target LCP <=2.5s, INP <=200ms, CLS <=0.1 at the 75th percentile once enough field data exists. Lab checks on a named throttling/device profile supplement, not replace, field results.

Audit image sizes and duplicated originals; generate responsive thumbnails separately from full-resolution assets. Static caching may be long-lived for hashed assets; HTML must allow new releases to become visible. Introduce service-worker offline behavior only after update/version recovery is designed, especially around the optional WebContainer runtime.

Accessible core: landmark structure, visible focus, readable contrast over all wallpapers, Escape behavior, touch targets, no required hover-only action, reduced motion, 200% zoom, and meaningful nonvisual game instructions. Games remain optional; portfolio information never requires playing them.

SEO: build direct, shareable project/about pages from the same content records, with prerendered useful text and per-page metadata. Desktop deep links open the matching app/project. Canonicals require the actual production domain. Add sitemap/robots only when routes/domain are settled. Never invent search ranking or performance claims.

Reliability: each app isolates errors; request cancellation and bounded retries; preserve last valid content; validate stored preferences; schema migrations and reset; avoid logging credentials or visitor content. If telemetry is introduced, choose minimal aggregate events and explicit purpose before selecting a provider. Do not add paid services simply for parity with a desktop OS.

Security work: rotate the exposed Cloudinary credentials; audit historical exposure and provider usage; never commit replacement secrets. Script sanitation in this revision does not rotate them. Revisit unsigned upload policy, server-enforced limits, third-party URL validation, and secret scanning. History rewriting is a separate coordinated operation, not a substitute for revocation.

## 9. Delivery sequence and exit gates

| Phase | Deliverable | Exit gate | Relative effort |
| --- | --- | --- | --- |
| 0 — Audit and plan | This document, module decisions, existing baseline checks, credential remediation notice | Roadmap distinguishes delivered/proposed behavior; no unverified success claims | Small |
| 1 — Desktop core | Typed app registry/commands, stacking/focus, shared tokens, Welcome window, mobile shell | Browser tests cover open/close/minimize/restore/resize, rapid actions, focus and small screens | Large |
| 2 — Settings and still wallpapers | Versioned preferences, one scene/four phases, preview/manual/automatic modes | Clock/fallback tests and no blank transitions; bundled default works without providers | Medium |
| 3 — Live and seasonal environment | Optional video, rotation, seasons, solar opt-in | Media budgets, reduced-motion fallback, pause/resume, denied location all verified | Medium–large |
| 4 — App depth and case studies | Complete Finder/Photos/Terminal/Safari slices and truthful project stories | Primary visitor journeys work with keyboard/touch and provider failure | Large |
| 5 — Arcade | One original pinball game; racer prototype only after first game passes | Input/physics/cleanup tests, local save recovery, independent lazy bundle | Large |
| 6 — Publication quality | Prerendered routes, metadata, asset budgets, browser matrix, release notes and rollback | No critical functional/accessibility defects; measured budgets; reproducible release | Medium–large |

Dependencies: phases 1–2 precede live wallpapers; app lifecycle precedes games; actual case-study content precedes SEO publication. Security remediation is immediate. Each completed phase reports changes, evidence, remaining limits, and the next bounded milestone. Effort labels are planning estimates, not promised deadlines.

Current merge scope: existing PR foundation + this plan + setup-script sanitation. Dynamic wallpaper phases, seasons, arcade, full native desktop interactions, and comprehensive browser verification are NOT complete in this merge. Merging the foundation is explicitly authorized by the owner; it is not certification of the final vision.

## 10. Validation and next executable work

Current reproducible commands: npm ci; node --test tests/*.test.mjs; npm run build. Preserve the existing image edits in the working tree; they are not included in this planning change.

First implementation batch after this planning merge:
1. Make the command registry and typed window payload contracts.
2. Consolidate duplicate launch/stacking logic and add finite z-order normalization.
3. Define appearance tokens and move the introduction into a Welcome application while preserving direct project discovery.
4. Add Settings with local schema/version/reset; create wallpaper manifests without adding video yet.
5. Test a four-phase still-image scene end to end before introducing seasonal or solar complexity.

Before declaring any phase release-ready: check Chrome, Firefox, and Safari where supported; Android/iOS layouts; keyboard and touch; reduced motion; failed external requests; unsupported WebContainer; PDF fallback; blocked storage; repeated app open/close; and deployment headers. See REVIEW.md for the current foundation checklist. Browser validation was not performed by the earlier PR; do not silently mark it complete.

## Primary references

These references establish platform constraints; product choices above are proposed engineering decisions.
- Apple Wallpaper settings: https://support.apple.com/en-ie/guide/mac-help/-mchlp1103/mac
- Apple wallpaper customization: https://support.apple.com/en-in/guide/mac-help/mchlp3013/mac
- Page visibility: https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API
- Media autoplay: https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay
- WebContainer browser support: https://webcontainers.io/guides/browser-support
- WebContainer isolation headers: https://webcontainers.io/guides/configuring-headers

Apple documents dynamic appearance options. MDN documents visibility and autoplay constraints. WebContainer documentation confirms that the real shell brings browser/isolation constraints; the portfolio command mode should remain independently usable.

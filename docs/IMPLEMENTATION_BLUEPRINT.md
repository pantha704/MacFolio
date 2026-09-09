# MacFolio implementation blueprint

Prepared 9 September 2026. Source baseline: [`d7d9aaf`](https://github.com/pantha704/MacFolio/tree/d7d9aaf9428608d89326a60c7c1fe09c7979660d). Working branch: `codex/macfolio-upgrade`.

**Status: proposed implementation contracts, not completed features.** This document supersedes conflicting recommendations in `MASTER_PLAN.md`, particularly its suggestion to make simulated portfolio commands the default Terminal. The real Node shell remains the Terminal experience. No application changes or new runtime validation are part of this planning document.

## 1. The experience we are building

A personal desktop that makes Pratham's work immediately understandable and rewards exploration. A visitor should feel that the windows, apps, scenery, and small interactions belong to one system. The portfolio must remain useful when an optional runtime, media host, or API is unavailable.

Two primary journeys determine priorities:

| Visitor | Intended journey | Proposed success criterion |
| --- | --- | --- |
| Recruiter or collaborator | Understand identity → inspect relevant project → see contribution and evidence → résumé or contact | Work, résumé, and contact are each reachable from the initial desktop in one obvious action; a project case study takes at most one additional action. |
| Curious explorer | Open an app → rearrange the desktop → browse photos, use Terminal, change scenery, play | Every visible control has a real result; exploring cannot lose access to the portfolio or leave the interface stuck. |

The desktop is the single full-screen page. Long documents, project lists, photos, and Terminal history scroll **inside their applications**. We do not shrink all content until it fits, disable zoom, or hide unreachable content to manufacture a no-scroll result.

### Non-negotiable contracts

1. No page scrollbars in the interactive desktop at supported sizes. Menu bar, active app controls, and navigation remain reachable.
2. Interface labels and decorative text do not select during clicks or dragging. Inputs, editable documents, copyable email fields, and Terminal output retain useful text interaction.
3. Clicking a window does not draw a thick blue perimeter. Keyboard navigation has a restrained, clearly visible indicator on the actual control.
4. Traffic lights are consistent circles with predictable close, minimize, and maximize/restore behaviour in every app.
5. Terminal runs a real browser-hosted Node environment. A mocked command form cannot substitute for `node`, `npm`, or `npx`.
6. Photos retain an informal, varied arrangement. Opening, favoriting, or resizing does not randomly reshuffle the collection.
7. Wallpaper follows the visitor's local time by default. Manual choices take precedence. Location access is optional.
8. Portfolio content describes verified work. Live links, ownership, outcomes, and repository freshness are not invented.
9. Games have complete start, pause, resume, game-over, and restart flows, including touch controls.
10. We release against recorded acceptance evidence. A successful build alone does not establish that the experience works.

## 2. What the current repository actually establishes

The rows below distinguish source facts from unverified behaviour. Screenshots and earlier checks are useful regression references, but are not a new cross-device certification.

| Area | Current source evidence | Remaining gap or uncertainty |
| --- | --- | --- |
| Desktop | `Welcome.tsx`, `desktop.css`: fixed desktop, six shortcuts, no page overflow rules, selection exceptions | Small screens, browser chrome, software keyboard, zoom, and nested app overflow need systematic checks. |
| Window controls | `WindowControls.tsx`, `WindowWrapper.tsx`: shared controls, bounded drag/resize, normal/maximized geometry | Focus and activation are distributed; geometry is component-local; resize does not explicitly promote focus. |
| Window state | `useWindowStore.ts`: many overlapping actions and growing z-index values | Dock and store toggle semantics differ; typed payloads, finite stacking, and lifecycle contracts are missing. |
| Terminal | `Terminal.tsx` opens the real shell; boot and shell startup have 60-second UI limits | Successful real `npm`/`npx` execution on the production deployment has not been established by the recorded checks. A UI timeout does not cancel a pending runtime boot. |
| Terminal focus/lifecycle | `TerminalBox.tsx`: xterm fitting, input/output streams, process cleanup; shell exit closes the window | Late startup can request focus after another app is active. Exiting loses the visible final output. Retry and late completion need explicit ownership. |
| Wallpaper | `appearance.ts`, `ambience.ts`, `DynamicWallpaper.tsx`: local clock buckets, tint, transform motion, phase cycling | One image receives effects. There are no matched scene variants, real video scenes, solar calculation, or asset-aware slideshow. |
| Photos | `Gallery.tsx`: masonry columns, subtle rotations, favorites, viewer, remote upload when configured | Photo dimensions and descriptive metadata are absent. Reset also clears favorites and wallpaper. "Reset wallpaper" can leave appearance mode set to photo. |
| Work | `data/portfolio.ts`: six curated public projects, used by Finder | IDs depend on array positions; old project data remains elsewhere. Rich case studies and current demo verification are incomplete. |
| GitHub app | Active `components/apps/GitHubProfile.tsx` requests profile, repositories, and stars together | One optional request can fail the entire view. New/Star buttons lack actions; API availability must not gate portfolio access. |
| Arcade | `Arcade.tsx`: three small original canvas games with local best scores | Stopping or losing focus discards the run. Simulation, rendering, input, scoring, and persistence are coupled. Pinball/racer are prototypes. |
| Contact | `Contact.tsx`: email, copy, and external social links | Copy failure suggests manual selection, but the surrounding selection rules make that fallback unreliable. |
| Maintainability | React, TypeScript, Vite, Zustand, GSAP already provide the needed foundation | Large overlapping stylesheets, duplicated definitions, compact components, and possibly unused declarations/scaffolding make changes harder to reason about. |
| Validation | CI runs nine Node logic tests and the TypeScript/Vite build | No committed end-to-end browser suite. Physical mobile and actual runtime execution remain distinct missing evidence. |

Current curated projects are Homeworker, Auto Apply Jobs, MacFolio, NimRoute, Threadline, and Leave Tracker. Their inclusion is an editorial choice, not a claim that they are all deployed, equally mature, or forever the newest repositories.

Investigate focus stealing, Spotlight result selection after filtering, and overlay stacking as **hypotheses to reproduce**, not already proven user-visible failures. Source review identifies a path to failure; browser reproduction establishes its actual impact.

## 3. Requirement map and completion evidence

Each change references one or more IDs. "Done" means the acceptance result is attached to the relevant commit; implementation alone is "built, unverified".

| ID | Deliverable | Evidence required before completion |
| --- | --- | --- |
| DESK-01 | One viewport, responsive desktop | Document dimensions do not exceed the viewport; long app content remains reachable; phone keyboard and landscape checks pass. |
| DESK-02 | Non-selectable chrome and unobtrusive focus | Mouse drag does not highlight labels; no window perimeter ring; keyboard and input/copy journeys pass. |
| WIN-01 | Shared window behaviour | Transition, geometry, focus, pointer-cancel, and rapid-interaction tests pass across all apps. |
| NAV-01 | Consistent Dock, menus, Spotlight, app switching | Every launcher reaches the same app and activation behaviour; no orphaned or decorative commands. |
| TERM-01 | Real shell reliability | Real HTTPS browser session executes Node, npm, and npx tests; captured outputs identify the tested environment. |
| TERM-02 | Terminal recovery and lifecycle | Delayed boot, failure, retry, exit, resize, minimize, close/reopen, and mobile input tests pass. |
| WALL-01 | Genuine time-aware scenes | Distinct matched phase assets; fake-clock transitions; manual priority; clock/timezone changes; fallback verification. |
| WALL-02 | Rotation, seasons, live modes | No-repeat rotation, selected seasonal variants, video failure/poster fallback, reduced-motion and hidden-tab checks. |
| PHOTO-01 | Varied, stable gallery | Desktop/phone visual references; stable identity/order; viewer navigation; image-failure and layout-shift checks. |
| PHOTO-02 | Useful personal photo actions | Favorites, local import, remove/undo, export, quota failure, and wallpaper integration pass without unrelated resets. |
| WORK-01 | Trustworthy current work | Curated records, verified source/demo status, stable IDs, and owner-supported project narratives. |
| FIND-01 | Finder navigation and preview | Back/forward, breadcrumbs, views, sorting, search, Quick Look, and direct project entry pass. |
| APPS-01 | Complete existing utilities | Contact, résumé/PDF fallback, GitHub/Safari, and Settings action inventories have no dead controls. |
| GAME-01 | Complete pinball | Physics edge cases, scoring, ball/life rules, true pause/resume, keyboard and simultaneous touch checks. |
| GAME-02 | Complete retro racer and paddle game | Deterministic simulation checks, playable progression, fair collisions, pause/resume, and real-device playtesting. |
| DATA-01 | Reliable local persistence | Version migration, invalid data, blocked storage, quota, targeted reset, and import/export round trips. |
| A11Y-01 | Accessible operation | Keyboard journey, screen-reader checks, contrast, zoom/reflow, reduced motion, and touch reachability. |
| PERF-01 | Responsive, efficient desktop | Recorded loading, frame-time, idle, memory, image, and deferred-chunk measurements on defined profiles. |
| RELEASE-01 | Repeatable safe releases | CI, changed-journey browser checks, production smoke, evidence ledger, and rollback procedure. |

## 4. Architecture: one system with clear ownership

Retain React, TypeScript, Vite, Zustand, and the current hosting arrangement. Refactor in useful slices. A framework migration, database, authentication system, or paid API is not a prerequisite for the requested experience.

| Proposed module | Owns | Must not own |
| --- | --- | --- |
| `src/desktop/` | App registry, commands, window records, ordering, focus, menus, viewport geometry | Photo blobs, Terminal processes, game physics |
| `src/apps/` | App UI, app-specific navigation, loading/error/empty states | Independent definitions of desktop activation or global shortcuts |
| `src/runtime/terminal/` | Single runtime boot, shell sessions, streams, process cleanup, diagnostics | Desktop styling or an alternative fake command interpreter |
| `src/wallpapers/` | Asset manifest, time/season resolver, preloading, transitions, media lifecycle | Requests for personal location on every visit |
| `src/content/` | Public profile, curated projects, case studies, credits, searchable content | Live GitHub availability or inferred achievements |
| `src/services/` | GitHub adapter, remote request validation, timeouts, cache status | Hidden automatic writes to external services |
| `src/preferences/` | Versioned preferences, migration, storage adapters, scoped resets | Live pointer positions or frame-by-frame game state |

Use one typed app registry for desktop shortcuts, Dock, Spotlight, app menu labels, icons, lazy imports, minimum/default sizes, and supported commands. Visibility in each launcher may differ intentionally; identity and behaviour may not.

Use typed intents such as `openProject(projectId)`, `previewPhoto(photoId)`, `setWallpaper(selection)`, and `activateApp(appId)`. Direct entry, Spotlight, and clicking a file use the same intent. Avoid a general event bus carrying unvalidated `any` payloads.

Keep one instance per app initially. Design the window record with a separate instance ID so a later second Terminal or document window does not require rewriting the core. Add multiple instances only when their lifecycle has been specified.

Separate three persistence classes: small preferences in localStorage; user-created blobs/documents in IndexedDB; volatile runtime processes and pointer/animation state in memory. A shared content index serves Finder, search, desktop links, and direct routes. Terminal's executable filesystem is a separate workspace, never silently conflated with read-only portfolio folders.

## 5. Visual direction and native interaction quality

Choose one consistent modern macOS-inspired treatment: quiet translucent surfaces, disciplined typography, circular controls, restrained shadows, crisp original icons, and landscape-led colour. Keep the desktop spacious. A compact introduction and visible Work action establish identity without a large scrolling marketing page.

Start with a representative visual slice: desktop + Finder + Photos + Terminal at desktop and phone sizes. Establish tokens before restyling every app. Compare screenshots against the existing examples so the photo personality and clean focus treatment do not regress.

Proposed starting tokens, subject to visual/device checks:

| Element | Starting contract |
| --- | --- |
| Spacing | 4px base scale; deliberate 8/12/16/24px component spacing |
| Titlebar | 40–44px desktop; more room on touch layouts as required |
| Traffic lights | 12–14px visible circles; separate non-overlapping touch targets approaching 44px on phones |
| Window corners | Shared 12–16px radius; identical clipping and border treatment across apps |
| Type | System UI for chrome, a restrained personal accent for the desktop, a legible monospace for Terminal |
| Focus | No activation perimeter; visible keyboard indicator on controls with sufficient contrast |
| Motion | Approximately 120–180ms for small feedback and 180–260ms for window transitions; input is accepted immediately |
| Wallpaper transition | Approximately 1.5–3 seconds after the next asset is decoded; shorter or still under reduced motion |

These are design starting values, not claims of pixel-perfect Apple replication or achieved performance. Check active/inactive, light/dark, hover, pressed, focus, disabled, loading, empty, and failed states. Visible control state must not depend on colour alone.

Create component-scoped CSS and shared tokens. Migrate old rules by component, remove their predecessors after comparison, and prevent broad selectors such as unscoped `nav` from styling unrelated apps. Do not add another stylesheet of emergency overrides.

## 6. Window manager, focus, and desktop commands

Store an ordered list of windows and an explicit focused window ID. Derive a bounded z-index from the list; reserve separate layers for menus, dialogs, notifications, and Spotlight. Avoid using the ever-growing counter as a proxy for focus.

Keep visibility (`closed`, `visible`, `minimized`) independent of presentation (`normal`, `maximized`, later `snapped`). Keep the last normal rectangle even while maximized. Persist final rectangles, not drag frames, and clamp saved geometry to the current work area on restore.

| Action | Required result |
| --- | --- |
| Open a closed app | Create/restore its window record, start its app lifecycle, focus once after the initiating action. |
| Activate a minimized app | Restore its last presentation and geometry; resume only the capabilities allowed by that app. |
| Activate a visible background app | Bring it forward without resetting its content. |
| Click the focused Dock app | Preserve the current product's minimize behaviour, implemented centrally. |
| Red control | Close the window using the app's documented session policy; choose the next visible app as active. |
| Yellow control | Minimize to Dock; preserve state. |
| Green control | Toggle maximized work-area size and the saved normal rectangle. Fullscreen browser mode is a separate explicit option. |
| Show Desktop | Minimize the current visible set; repeat restores that set without launching previously closed apps. |
| Resize or drag | Activate the window, clamp to reachable bounds, handle pointer cancellation, and save only committed geometry. |
| Close an app's dialog | Return focus to the invoking control if it still exists in the active app; otherwise choose a valid current target. |

During drag/resize, use pointer capture and frame-scheduled local updates. Do not rerender the desktop or write preferences on every move. Keep the titlebar and recovery controls reachable after orientation changes, zoom, and restoring old geometry.

Focus belongs to the desktop manager; late network/runtime completion must not take it. An opened background Terminal may finish booting without focusing its input. Stop global shortcuts when typing into an input or when the active app owns that key. Do not intercept browser-reserved close-tab shortcuts.

Regular application windows are labelled nonmodal surfaces; they do not trap keyboard focus. True modal dialogs trap focus until dismissed and make the background inert. Minimized/closed content is removed from interaction and the accessibility tree. Define tab order and focus return independently of visual z-index, so neither invisible apps nor the Dock create a keyboard trap.

Spotlight and menus use the same command catalog. Filtered results clamp selection, zero results is a real state, Escape closes the topmost overlay, and focus returns correctly. Provide an accessible app switcher and visible Reset window layout action. Context menus expose only implemented commands and dismiss on outside click/Escape.

Acceptance includes repeated open/minimize/maximize/close cycles; titlebar double-click; dragging beyond each edge; resize then maximize then restore; opening an app while Terminal boots; game → Spotlight → game; and switching viewport class with multiple windows open.

## 7. Mobile, selection, scrolling, and accessibility

Phone layout uses one active application panel filling the available work area. Background app state is preserved. The desktop becomes a compact launcher with readable type and reachable controls, not a scaled-down desktop screenshot. Tablet behaviour follows available width and input type; it may retain bounded windows when there is room.

Use dynamic viewport sizing and safe-area insets. Track the visual viewport for software-keyboard occlusion, including offsets, with a fallback when unavailable. Do not treat pinch zoom as a signal to shrink the UI back down. MDN distinguishes the visual viewport from layout size; keyboard changes can affect only the former.[S3]

Rules for overflow:

- The root desktop does not scroll in its normal operating layout.
- Each app declares its own content scroller; flex/grid children have the necessary minimum-size overrides.
- Wheel/touch scrolling at app boundaries does not scroll the desktop. Do not globally prevent all touch movement.
- Terminal scrollback and PDF documents retain their natural scroll interactions.
- On short landscape screens or at high zoom, app content may scroll, while close/back/input controls remain reachable.
- Hiding a scrollbar is not evidence that overflow is fixed; test scroll dimensions and access to the final item.

Apply `user-select: none` to interface chrome and decorative text, with explicit exceptions for editable and copyable surfaces. Prevent unwanted native image dragging on gallery thumbnails and icons. Do not block the context menu or selection inside Terminal and document editors.

Distinguish three separate visuals: text selection, keyboard focus, and a selected file. Remove the unwanted first two treatments from chrome as specified, while using a subtle selected-file fill and an intentional keyboard indicator. Visible keyboard focus remains an accessibility requirement.[S4]

Test keyboard-only navigation, VoiceOver and one Windows screen reader when available, 200% zoom and narrow reflow, reduced motion, increased contrast, touch targets, and long labels. Do not declare screen-reader or physical-device support from viewport emulation alone. Critical status changes should be announced briefly, without reading Terminal output twice or announcing every game frame.

## 8. Terminal: real runtime first, with explicit recovery

### Runtime contract

Opening Terminal lazily starts xterm and one WebContainer boot managed outside the window component. React remounts, quick reopening, and repeated retries must not create competing boots. Separate runtime state from a shell session's state.

Runtime states: `idle → checking → booting → ready`, with explicit `unsupported`, `failed`, and `still-starting` outcomes. A session progresses through `creating → running → exited/failed → disposed`.

Before boot, inspect secure-context and isolation capability. The deployment must serve the required COOP/COEP headers, and its own and third-party assets must still load under those policies.[S1] Test the actual HTTPS deployment. An internal non-secure HTTP preview that cannot boot is an environment limitation, not a successful reproduction of a production failure.

Timeouts describe waiting; they do not imply the underlying boot was cancelled. The service retains ownership of pending work, handles late success/failure, and prevents a second concurrent boot. A retry either subscribes to the existing attempt, retries after settled failure, or offers a clearly explained reload when the browser runtime cannot safely restart. Attach attempt IDs so obsolete completion cannot replace a newer state.

Show meaningful phases such as Preparing runtime and Starting shell, plus elapsed time; do not fabricate a percentage. At the bounded wait threshold, offer a useful recovery choice and preserve diagnostic detail. Distinguish headers, unsupported capability, blocked network, runtime boot, shell spawn, package registry, and process exit failures.

### Session behaviour

| Event | Recommended policy |
| --- | --- |
| Minimize / switch app | Shell continues; input focus is released. Rendering/output buffering remains bounded. |
| Close Terminal window | End its shell/process tree; keep the page's workspace until reload/reset. Warn inside the app only when closing a known active task would discard work. |
| Reopen | Start a new shell in the same in-page workspace; no claim that the old process resumed. |
| Shell exits | Keep final output visible with exit status and Restart shell. Do not instantly close the window. |
| Restart shell | Recreate the shell connection without resetting workspace files. |
| Reset workspace | Explicit destructive action with export opportunity; end processes and reset files only after that intent. |
| Page reload | Runtime/processes are lost. Offer explicit file export; cross-reload workspace recovery is a separately tested later feature. |

Keep process cleanup, output streams, resize signals, scrollback limits, input queuing, paste behaviour, and writer release in the session service. A hidden/minimized Terminal should not steal focus on boot or continue expensive UI rendering. Test multibyte text, IME composition, multiline paste, control keys, copy, selection, and software-keyboard resizing. Mobile may expose a small Ctrl/Esc/Tab utility row while retaining the actual terminal emulator.

Replace synthetic uptime, hardcoded display resolution, and OS claims in `stackfetch.ts` with real session/browser/runtime facts or a clearly decorative welcome. Keep the personality of the terminal greeting without misleading system details.

### Required real-runtime proof

1. Capture origin, deployment SHA, browser/device version, secure-context/isolation flags, and boot/spawn durations.
2. Run `node --version`, `npm --version`, and `npx --version`; record actual output.
3. Create/read/update/delete a temporary workspace file using Node and verify the resulting bytes.
4. Run a JavaScript script, a controlled failing script, and an npm script; verify stdout, stderr, and exit codes.
5. Install a small local fixture package with a real executable and invoke it through `npx --no-install macfolio-check`. Separately test a pinned, reviewed public registry dependency to prove network/package installation.
6. Interrupt a running process with Ctrl+C, then run another command. Check ANSI rendering, long output, resizing, history, paste, and Unicode.
7. Minimize/restore, switch apps during startup, exit/restart, close/reopen, and repeat lifecycle operations without duplicate processes or listeners.
8. On physical Android Chrome and iPhone Safari, repeat the capability and input tests. Record support per exact environment; failures do not get replaced by fake commands.

The provider's browser-support pages are old and describe support levels and mobile constraints.[S2] They guide the test matrix; they do not prove current compatibility on the user's phone. Desktop Chromium is the first full-runtime gate. Other browsers need their own evidence. If a target environment cannot support the runtime, present the actual limitation and retry/open-supported-environment options. A hosted remote shell would require a separate security/cost design and is not silently introduced as a workaround.

## 9. Wallpaper: scenery, time, seasons, and motion

### Separate the decisions

Store independent choices: scene, time policy, season policy, rotation policy, and motion quality. Avoid overloading one `mode` value with unrelated concepts.

- Time policy: device-local clock by default; manual phase; optional solar timing from a selected city or user-granted coordinates.
- Season policy: off by default until a region/hemisphere is chosen; north, south, or manual season. Explain calendar approximation. Do not infer hemisphere reliably from language or timezone alone.
- Rotation: off or selected scene collection plus interval; rotation selects scenes, while the time/season resolver selects each scene's matching asset.
- Motion: still, subtle movement, or supported live video. Reduced motion always yields a still equivalent; video is explicitly selectable.
- Personal photo: an explicit manual choice. Preserve the photo's original appearance unless the visitor chooses effects.

Priority is: accessibility/resource constraints on motion → manual photo/scene/phase choices → automatic time/season → available asset fallback. Keep the chosen mode and the currently displayed fallback separate, so a failed asset does not rewrite preferences.

### Assets and resolver

Begin with one excellent landscape scene containing matched dawn, day, golden-hour/evening, dusk, and night images. The composition should feel continuous. Add matched seasonal assets for the supported seasons, then additional scene collections for rotation. A tint alone does not complete WALL-01 or WALL-02.

The manifest records stable scene ID, phase, season, source/credit/license, dimensions, responsive variants, crop focal points, still poster, optional video formats, and estimated transfer size. Only advertise combinations present in the manifest. A missing seasonal variation falls back to the scene's neutral seasonal asset, not an unrelated broken URL.

Resolver inputs are injectable time, timezone/offset, optional region/solar data, preferences, and asset availability. Handle phase boundaries, daylight-saving changes, the tab returning after sleep, timezone changes during a visit, and invalid saved choices. Solar mode must define polar day/night and unavailable calculation fallbacks. Local clock mode remains fully functional without location or network weather data.

Use a bounded scene cache: current asset plus the likely next transition. Decode/preload the next image before crossfading; retain the current one on failure. A shuffle bag avoids immediate scene repeats. Compute elapsed transitions once after a long background interval instead of replaying every missed change.

### Live media contract

Provide a still poster immediately. Start video only after the relevant scene is selected and motion policy permits it; use muted inline playback and handle rejected play promises. Pause on hidden tabs, release abandoned video resources, and fall back to the poster on decode/network failure. Respect reduced motion and a visitor-selected low-data mode; use browser data-saving hints only when available. Do not assume access to battery state.

Settings has separate Preview and Apply actions where a costly video is involved, a clear Return to automatic time action, and scoped resets. Photos → Set wallpaper updates the same model. Removing the selected imported photo resolves to a valid scene and cleans up its blob safely.

Acceptance uses a fake clock for every phase/season boundary, both hemispheres, missing assets, failed video playback, offline return, rapid setting changes, deleted photos, and manual override precedence. Visual review checks that text and icons remain legible over the brightest and darkest variants.

## 10. Photos: an informal collection with dependable behaviour

Keep the collage character: varied sizes/aspect ratios, small deliberate rotations, generous breathing room, and original photo crops. Prefer a deterministic arrangement derived from stable photo IDs. Opening an app, adding a favorite, or returning from a viewer must not produce a new random layout.

On phones, use a readable two-column or single-column arrangement according to width, with restrained rotation and full touch targets. Reserve image dimensions to prevent jumps. The visible browse order, DOM order, and lightbox previous/next order must be understandable; test this explicitly if retaining CSS columns. Heavy virtualization is unnecessary until the collection's measured cost warrants it.

Define `PhotoRecord` with ID, source kind, image/thumbnail references, width, height, alt text/caption, collection, attribution, and optional local-blob ID. Favorites and hidden items refer to IDs instead of URL strings. Migrate existing URL favorites where matches are known; preserve unmatched entries safely rather than guessing ownership.

| Flow | Required result and recovery |
| --- | --- |
| Browse | Lazy thumbnails with reserved space; an image failure has a compact retry/placeholder without breaking the layout. |
| Open/view | Keyboard arrows, touch navigation, Escape/back, optional zoom, and return focus to the originating photo. The viewer owns its browsing snapshot. |
| Favorite | Immediate state update, persistence status, and a useful empty Favorites collection. Toggling the viewed photo does not unexpectedly jump to another photo. |
| Import | Local-only import first, with decode/type/pixel limits, progress, duplicate handling, and readable failures. Files are stored only after successful validation. |
| Remove | Clearly says remove from this device; soft deletion/Undo where possible. It does not claim remote deletion. |
| Set wallpaper | Uses the shared wallpaper command and reports the selected mode correctly. Clearing a wallpaper returns to the chosen automatic scene. |
| Restore original collection | Restores hidden original photos. It does not also erase favorites, imported images, or appearance preferences. |
| Reset personal Photos data | Separate explicit action describing the affected imports/favorites. Provide export before irreversible deletion. |

For local files, use IndexedDB and managed object-URL lifetimes. Revoke URLs only after consumers release them. Handle storage denial, full quota, corrupt metadata, interrupted imports, large pixel dimensions, orientation, and unsupported image formats. A failed write may leave a temporary in-memory preview, but the UI must not claim it is saved for next time.

Public uploads are a separate capability. Inspect and enforce Cloudinary-side restrictions before enabling unsigned uploads broadly; browser validation alone is insufficient. Prefer owner-managed publication for the public portfolio collection. Preserve original source assets and record their rights/credits before changing the media pipeline.

## 11. Finder, portfolio content, and discoverability

### Content model

Separate curated public projects from a live public-repository feed. Curated work is always available from a build snapshot; GitHub is enrichment and discovery. Newly updated, forked, archived, empty, or tutorial repositories do not automatically become featured case studies.

Use stable slugs and fields for title, short summary, role/contribution, problem, approach, technology, screenshots, source URL, optional verified demo URL, status, public dates, and evidence. Keep unknown fields absent. Do not fabricate impact numbers, employers, availability, users, or client outcomes.

For each featured project, prepare a short case study: what problem it addresses, what Pratham built, one interesting engineering/design decision, tradeoffs, concrete evidence, and what changed or could improve. Use actual repository/readme/product evidence; ask for owner input only where needed to substantiate personal contribution or unpublished outcomes.

A content refresh process fetches public repository candidates, filters them, records checked timestamps and redirect/demo results, and presents an editorial diff. The default workflow is a repository update; no runtime token or automatic public publishing is required. Separate optional live counters from project identity. GitHub failure must never erase Work.

### Finder behaviour

Provide sidebar locations, breadcrumbs, back/forward, icon/list views, sorting, search, selection, Enter/open, and Space/Quick Look. A compact mobile navigation sheet replaces a permanently wide sidebar. Keep app navigation state when minimizing; preserve relevant route state when opening a specific project directly.

Start with typed read-only portfolio folders and documents. Projects, About, Résumé, and genuine reference material are meaningful locations. If Trash stays, it should describe a real local function, such as recoverable removed imports, rather than obsolete sample project links. Do not imply that visitors can delete the owner's repositories.

Selection and activation are separate: a selected item has a restrained fill; opening it does not depend exclusively on double-click. Browser links remain real links. Keyboard search ignores input owned by Terminal or another app.

Use the same content records for desktop Work shortcuts, Spotlight results, Finder, and direct URLs. A path such as `/work/homeworker` opens the correct content inside the single-page desktop. Back/forward restores app content without adding a browser-history entry for every drag or focus change. Direct reload must resolve on the deployment.

For discoverability, generate meaningful HTML/metadata for the public content routes with the existing stack before considering a framework migration. Add canonical URLs, a real social image, sitemap, and verified profile metadata. Keep direct résumé/email/source links and a useful no-JavaScript fallback. A share link should lead to the relevant work, not force visitors to reconstruct the desktop journey.

## 12. Complete every existing app before multiplying apps

Create an action inventory for every visible button, menu item, shortcut, context action, and link. Record its intent, enabled conditions, success state, empty state, error state, and associated test. Remove or redesign inactive controls; a convincing-looking button with no action is a defect.

| App/surface | Completion scope |
| --- | --- |
| Safari / GitHub | Internal portfolio pages and curated bookmarks; address input with safe URL validation; honest external-tab opening for other sites; working internal back/forward; independent profile/repository/starred loading; cached content with timestamp; retry and rate-limit handling. Replace New/Star mutation-like buttons with appropriate real outbound links or omit them. |
| Contact | Working email link and copy result; selectable read-only email fallback when clipboard access fails; verified social URLs; visible success/error announcement. Add a contact form only if a real delivery backend, anti-abuse controls, and delivery/failure tests are included. |
| Résumé / preview | Verify the actual PDF content with the owner; test file existence, filename, download/open, phone rendering, and fallback when embedding is blocked. Text and image previews need useful missing-file states. |
| Settings | Sections for appearance, wallpaper, motion/data use, sound, desktop layout, and local data. Instant lightweight changes; explicit Apply for expensive media; descriptive resets; persistent state with migration and failure feedback. |
| Menu bar / Control Center | Actual site controls such as appearance and site audio; date/time with an optional calendar panel; Show Desktop, app switching, and help. Do not suggest changing device Wi-Fi, system brightness, battery, or OS permissions. |
| Spotlight | Apps, projects, documents, and supported actions from one index; keyboard navigation, empty results, result categories, and reliable focus return. |
| Notifications | Short, actionable site events only; consistent placement and dismissal; no fake operating-system alerts or noisy success toasts on every click. |

External sites may prevent embedding. Open them in real tabs rather than building an arbitrary proxy to imitate unrestricted browsing. Isolated Terminal deployment policies must be checked against GitHub images, Cloudinary media, PDFs, and external links before header changes ship.

### Growth after the requested foundation

Useful additions, in order of likely value:

1. Notes/scratchpad with local autosave, clear saved/unsaved status, search, export, and recovery from quota failure.
2. Quick Look shared by Finder and Photos, plus keyboard help and a contextual app menu.
3. A lightweight calendar/clock and optional small desktop widgets, each dismissible and space-aware.
4. A small owner-curated music player only with appropriate audio assets; explicit play gesture, site volume/mute, keyboard operation, and paused audio on the chosen lifecycle events.
5. A Terminal Workspace location in Finder only after the runtime/filesystem contract is stable. Keep it separate from read-only portfolio content, with explicit download/import actions.

Weather, cloud sync, accounts, public leaderboards, achievements, multi-window Terminal tabs, PWA offline mode, and sophisticated workspace recovery are later options. Each must earn its cost through a concrete visitor benefit. No decorative app is added merely to fill Dock slots.

## 13. Arcade: complete small games with convincing feel

Deliver original retro-inspired games with owned/licensed art and sound. The racer can evoke the pace and personality of Road Rash without requiring its original assets or a commercial-game emulator. Agree that it is a motorcycle racing game; the existing falling-rectangle dodger does not meet that ambition.

### Shared game platform

Separate simulation state, input mapping, rendering, audio, and persisted records. Use a fixed simulation timestep with an accumulator, bounded catch-up after stalls, and requestAnimationFrame rendering. Cap collision displacement or use swept collision/substeps where needed. A faster display must not make the game faster.

Use an explicit state model: `ready`, `playing`, `paused`, `gameOver`. Pause retains the run. Restart resets it. On window blur/minimize, hidden tab, pointer cancellation, or loss of input focus, release held controls and pause. Resume is deliberate, optionally with a short countdown. Touch gestures in the game area must not suppress normal scrolling elsewhere.

Store best scores on meaningful events, not every render or scoring tick. Keep best-score schema versioned and per game/ruleset. Audio starts only after a user gesture, respects site mute, and cannot continue unexpectedly behind a closed game. Rendering honours device-pixel ratio with a cap suitable for mobile performance.

### Pinball scope

- A recognizable table: plunger/launch lane, flippers, bumpers, lanes, drains, and a clear score/lives display.
- Simultaneous flipper input from keyboard and two-finger touch; visual and audio response on contact.
- Fixed ball count, consistent relaunch, bonus/scoring rules, game-over summary, restart, and local best score.
- Ball collision response handles fast travel, repeated contacts, corners, stuck-ball recovery, and frame stalls. A collision cannot multiply-score every frame while stationary.

Prototype rotating-flipper/ball contacts early. Evaluate a maintained physics library only if the small custom simulation cannot meet accuracy and maintenance needs; measure the added download and audit its current API before adopting it. The acceptance requirement is believable, stable play, not allegiance to a particular implementation.

### Motorcycle racer scope

- Pseudo-3D road or another deliberate retro visual style with readable depth, original rider/bike sprites, turns, traffic/opponents, and speed feedback.
- Steering plus acceleration/braking; approachable automatic acceleration may be the default for touch, with a clear choice.
- Fair collision zones, off-road handling, recoverable crashes or an explicit life system, a finish/progression objective, and a score summary.
- Difficulty progresses from a playable opening; deterministic seeds reproduce collision and spawn bugs. No obstacle combination should make a run unavoidable by design.

Additional combat, upgrades, more tracks, and online competition are later depth. The first complete game should feel good for a short session before expanding content.

### Paddle game scope

Keep it as a smaller polished game: consistent serve, paddle response, fair opponent difficulty, scoring/win rules, pause/resume, restart, sound, and touch input. It is also a useful early validation of the shared game loop.

Automated checks cover state transitions, repeatable simulation, scoring, collision boundaries, input cancellation, and storage. Human playtesting covers flipper responsiveness, steering predictability, fairness, readability, sound, and enjoyment. Passing collision tests cannot certify game feel.

## 14. Data, privacy, and recovery

Give stored records a schema version and migration path. Validate persisted types and ranges at load; retain safe values, repair known older formats, and fall back without crashing. Preserve old data until a migration succeeds. Treat optional settings corruption independently from personal documents/imports.

Reset actions are scoped: layout, wallpaper, original gallery visibility, game scores, or all local personal data. Explain the affected category before destructive resets. Do not solve a broken appearance setting by clearing the entire origin's storage, including unrelated runtime or user files.

Export/import contains versioned settings and user-owned data with type/size validation. Reject unsafe references and partial invalid imports before replacing existing state. Export private notes/photos intentionally; do not include runtime command history, credentials, or location by default. Agree per feature whether changes synchronize between two open tabs; for preferences use a defined last-update rule, while document edits need conflict handling.

Default privacy posture: device-local time, local preferences, no account, no location prompt, no background upload, and no analytics requirement. A solar/location option explains its purpose at the moment of use and works with a manual city. Do not log exact coordinates, Terminal input/output, imported photos, or private notes in error telemetry.

Use read-only public GitHub calls, validated URLs, and no secrets in client bundles. Review the provider configuration for uploads and the status of credentials previously exposed in the initialization script; source removal alone does not establish revocation. Any optional backend receives a separate design for secret storage, abuse limits, and failure reporting.

Render external metadata as text or through a deliberately restricted renderer; reject unsafe URL schemes and unexpected import keys. A user-entered address, repository description, imported settings file, or photo caption must not become executable HTML. Add focused cases for these boundaries where the feature accepts external content.

Review dependency changes selectively, remove packages only after checking runtime/build/script usage, and maintain a single documented package-manager path. Since CI uses npm, retain npm as the default unless an explicit migration provides a benefit. Inspect generated declarations and duplicate components before deleting them. Keep content/source image changes separate from infrastructure cleanup.

## 15. Loading, performance, and resource budgets

Measure a baseline before optimization. Keep the desktop and portfolio available before downloading Terminal, games, video, or the full gallery. Show loading shells with reserved dimensions and meaningful errors. A failing app chunk should leave other apps usable and provide a controlled retry/reload path for stale deployments.

The following are **proposed targets**, to be calibrated against a recorded mid-range phone and laptop. They are not current measurements or guarantees.

| Measure | Proposed gate / measurement approach |
| --- | --- |
| Initial essential JavaScript | Aim for no more than 200 KiB compressed across the initial desktop dependency graph; measure the graph, not one chunk. Terminal and Arcade load on demand. |
| First wallpaper | Aim for an appropriately sized still image within 350 KiB on the phone profile; no initial video download. |
| Loading/layout | Lab targets aligned to LCP ≤2.5s and CLS ≤0.1 on the declared profile; separate media readiness from interaction readiness. |
| Interaction | Target INP ≤200ms in field data if collected; use lab traces and scripted interaction durations before field data exists. |
| Input feedback | Pointer/keyboard feedback on the next rendering opportunity; animations do not delay accepting the next command. |
| Motion/games | Aim for stable 60fps on target hardware; inspect slow-frame distributions and sustained play, not a single FPS reading. Reduce visual cost before changing simulation rules. |
| Idle | No game simulation or hidden-video playback; bounded clock work; avoid permanent frame loops for a still desktop. |
| Lifecycle memory | After repeated open/close cycles, listener/process counts return to expected levels and retained memory does not grow monotonically. Use heap/worker evidence rather than an arbitrary universal MB threshold. |
| Images | Responsive sizes, known dimensions, lazy thumbnails, current/next wallpaper cache only, bounded decoded-image retention. |

Core Web Vitals field classification uses the 75th percentile and is different from one Lighthouse run.[S5] Until there is representative field data, report lab results as lab results. Pin the test browser, device/network/CPU profile, build, and number of runs. Compare regression deltas; do not chase a score by hiding real functionality.

Investigate avoidable renders, blur layers, oversized media, repeated storage writes, and main-thread game work before adding libraries or a service worker. An offline cache is deferred until its interaction with WebContainer service workers, isolation, deployment versions, and update recovery is tested.

## 16. Failure handling matrix

All async features need a settled outcome. A spinner with no deadline, retry rule, or fallback is incomplete.

| Failure | Visitor experience | Engineering response / regression |
| --- | --- | --- |
| Runtime isolation missing | Specific explanation and usable remaining desktop | Capture deployed response headers and capability flags; fix hosting configuration; verify actual HTTPS. |
| Runtime boot slow/late | Still-starting state with bounded wait and safe recovery | Retain one attempt owner; test late completion and rapid reopen/retry without duplicate boots. |
| Shell dies | Last output and exit status remain visible; Restart shell | Verify stream closure, process cleanup, and workspace preservation. |
| Registry/network blocked | Shell remains usable; command error is visible | Distinguish runtime health from package availability; do not label every command failure as a boot failure. |
| GitHub rate limit/offline | Curated projects remain; cached live data shows age; retry/direct link | Optional requests fail independently; respect response reset/retry information and avoid retry storms. |
| Wallpaper missing/video rejected | Current image or still poster remains | Abort obsolete loads; log non-sensitive asset failure; resolve next valid asset without changing manual preference. |
| Photo decode/upload/import fails | Specific item error, retry/remove, original collection unaffected | Validate before persistence; abort requests on disposal; test image dimensions and quotas. |
| Storage blocked/full/corrupt | App remains usable with honest unsaved state | Isolate failure per record/category; migrate or recover without clearing everything. |
| Clipboard denied | Read-only selectable email field and mail link | Test denied API and missing API, not just clipboard success. |
| PDF/embed denied | Direct open/download remains available | Verify actual file and response; do not keep an empty frame as the only result. |
| App chunk from old deployment disappears | App-specific reload/retry explanation | Verify stale-tab deployment recovery and avoid automatic reload loops. |
| Pointer cancelled / app blurred | Drag ends safely; controls released; game pauses | Test pointercancel/lost capture, notifications, app switch, and multitouch interruption. |
| Viewport shrinks | Active controls and typing area stay visible | Test keyboard, landscape, browser toolbar, zoom, and restoration from saved large geometry. |

Errors should be understandable at the point of action. Optional technical details may be expandable; routine product flows should not display implementation internals.

## 17. Verification strategy and test matrix

### Distinct layers of proof

1. **Static correctness:** clean install from the chosen lockfile, typecheck/build, and targeted lint. Establish existing lint debt, then fix touched modules and schedule a bounded cleanup; do not hide new errors with blanket disables.
2. **Pure logic:** window transitions/geometry, wallpaper resolution, migrations, navigation, and game simulation. Use injected clocks/random seeds and test properties/boundaries rather than merely copying implementation assertions.
3. **Component/integration behaviour:** dialogs/focus, async states, storage failures, command routing, and input ownership. Mocked provider responses prove recovery UI only.
4. **End-to-end browser journeys:** real pointer/keyboard actions across desktop/apps, route reloads, copy fallbacks, no page overflow, and cross-app sequences. Use stable accessible selectors and deterministic fixtures.
5. **Real integrations:** HTTPS WebContainer execution, actual GitHub/CDN behaviour, and any enabled upload/delivery service. Stubs cannot count as these passes.
6. **Visual/device review:** agreed screenshot states, physical phone keyboard/touch, zoom, screen readers, and human game/interaction evaluation.

Keep the nine existing Node tests as baseline checks. Add a documented test command and a focused browser suite using the tool best matched to the repository after checking its current setup requirements. Do not rewrite the project merely to adopt a test framework.

### Environment matrix

| Environment | Required coverage |
| --- | --- |
| Desktop Chromium, current stable recorded at test time | Full desktop journey, real runtime, pointer/keyboard, performance baseline |
| Desktop Safari | Portfolio/apps, window/focus, media, real-runtime capability and command results separately recorded |
| Desktop Firefox | Same core journey; runtime results separately recorded; private mode as a failure/recovery scenario |
| Physical Android Chrome | Native-scale layout, real keyboard, touch gestures, game input, and real-runtime capability/commands |
| Physical iPhone Safari | Safe areas, toolbar/keyboard changes, gestures, local storage/media behaviour, and real-runtime capability/commands |
| Tablet touch / narrow desktop | Responsive transition, app switching, sidebar behaviour, reachable controls |
| Reduced motion / zoom / storage or network unavailable | Equivalent core access and honest recovery; no disabled essential workflow |

Suggested viewport fixtures: 360×800, 390×844, 768×1024, 1366×768, and 1920×1080, plus a short landscape screen. They supplement physical devices, not replace them. Record browser versions when testing; do not freeze "latest" in the evidence ledger.

### Highest-value regression journeys

- Open Terminal, then Finder before boot completes; keep typing in Finder. Terminal finishes without stealing focus.
- Resize Finder → maximize → minimize → restore → unmaximize. The original normal geometry returns and remains reachable.
- Open Photos → choose a wallpaper → change manual/auto modes in Settings → remove that photo → reload. State stays coherent and defaults are recoverable.
- Start pinball → open Spotlight → return → Resume. Ball position, score, and lives are preserved, with no stuck flipper.
- Open a direct project URL → switch project → browser Back → reload. Content and navigation agree.
- Deny clipboard/storage/network separately. Contact, Work, and desktop navigation remain usable.
- Open and close the heavy apps repeatedly, then idle. No abandoned game loops, videos, shell processes, or ever-growing listener sets.
- Switch phone orientation with the Terminal keyboard open. The cursor, last output, and dismiss/close controls remain reachable.

Automate repeated checks where they prevent a real recurrence. A one-time copy fix does not need an elaborate unit test that restates JSX; clipboard-denial browser coverage does. Add or broaden testing to answer a concrete remaining risk, not to accumulate test counts.

## 18. Iteration loop: fixing causes without losing the goal

For every defect, record: requirement ID, build SHA, environment, reproducible steps, expected result, actual result, evidence, severity, suspected cause, and final verification. Separate an app defect from a provider outage or unsupported test environment, while ensuring all three have an adequate user-facing outcome.

Use this sequence:

1. Reproduce the smallest reliable case on the relevant build.
2. Identify the owning layer and cause; compare with a working baseline where available.
3. Make the smallest coherent fix, including all affected call sites when the issue is a shared contract.
4. Add a regression check for behavioural bugs; capture an approved visual reference for appearance regressions.
5. Run the affected checks and adjacent critical journey, then inspect the actual result in a browser.
6. Review the diff for scope creep, state loss, accessibility, and changes to the original requirement.
7. Record evidence and stop optional retesting once the specific risk and required gates are resolved.

### Severity and release treatment

| Severity | Example | Treatment |
| --- | --- | --- |
| S0 | Exposed active secret, unintended external destructive action, unrecoverable personal-data loss | Stop affected release; contain/recover and verify before proceeding. |
| S1 | Terminal cannot run on a declared supported target; core navigation inaccessible; blank app; trapped focus | Blocks release of the affected required capability. |
| S2 | Wrong maximize restore, reset clears unrelated state, collision/score bug, broken source/demo action | Blocks completion of the relevant requirement; fix before that slice is called done. |
| S3 | Minor spacing, subtle motion tuning, nonblocking visual inconsistency | Resolve during polish or document as a known issue with clear scope. |

Use a small visual/feel rubric during review: consistency, response, clarity, legibility, continuity, and personal character. Score 1–5 only as a review aid; any material regression in Terminal, gallery personality, focus, or mobile usability blocks acceptance regardless of average score. Invite focused user feedback on one representative slice at a time rather than asking them to rediscover bugs across a wholesale redesign.

## 19. Delivery sequence and exit gates

All original requirements stay in the ledger until their evidence passes. An interim release may improve the site, but it is not described as the completed reimagining while wallpaper, games, or app contracts remain unfinished.

| Stage | Work and likely files | Exit gate |
| --- | --- | --- |
| 0. Establish evidence | Snapshot production, reconcile old docs, action inventory, browser harness, runtime HTTPS probe | Confirm exact baseline; distinguish failures from missing tests; record supported/untested environments. |
| 1. Restore trust | `WebContainerContext`, `TerminalBox`, window focus/geometry, copy fallback, dead app controls | Real shell commands pass on first target; critical regressions have targeted checks; no new focus/scroll regression. |
| 2. Unify desktop | Registry/commands, `useWindowStore`, `WindowWrapper`, Dock/Navbar/Spotlight, CSS tokens, mobile work area | WIN/NAV/DESK contracts pass across apps; representative desktop/phone visuals reviewed. |
| 3. Complete content and Photos | Content records, Finder navigation/Quick Look, GitHub adapter, Gallery schema/local actions, résumé/contact | WORK/FIND/PHOTO/APPS core flows pass; no fabricated content or destructive cross-setting reset. |
| 4. Build living scenery | Scene production/credits, wallpaper manifest/resolver, Settings controls, matched seasons, rotation, optional live media | WALL contracts pass with real assets, fake-clock boundaries, missing-media recovery, and resource budgets. |
| 5. Finish Arcade | Shared lifecycle/input loop; polish paddle; accurate pinball; motorcycle racer art/simulation/progression | Each game has true pause/resume, complete rules, automated edge coverage, and phone/desktop playtest evidence. |
| 6. Whole-experience release | Cross-app journeys, accessibility, physical devices, performance, link/content review, SEO/direct routes | All required IDs pass or have an explicitly narrowed, visible support boundary; production smoke and rollback ready. |
| 7. Earned growth | Notes, widgets, optional music, richer workspace/scene/game content | Each addition independently meets the same usefulness, lifecycle, failure, and test contracts. |

Stages contain small reviewable PRs, not one large merge. Wallpaper asset preparation and case-study collection can progress while core engineering is underway, without mixing their changes into Terminal fixes. A credible schedule follows Stage 0's runtime/device findings and the scene/game asset inventory; fixed delivery dates before those facts would be guesswork.

The highest uncertainty is real mobile runtime compatibility, followed by pinball/racer feel and matched seasonal/live asset production. Investigate those early with bounded feasibility work. If a target is infeasible, document the observed limit and the alternatives; do not silently substitute a smaller feature and mark the original request complete.

### Recommended first implementation slice

1. Prove the deployed real Node shell and capture the user's phone environment where accessible.
2. Repair startup/retry/session ownership and late-focus behaviour against those findings.
3. Establish shared window activation and mobile keyboard geometry tests.
4. Fix Contact's copy fallback and remove inactive GitHub controls as small independent changes.

This slice resolves the highest-confidence functional debt while creating the verification path the larger visual and creative work will use.

## 20. Release, rollback, and maintenance

Continue on the established upgrade branch. Compare it with current master before each change; preserve unrelated local edits. Attach a requirement list, behavioural changes, known limits, and validation evidence to each PR. Check the **exact candidate commit** and do not bypass failed required checks.

Code releases require build/logic checks plus browser journeys affected by the change. Runtime/header changes require real HTTPS runtime proof and a cross-origin asset smoke. Media/visual changes require representative screenshots and transfer-size comparison. Content-only changes need link/identity/metadata review rather than an unnecessary full game test run.

After merge, confirm the deployed commit and rerun a short production path: load desktop, open Work, contact/résumé access, affected app, and any runtime or media capability changed. Deployment success is separate from merge success.

Rollback means restoring the last verified application revision. Versioned data migrations must tolerate returning to that revision or have a documented safe fallback/export path. Do not release a one-way local-data migration without a recovery plan. Feature switches can isolate large optional additions, but must not become permanent ways of hiding incomplete original requirements.

Evidence ledger fields:

| Field | What to record |
| --- | --- |
| Requirement and result | ID; not started / built unverified / blocked / passed; specific scope |
| Build | Commit SHA, preview/production URL, deployment identifier |
| Environment | Device, OS, browser version, viewport, input type, network profile |
| Method | Automated command/test, manual steps, real integration or stub |
| Evidence | Output, screenshot/video, trace, error summary, measured values |
| Review | Date, reviewer/tester, outstanding defect and next action |

Maintenance is proportionate: refresh curated work when projects change; check important outbound links and media after content releases; review dependencies and provider/API changes on a documented cadence; rerun runtime/device checks when browsers or WebContainer change. If analytics are later introduced, start with useful aggregate measures such as project and contact access, with deliberate privacy choices. Do not collect private desktop activity just because it is technically possible.

## 21. Decisions we can make now, and evidence still needed

| Topic | Recommended default | When more input/evidence matters |
| --- | --- | --- |
| Overall style | Modern, coherent macOS-inspired desktop with original personal details | Review the representative desktop/Finder/Photos/Terminal visual slice. |
| No scrolling | No page scroll; useful internal app scrolling | Validate short viewports and zoom, not a blanket `overflow: hidden` screenshot. |
| Selection/focus | Non-selectable chrome; functional typing/copy; quiet keyboard focus | Test mouse, keyboard, touch, and assistive use. |
| Terminal | Real runtime by default; specific compatibility/recovery messages | Actual HTTPS execution and the user's physical phone/browser. |
| Window close | App-specific explicit session policy; minimize preserves work | Verify Terminal process termination and unsaved-data cases. |
| Time/season | Device-local clock; optional manual hemisphere/season; location-free default | Solar/location option is added only with its own inputs and edge cases. |
| Wallpaper media | Matched still scenes first; selectable live media with poster | Produce/obtain the assets and measure memory, battery impact indirectly through activity, and download cost. |
| Photos | Stable collage, local imports, scoped remove/reset | Remote publishing only after provider restrictions and ownership are settled. |
| Projects | Curated, public, evidence-backed work with optional live enrichment | Owner confirmation of unpublished contribution/outcomes and current résumé. |
| Retro games | Original pinball and motorcycle racer, polished paddle game | Playtest the desired feel; exact commercial assets are not assumed available. |
| Backend/services | Static/local-first foundation using existing services | Add a backend only for a selected feature whose value justifies its operations and cost. |
| Success | Required journeys pass on a declared matrix, no unresolved blocking defects, polished reviewed states | "Perfect everywhere" is not a testable promise; support and remaining limitations stay explicit. |

## Sources and interpretation

Repository findings refer to the baseline linked at the top and its `src/`, `tests/`, `vercel.json`, and CI files. Proposed architecture, budgets, defaults, and test cases are engineering decisions in this blueprint, not statements that the repository already implements them.

- **[S1]** [WebContainer: configuring headers](https://webcontainers.io/guides/configuring-headers). Required isolation headers; application inference: verify actual deployed responses and asset compatibility.
- **[S2]** [StackBlitz: WebContainer browser support](https://developer.stackblitz.com/platform/webcontainers/browser-support) and [WebContainer browser support](https://webcontainers.io/guides/browser-support). Both display a February 2023 update note and describe browser/mobile limits. Treat these as constraints to investigate, not a current device certification. [Provider runtime testing guide](https://webcontainers.io/guides/ai-agents) is an additional implementation-time reference.
- **[S3]** [MDN: VisualViewport](https://developer.mozilla.org/en-US/docs/Web/API/VisualViewport). Keyboard and pinch-zoom can change the visible area independently of layout dimensions.
- **[S4]** [W3C: Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html). Keyboard users need visible focus; the proposed control-level treatment reconciles that with the requested cleaner appearance.
- **[S5]** [web.dev: Web Vitals](https://web.dev/articles/vitals). Loading, interaction, layout stability, and field percentile methodology. The other byte/frame budgets above are proposed project targets.

Sources checked 9 September 2026. Verify platform/library details again when implementing changes that depend on them.

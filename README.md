# MacFolio

Pratham Jaiswal’s interactive portfolio, built as a personal desktop with React, TypeScript, Vite, Tailwind CSS, and Zustand.

## Experience

- A responsive desktop with a clear introduction and selected project shortcuts.
- Finder with project filtering, project details, source/live links, about information, and résumé access.
- Spotlight search: use **Command K** or **Control K**, arrow keys, Enter, and Escape.
- Windows that drag and resize within the available desktop, preserve geometry through maximize/restore, and retain application state while minimized. Use **Alt W** to close the active window.
- Keyboard-operable window controls and resize handle, visible focus, reduced-motion support, and mobile windows that leave the dock accessible.
- Résumé PDF viewing/downloads and image/text preview windows.
- Contact links and copy-email feedback.
- Gallery with favorites, photo navigation, wallpaper selection, and optional Cloudinary uploads. Collection/favorites changes belong to the visitor’s browser, not a shared database.
- Safari with a GitHub profile view, safe web navigation, request cancellation/timeouts, and retry states.
- A real WebContainer shell loaded only when Terminal opens, with a readable fallback on unsupported browsers.

The original public identity, project links, résumé, and image collection are preserved. No project impact metrics or employment claims have been invented.

## Run locally

Use Node.js **24 LTS** and npm with the committed `package-lock.json`:

```sh
npm ci
npm run dev
```

The historical `bun.lock` is retained, but npm is the verified install path for this revision. Do not alternate package managers when updating dependencies.

## Validate

```sh
node --test tests/*.test.mjs
npm run build
```

The tests cover window bounds, window-state transitions, safe URL routing, and corrupted/blocked browser storage. CI runs these checks on pull requests and pushes to `master`.

The build performs TypeScript checks and creates `dist/`. TypeScript is configured not to emit declarations beside source files. Historical generated declaration files remain in the repository; they are not build outputs of this revision.

Automated build and logic checks do **not** replace browser testing. Before merging, check the flows in [REVIEW.md](REVIEW.md), particularly the live shell, PDF viewer, gallery provider, mobile layouts, and keyboard interactions.

## Customize

| Content | Location |
| --- | --- |
| Name, role, email, avatar, social links | `src/data/portfolio.ts` |
| Project folder names and URLs, original bio | `src/constants/index.ts` |
| Project summaries, categories, tags | `src/data/portfolio.ts` |
| Desktop layout and copy | `src/components/Welcome.tsx` |
| Desktop/window styles | `src/desktop.css` |
| Résumé | `public/files/resume.pdf` |
| Default gallery | `src/constants/initialImages.json` |
| Search title/description and no-JavaScript fallback | `index.html` |

When changing identity, update `index.html` and the original about text as well. The current source identifies the owner as **Pratham Jaiswal**; it has not been replaced using information from outside the repository.

## Optional photo uploads

Copy `.env.example` to `.env.local` and fill in the Cloudinary cloud name and unsigned upload preset. Without both values, the upload button is hidden and the existing gallery remains usable.

The browser accepts JPG, PNG, WebP, or GIF under 10 MB and reports upload failures/timeouts. Also enforce limits and allowed formats on the Cloudinary preset. An unsigned preset is public and permits uploads: do not enable it unless visitor uploads are intentional. Use a server-authorized upload flow if moderation, per-user quotas, or private uploads become necessary. Never expose a Cloudinary API secret in `VITE_` variables.

Removing/resetting gallery items only changes this browser’s collection. It does not delete cloud assets. Favorites and wallpaper preferences stay local; if storage is blocked, the app continues in memory.

## Deployment

Use the existing Vercel project with build command `npm run build` and output directory `dist`. Preserve `vercel.json`: the real terminal needs its cross-origin isolation headers. Other static hosts must send equivalent headers. The browser, WebContainer runtime, external image provider, and unauthenticated GitHub API impose availability/compatibility limits; the portfolio supplies fallbacks rather than assuming they always work.

This change does not require a database, new paid service, or a hosting migration. Search metadata and a no-JavaScript contact/résumé fallback are included. The full interactive content is client rendered; static prerendering would be a separate enhancement if search indexing becomes a primary goal.

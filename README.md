# MacFolio

An interactive, macOS-inspired engineering portfolio for **Pratham Jaiswal**.

**Live:** https://mac-folio-three.vercel.app/

MacFolio is intentionally more than a landing page. It behaves like a small desktop environment so visitors can explore projects, GitHub, a real browser-based terminal, photos, resume, and contact information without losing the simplicity of a portfolio.

> Not affiliated with or endorsed by Apple. macOS names and visual references are used only as interface inspiration.

## Fast path

You do not need to learn the desktop to use the portfolio.

- Press **⌘ K** on macOS or **Ctrl K** elsewhere to open Spotlight.
- Search for a project, **Resume**, **GitHub**, **Terminal**, **Photos**, or **Contact**.
- Use **Alt W** to close the active window.

## What works

- **Window manager** — draggable, resizable, focusable, minimizable, maximizable windows with geometry-preserving restore.
- **Finder** — navigable project folders plus functional image, text, and PDF previews.
- **Spotlight** — real search/launcher with keyboard navigation and project deep-links.
- **Safari** — portfolio browser surface with a resilient GitHub profile view and graceful API-rate-limit fallback.
- **Terminal** — xterm.js backed by a real WebContainer shell, booted only when Terminal is opened.
- **Photos** — gallery, favorites, lightbox, wallpaper changes, and privacy-preserving local photo additions.
- **Menu bar + Dock** — working app launcher, Wi-Fi state, current time, keyboard-accessible controls, and reduced-motion support.
- **Responsive behavior** — touch-friendly Finder interactions and full-screen mobile windows.

## Selected work

Finder currently highlights public projects that visitors can actually access:

- **MacFolio** — this interactive portfolio.
- **Atlas** — a personalized AI news agent.
- **CrawlMind** — AI-powered crawling and research tooling.
- **Job Finder CLI** — multi-source job discovery and ranking CLI.
- **Threadline** — product/landing-page work.
- **Solverse** — Web3 product work.
- **T3MP3ST** — authorized-security engineering framework.

## Engineering

```
React 19
TypeScript 5.9
Vite 7
Tailwind CSS 4
Zustand + Immer
GSAP + Draggable
xterm.js
WebContainer API
```

### Performance decisions

Heavy desktop apps are code-split and mounted only after they are launched. The WebContainer runtime is dynamically imported and booted only for Terminal, rather than on every page visit. Small one-purpose dependencies were removed in favor of native browser APIs and existing primitives.

### Security and privacy

- No server secret is required by the frontend.
- Visitor-added gallery images stay in that visitor's browser storage; they are not uploaded to a shared cloud account.
- Vercel sends COOP/COEP headers required by WebContainer plus baseline browser-hardening headers.
- External links use isolated new-tab behavior where applicable.

### Accessibility

- Semantic window-control buttons with labels.
- Visible keyboard focus states.
- Spotlight is fully keyboard navigable.
- Reduced-motion preferences are respected.
- Decorative imagery is hidden from assistive technology where appropriate.

## Local development

### Requirements

- Node.js **22.12+**
- npm 10+ (or a current Bun release)

```bash
git clone https://github.com/pantha704/MacFolio.git
cd MacFolio
npm ci
npm run dev
```

Validate a production build:

```bash
npm run check
```

## Deployment

The current deployment targets Vercel. `vercel.json` includes the cross-origin isolation headers required for the browser terminal.

```bash
npm run build
```

The generated static app is emitted to `dist/`.

## Customization

Most portfolio content lives in `src/constants/index.ts`.

- Projects: `WORK_LOCATION`
- About copy: `ABOUT_LOCATION`
- Resume: `public/files/resume.pdf`
- Social links: `socials`
- Default gallery: `src/constants/initialImages.json`
- Global desktop styling: `src/index.css`

SEO/social metadata lives in `index.html`, with crawler files in `public/`.

## Quality gate

Every push and pull request runs:

1. ESLint
2. TypeScript project build
3. Vite production build

See `.github/workflows/ci.yml`.

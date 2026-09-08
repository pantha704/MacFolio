# MacFolio upgrade review

## Completed in this revision

The desktop now leads with the developer and selected work. Finder exposes project summaries and real links; Spotlight searches real applications and projects. Résumé and archive image actions now open viewers. The window manager preserves normal dimensions during maximize/restore, bounds drag/resize, keeps minimized app state, and uses mobile-specific geometry.

Terminal code and boot are deferred until opening the app. Shell streams, subscriptions, processes, and observers are cleaned up. Safari validates URL schemes/hosts and GitHub handles HTTP errors, invalid result shapes, timeouts, and retry. Gallery includes keyboard-friendly controls, a modal viewer, lazy images, local favorites, and optional uploads with validation and feedback. The Wi-Fi simulation has an explicit recovery button and no longer persists a locked-out desktop.

No new dependency versions were introduced. Existing wallpaper and project assets are reused. Browser fonts replace the remote Google Fonts stylesheet on the initial page.

## Validation recorded

- `npm ci --no-audit --no-fund`: successful.
- `npm run build`: TypeScript and production bundle successful.
- `node --test tests/*.test.mjs`: 7 passing tests.
- Browser/visual/end-to-end testing: **not performed** in this revision.
- External services, current résumé accuracy, and project descriptions: no end-to-end verification or owner content sign-off claimed.

## Before merging

1. Review desktop at 1440×900, laptop at 1280×720, and mobile at 390×844 and 320×568. Repeat at 200% zoom. Check text wrapping, vertical scrolling, dock visibility, and the Safari address field.
2. Open each project from the desktop and Finder; use the back button, sidebar, and filter. Verify the project links still describe the intended work.
3. Open overlapping apps, focus each, drag to edges, resize, maximize/restore, minimize/reopen, and close. Rotate a mobile device with a window open.
4. Use only the keyboard to reach desktop actions, dock, window controls, Finder, and Spotlight. Check search filtering, Enter, Escape, focus return, and Alt W.
5. View and download the résumé; confirm the PDF is current. Source identity is Pratham Jaiswal. Replace the PDF explicitly if necessary.
6. Browse/favorite photos, navigate a lightbox, set/reset wallpaper, remove an item, and reload. Verify blocked storage doesn’t crash the page. If Cloudinary is enabled, test upload success, rejected format/size, and network failure.
7. Open Terminal on a supported cross-origin-isolated browser, enter commands, resize it, minimize/restore it, then close/reopen it. Check its fallback in an unsupported browser.
8. Open GitHub in Safari and try retry after a blocked/rate-limited request. Verify external searches/links open new tabs. Test reduced-motion preferences.

## Remaining opportunities

Deeper project case studies should be based on actual architecture choices, screenshots, and measured outcomes supplied or confirmed by the owner. Full prerendering, custom-domain canonical metadata, and measured Core Web Vitals can follow the visual review. Avoid presenting unmeasured speed improvements or client-rendered SEO as guarantees.

# CVault — Private Code Snippet Manager

## Overview
CVault is a private alternative to GitHub Gist. Snippets are shareable via secret links or password-protected. The app now includes a local backend with username/password accounts, Redis-backed CAPTCHA/session/rate-limit state, HTTP-only sessions, server-side snippet persistence, and server-side password/expiration checks.

## Tech Stack
- Next.js 16 (App Router, TypeScript, Tailwind CSS v4)
- shadcn/ui — component library (Radix + Tailwind)
- Framer Motion — animations (page transitions, stagger, layout, hover)
- @uiw/react-codemirror — code editor with syntax highlighting
- next-themes — dark/light mode toggle
- Lucide React — icons
- Geist + Geist Mono — local fonts (no CDN, served from /public/fonts/)

## Color Palette (No Purple)
- Primary: green-500 (#22c55e) / green-600 hover
- Accent: amber-500 (#f59e0b) — for password/highlights
- Background dark: zinc-950 / light: zinc-50
- Card dark: zinc-900 / light: white

## Routes
| Route | Purpose |
|---|---|
| `/` | Landing — hero, feature cards, recent snippets |
| `/login` | Username/password sign-in with local CAPTCHA |
| `/register` | Local account creation with CAPTCHA |
| `/snippets` | Library — grid/list, search, filter |
| `/snippets/new` | Create — code/text toggle, CodeMirror or textarea |
| `/snippets/[id]` | Owner view — syntax highlight, copy, share, edit, delete |
| `/snippets/[id]/edit` | Edit — pre-filled form |
| `/s/[id]` | Shared — minimal chrome, password gate |

## Key Components
| Component | File | Notes |
|---|---|---|
| Header | `components/header.tsx` | Nav, theme toggle, mobile menu |
| Footer | `components/footer.tsx` | Coaxys credit + arsamsabbagh.ir link |
| Hero | `components/hero.tsx` | Gradient text, stagger cards |
| SnippetCard | `components/snippet-card.tsx` | Layout animation, grid/list |
| CodeEditor | `components/code-editor.tsx` | CodeMirror wrapper, 13+ langs |
| CodeViewer | `components/code-viewer.tsx` | Read-only + copy button |
| PrivacyToggle | `components/privacy-toggle.tsx` | Secret/Password slider |
| PasswordGate | `components/password-gate.tsx` | Password modal |
| SearchBar | `components/search-bar.tsx` | Live filter |
| ViewToggle | `components/view-toggle.tsx` | Grid/list switch |
| TagInput | `components/tag-input.tsx` | Comma-separated tags |
| LanguageSelector | `components/language-selector.tsx` | Language dropdown |
| ExpirationSelector | `components/expiration-selector.tsx` | Expiry dropdown |
| EmptyState | `components/empty-state.tsx` | Floating icon illustration |
| ThemeProvider | `components/theme-provider.tsx` | next-themes wrapper |
| PageTransition | `components/page-transition.tsx` | AnimatePresence wrapper |

## Animation Strategy
- All Framer Motion `initial` props set to `false` — content visible by default on SSR, animations play on client mount
- `whileHover` / `whileTap` micro-interactions on buttons/cards
- Stagger children on card grids
- Layout animations on grid/list toggle
- Hero gradient shimmer via CSS keyframes

## Data Layer
- `lib/types.ts` — Snippet interface, PrivacyType, Expiration, LANGUAGES list
- `lib/mock-data.ts` — legacy demo snippets only; production does not seed demo users/snippets
- `lib/server-db.ts` — local JSON datastore in `data/db.json`, expiration helpers, public snippet sanitizer
- `lib/server-redis.ts` — Redis client with in-memory fallback
- `lib/server-security.ts` — HTTP-only sessions and local CAPTCHA backed by Redis
- `lib/server-rate-limit.ts` — Redis-backed rate limiting
- `lib/server-password.ts` — password hashing and verification
- `lib/api-client.ts` — client-side API wrapper
- `app/api/**` — auth, snippet CRUD, and shared-snippet route handlers
- `lib/utils.ts` — cn() from shadcn

## Deployment
- Public URL: `https://snp.coaxys.ir`
- Production build: `npm run build`
- Process manager: `cvault.service` systemd unit
- App upstream: `next start -H 127.0.0.1 -p 3005`
- Nginx reverse proxy: HTTPS on port 443 → `127.0.0.1:3005`
- Redis: `REDIS_URL=redis://127.0.0.1:6379`
- Service env: `CVAULT_SECRET`, `CVAULT_SECURE_COOKIES=true`, `REDIS_URL`
- All runtime dependencies local (fonts in `/public/fonts/`, icons and editor bundled from npm, no CDN/remote ESM)
- CSP restricts scripts, styles, fonts, images, media, and API connections to local/self sources

## Production Commands
- Rebuild app: `npm run build`
- Restart app: `systemctl restart cvault.service`
- Check app: `systemctl status cvault.service --no-pager -l`
- Check nginx: `nginx -t && systemctl reload nginx`
- Check Redis: `redis-cli ping`
- Inspect Redis CVault keys: `redis-cli --scan --pattern 'cvault:*'`

## What's Done
- Full frontend with all 6 routes
- Code + Text snippet creation toggle
- CodeMirror editor with 13 language extensions
- Privacy toggle (secret link / password-protected)
- Expiration options (never, 1h, 1d, 1w)
- Tag input
- Snippet library with grid/list view + search
- View snippet with copy, share, edit, delete
- Password gate modal
- Shared snippet minimal view
- Dark/light theme (green/amber palette, zero purple)
- Footer with Coaxys + arsamsabbagh.ir link
- Responsive on mobile/tablet/desktop
- Framer Motion animations (visible-then-animate pattern)
- All fonts/resources served locally
- Production build + nginx proxy (HTTPS, snp.coaxys.ir)
- systemd service enabled for boot
- No demo account or demo snippets seeded in production

## Backend Status
- Local username/password authentication with HTTP-only session cookie
- Fully local CAPTCHA for login and registration, stored in Redis
- Redis-backed session storage, CAPTCHA storage, and rate limits
- Server-side hashed user and snippet passwords
- Persistent server datastore in `data/db.json`
- API endpoints for snippet CRUD and shared snippet access
- Server-side password verification for shared snippets
- Server-side expiration enforcement

## What's Remaining
- PostgreSQL adapter if this needs multi-instance deployment
- Redis persistence hardening/monitoring if sessions must survive Redis restarts
- Real-time collaboration
- Comments on snippets
- Embed widgets for shared snippets
- Snippet templates

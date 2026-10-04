# Portfolio OS — a futuristic personal technology portfolio

A single-page, **static, zero-dependency** portfolio built with **HTML5, CSS3 and vanilla
JavaScript (ES6+)**, plus **SVG** and **Canvas**. It ships with a 17-theme visual engine, an
interactive skill explorer, a project showcase driven by a plain JS data array, a command
palette, a terminal, Web-Audio ambient mode and an optional **Portfolio OS** desktop with
draggable windows.

No backend. No build step. No framework. It works by double-clicking `index.html` **and** when
deployed to `https://USERNAME.github.io/REPOSITORY/`.

---

## 1. Overview

The site presents a multidisciplinary builder working across cybersecurity, AI, robotics,
embedded systems, RF/SDR, software engineering, research and design. Content is honest by
default: anything you have not filled in yet renders as a visible `[ADD …]` placeholder instead
of an invented achievement.

* **Deliverables:** `index.html`, `style.css`, `script.js`, `README.md`, `favicon.svg`, `assets/`
* **Zero dependencies** — Google Fonts are the only external request, and every font family has
  a local fallback stack, so the site still looks correct with no internet connection.
* **GitHub Pages ready** — all paths are relative, no environment variables, no API keys.

### Project structure

```text
portfolio/
├── index.html            # markup: every section + overlays
├── style.css             # design tokens, 17 themes, components, responsive rules
├── script.js             # config, data, theme engine, interactions
├── README.md
├── favicon.svg
└── assets/
    ├── images/           # avatar.svg (replace with your photo)
    ├── icons/            # extra icons if you want file-based ones
    ├── projects/         # project screenshots (placeholder.svg included)
    └── cv.pdf            # placeholder CV — replace with your real one
```

---

## 2. Features

| Area | What you get |
| --- | --- |
| **Theme engine** | 17 visual systems (+1 secret) that change typography, spacing, radius, borders, shadows, textures, layout behaviour and animation — not just colours |
| **Appearance** | Separate dark/light mode, custom accent colour, accent reset, reduced motion, custom cursor |
| **Persistence** | Theme, mode, accent, motion, locale, mute, dismissed notices, GitHub cache — all in `localStorage` |
| **Skills** | 9 domains, ~100 skills, category filters, proficiency bars, expandable cards, detail panel, interactive SVG radar chart, learning/practicing/advanced states |
| **Projects** | Data-driven cards, featured strip, category filters, debounced search, 5 sort modes, detail modal with problem/solution/architecture/challenges/results, GitHub + demo links |
| **Certifications** | Filterable + searchable cards, credential ID, verify link, detail modal |
| **Timeline** | Kind filters (learning/project/certification/research/achievement) with scroll reveal |
| **Achievements** | Animated counters (never inflated), grouped achievement cards, live GitHub stats panel with fallback |
| **Command palette** | `Ctrl/⌘ + K`, fuzzy-ish search across commands, navigation, themes and actions |
| **Global search** | `/` opens search mode; searches projects, skills, certifications, timeline and sections |
| **Terminal** | `help`, `about`, `skills`, `projects`, `github`, `contact`, `theme`, `mode`, `cv`, `open`, `search`, `neofetch`, `ambient`, `clear`, `exit` + easter eggs |
| **Portfolio OS** | Optional desktop mode: draggable, resizable, minimisable, maximisable windows with layering |
| **Ambient mode** | Optional Web Audio drone synthesised in the browser — never autoplayed, mute-able |
| **i18n** | English complete, Bengali scaffold (`I18N.bn`) with graceful fallback |
| **A11y** | Semantic landmarks, ARIA, focus trapping, skip link, visible focus, reduced-motion support |
| **Performance** | Lazy-loaded images, `IntersectionObserver` reveals, rAF-throttled canvas, debounced inputs, transform-only animation |
| **SEO** | Title, description, Open Graph, Twitter card, canonical placeholder, JSON-LD `Person` schema, favicon |

---

## 3. Installation

Nothing to install.

```bash
# 1. Open directly
open index.html            # macOS
start index.html           # Windows
xdg-open index.html        # Linux

# 2. Or serve it locally (recommended while editing, avoids file:// quirks)
python -m http.server 8000
# → http://localhost:8000
```

`localStorage` may be blocked on `file://` in some browsers; themes then simply stop persisting.
Everything else keeps working.

---

## 4. Changing your personal information

Everything personal lives in **one object** at the top of `script.js`:

```javascript
const portfolioConfig = {
  name: 'YOUR NAME',
  username: 'YOUR_GITHUB_USERNAME',   // used by the live GitHub panel
  email: 'YOUR_EMAIL',
  github: 'https://github.com/YOUR_GITHUB_USERNAME',
  linkedin: '#',
  discord: '#',
  x: '#',
  website: '#',
  location: 'Bangladesh',
  role: 'Cybersecurity & AI Engineer · Builder · Researcher',
  tagline: 'CYBERSECURITY × AI × ROBOTICS',
  cvPath: 'assets/cv.pdf',
  resumeFileName: 'YOUR_NAME_CV.pdf',
  accent: '#22d3ee',
  theme: 'cybercore',
  mode: 'dark',
  defaultLocale: 'en',
  githubCacheMinutes: 30
};
```

Then search `index.html` / `script.js` for the remaining `YOUR_*` and `[ADD …]` placeholders:

* `index.html` — `<title>`, meta description, Open Graph/Twitter URLs, canonical URL, JSON-LD,
  avatar `alt` text, hero lede, About bio, philosophy sentences, mission statement.
* `script.js` — `IDENTITY_CHIPS`, `PHILOSOPHY`, `INTERESTS`, `PROJECTS`, `CERTIFICATIONS`,
  `TIMELINE`, `ACHIEVEMENT_STATS`, `ACHIEVEMENT_GROUPS`, `CONTACT_NOTES`.

A dismissible banner reminds you while placeholders remain. It disappears automatically once
`portfolioConfig` no longer contains `YOUR_` values, and can be hidden for good by clearing
`localStorage`.

**Images to replace**

| File | Purpose |
| --- | --- |
| `assets/images/avatar.svg` | About-section portrait / OS avatar |
| `assets/projects/*` | Project screenshots — set `image: 'assets/projects/your-shot.png'` per project |
| `assets/cv.pdf` | Replace with your real CV (keep the name, or update `cvPath`) |
| `favicon.svg` | Your mark (keep the same file name) |

Any project without an `image` automatically gets a generated SVG poster, so nothing ever
displays a broken image.

---

## 5. Adding a project

Append an object to the `PROJECTS` array in `script.js` — a card, a filter count, a search hit and
a detail modal are created automatically:

```javascript
{
  id: 'my-project',                     // unique, used for anchors and modals
  title: 'Project Name',
  category: 'Cybersecurity',            // must match a label in PROJECT_CATEGORIES
  status: 'Completed',                  // free text badge
  year: 2026,
  featured: true,                       // shows in the featured strip
  description: 'One or two sentences shown on the card.',
  technologies: ['Python', 'Linux', 'Networking'],
  github: 'https://github.com/you/repo',
  demo: 'https://your-demo.example',
  image: 'assets/projects/my-project.png',   // '' → generated poster
  problem: 'What was broken or unknown.',
  solution: 'What you built to fix it.',
  architecture: 'How the pieces fit together.',
  challenges: 'What fought back.',
  results: 'What changed, measured honestly.'
}
```

If you need a new category, add it to `PROJECT_CATEGORIES` (filters and counts update by
themselves).

---

## 6. Adding a skill, certificate or timeline entry

```javascript
// SKILL_GROUPS → items: [name, level, score, note]
['Ghidra', 'learning', 48, 'Reverse-engineering binaries in a lab environment.'],

// CERTIFICATIONS
{ name: 'Certified Thing', issuer: 'Issuer', date: '2026', credentialId: 'ABC-123',
  url: 'https://verify.example/ABC-123', category: 'Cybersecurity', note: 'What it proves.' },

// TIMELINE (kind: learning | project | certification | research | achievement)
{ year: '2026', date: '2026 — Now', title: 'Milestone', org: 'Context',
  kind: 'research', text: 'What happened and why it mattered.', tech: ['Python'] }
```

Levels must be `learning`, `practicing` or `advanced` (they drive the badge colour and the
weighting in `LEVELS`). The radar chart averages the scores per domain, so it updates as you edit.

Achievement counters stay at `[ADD]` while `value: 0`. Set a real number to animate it:

```javascript
const ACHIEVEMENT_STATS = [
  { key: 'projects', value: 12, suffix: '+', label: 'Projects', note: 'Shipped and tested', icon: 'grid' }
];
```

---

## 7. Themes

The default theme is set via `data-theme` on `<html>`. Switch it in the **Theme Studio** (palette
icon in the nav, or `Ctrl/⌘ + K` → “Open Theme Studio”), or programmatically:

```javascript
applyTheme('cyberpunk');      // console / any script
applyMode('light');           // dark | light
applyAccent('#ff2d55');       // custom accent
applyMotion('reduced');       // full | reduced
```

### Available themes

`claymorphism` · `cybercore` · `scrapbook` · `surrealism` · `pixel` · `glassmorphism` ·
`neumorphism` · `bento` · `editorial` · `swiss` · `minimalism` · `maximalism` · `luxury` ·
`strap` · `bohemian` · `cyberpunk` · `wabi` · (+ secret `void`)

Each theme is a block of CSS custom properties plus a few component rules, for example:

```css
[data-theme="cyberpunk"] {
  --bg-base: #08000f;
  --accent: #ff2fd0;
  --tex: repeating-linear-gradient(0deg, ...);   /* texture layer */
  --btn-transform: uppercase;
  --shadow-3: 0 0 0 1px var(--accent), 0 0 48px -8px var(--accent);
}
[data-theme="cyberpunk"] .section__title { text-shadow: 2px 0 var(--accent-2), -2px 0 var(--accent); }
```

Light mode is derived automatically from each theme's `--bg-base` / `--surface-base` /
`--ink-base` triplets using `color-mix()`, so all 17 themes get a coherent light presentation. To
hand-tune one, add:

```css
[data-theme="yourtheme"][data-mode="light"] { --bg: #fff; --text: #111; }
```

### Adding your own theme

1. Register it in the `THEMES` array in `script.js` (id, name, description, preview colours,
   optional font).
2. Add a `[data-theme="yourid"] { … }` token block in `style.css`.
3. Optionally add its accent defaults to `THEME_ACCENTS` / `THEME_ACCENT_2`.

---

## 8. Keyboard shortcuts

| Keys | Action |
| --- | --- |
| `Ctrl/⌘ + K` | Open / close the command palette |
| `/` | Open global search |
| `Esc` | Close any dialog, overlay, modal or OS window focus |
| `Ctrl/⌘ + Shift + L` | Toggle dark / light mode |
| `Ctrl/⌘ + Shift + O` | Enter / exit Portfolio OS |
| `↑` / `↓` + `Enter` | Navigate and run palette items |
| `Tab` / `Shift + Tab` | Focus is trapped inside open dialogs |
| `↑` / `↓` in the terminal | Command history |

**Easter eggs** — the Konami code (`↑↑↓↓←→←→BA`), and in the terminal: `sudo`, `matrix`, `hack`,
`coffee`, `konami`. One of them unlocks a hidden theme.

---

## 9. Everything stored in `localStorage`

Key: `portfolio-os.v1`

| Field | Meaning |
| --- | --- |
| `theme` | Selected theme id |
| `mode` | `dark` or `light` |
| `accent` / `accentCustom` | Accent colour and whether it overrides the theme default |
| `motion` | `full` or `reduced` |
| `locale` | `en` or `bn` |
| `muted` | Audio mute preference |
| `cursor` | Custom cursor preference |
| `bannerDismissed` | Setup notice dismissed |
| `voidUnlocked` | Secret theme unlocked |

GitHub responses are cached under `portfolio-os.github.cache` for `githubCacheMinutes`.

Clear everything with `Ctrl/⌘ + K` → **Reset preferences**, or in the console:

```javascript
localStorage.removeItem('portfolio-os.v1');
localStorage.removeItem('portfolio-os.github.cache');
```

---

## 10. GitHub integration (no backend)

The Achievements section calls the public GitHub REST API directly from the browser, using only
`portfolioConfig.username`:

* `https://api.github.com/users/USERNAME`
* `https://api.github.com/users/USERNAME/repos?per_page=100&sort=updated`

It shows public repos, total stars, followers, following and the six most-starred repositories.
Failures are handled deliberately:

1. Live fetch → cached (30 min) → stale cache → `offline` fallback object.
2. The page never breaks; a note explains what happened.
3. Unauthenticated API access is rate-limited to 60 requests/hour per IP — the cache keeps normal
   browsing well inside that.
4. Contribution-graph data requires an authenticated GraphQL request (a token), which a static
   site must not embed, so it is intentionally omitted.

While `username` is still `YOUR_GITHUB_USERNAME`, the site skips the network entirely and shows
the configuration hint instead.

---

## 11. Deploying to GitHub Pages

### Option A — repository root site

```bash
git init
git add .
git commit -m "Add portfolio"
git branch -M main
git remote add origin https://github.com/USERNAME/USERNAME.github.io.git
git push -u origin main
```

Pages for a `USERNAME.github.io` repository is served at `https://USERNAME.github.io/`.

### Option B — project subdirectory (recommended for this repo layout)

```bash
git init
git add .
git commit -m "Add portfolio"
git branch -M main
git remote add origin https://github.com/USERNAME/portfolio.git
git push -u origin main
```

Then in GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch →
Branch: `main` → Folder: `/ (root)` → Save**.

The site goes live at `https://USERNAME.github.io/portfolio/`.

If you keep the files in a subfolder (for example `portfolio/`), either move them to the
repository root or set the Pages folder to `/docs` and rename the folder to `docs`.

### Option C — automated with Actions

`.github/workflows/pages.yml`:

```yaml
name: Deploy portfolio to Pages
on:
  push:
    branches: [main]
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: true
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: .
      - id: deployment
        uses: actions/deploy-pages@v4
```

### Checklist before you publish

* [ ] Replace every `YOUR_*` value in `portfolioConfig`.
* [ ] Update `<title>`, meta description, canonical URL, Open Graph and Twitter URLs in `index.html`.
* [ ] Replace `assets/cv.pdf`, `assets/images/avatar.svg` and project images.
* [ ] Confirm every project `github` / `demo` link is real (no `#`).
* [ ] All paths are relative — do **not** add a leading `/` to any `href` or `src`.
* [ ] `.nojekyll` is optional here; this site uses no `_`-prefixed folders.

A custom domain only needs a `CNAME` file containing your domain in the same folder as
`index.html`.

---

## 12. Customisation notes

* **Accent tokens** — `--accent` and `--accent-2` drive the whole palette; `--accent-soft`,
  `--accent-ink` and the gradient usages derive from them.
* **Typography** — `--font-display`, `--font-body`, `--font-mono`, plus `--fs-h1`, `--fs-h2`,
  `--tracking-*`, `--leading*`.
* **Shape and space** — `--radius*`, `--border-w`, `--gap`, `--space-scale`, `--section-pad`.
* **Motion** — `--motion` scales every duration; `[data-motion="reduced"]` also removes decorative
  layers and stops the canvas loops.
* **Textures** — `--tex` and `--tex-size` paint the fixed background decoration layer; `--deco`
  controls its opacity.
* **Radar chart** — `renderRadar()` in `script.js` builds the SVG from `groupScores()`; change the
  `radius` / `size` constants or the label shortening to taste.
* **Ambient audio** — `startAmbient()` synthesises a drone from three oscillators plus filtered
  noise. Adjust the frequencies or `master.gain` target to change the character. Audio never
  starts without a user action.

---

## 13. Testing checklist

Verified manually in Chrome (mobile-width and 1440px desktop):

* [x] Theme switching changes typography, radius, surfaces, borders, shadows and textures
* [x] Dark/light derivation, custom accent, accent reset, persistence across reloads
* [x] Reduced motion: attribute, CSS suppression, canvas loops stopped
* [x] Command palette open/close, filtering, arrow keys, Enter execution
* [x] Global search across projects, skills, certifications, timeline, sections
* [x] Project filters, debounced search, empty state, sorting, detail modal
* [x] Skill filters, expandable cards, detail panel, radar interaction
* [x] Certification filters/search, timeline filters, animated counters
* [x] Terminal commands, history, easter eggs
* [x] Portfolio OS: open, drag, resize, minimise, restore, maximise, close, layering
* [x] Mobile menu open/close, body scroll lock, focus return
* [x] Modal Escape / click-outside / focus trap / focus return
* [x] GitHub fallback path (no username configured) and live path (configured)
* [x] No console errors; no horizontal overflow at 430px or 1440px
* [x] Relative paths only, so it works from a Pages subdirectory

---

## 14. License

MIT — use it, fork it, theme it, ship it. Replace the placeholder content with your own work.

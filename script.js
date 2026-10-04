/* ==========================================================================
   PORTFOLIO OS — script.js
   --------------------------------------------------------------------------
   Vanilla ES2020+. No dependencies, no build step, works from file:// and
   from a GitHub Pages project subdirectory.

   Architecture
     1.  CONFIG          — everything personal lives here
     2.  DATA            — skills, projects, certificates, timeline, achievements
     3.  STATE + STORE   — localStorage persistence
     4.  UTILS           — DOM, formatting, helpers
     5.  TOASTS          — non-blocking notifications
     6.  THEME ENGINE    — themes, mode, accent, motion, persistence
     7.  I18N            — English + Bengali scaffold
     8.  APP SHELL       — nav, reveal, progress, hero, cursor, shortcuts
     9.  SECTIONS        — about, skills + radar, projects, timeline, certs,
                           achievements, github, contact
     10. OVERLAYS        — modal, command palette, theme studio, terminal
     11. PORTFOLIO OS    — draggable window manager
     12. AMBIENT         — Web Audio drone (never autoplayed)
     13. SECRETS         — konami, hidden theme, terminal easter eggs
     14. BOOT            — restore state, render, wire events
   ========================================================================== */
'use strict';

/* ============================ 1. CONFIG ================================= */
const portfolioConfig = {
  name: 'YOUR NAME',
  username: 'YOUR_GITHUB_USERNAME',   // GitHub username used by the live API panel
  email: 'YOUR_EMAIL',
  github: 'https://github.com/YOUR_GITHUB_USERNAME',
  linkedin: '#',                      // e.g. https://www.linkedin.com/in/your-handle
  discord: '#',
  x: '#',
  website: '#',
  location: 'Bangladesh',
  role: 'Cybersecurity & AI Engineer · Builder · Researcher',
  tagline: 'CYBERSECURITY × AI × ROBOTICS',
  cvPath: 'assets/cv.pdf',            // local file, works on GitHub Pages
  resumeFileName: 'YOUR_NAME_CV.pdf',
  accent: '#22d3ee',
  theme: 'cybercore',
  mode: 'dark',
  defaultLocale: 'en',
  githubCacheMinutes: 30
};

/* A value is "placeholder" when it still contains the YOUR_/ADD tokens. */
const PLACEHOLDER_RE = /YOUR_|\[ADD|REPOSITORY/;

/* ============================= 2. DATA ================================== */

/* --- 2.1 Theme registry ------------------------------------------------- */
/* "preview" drives the mini visual preview in the Theme Studio, "family"
   drives extra preview affordances. Everything visual lives in style.css. */
const THEMES = [
  { id: 'claymorphism', name: 'Claymorphism', desc: 'Soft inflated 3D surfaces', family: 'soft',
    preview: { bg: '#10131c', surface: '#232a3d', ink: '#f2f5ff', accent: '#ff8fab', radius: 14, bw: '0px', border: '#3a4460' } },
  { id: 'cybercore', name: 'Cybercore', desc: 'Dark technical data panels', family: 'grid',
    preview: { bg: '#04070f', surface: '#0b1a2c', ink: '#dff3ff', accent: '#22d3ee', radius: 3, bw: '1px', border: '#1d3b52' } },
  { id: 'scrapbook', name: 'Scrapbook', desc: 'Paper, tape and handwriting', family: 'paper',
    preview: { bg: '#efe3cd', surface: '#fdf8ee', ink: '#2f2418', accent: '#d9534f', radius: 2, bw: '1px', border: '#c9b895', cls: 'theme-preview--tilt' } },
  { id: 'surrealism', name: 'Surrealism', desc: 'Unexpected dreamlike composition', family: 'art',
    preview: { bg: '#140b2b', surface: '#2a1a52', ink: '#f6ecff', accent: '#ff7a45', radius: 18, bw: '1px', border: '#584196' } },
  { id: 'pixel', name: 'Pixel Art', desc: 'Retro game UI, hard edges', family: 'pixel',
    preview: { bg: '#181425', surface: '#332a4d', ink: '#f4f4ff', accent: '#ffe066', radius: 0, bw: '3px', border: '#0d0a14', cls: 'theme-preview--pixel' }, font: "'Press Start 2P', monospace" },
  { id: 'glassmorphism', name: 'Glassmorphism', desc: 'Frosted translucency', family: 'glass',
    preview: { bg: '#08132b', surface: '#1d3f70', ink: '#f4f8ff', accent: '#67e8f9', radius: 14, bw: '1px', border: '#7fb6e8', shadow: 'inset 0 1px 0 rgb(255 255 255 / .3)', cls: 'theme-preview--glass' } },
  { id: 'neumorphism', name: 'Neumorphism', desc: 'Soft extruded depth', family: 'soft',
    preview: { bg: '#171b24', surface: '#1d2230', ink: '#e9edf9', accent: '#8b7cff', radius: 14, bw: '0px', border: '#2a3040', shadow: '4px 4px 10px rgb(0 0 0 / .6), -4px -4px 10px rgb(255 255 255 / .05)' } },
  { id: 'bento', name: 'Bento Grid', desc: 'Modular information tiles', family: 'grid',
    preview: { bg: '#0d0f14', surface: '#1b1f27', ink: '#eef1f7', accent: '#ffb347', radius: 10, bw: '1px', border: '#31363f' } },
  { id: 'editorial', name: 'Editorial', desc: 'Magazine typography', family: 'paper',
    preview: { bg: '#f7f4ee', surface: '#fffdf8', ink: '#14110c', accent: '#b3352b', radius: 2, bw: '1px', border: '#cfc7b8' }, font: "'Playfair Display', Georgia, serif" },
  { id: 'swiss', name: 'Swiss', desc: 'Grid, clarity, structure', family: 'grid',
    preview: { bg: '#f2f2f1', surface: '#ffffff', ink: '#101010', accent: '#e00000', radius: 0, bw: '1px', border: '#111111' }, font: "Inter, Helvetica, sans-serif" },
  { id: 'minimalism', name: 'Minimalism', desc: 'Restraint and space', family: 'paper',
    preview: { bg: '#fbfbfa', surface: '#ffffff', ink: '#16181c', accent: '#2b6cb0', radius: 3, bw: '1px', border: '#d8d8d6' } },
  { id: 'maximalism', name: 'Maximalism', desc: 'Dense, loud, layered', family: 'neon',
    preview: { bg: '#12002e', surface: '#3a0d70', ink: '#fff6ff', accent: '#ff2e88', radius: 8, bw: '2px', border: '#ffd400', cls: 'theme-preview--neon' }, font: "'Archivo Black', Inter, sans-serif" },
  { id: 'luxury', name: 'Luxury Typography', desc: 'Premium editorial restraint', family: 'paper',
    preview: { bg: '#0c0b09', surface: '#17150f', ink: '#f4ecdc', accent: '#c8a961', radius: 0, bw: '1px', border: '#4d4530' }, font: "'Playfair Display', Georgia, serif" },
  { id: 'strap', name: 'Conceptual Strap', desc: 'Strong graphic composition', family: 'neon',
    preview: { bg: '#101010', surface: '#1f1f1f', ink: '#f5f5f3', accent: '#d7ff3f', radius: 0, bw: '2px', border: '#f5f5f3' }, font: "'Archivo Black', Inter, sans-serif" },
  { id: 'bohemian', name: 'Bohemian', desc: 'Organic, handcrafted warmth', family: 'art',
    preview: { bg: '#1d1a14', surface: '#332c20', ink: '#f6ecd9', accent: '#d98b5f', radius: 16, bw: '1px', border: '#5c4f38', cls: 'theme-preview--tilt' }, font: "'Caveat', cursive" },
  { id: 'cyberpunk', name: 'Cyberpunk', desc: 'Neon, aggressive contrast', family: 'neon',
    preview: { bg: '#08000f', surface: '#26003a', ink: '#f7e9ff', accent: '#ff2fd0', radius: 2, bw: '1px', border: '#25f4ee', cls: 'theme-preview--neon' } },
  { id: 'wabi', name: 'Wabi-Sabi', desc: 'Imperfection and asymmetry', family: 'paper',
    preview: { bg: '#1a1815', surface: '#272319', ink: '#ece4d6', accent: '#a3855f', radius: 3, bw: '1px', border: '#4a4234', cls: 'theme-preview--tilt' }, font: "'Playfair Display', serif" },
  /* secret theme — unlocked through an easter egg */
  { id: 'void', name: 'VOID', desc: 'Terminal green, maximum glow', family: 'neon', secret: true,
    preview: { bg: '#000000', surface: '#0c0c0c', ink: '#d8ffe0', accent: '#22ff88', radius: 2, bw: '1px', border: '#22ff88', cls: 'theme-preview--pixel theme-preview--neon' }, font: "'JetBrains Mono', monospace" }
];

const ACCENT_SWATCHES = [
  { name: 'Cyan', value: '#22d3ee' },
  { name: 'Indigo', value: '#7c5cff' },
  { name: 'Magenta', value: '#ff2fd0' },
  { name: 'Ember', value: '#ff7a45' },
  { name: 'Lime', value: '#b6f34b' },
  { name: 'Rose', value: '#ff6b8b' },
  { name: 'Amber', value: '#ffb347' },
  { name: 'Teal', value: '#2dd4a7' }
];

/* --- 2.2 Profile copy --------------------------------------------------- */
const IDENTITY_CHIPS = ['Cybersecurity', 'AI / ML', 'Robotics', 'Embedded', 'SDR / RF', 'Research'];

const PHILOSOPHY = [
  'Security is a design constraint, not a feature added at the end.',
  'If it cannot be explained simply, it is not finished yet.',
  'Build in public, document the failures, share the tooling.',
  'Hardware and software are one discipline viewed from two angles.',
  'Prefer a boring solution that ships over an elegant one that does not.'
];

const INTERESTS = [
  'Penetration Testing', 'Bug Bounty', 'OSINT', 'LLM Agents', 'Computer Vision',
  'ESP32 Firmware', 'RTL-SDR', 'CubeSats', 'Astronomy', 'Open Science',
  'Design Systems', 'Data Visualisation', 'PCB Design', 'Product Strategy',
  'Technical Writing', 'CTF Competitions'
];

/* --- 2.3 Skills --------------------------------------------------------- */
/* item tuple: [name, level, score, note]  — level: learning | practicing | advanced */
const SKILL_GROUPS = [
  { id: 'security', name: 'Cybersecurity', icon: 'shield', blurb: 'Offensive security, defensive fundamentals and the tooling in between.', items: [
    ['Ethical Hacking', 'advanced', 88, 'Recon → exploitation → reporting, always inside legal lab scope.'],
    ['Penetration Testing', 'practicing', 78, 'Web and network engagements against intentionally vulnerable targets.'],
    ['Web Security', 'practicing', 80, 'OWASP Top 10, auth flows, SSRF/XSS/IDOR reasoning, secure headers.'],
    ['Bug Bounty', 'learning', 52, 'Program triage, duplicate hunting, clear reproduction reports.'],
    ['OWASP', 'practicing', 76, 'Threat modelling and checklist-driven review of application surfaces.'],
    ['Recon', 'advanced', 86, 'Subdomain enumeration, fingerprinting and attack-surface mapping.'],
    ['OSINT', 'practicing', 74, 'Public-source investigation with a documentation-first method.'],
    ['Network Security', 'practicing', 72, 'Segmentation, TLS hygiene, packet-level troubleshooting.'],
    ['Burp Suite', 'practicing', 79, 'Intercepting proxies, repeater workflows, custom extensions.'],
    ['Nmap', 'advanced', 87, 'Discovery, scripted scanning and interpreting noisy results.'],
    ['Metasploit', 'learning', 55, 'Exploitation labs and post-exploitation fundamentals.'],
    ['Wireshark', 'practicing', 73, 'Traffic analysis, protocol dissection, anomaly spotting.'],
    ['Linux', 'advanced', 90, 'Daily driver on Arch/Debian: shell, permissions, services, hardening.']
  ]},
  { id: 'programming', name: 'Programming', icon: 'code', blurb: 'Languages and the fundamentals that outlive them.', items: [
    ['Python', 'advanced', 92, 'Automation, tooling, data pipelines, FastAPI-style service sketches.'],
    ['C', 'practicing', 74, 'Pointers, memory layout, embedded-minded systems code.'],
    ['C++', 'learning', 58, 'Modern basics, STL containers, small performance-minded tools.'],
    ['JavaScript', 'advanced', 89, 'Vanilla ES6+ apps, DOM animation, API integration — no framework required.'],
    ['HTML', 'advanced', 93, 'Semantic, accessible structure first.'],
    ['CSS', 'advanced', 91, 'Design tokens, theming engines, container-aware responsive layout.'],
    ['Bash', 'practicing', 80, 'Pipelines, cron jobs, environment bootstrapping.'],
    ['Git', 'practicing', 82, 'Branching strategy, rebasing, bisecting, clean history.'],
    ['GitHub', 'advanced', 88, 'Actions, Pages, PR hygiene, issue triage.'],
    ['JSON', 'advanced', 90, 'Schema design and safe parsing/serialisation.'],
    ['APIs', 'practicing', 81, 'REST design, auth flows, rate limits, caching.'],
    ['Data Structures', 'practicing', 76, 'Choosing structures by complexity, not by habit.'],
    ['Algorithms', 'practicing', 72, 'Practice for problem solving and CTF-style challenges.']
  ]},
  { id: 'web', name: 'Web Development', icon: 'globe', blurb: 'From static sites to full-stack architecture.', items: [
    ['Frontend', 'advanced', 90, 'Component thinking, motion design, zero-jank interfaces.'],
    ['Backend concepts', 'practicing', 70, 'Request lifecycles, queues, caching, observability.'],
    ['Full Stack', 'practicing', 74, 'Shipping a feature end-to-end, API to UI.'],
    ['REST APIs', 'practicing', 80, 'Resource modelling and consumer-first contracts.'],
    ['Responsive UI', 'advanced', 92, '320px to ultrawide, touch-first where it matters.'],
    ['PWA', 'learning', 56, 'Service workers, offline shells, installable experiences.'],
    ['Accessibility', 'practicing', 78, 'Semantics, focus order, contrast, reduced motion.'],
    ['Performance', 'practicing', 79, 'Lazy loading, paint budget, avoiding layout thrash.'],
    ['UI Engineering', 'advanced', 86, 'Turning design intent into tokens and components.']
  ]},
  { id: 'ai', name: 'AI', icon: 'bot', blurb: 'Applied intelligence: models that actually do a job.', items: [
    ['Artificial Intelligence', 'practicing', 76, 'Where classical search still beats an LLM, and where it does not.'],
    ['Machine Learning', 'practicing', 74, 'Feature thinking, validation discipline, honest metrics.'],
    ['Deep Learning', 'learning', 60, 'PyTorch-style workflows, training loops, overfitting signals.'],
    ['Generative AI', 'practicing', 80, 'Prompt-to-product pipelines with guardrails.'],
    ['LLMs', 'practicing', 82, 'Context design, evaluation, cost/latency trade-offs.'],
    ['Prompt Engineering', 'advanced', 85, 'Structured prompts, few-shot patterns, output contracts.'],
    ['RAG', 'practicing', 75, 'Chunking, embedding, retrieval quality and citation discipline.'],
    ['AI Agents', 'practicing', 72, 'Tool-using loops, state handling, failure containment.'],
    ['Computer Vision', 'learning', 58, 'Detection/classification pipelines on small datasets.'],
    ['NLP', 'learning', 57, 'Classic text processing through transformer-era methods.']
  ]},
  { id: 'robotics', name: 'Robotics', icon: 'rocket', blurb: 'Sensing, deciding and moving in the real world.', items: [
    ['Arduino', 'practicing', 80, 'Fast prototypes, sensor bring-up, serial debugging.'],
    ['ESP8266', 'advanced', 84, 'Cheap networked nodes, OTA updates, sleep strategy.'],
    ['ESP32', 'advanced', 87, 'Dual-core tasks, BLE + WiFi, FreeRTOS basics.'],
    ['Sensors', 'practicing', 82, 'I²C/analog sensors, calibration, noise filtering.'],
    ['Motors', 'practicing', 74, 'Drivers, PWM speed control, feedback loops.'],
    ['Embedded Programming', 'practicing', 79, 'Interrupts, timing budgets, memory constraints.'],
    ['Robotics', 'learning', 58, 'Kinematics basics and simple autonomous behaviours.'],
    ['IoT', 'practicing', 81, 'Telemetry pipelines from device to dashboard.'],
    ['ROS / ROS2', 'learning', 45, 'Topic/service concepts and simulation experiments.'],
    ['Automation', 'practicing', 77, 'Removing repetitive work from my own workflow.']
  ]},
  { id: 'electronics', name: 'Electronics', icon: 'cpu', blurb: 'The layer beneath the code.', items: [
    ['Digital Electronics', 'practicing', 78, 'Logic families, timing, debouncing, level shifting.'],
    ['Analog Electronics', 'learning', 60, 'Op-amp intuition, filters, supply noise.'],
    ['Microcontrollers', 'practicing', 80, 'Peripheral bring-up and register-level curiosity.'],
    ['UART', 'advanced', 86, 'The debugging channel that never fails.'],
    ['SPI', 'practicing', 76, 'Displays, flash, high-speed peripherals.'],
    ['I2C', 'advanced', 85, 'Multi-device buses, address conflicts, pull-ups.'],
    ['PWM', 'advanced', 84, 'Dimming, motor control, servo timing.'],
    ['ADC', 'practicing', 78, 'Resolution, reference, sampling and smoothing.'],
    ['PCB concepts', 'learning', 52, 'Schematic capture, layout constraints, ground planes.'],
    ['Circuit Design', 'learning', 55, 'Reading datasheets and designing small functional blocks.']
  ]},
  { id: 'rf', name: 'Wireless / RF', icon: 'radio', blurb: 'Signals in the air, decoded.', items: [
    ['SDR', 'practicing', 74, 'Spectrum exploration, IQ capture, demodulation experiments.'],
    ['RTL-SDR', 'practicing', 78, 'Cheap hardware, serious listening — weather, ADS-B, pagers.'],
    ['RF fundamentals', 'learning', 58, 'Modulation, bandwidth, antennas and link budgets.'],
    ['Signal Analysis', 'learning', 60, 'Spectrograms, waterfall reading, noise floors.'],
    ['Wireless Communication', 'practicing', 72, 'Protocol stacks above the physical layer.'],
    ['Wi-Fi', 'advanced', 84, '802.11 behaviour, monitoring mode, security implications.'],
    ['Bluetooth', 'practicing', 70, 'BLE profiles, pairing models, sniffing basics.']
  ]},
  { id: 'research', name: 'Research / Science', icon: 'flask', blurb: 'Method, evidence and communicating results.', items: [
    ['Scientific Research', 'practicing', 74, 'Question → method → data → caveats → conclusion.'],
    ['Open Science', 'practicing', 80, 'Reproducible artefacts, open data, permissive licensing.'],
    ['Space Science', 'learning', 62, 'Orbital mechanics intuition and mission architectures.'],
    ['Astronomy', 'practicing', 70, 'Observation planning, astrophotography, data reduction.'],
    ['Aerospace Technology', 'learning', 55, 'Structures, propulsion and telemetry basics.'],
    ['Data Analysis', 'practicing', 76, 'Clean datasets, honest charts, written interpretation.'],
    ['Technical Documentation', 'advanced', 86, 'If it is undocumented, it does not exist.']
  ]},
  { id: 'design', name: 'Design / Product', icon: 'pen', blurb: 'Making complex systems feel obvious.', items: [
    ['UI/UX', 'practicing', 80, 'Hierarchy, affordance and flow before decoration.'],
    ['Product Design', 'practicing', 76, 'Problem framing, scope control, iteration loops.'],
    ['Design Systems', 'practicing', 82, 'Tokens, themes, component contracts.'],
    ['Data Visualization', 'practicing', 75, 'Charts that do not lie about their data.'],
    ['Branding', 'learning', 62, 'Voice, identity and consistency across surfaces.'],
    ['Product Strategy', 'learning', 58, 'Who it is for, why now, and what to cut.']
  ]}
];

const LEVELS = {
  learning: { label: 'Learning', weight: 0.6 },
  practicing: { label: 'Practicing', weight: 0.82 },
  advanced: { label: 'Advanced', weight: 1 }
};

/* --- 2.4 Projects ------------------------------------------------------- */
const PROJECTS = [
  {
    id: 'cyber-toolkit',
    title: '[ADD PROJECT NAME] — Cybersecurity Toolkit',
    category: 'Cybersecurity',
    status: 'In progress',
    year: 2026,
    featured: true,
    description: 'A modular reconnaissance and reporting toolkit that turns scattered CLI output into a single structured engagement report.',
    technologies: ['Python', 'Linux', 'Networking', 'JSON', 'APIs'],
    github: '#',
    demo: '#',
    image: '',                       // empty → generated SVG poster
    problem: '[ADD PROBLEM] Penetration-test notes get lost across terminals, screenshots and half-written reports.',
    solution: '[ADD SOLUTION] A pipeline that collects recon output, normalises it into JSON and emits a consistent report skeleton.',
    architecture: '[ADD ARCHITECTURE] Command modules → normaliser → datastore → report renderer, all driven by a single config file.',
    challenges: '[ADD CHALLENGES] Handling wildly different tool output formats and keeping the toolkit safe by default.',
    results: '[ADD RESULTS] Measured before/after time to produce a first draft report.'
  },
  {
    id: 'ai-research-assistant',
    title: '[ADD PROJECT NAME] — AI Research Assistant',
    category: 'AI',
    status: 'Prototype',
    year: 2026,
    featured: true,
    description: 'A retrieval-augmented assistant that reads a local paper library and answers with citations instead of confident guesses.',
    technologies: ['Python', 'LLMs', 'RAG', 'NLP', 'APIs'],
    github: '#',
    demo: '#',
    image: '',
    problem: '[ADD PROBLEM] Reading a large paper corpus is slow and easy to misquote.',
    solution: '[ADD SOLUTION] Chunk, embed and retrieve passages, then force the model to answer only from retrieved context.',
    architecture: '[ADD ARCHITECTURE] Ingestor → embedder → vector index → retriever → answering layer with citation enforcement.',
    challenges: '[ADD CHALLENGES] Chunk boundaries destroying meaning, and evaluating answers without hallucinated confidence.',
    results: '[ADD RESULTS] Answer quality and citation accuracy tracked on a small hand-labelled question set.'
  },
  {
    id: 'robotics-controller',
    title: '[ADD PROJECT NAME] — Robotics Controller',
    category: 'Robotics',
    status: 'Hardware working',
    year: 2025,
    featured: true,
    description: 'An ESP32-based motion controller with sensor fusion, telemetry over Wi-Fi and a browser dashboard for live tuning.',
    technologies: ['ESP32', 'C++', 'Sensors', 'PWM', 'IoT'],
    github: '#',
    demo: '#',
    image: '',
    problem: '[ADD PROBLEM] Off-the-shelf controllers are hard to instrument and slow to tune.',
    solution: '[ADD SOLUTION] Firmware exposing live telemetry plus a lightweight dashboard for PID tuning in the browser.',
    architecture: '[ADD ARCHITECTURE] Sensor task → filter → control loop → motor driver, with a telemetry task publishing over WebSocket.',
    challenges: '[ADD CHALLENGES] Timing jitter, sensor noise and making the dashboard usable while the robot is moving.',
    results: '[ADD RESULTS] Step-response improvement and a repeatable tuning workflow.'
  },
  {
    id: 'sdr-spectrum-logger',
    title: '[ADD PROJECT NAME] — SDR Spectrum Logger',
    category: 'Embedded',
    status: 'Experimental',
    year: 2025,
    featured: false,
    description: 'An RTL-SDR pipeline that records band activity over time and renders a heatmap of what actually occupies the spectrum.',
    technologies: ['RTL-SDR', 'Python', 'Signal Analysis', 'Data Analysis'],
    github: '#',
    demo: '#',
    image: '',
    problem: '[ADD PROBLEM] Spectrum occupancy is hard to reason about from one-off waterfall screenshots.',
    solution: '[ADD SOLUTION] Continuous scanning with time-bucketed power measurements stored for long-term analysis.',
    architecture: '[ADD ARCHITECTURE] SDR capture → FFT bins → time series store → heatmap renderer.',
    challenges: '[ADD CHALLENGES] Clock drift, calibration and disk-space management during long runs.',
    results: '[ADD RESULTS] A heatmap that exposes daily patterns in a fixed band.'
  },
  {
    id: 'portfolio-os',
    title: 'Portfolio OS',
    category: 'Web',
    status: 'Live',
    year: 2026,
    featured: true,
    description: 'This site: a static, zero-dependency portfolio with a theme engine, command palette, terminal and an optional desktop-OS mode.',
    technologies: ['HTML', 'CSS', 'JavaScript', 'SVG', 'Canvas'],
    github: '#',
    demo: '#',
    image: '',
    problem: '[ADD PROBLEM] Template portfolios flatten a multidisciplinary profile into one generic grid.',
    solution: 'A single static document that can be read linearly, driven by keyboard, or explored as a draggable desktop.',
    architecture: 'Data module → render functions → overlay controllers (palette, studio, terminal, window manager) on one design-token system.',
    challenges: 'Supporting seventeen genuinely different visual systems without duplicating markup, and keeping animation cheap.',
    results: 'One HTML file, one stylesheet, one script — deploys to GitHub Pages with no build step.'
  },
  {
    id: 'ctf-writeups',
    title: '[ADD PROJECT NAME] — CTF Writeup Collection',
    category: 'Cybersecurity',
    status: 'Ongoing',
    year: 2025,
    featured: false,
    description: 'Structured writeups for the challenges I solve, focused on the reasoning path rather than the final flag.',
    technologies: ['Linux', 'Python', 'Wireshark', 'Burp Suite'],
    github: '#',
    demo: '#',
    image: '',
    problem: '[ADD PROBLEM] Writeups that only show the payload teach nothing reusable.',
    solution: '[ADD SOLUTION] A documentation template that records dead ends, hypotheses and the moment of insight.',
    architecture: '[ADD ARCHITECTURE] Markdown corpus with per-challenge metadata and tag-based navigation.',
    challenges: '[ADD CHALLENGES] Staying honest about failed attempts and keeping pace with events.',
    results: '[ADD RESULTS] A growing, searchable knowledge base for my own reference.'
  },
  {
    id: 'iot-telemetry',
    title: '[ADD PROJECT NAME] — IoT Telemetry Mesh',
    category: 'Embedded',
    status: 'Prototype',
    year: 2025,
    featured: false,
    description: 'A set of low-power sensor nodes reporting into one dashboard, built to survive flaky Wi-Fi and poor power budgets.',
    technologies: ['ESP8266', 'I2C', 'UART', 'IoT', 'JSON'],
    github: '#',
    demo: '#',
    image: '',
    problem: '[ADD PROBLEM] Cheap sensor nodes drop readings or die in days on battery.',
    solution: '[ADD SOLUTION] Store-and-forward buffering with deep-sleep scheduling and retention limits.',
    architecture: '[ADD ARCHITECTURE] Sensor read → CRC check → local buffer → batched upload → dashboard store.',
    challenges: '[ADD CHALLENGES] Power profiling, time sync and avoiding duplicate submissions.',
    results: '[ADD RESULTS] Measured node uptime and power draw over a multi-week run.'
  },
  {
    id: 'vision-qc',
    title: '[ADD PROJECT NAME] — Vision Quality Checker',
    category: 'AI',
    status: 'Exploratory',
    year: 2026,
    featured: false,
    description: 'A small computer-vision prototype that flags defective parts on a conveyor-style test rig.',
    technologies: ['Python', 'Computer Vision', 'Deep Learning', 'OpenCV'],
    github: '#',
    demo: '#',
    image: '',
    problem: '[ADD PROBLEM] Manual inspection of small batches is inconsistent and tiring.',
    solution: '[ADD SOLUTION] A classifier trained on a tiny labelled set, tuned for recall over precision.',
    architecture: '[ADD ARCHITECTURE] Frame capture → preprocessing → classifier → decision + evidence thumbnail.',
    challenges: '[ADD CHALLENGES] Severe class imbalance and lighting variation between capture sessions.',
    results: '[ADD RESULTS] Confusion matrix on a held-out batch, with failure cases documented.'
  },
  {
    id: 'open-science-kit',
    title: '[ADD PROJECT NAME] — Open Science Data Kit',
    category: 'Research',
    status: 'Planning',
    year: 2026,
    featured: false,
    description: 'Templates and tooling that make small research projects reproducible by default: data, method, environment, results.',
    technologies: ['Python', 'Data Analysis', 'Technical Documentation', 'Open Science'],
    github: '#',
    demo: '#',
    image: '',
    problem: '[ADD PROBLEM] Student research often loses the environment that produced its figures.',
    solution: '[ADD SOLUTION] A minimal repository template plus scripts that regenerate every figure from raw data.',
    architecture: '[ADD ARCHITECTURE] raw/ → notebooks → figures/ with a lockfile and a one-command rebuild.',
    challenges: '[ADD CHALLENGES] Making the process light enough that people actually adopt it.',
    results: '[ADD RESULTS] A template that rebuilds a sample study end-to-end.'
  },
  {
    id: 'dev-cli-tools',
    title: '[ADD PROJECT NAME] — Developer CLI Toolbox',
    category: 'Tools',
    status: 'In use daily',
    year: 2025,
    featured: false,
    description: 'Small shell and Python utilities that remove the repetitive parts of my own workflow.',
    technologies: ['Bash', 'Python', 'Git', 'JSON', 'APIs'],
    github: '#',
    demo: '#',
    image: '',
    problem: '[ADD PROBLEM] The same five setup steps, every project, every time.',
    solution: '[ADD SOLUTION] One entry point with subcommands: scaffold, sync, package, publish.',
    architecture: '[ADD ARCHITECTURE] A thin Bash front-end dispatching into focused Python modules.',
    challenges: '[ADD CHALLENGES] Cross-platform behaviour and failing loudly instead of silently.',
    results: '[ADD RESULTS] Setup time per project reduced to a single command.'
  }
];

const PROJECT_CATEGORIES = ['All', 'Cybersecurity', 'AI', 'Robotics', 'Web', 'Embedded', 'Research', 'Tools'];

/* --- 2.5 Timeline ------------------------------------------------------- */
const TIMELINE = [
  { year: '2026', date: '2026 — Now', title: '[ADD MILESTONE]', org: '[ADD ORGANISATION]', kind: 'research',
    text: '[ADD DESCRIPTION] What you are researching, building or studying right now, and why it matters.',
    tech: ['Python', 'LLMs', 'Research'] },
  { year: '2026', date: '2026', title: 'Portfolio OS shipped', org: 'Personal project', kind: 'project',
    text: 'Built a static, dependency-free portfolio with a theme engine, command palette, terminal and desktop mode.',
    tech: ['HTML', 'CSS', 'JavaScript'] },
  { year: '2025', date: '2025', title: '[ADD CERTIFICATION]', org: '[ADD ISSUER]', kind: 'certification',
    text: '[ADD DESCRIPTION] What the certification covered and what you can now do because of it.',
    tech: ['[ADD TECH]'] },
  { year: '2025', date: '2025', title: '[ADD PROJECT MILESTONE]', org: '[ADD CONTEXT]', kind: 'project',
    text: '[ADD DESCRIPTION] The project, the hardest part, and the result you are proud of.',
    tech: ['ESP32', 'C++', 'IoT'] },
  { year: '2024', date: '2024', title: 'Deep dive into offensive security', org: 'Self-study + labs', kind: 'learning',
    text: 'Systematic practice across recon, web exploitation and reporting, alongside Linux fundamentals.',
    tech:    ['Linux', 'Burp Suite', 'Nmap', 'Wireshark'] },
  { year: '2024', date: '2024', title: '[ADD ACHIEVEMENT]', org: '[ADD CONTEXT]', kind: 'achievement',
    text: '[ADD DESCRIPTION] Competition placement, publication, open-source contribution or award.',
    tech: ['[ADD TECH]'] },
  { year: '2023', date: '2023', title: 'Embedded systems and RF experimentation', org: 'Self-directed lab work', kind: 'learning',
    text: 'From breadboard circuits to networked microcontrollers, then on to software-defined radio.',
    tech: ['Arduino', 'ESP32', 'RTL-SDR'] },
  { year: '2023', date: '2023', title: 'First programming foundations', org: 'Self-taught', kind: 'learning',
    text: 'Python and C fundamentals, data structures, and the first tools built for my own use.',
    tech: ['Python', 'C', 'Git'] }
];

const TIMELINE_KINDS = ['All', 'learning', 'project', 'certification', 'research', 'achievement'];

/* --- 2.6 Certifications ------------------------------------------------- */
const CERTIFICATIONS = [
  { name: '[ADD YOUR CERTIFICATE]', issuer: '[ADD ISSUER]', date: '2026', credentialId: '[ADD CREDENTIAL ID]',
    url: '#', category: 'Cybersecurity', note: '[ADD SHORT NOTE] What it proves you can do.' },
  { name: '[ADD YOUR CERTIFICATE]', issuer: '[ADD ISSUER]', date: '2025', credentialId: '[ADD CREDENTIAL ID]',
    url: '#', category: 'Programming', note: '[ADD SHORT NOTE]' },
  { name: '[ADD YOUR CERTIFICATE]', issuer: '[ADD ISSUER]', date: '2025', credentialId: '[ADD CREDENTIAL ID]',
    url: '#', category: 'AI', note: '[ADD SHORT NOTE]' },
  { name: '[ADD YOUR CERTIFICATE]', issuer: '[ADD ISSUER]', date: '2025', credentialId: '[ADD CREDENTIAL ID]',
    url: '#', category: 'Research', note: '[ADD SHORT NOTE]' },
  { name: '[ADD YOUR CERTIFICATE]', issuer: '[ADD ISSUER]', date: '2024', credentialId: '[ADD CREDENTIAL ID]',
    url: '#', category: 'Space', note: '[ADD SHORT NOTE]' },
  { name: '[ADD YOUR CERTIFICATE]', issuer: '[ADD ISSUER]', date: '2024', credentialId: '[ADD CREDENTIAL ID]',
    url: '#', category: 'Other', note: '[ADD SHORT NOTE]' }
];

const CERT_CATEGORIES = ['All', 'Cybersecurity', 'Programming', 'AI', 'Research', 'Space', 'Other'];

/* --- 2.7 Achievements --------------------------------------------------- */
/* value: 0 renders the placeholder text. Set a real number to animate it. */
const ACHIEVEMENT_STATS = [
  { key: 'projects', value: 0, suffix: '+', label: 'Projects', note: 'Set value in ACHIEVEMENT_STATS', icon: 'grid' },
  { key: 'certifications', value: 0, suffix: '+', label: 'Certifications', note: 'Set value in ACHIEVEMENT_STATS', icon: 'cert' },
  { key: 'technologies', value: 0, suffix: '+', label: 'Technologies', note: 'Set value in ACHIEVEMENT_STATS', icon: 'cpu' },
  { key: 'repos', value: 0, suffix: '+', label: 'GitHub Repos', note: 'Auto-filled from the GitHub panel when your username is set', icon: 'github' }
];

const ACHIEVEMENT_GROUPS = [
  { title: 'Security & CTF', icon: 'shield', items: ['[ADD YOUR ACHIEVEMENT]', '[ADD CTF PLACEMENT]', '[ADD CVE / DISCLOSURE]'] },
  { title: 'Research & Science', icon: 'flask', items: ['[ADD YOUR ACHIEVEMENT]', '[ADD PUBLICATION]', '[ADD OLYMPIAD / COMPETITION]'] },
  { title: 'Open source', icon: 'git', items: ['[ADD YOUR CONTRIBUTION]', '[ADD MILESTONE]'] },
  { title: 'Craft & community', icon: 'trophy', items: ['[ADD YOUR ACHIEVEMENT]', '[ADD TALK / WORKSHOP / MENTORING]'] }
];

const CONTACT_NOTES = [
  'Replies usually within 24–48 hours',
  'Open to remote and on-site collaboration',
  'Security research must be authorised in writing'
];

/* --- 2.8 Navigation + social ------------------------------------------- */
const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: 'grid' },
  { id: 'about', label: 'About', icon: 'info' },
  { id: 'skills', label: 'Skills', icon: 'cpu' },
  { id: 'projects', label: 'Projects', icon: 'layers' },
  /* the timeline lives in the Experience section: the nav keeps the short name
     (requirement 35) while the command list and search expose it as Timeline */
  { id: 'experience', label: 'Experience', paletteLabel: 'Timeline', icon: 'git' },
  { id: 'certifications', label: 'Certifications', icon: 'cert' },
  { id: 'achievements', label: 'Achievements', icon: 'trophy' },
  { id: 'contact', label: 'Contact', icon: 'mail' }
];

const SOCIALS = [
  { id: 'github', label: 'GitHub', icon: 'github' },
  { id: 'linkedin', label: 'LinkedIn', icon: 'linkedin' },
  { id: 'x', label: 'X / Twitter', icon: 'x' },
  { id: 'discord', label: 'Discord', icon: 'discord' },
  { id: 'email', label: 'Email', icon: 'mail' }
];

/* --- 2.9 Hero terminal script ------------------------------------------ */
const HERO_TYPED_LINES = [
  { text: '$ whoami', cls: 't-cmd' },
  { text: '→ technologist · security researcher · hardware tinkerer', cls: 't-dim' },
  { text: '$ cat focus.txt', cls: 't-cmd' },
  { text: '  cybersecurity × ai × robotics × software × research', cls: 't-key' },
  { text: '$ ./scan --profile deep', cls: 't-cmd' },
  { text: '  [ok] 9 domains indexed · 17 themes loaded · 0 backend calls', cls: 't-ok' },
  { text: '  [ok] github api: live when available, fallback when not', cls: 't-ok' },
  { text: '$ _', cls: 't-dim' }
];

const HERO_ROTATOR = ['Cybersecurity', 'Artificial Intelligence', 'Robotics', 'Software Engineering', 'Scientific Research'];

/* --- 2.10 i18n ---------------------------------------------------------- */
/* Only key/value pairs are registered; missing keys fall back to English so
   Bengali can be completed incrementally without touching the markup. */
const I18N = {
  en: {},
  bn: {
    'hero.status': 'গবেষণা, নিরাপত্তা ও নির্মাণে সহযোগিতার জন্য উন্মুক্ত',
    'hero.eyebrow': 'বহুমাত্রিক প্রযুক্তি নির্মাতা',
    'hero.cta1': 'আমার কাজ দেখুন',
    'hero.cta2': 'সিভি ডাউনলোড',
    'hero.cta3': 'যোগাযোগ করুন',
    'hero.scroll': 'স্ক্রল',
    'about.eyebrow': 'পরিচয়',
    'skills.eyebrow': 'দক্ষতার মানচিত্র',
    'skills.title': 'দক্ষতা অনুসন্ধান',
    'projects.eyebrow': 'নির্বাচিত কাজ',
    'projects.title': 'প্রকল্পের সংগ্রহ',
    'exp.eyebrow': 'অগ্রযাত্রা',
    'exp.title': 'অভিজ্ঞতা ও শেখার সময়রেখা',
    'certs.eyebrow': 'যাচাইকৃত শিক্ষা',
    'certs.title': 'সার্টিফিকেশন',
    'ach.eyebrow': 'সংকেত',
    'ach.title': 'অর্জনের ড্যাশবোর্ড',
    'contact.eyebrow': 'খোলা চ্যানেল',
    'contact.title': 'চলুন গুরুত্বপূর্ণ কিছু তৈরি করি',
    'contact.copy': 'ইমেইল কপি করুন',
    'contact.compose': 'মেইল লিখুন',
    'footer.rights': 'সর্বস্বত্ব সংরক্ষিত।'
  }
};

/* ========================= 3. STATE OWNERS =============================
   State is split by who owns it, and each owner exposes the one legal way to
   change what it holds. Feature-local state lives with its feature further
   down (ambient, terminal, os, palette, modal, overlay, konami, hero).

     store  — the only code that touches localStorage
     prefs  — the user's persisted configuration; write with prefs.set()
     view   — filters/queries the page is currently showing; never persisted
   ====================================================================== */
const STORAGE_KEY = 'portfolio-os.v1';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const isTouch = window.matchMedia('(hover: none)').matches || navigator.maxTouchPoints > 0;

/** Persistence. Knows the storage schema and nothing else. */
const store = {
  read() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (err) {
      console.warn('[store] unable to read preferences', err);
      return {};
    }
  },
  write(patch) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Object.assign({}, store.read(), patch)));
    } catch (err) {
      console.warn('[store] unable to persist preferences (private mode?)', err);
    }
  },

  /**
   * Validates whatever is in storage into a prefs patch. Pure: it decides
   * what is trustworthy and writes nothing, so boot() stays the only place
   * that installs restored preferences.
   */
  restore() {
    const saved = store.read();
    const patch = {};
    const validTheme = THEMES.some((t) => t.id === saved.theme && (!t.secret || saved.voidUnlocked));
    if (saved.theme && validTheme) patch.theme = saved.theme;
    if (saved.mode === 'light' || saved.mode === 'dark') patch.mode = saved.mode;
    if (typeof saved.accent === 'string' && /^#[0-9a-f]{6}$/i.test(saved.accent)) patch.accent = saved.accent;
    if (typeof saved.accentCustom === 'boolean') patch.accentCustom = saved.accentCustom;
    if (saved.motion === 'reduced' || saved.motion === 'full') patch.motion = saved.motion;
    if (saved.locale === 'en' || saved.locale === 'bn') patch.locale = saved.locale;
    if (typeof saved.muted === 'boolean') patch.muted = saved.muted;
    if (typeof saved.bannerDismissed === 'boolean') patch.bannerDismissed = saved.bannerDismissed;
    if (typeof saved.voidUnlocked === 'boolean') patch.voidUnlocked = saved.voidUnlocked;
    return patch;
  }
};

/**
 * The user's saved configuration.
 *
 * Reads are plain properties and `set()` is the only way to *persist* a
 * change. A few call sites assign a field directly on purpose — the accent a
 * theme derives for itself is deliberately not persisted, because boot()
 * recomputes it from `prefs.accentCustom` on every load.
 */
const prefs = {
  theme: portfolioConfig.theme,
  mode: portfolioConfig.mode,
  accent: portfolioConfig.accent,
  accentCustom: false,
  motion: prefersReducedMotion.matches ? 'reduced' : 'full',
  locale: portfolioConfig.defaultLocale,
  muted: true,
  bannerDismissed: false,
  voidUnlocked: false,
  set(patch) {
    Object.assign(prefs, patch);
    store.write(patch);
  }
};

/** Filters, queries and sort orders currently applied to the lists. Transient. */
const view = {
  skillFilter: 'All',
  radarMode: false,
  projectFilter: 'All',
  projectQuery: '',
  projectSort: 'featured',
  certFilter: 'All',
  certQuery: '',
  timelineFilter: 'All'
};

/* ============================ 4. UTILS ================================= */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/** Icon markup helper — always decorative unless a label is supplied. */
function icon(name, cls = '') {
  return `<svg class="ico${cls ? ' ' + cls : ''}" aria-hidden="true" focusable="false"><use href="#i-${name}"></use></svg>`;
}

function escapeHtml(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[ch]));
}

function debounce(fn, wait = 180) {
  let timer;
  return function debounced(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), wait);
  };
}

function clamp(value, min, max) { return Math.min(Math.max(value, min), max); }

function prefersReduced() { return prefs.motion === 'reduced' || prefersReducedMotion.matches; }

function formatNumber(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) return value;
  return value >= 1000 ? `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k` : String(value);
}

/* Relative-path safe absolute URL (works under /REPOSITORY/ subdirectories). */
function assetUrl(path) { return path || ''; }

/** Deterministic SVG poster so projects never show a broken image. */
function generatedPoster(title, seedIndex = 0) {
  const palettes = [
    ['#22d3ee', '#6366f1'], ['#ff2fd0', '#7c5cff'], ['#ffb347', '#ff7a45'],
    ['#2dd4a7', '#22d3ee'], ['#a855f7', '#22d3ee'], ['#ff6b8b', '#ff2fd0']
  ];
  const [c1, c2] = palettes[seedIndex % palettes.length];
  const label = String(title).replace(/^\[ADD PROJECT NAME\]\s*—?\s*/, '').slice(0, 34);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450">
<defs>
<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#070b16"/><stop offset="1" stop-color="#121a30"/></linearGradient>
<linearGradient id="ac" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>
<pattern id="g" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0v40" fill="none" stroke="${c1}" stroke-opacity="0.18"/></pattern>
</defs>
<rect width="800" height="450" fill="url(#bg)"/>
<rect width="800" height="450" fill="url(#g)"/>
<circle cx="640" cy="120" r="150" fill="${c1}" opacity="0.16"/>
<circle cx="180" cy="380" r="170" fill="${c2}" opacity="0.14"/>
<g stroke="url(#ac)" stroke-width="3" fill="none"><rect x="300" y="180" width="200" height="110" rx="10"/><path d="M340 180v-30h120v30M300 235h200"/></g>
<circle cx="340" cy="255" r="7" fill="${c1}"/><circle cx="460" cy="255" r="7" fill="${c2}"/>
<text x="400" y="352" text-anchor="middle" fill="#c9d6f0" font-family="monospace" font-size="24">${label.replace(/[<>&]/g, '')}</text>
<text x="400" y="384" text-anchor="middle" fill="#7f8dab" font-family="monospace" font-size="14" letter-spacing="3">ADD IMAGE IN assets/projects/</text>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.replace(/\n/g, ''))}`;
}

/* --- 4.1 Shared markup fragments ----------------------------------------
   Every card, modal and panel is assembled from these, so a tag list, a
   badge or a key/value row has exactly one definition in the codebase.
   ----------------------------------------------------------------------- */
const frag = {
  /** One tag pill. */
  pill(label, style = '') {
    return `<span class="tag"${style ? ` style="${style}"` : ''}>${escapeHtml(label)}</span>`;
  },

  /** Tag pills. `cls` is the wrapper class, `style` an optional inline style. */
  tags(items, { cls = 'tags', tag = 'div', style = '' } = {}) {
    return `<${tag} class="${cls}"${style ? ` style="${style}"` : ''}>${(items || []).map((t) => frag.pill(t)).join('')}</${tag}>`;
  },

  badge(label, kind = '', ico = '') {
    return `<span class="badge${kind ? ` badge--${kind}` : ''}">${ico ? icon(ico) + ' ' : ''}${escapeHtml(label)}</span>`;
  },

  /** One key/value row of a detail panel. */
  stat(key, value) {
    return `<div class="mini-stat"><span class="mini-stat__k">${escapeHtml(key)}</span><span class="mini-stat__v">${escapeHtml(value)}</span></div>`;
  },

  /** A group of stat() rows, shaped for a modal body. */
  stats(rows) {
    return `<div class="modal__kv">${rows.map(([key, value]) => frag.stat(key, value)).join('')}</div>`;
  },

  /** A titled block inside a modal. */
  section(label, body, ico) {
    return `<div class="modal__section"><h4>${icon(ico)} ${escapeHtml(label)}</h4>${body}</div>`;
  },

  /**
   * An outbound link styled as a button. The target/rel policy lives here so
   * it cannot drift between the six places that link away from the site.
   */
  linkButton(href, label, ico, { kind = 'ghost', size = 'sm', attrs = '' } = {}) {
    return `<a class="btn btn--${kind} btn--${size}" href="${escapeHtml(href || '#')}" target="_blank" rel="noopener noreferrer"${attrs}>${icon(ico)} ${escapeHtml(label)}</a>`;
  },

  /** The standard closing action of every modal. */
  modalClose() {
    return `<button type="button" class="btn btn--ghost btn--sm" data-modal-close>${icon('close')} Close</button>`;
  }
};

/* --- 4.2 Filter chips ----------------------------------------------------
   Skills, projects, timeline and certifications all show the same control:
   a row of chips with counts and one selection. This is its only definition.
   ----------------------------------------------------------------------- */

/**
 * @param {string} selector  container, e.g. '#project-filters'
 * @param {string} attr      data attribute carrying the value, e.g. 'data-project-filter'
 * @param {{value: string, label: string, count: number}[]} items
 * @param {string} active    value of the chip to mark selected
 */
function renderChips(selector, attr, items, active) {
  const wrap = $(selector);
  if (!wrap) return;
  wrap.innerHTML = items.map(({ value, label, count }) => `
    <button type="button" role="tab" class="chip${value === active ? ' is-active' : ''}"
      ${attr}="${escapeHtml(value)}" aria-selected="${value === active}">${escapeHtml(label)}<span class="chip__count">${count}</span>
    </button>`).join('');
}

/** Wires a chip row: clicking a chip hands its value to `onPick`. */
function bindChips(selector, attr, onPick) {
  $(selector)?.addEventListener('click', (event) => {
    const btn = event.target.closest(`[${attr}]`);
    if (btn) onPick(btn.getAttribute(attr));
  });
}

/** Wires a search box: debounced, trimmed, then handed to `onQuery`. */
function bindSearch(selector, onQuery) {
  const input = $(selector);
  input?.addEventListener('input', debounce(() => onQuery(input.value.trim())));
}

/**
 * Chip items for a category list, where "All" counts the whole collection.
 * @param {string[]} values                 e.g. PROJECT_CATEGORIES
 * @param {any[]} list                      the collection being filtered
 * @param {(item: any) => string} keyOf     how to read a category off an item
 * @param {(value: string) => string} [labelOf]
 */
function categoryChips(values, list, keyOf, labelOf = (value) => value) {
  return values.map((value) => ({
    value,
    label: labelOf(value),
    count: value === 'All' ? list.length : list.filter((item) => keyOf(item) === value).length
  }));
}

const capitalise = (value) => value.charAt(0).toUpperCase() + value.slice(1);

/* ============================ 5. TOASTS ================================ */
const toastRegion = () => $('#toasts');

/**
 * @param {string} message  primary line
 * @param {object} [opts]   { sub, icon, kind: 'info'|'ok'|'warn'|'err', duration }
 */
function toast(message, opts = {}) {
  const region = toastRegion();
  if (!region) return;
  const kind = opts.kind || 'info';
  const el = document.createElement('div');
  el.className = `toast toast--${kind}`;
  el.setAttribute('role', 'status');
  el.innerHTML = `
    ${icon(opts.icon || (kind === 'ok' ? 'check' : kind === 'err' ? 'close' : kind === 'warn' ? 'info' : 'bell'))}
    <div class="toast__text">
      <span class="toast__msg">${escapeHtml(message)}</span>
      ${opts.sub ? `<span class="toast__sub">${escapeHtml(opts.sub)}</span>` : ''}
    </div>
    <button type="button" class="toast__close" aria-label="Dismiss notification">${icon('close')}</button>`;

  const remove = () => {
    el.classList.add('is-out');
    el.addEventListener('animationend', () => el.remove(), { once: true });
    setTimeout(() => el.remove(), 600);
  };

  el.querySelector('.toast__close').addEventListener('click', remove);
  region.appendChild(el);

  // keep the stack small so toasts never cover the UI
  while (region.children.length > 4) region.firstElementChild.remove();

  if (opts.duration !== 0) setTimeout(remove, opts.duration || 3400);
}

/* ========================= 6. THEME ENGINE ============================= */
const themeById = (id) => THEMES.find((t) => t.id === id) || THEMES[0];

function applyTheme(id, { notify = true, flash = true } = {}) {
  const theme = themeById(id);
  if (theme.secret && !prefs.voidUnlocked) {
    toast('Locked theme', { sub: 'Find the easter egg first', kind: 'warn', icon: 'key' });
    return;
  }
  prefs.set({ theme: theme.id });
  const root = document.documentElement;
  root.setAttribute('data-theme', theme.id);
  // theme-scoped accent defaults (custom accent overrides them inline)
  if (!prefs.accentCustom) {
    const accent = themeAccentDefault(theme.id);
    if (accent) setAccentVariables(accent);
  }
  syncThemeGrid();
  if (flash && !prefersReduced()) flashTheme();
  if (notify) {
    toast(`${theme.name} theme`, { sub: theme.desc, icon: 'palette', kind: 'ok' });
  }
}

/* Accent defaults harvested from the stylesheet tokens, mirrored in JS so the
   accent picker and the theme previews stay in sync. */
const THEME_ACCENTS = {
  claymorphism: '#ff8fab', cybercore: '#22d3ee', scrapbook: '#d9534f', surrealism: '#ff7a45',
  pixel: '#ffe066', glassmorphism: '#67e8f9', neumorphism: '#8b7cff', bento: '#ffb347',
  editorial: '#b3352b', swiss: '#e00000', minimalism: '#2b6cb0', maximalism: '#ff2e88',
  luxury: '#c8a961', strap: '#d7ff3f', bohemian: '#d98b5f', cyberpunk: '#ff2fd0',
  wabi: '#a3855f', void: '#22ff88'
};
const THEME_ACCENT_2 = {
  claymorphism: '#7ac7ff', cybercore: '#6d8cff', scrapbook: '#2f6f8f', surrealism: '#58e0c3',
  pixel: '#5bd6a4', glassmorphism: '#c084fc', neumorphism: '#58c9d6', bento: '#4ea8de',
  editorial: '#1f4b6b', swiss: '#0a56b8', minimalism: '#6b7280', maximalism: '#ffd400',
  luxury: '#8c7a52', strap: '#ff4d2e', bohemian: '#8fae7a', cyberpunk: '#25f4ee',
  wabi: '#6f7f6a', void: '#00ffd5'
};

function themeAccentDefault(id) { return THEME_ACCENTS[id] || portfolioConfig.accent; }

/** Write accent (and its derived secondary) as inline custom properties. */
function setAccentVariables(hex) {
  const root = document.documentElement;
  root.style.setProperty('--accent', hex);
  root.style.setProperty('--accent-2', shiftAccentSecondary(hex));
}

/** Secondary accent = hue-rotated companion so themes keep a two-tone feel. */
function shiftAccentSecondary(hex) {
  if (!prefs.accentCustom) {
    const themeSecondary = THEME_ACCENT_2[prefs.theme];
    if (themeSecondary) return themeSecondary;
  }
  const { h, s, l } = hexToHsl(hex);
  return hslToHex((h + 48) % 360, s, clamp(l + 4, 8, 92));
}

function hexToHsl(hex) {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    h = max === r ? ((g - b) / d + (g < b ? 6 : 0)) : max === g ? ((b - r) / d + 2) : ((r - g) / d + 4);
    h *= 60;
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToHex(h, s, l) {
  const sN = s / 100, lN = l / 100;
  const k = (n) => (n + h / 30) % 12;
  const a = sN * Math.min(lN, 1 - lN);
  const f = (n) => lN - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = (x) => Math.round(x * 255).toString(16).padStart(2, '0');
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}

function applyAccent(hex, { custom = true, notify = true } = {}) {
  prefs.set({ accent: hex, accentCustom: custom });
  setAccentVariables(hex);
  document.documentElement.toggleAttribute('data-accent-custom', custom);
  $$('#accent-swatches .swatch').forEach((btn) => {
    btn.setAttribute('aria-checked', String(btn.dataset.accent?.toLowerCase() === hex.toLowerCase()));
  });
  const customInput = $('#accent-custom');
  if (customInput) customInput.value = hex;
  syncThemePreviewAccents(hex);
  if (notify) toast('Accent updated', { sub: hex.toUpperCase(), kind: 'ok', icon: 'palette', duration: 1800 });
}

function resetAccent() {
  document.documentElement.removeAttribute('data-accent-custom');
  const def = themeAccentDefault(prefs.theme);
  prefs.set({ accent: def, accentCustom: false });
  setAccentVariables(def);
  const customInput = $('#accent-custom');
  if (customInput) customInput.value = def;
  renderAccentSwatches();
  syncThemePreviewAccents(def);
  toast('Accent reset', { sub: `${themeById(prefs.theme).name} default`, kind: 'ok', icon: 'palette', duration: 1800 });
}

function applyMode(mode, { notify = false } = {}) {
  prefs.set({ mode: mode === 'light' ? 'light' : 'dark' });
  document.documentElement.setAttribute('data-mode', prefs.mode);
  $$('[data-mode-btn]').forEach((btn) => btn.setAttribute('aria-checked', String(btn.dataset.modeBtn === prefs.mode)));
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', prefs.mode === 'light' ? '#f4f6fb' : '#05070d');
  if (notify) toast(prefs.mode === 'light' ? 'Light mode' : 'Dark mode', { icon: prefs.mode === 'light' ? 'sun' : 'moon', kind: 'ok', duration: 1800 });
}

function applyMotion(mode, { notify = true } = {}) {
  prefs.set({ motion: mode === 'reduced' ? 'reduced' : 'full' });
  document.documentElement.setAttribute('data-motion', prefs.motion);
  const input = $('#pref-reduced-motion');
  if (input) input.checked = prefs.motion === 'reduced';
  if (prefs.motion === 'reduced') stopHeroCanvas();
  else resumeHeroCanvas();
  if (notify) toast(prefs.motion === 'reduced' ? 'Motion reduced' : 'Motion enabled', { icon: 'sparkle', kind: 'ok', duration: 1800 });
}

function flashTheme() {
  const root = document.documentElement;
  root.classList.remove('theme-flash');
  // force reflow so the animation can restart
  void root.offsetWidth;
  root.classList.add('theme-flash');
  setTimeout(() => root.classList.remove('theme-flash'), 620);
}

function randomTheme() {
  const pool = THEMES.filter((t) => !t.secret || prefs.voidUnlocked);
  let next = prefs.theme;
  while (next === prefs.theme && pool.length > 1) next = pool[Math.floor(Math.random() * pool.length)].id;
  applyTheme(next, { notify: false });
  if (prefs.accentCustom) setAccentVariables(prefs.accent);
  else {
    prefs.accent = themeAccentDefault(next);
    setAccentVariables(prefs.accent);
    renderAccentSwatches();
    syncThemePreviewAccents(prefs.accent);
  }
  flashTheme();
  toast('Surprise me', { sub: themeById(next).name, icon: 'sparkle', kind: 'ok' });
}

/* ============================== 7. I18N =============================== */
function applyLocale(locale, { notify = false } = {}) {
  prefs.set({ locale: locale === 'bn' ? 'bn' : 'en' });
  document.documentElement.lang = prefs.locale;

  $$('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n;
    if (!el.dataset.i18nEn) el.dataset.i18nEn = el.textContent;
    const dict = I18N[prefs.locale] || {};
    el.textContent = dict[key] || el.dataset.i18nEn;
  });

  $$('[data-locale-btn]').forEach((btn) => btn.setAttribute('aria-checked', String(btn.dataset.localeBtn === prefs.locale)));
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.dataset.i18nPlaceholder;
    if (!el.dataset.i18nPlaceholderEn) el.dataset.i18nPlaceholderEn = el.placeholder;
    const dict = I18N[prefs.locale] || {};
    el.placeholder = dict[key] || el.dataset.i18nPlaceholderEn;
  });

  if (notify) {
    toast(prefs.locale === 'bn' ? 'বাংলা নির্বাচিত' : 'English selected', {
      sub: prefs.locale === 'bn' ? 'Partial translation — add keys in I18N.bn' : 'Full translation available',
      icon: 'globe', kind: 'ok'
    });
  }
}

/* ==================== 8. APP SHELL / STATIC RENDER ==================== */

/* --- 8.1 Static content bindings --------------------------------------- */
function bindConfigContent() {
  $$('[data-bind="name"]').forEach((el) => { el.textContent = portfolioConfig.name; });
  $$('[data-bind="tagline"]').forEach((el) => { el.textContent = portfolioConfig.tagline; });
  $$('[data-bind="role"]').forEach((el) => { el.textContent = portfolioConfig.role; });
  $$('[data-bind="location"]').forEach((el) => { el.textContent = portfolioConfig.location; });

  const mailto = `mailto:${portfolioConfig.email}`;
  $$('[data-bind-email]').forEach((el) => { el.textContent = portfolioConfig.email; el.href = mailto; });
  const mailBtn = $('#contact-mail-btn');
  if (mailBtn) mailBtn.href = mailto;

  const cvLinks = $$('[data-cv-link]');
  cvLinks.forEach((a) => { a.href = assetUrl(portfolioConfig.cvPath); a.setAttribute('download', portfolioConfig.resumeFileName); });

  const year = $('#footer-year');
  if (year) year.textContent = String(new Date().getFullYear());

  document.title = `${portfolioConfig.name} — Cybersecurity × AI × Robotics × Software × Research`;

  // mark placeholder copy so it is visually obvious what must be replaced
  $$('[data-i18n]').forEach((el) => {
    const text = el.textContent || '';
    if (PLACEHOLDER_RE.test(text)) el.setAttribute('data-placeholder', '');
  });
}

function renderSocials() {
  const target = $('#hero-socials');
  if (!target) return;
  target.innerHTML = SOCIALS.map((s) => {
    const href = socialHref(s.id);
    const external = s.id !== 'email';
    return `<li><a href="${escapeHtml(href)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${icon(s.icon)}<span>${escapeHtml(s.label)}</span></a></li>`;
  }).join('');
}

function socialHref(id) {
  switch (id) {
    case 'github': return portfolioConfig.github;
    case 'linkedin': return portfolioConfig.linkedin || '#';
    case 'x': return portfolioConfig.x || '#';
    case 'discord': return portfolioConfig.discord || '#';
    case 'email': return `mailto:${portfolioConfig.email}`;
    default: return '#';
  }
}

function renderIdentityAndLists() {
  const chips = $('#identity-chips');
  if (chips) chips.innerHTML = IDENTITY_CHIPS.map((c) => `<li class="tag">${escapeHtml(c)}</li>`).join('');

  const philosophy = $('#philosophy-list');
  if (philosophy) philosophy.innerHTML = PHILOSOPHY.map((p) => `<li>${escapeHtml(p)}</li>`).join('');

  const interests = $('#interest-cloud');
  if (interests) interests.innerHTML = INTERESTS.map((i) => `<li>${escapeHtml(i)}</li>`).join('');

  const notes = $('#contact-notes');
  if (notes) notes.innerHTML = CONTACT_NOTES.map((n) => `<li>${escapeHtml(n)}</li>`).join('');

  const profiles = $('#contact-profiles');
  if (profiles) {
    profiles.innerHTML = SOCIALS.filter((s) => s.id !== 'email').map((s) => {
      const href = socialHref(s.id);
      const handle = href && href !== '#' ? href.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '') : '[ADD LINK]';
      return `<li><a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${icon(s.icon)}<b>${escapeHtml(s.label)}</b><span>${escapeHtml(handle)}</span></a></li>`;
    }).join('');
  }
}

function renderMobileMenu() {
  const list = $('#mobile-menu-list');
  if (!list) return;
  list.innerHTML = NAV_ITEMS.map((item, i) =>
    `<li><a href="#${item.id}" data-mobile-link="${item.id}"><span>${String(i + 1).padStart(2, '0')}</span>${escapeHtml(item.label)}</a></li>`
  ).join('');
}

/* --- 8.2 Placeholder banner -------------------------------------------- */
function initSetupBanner() {
  const banner = $('#setup-banner');
  const close = $('#setup-banner-close');
  if (!banner) return;
  if (prefs.bannerDismissed) return;

  const needsSetup = PLACEHOLDER_RE.test(portfolioConfig.name) || PLACEHOLDER_RE.test(portfolioConfig.username) ||
    PLACEHOLDER_RE.test(portfolioConfig.email) || PLACEHOLDER_RE.test(portfolioConfig.github);
  if (!needsSetup) return;

  banner.hidden = false;
  close?.addEventListener('click', () => {
    banner.hidden = true;
    prefs.set({ bannerDismissed: true });
    toast('Setup notice hidden', { sub: 'Re-enable by clearing localStorage', kind: 'info', icon: 'info', duration: 2200 });
  });
}

/* --- 8.3 Navigation ---------------------------------------------------- */
function initNav() {
  let menuOpen = false;
  const nav = $('#site-nav');
  const burger = $('#nav-toggle');
  const menu = $('#mobile-menu');
  const menuClose = $('#mobile-menu-close');
  const links = $$('.nav__link');

  /* scroll-spy + sticky hide-on-scroll-down */
  const sections = NAV_ITEMS.map((item) => document.getElementById(item.id)).filter(Boolean);
  const setActive = (id) => {
    links.forEach((l) => l.classList.toggle('is-active', l.dataset.nav === id));
  };

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) setActive(entry.target.id);
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
  sections.forEach((section) => navObserver.observe(section));

  let lastY = window.scrollY;
  const onScroll = () => {
    const y = window.scrollY;
    if (nav) nav.classList.toggle('is-hidden', y > lastY && y > 260 && !menuOpen);
    lastY = y;
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  /* mobile menu */
  const openMenu = () => {
    menuOpen = true;
    menu.hidden = false;
    burger?.setAttribute('aria-expanded', 'true');
    document.body.classList.add('is-locked');
    revealFocus(menu.querySelector('.mobile-menu__list a, button'));
  };
  const closeMenu = () => {
    menuOpen = false;
    if (menu) menu.hidden = true;
    burger?.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('is-locked');
    burger?.focus();
  };
  burger?.addEventListener('click', () => (menuOpen ? closeMenu() : openMenu()));
  menuClose?.addEventListener('click', closeMenu);
  menu?.addEventListener('click', (event) => { if (event.target === menu) closeMenu(); });
  $$('[data-mobile-link]').forEach((a) => a.addEventListener('click', () => setTimeout(closeMenu, 60)));

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuOpen) closeMenu();
  });
}

/* Move focus without triggering scroll jumps. */
function revealFocus(el) {
  if (!el) return;
  try { el.focus({ preventScroll: true }); } catch { el.focus(); }
}

/* --- 8.4 Reveal on scroll --------------------------------------------- */
function initReveal() {
  const items = $$('[data-reveal]');
  if (!items.length) return;

  if (prefersReduced()) {
    items.forEach((el) => el.classList.add('is-revealed'));
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        obs.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

  items.forEach((el) => observer.observe(el));

  // dynamic content injected later (cards, timeline rows...) re-uses the same observer
  window.__revealObserver = observer;

  // Safety net: if the observer never reports back (unusual engines, print
  // preview, headless capture) reveal everything instead of hiding content.
  setTimeout(() => {
    const alreadyRevealed = document.querySelector('[data-reveal].is-revealed');
    const onScreen = items.some((el) => {
      const rect = el.getBoundingClientRect();
      return rect.top < window.innerHeight && rect.bottom > 0;
    });
    if (!alreadyRevealed && onScreen) items.forEach((el) => el.classList.add('is-revealed'));
  }, 2200);
}

/** Register a dynamically created element for reveal animation. */
function observeReveal(el, index = 0) {
  if (!el) return;
  el.setAttribute('data-reveal', '');
  const delay = Math.min(index, 6);
  if (delay) el.setAttribute('data-reveal-delay', String(delay));
  if (prefersReduced() || !window.__revealObserver) {
    el.classList.add('is-revealed');
    return;
  }
  window.__revealObserver.observe(el);
}

/* --- 8.5 Reading progress + parallax --------------------------------- */
function initProgress() {
  const bar = $('#scroll-progress-bar');
  const wrap = $('#scroll-progress');
  const top = $('#back-to-top');
  if (!bar) return;

  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? clamp((window.scrollY / max) * 100, 0, 100) : 0;
    bar.style.width = `${pct}%`;
    wrap?.setAttribute('aria-valuenow', String(Math.round(pct)));
    top?.classList.toggle('is-visible', window.scrollY > 600);
  };

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', debounce(update, 200));
  update();

  top?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReduced() ? 'auto' : 'smooth' });
  });
}

/* --- 8.6 Hero: typed terminal, rotator, particle field ---------------- */
/** Particle field handle: { running, stop(), start() } while it is alive. */
const hero = { canvas: null };

function initHero() {
  initHeroTyping();
  initHeroRotator();
  startHeroCanvas();

  // gently parallax the visual column (desktop only, cheap transform)
  const visual = $('.hero__visual');
  const orbit = $('.hero__orbit');
  if (!visual || prefersReduced() || isTouch) return;
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      if (y < window.innerHeight * 1.2) {
        visual.style.transform = `translate3d(0, ${(y * 0.06).toFixed(2)}px, 0)`;
        if (orbit) orbit.style.transform = `translate3d(0, ${(y * -0.04).toFixed(2)}px, 0)`;
      }
      ticking = false;
    });
  }, { passive: true });
}

function initHeroTyping() {
  const target = $('#hero-typed');
  if (!target) return;

  if (prefersReduced()) {
    target.innerHTML = HERO_TYPED_LINES.map((l) => `<span class="${l.cls}">${escapeHtml(l.text)}</span>`).join('\n');
    return;
  }

  const finished = HERO_TYPED_LINES.map((l) => `<span class="${l.cls}">${escapeHtml(l.text)}</span>`).join('\n');
  let lineIndex = 0;
  let charIndex = 0;
  const rendered = [];
  let timer;

  /* Renders: every completed line, then the line currently being typed. */
  const paint = () => {
    const committed = rendered.map((l) => `<span class="${l.cls}">${escapeHtml(l.text)}</span>`).join('\n');
    const current = HERO_TYPED_LINES[lineIndex];
    if (!current) { target.innerHTML = `${finished}<span class="caret"></span>`; return; }
    const typing = `<span class="${current.cls}">${escapeHtml(current.text.slice(0, charIndex))}</span><span class="caret"></span>`;
    target.innerHTML = committed ? `${committed}\n${typing}` : typing;
  };

  const step = () => {
    const line = HERO_TYPED_LINES[lineIndex];
    if (!line) { paint(); return; }                 // nothing left to type

    if (charIndex < line.text.length) {             // still typing this line
      charIndex += 1;
      paint();
      timer = setTimeout(step, line.cls === 't-cmd' ? 52 : 14);
      return;
    }

    // line complete: commit it, advance, then keep going
    rendered.push(line);
    lineIndex += 1;
    charIndex = 0;
    paint();
    timer = setTimeout(step, line.cls === 't-cmd' ? 420 : 200);
  };

  // On a normal landing the hero is the point of the page, so type right away.
  // On a deep link (#projects, #contact…) wait until the card is actually seen.
  if (!location.hash || location.hash === '#home') {
    timer = setTimeout(step, 320);
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { step(); io.disconnect(); }
      });
    }, { threshold: 0.1, rootMargin: '120px 0px' });
    io.observe(target);
  }

  // pause while the tab is hidden so a returning visitor does not get a burst
  document.addEventListener('visibilitychange', () => {
    clearTimeout(timer);
    if (!document.hidden && lineIndex < HERO_TYPED_LINES.length) timer = setTimeout(step, 220);
  });
}

function initHeroRotator() {
  const track = $('#hero-rotator-track');
  if (!track) return;
  const words = HERO_ROTATOR;
  track.innerHTML = words.map((w) => `<span>${escapeHtml(w)}</span>`).join('');
  if (prefersReduced()) return;

  let index = 0;

  /** Offset of a word inside the track. Using measured offsets (instead of a
   *  percentage transform, which would resolve against the whole track) keeps
   *  the slide correct even if a word wraps or fonts load late. */
  const offsetOf = (i) => {
    const children = track.children;
    if (!children[i]) return 0;
    return children[i].offsetTop - children[0].offsetTop;
  };

  const slide = () => {
    index = (index + 1) % words.length;
    if (index === 0) {
      // rewind instantly instead of animating all the way back
      track.style.transition = 'none';
      track.style.transform = 'translateY(0px)';
      void track.offsetHeight;
      track.style.transition = '';
      return;
    }
    track.style.transform = `translateY(-${offsetOf(index)}px)`;
  };

  setInterval(() => {
    const nearTop = window.scrollY < window.innerHeight * 0.9;
    if (nearTop && !document.hidden) slide();
  }, 3200);

  const rotator = $('#hero-rotator');
  if (rotator) rotator.setAttribute('aria-label', `Focus areas: ${words.join(', ')}`);

  // once webfonts arrive the measured offsets change, so restart on word one
  if (document.fonts?.ready) {
    document.fonts.ready.then(() => {
      index = 0;
      track.style.transition = 'none';
      track.style.transform = 'translateY(0px)';
      void track.offsetHeight;
      track.style.transition = '';
    });
  }
}

/** Lightweight particle/nodes field. Stops when off-screen or tab hidden. */
function startHeroCanvas() {
  const canvas = $('#hero-canvas');
  if (!canvas || prefersReduced()) return;
  if (hero.canvas?.running) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let width = 0, height = 0;
  let particles = [];
  let raf = null;
  let running = true;
  let visible = true;
  const pointer = { x: -9999, y: -9999 };

  const accent = () => getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#22d3ee';

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    width = rect.width; height = rect.height;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = clamp(Math.round((width * height) / 26000), 18, 70);
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.24,
      vy: (Math.random() - 0.5) * 0.24,
      r: Math.random() * 1.7 + 0.7
    }));
  };

  const draw = () => {
    if (!running) return;
    ctx.clearRect(0, 0, width, height);
    const color = accent();

    for (const p of particles) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < -20) p.x = width + 20; else if (p.x > width + 20) p.x = -20;
      if (p.y < -20) p.y = height + 20; else if (p.y > height + 20) p.y = -20;

      const dx = p.x - pointer.x, dy = p.y - pointer.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 120) {
        p.x += (dx / dist) * 0.42;
        p.y += (dy / dist) * 0.42;
      }
      ctx.beginPath();
      ctx.globalAlpha = 0.55;
      ctx.fillStyle = color;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // link nearby particles — cheap O(n²) with a small cap
    ctx.lineWidth = 0.6;
    for (let i = 0; i < particles.length; i += 1) {
      for (let j = i + 1; j < particles.length; j += 1) {
        const a = particles[i], b = particles[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 108) {
          ctx.globalAlpha = (1 - d / 108) * 0.28;
          ctx.strokeStyle = color;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;
    raf = requestAnimationFrame(draw);
  };

  const stop = () => { running = false; if (raf) cancelAnimationFrame(raf); raf = null; };
  const start = () => { if (!running) { running = true; raf = requestAnimationFrame(draw); } };

  resize();
  raf = requestAnimationFrame(draw);

  window.addEventListener('resize', debounce(resize, 250));
  window.addEventListener('pointermove', (event) => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = event.clientX - rect.left;
    pointer.y = event.clientY - rect.top;
  }, { passive: true });
  window.addEventListener('pointerleave', () => { pointer.x = -9999; pointer.y = -9999; });

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      visible = entry.isIntersecting;
      if (visible && !document.hidden) start(); else stop();
    });
  }, { threshold: 0 });
  io.observe(canvas);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop(); else if (visible) start();
  });

  // one state object per page: stop/start reuse the existing listeners instead
  // of rebuilding them (no duplicate observers or rAF loops on preference flips)
  hero.canvas = {
    running: true,
    resize,
    stop: () => { stop(); hero.canvas.running = false; },
    start: () => { if (!document.hidden) { start(); hero.canvas.running = true; } }
  };
}

function stopHeroCanvas() {
  hero.canvas?.stop();
}

function resumeHeroCanvas() {
  if (hero.canvas) hero.canvas.start();
  else startHeroCanvas();
}

/* --- 8.7 About: nothing dynamic beyond lists (rendered in 8.1) -------- */

/* --- 8.8 Skills + radar ----------------------------------------------- */
function groupScores() {
  return SKILL_GROUPS.map((group) => {
    const total = group.items.reduce((sum, item) => sum + item[2], 0);
    const score = Math.round(total / group.items.length);
    const advanced = group.items.filter((i) => i[1] === 'advanced').length;
    return { id: group.id, name: group.name, score, count: group.items.length, advanced };
  });
}

function renderSkillFilters() {
  renderChips('#skill-filters', 'data-skill-filter', [
    { value: 'All', label: 'All', count: SKILL_GROUPS.reduce((sum, g) => sum + g.items.length, 0) },
    ...groupScores().map((s) => ({ value: s.id, label: s.name, count: s.count }))
  ], view.skillFilter);
}

function renderSkills() {
  const grid = $('#skill-grid');
  if (!grid) return;

  const groups = view.skillFilter === 'All'
    ? SKILL_GROUPS
    : SKILL_GROUPS.filter((g) => g.id === view.skillFilter);

  const fragments = [];
  groups.forEach((group) => {
    group.items.forEach((item) => {
      const [name, level, score, note] = item;
      const levelInfo = LEVELS[level] || LEVELS.learning;
      const related = group.items
        .filter((other) => other[0] !== name && ['advanced', 'practicing'].includes(other[1]))
        .slice(0, 3)
        .map((other) => other[0]);

      fragments.push(`
        <button type="button" class="skill-card" data-skill="${escapeHtml(name)}" data-group="${group.id}" aria-expanded="false">
          <span class="skill-card__head">
            <span>
              <span class="skill-card__cat">${escapeHtml(group.name)}</span>
              <span class="skill-card__name">${escapeHtml(name)}</span>
            </span>
            <span class="level level--${level}">${levelInfo.label}</span>
          </span>
          <span class="skill-card__bar" role="img" aria-label="${score} percent proficiency"><i data-score="${score}"></i></span>
          <span class="skill-card__foot"><span>${score}%</span><span>${escapeHtml(group.name)}</span></span>
          <span class="skill-card__body">
            ${escapeHtml(note)}
            ${frag.tags(related, { cls: 'skill-card__related', tag: 'span' })}
          </span>
        </button>`);
    });
  });

  grid.innerHTML = fragments.join('');

  // animate proficiency bars after paint
  requestAnimationFrame(() => {
    $$('#skill-grid .skill-card__bar > i').forEach((bar) => {
      bar.style.width = `${bar.dataset.score}%`;
    });
  });

  // card toggling + detail panel
  $$('#skill-grid .skill-card').forEach((card) => {
    card.addEventListener('click', () => {
      const open = card.classList.toggle('is-open');
      card.setAttribute('aria-expanded', String(open));
      if (open) {
        const group = SKILL_GROUPS.find((g) => g.id === card.dataset.group);
        const item = group?.items.find((i) => i[0] === card.dataset.skill);
        if (item && group) renderSkillDetail(group, item);
      }
    });
  });
}

function renderSkillDetail(group, item) {
  const panel = $('#skill-detail');
  if (!panel) return;
  const [name, level, score, note] = item;
  const levelInfo = LEVELS[level] || LEVELS.learning;
  const peers = group.items
    .slice()
    .sort((a, b) => b[2] - a[2])
    .slice(0, 5)
    .map((p) => p[0]);

  panel.hidden = false;
  panel.innerHTML = `
    <div class="skill-detail__inner">
      <div class="skill-detail__head">
        <div>
          <span class="skill-card__cat">${escapeHtml(group.name)}</span>
          <h3>${escapeHtml(name)}</h3>
        </div>
        <span class="level level--${level}">${levelInfo.label} · ${score}%</span>
      </div>
      <p>${escapeHtml(note)}</p>
      <div class="skill-detail__grid">
        ${frag.stat('Domain', group.name)}
        ${frag.stat('Items in domain', group.items.length)}
        ${frag.stat('Proficiency', `${score}%`)}
      </div>
      ${frag.tags(peers, { cls: 'skill-card__related' })}
    </div>`;
  panel.scrollIntoView({ behavior: prefersReduced() ? 'auto' : 'smooth', block: 'nearest' });
}

function renderRadarLegend() {
  const legend = $('#radar-legend');
  if (!legend) return;
  legend.innerHTML = groupScores().map((s) => `
    <li data-radar-row="${s.id}">
      <button type="button" class="linkish" data-radar-group="${s.id}" style="color:inherit">${escapeHtml(s.name)}</button>
      <b>${s.score}</b>
    </li>`).join('');

  $$('#radar-legend [data-radar-group]').forEach((btn) => {
    btn.addEventListener('click', () => focusGroup(btn.dataset.radarGroup));
  });
}

function renderRadar() {
  const svg = $('#skill-radar');
  if (!svg) return;
  const scores = groupScores();
  const size = 320, cx = size / 2, cy = size / 2;
  const radius = 104;
  const axes = scores.length;
  const point = (value, index) => {
    const angle = (Math.PI * 2 * index) / axes - Math.PI / 2;
    const r = (clamp(value, 0, 100) / 100) * radius;
    return [cx + Math.cos(angle) * r, cy + Math.sin(angle) * r];
  };

  const rings = [25, 50, 75, 100].map((pct) => {
    const pts = scores.map((_, i) => point(pct, i).map((n) => n.toFixed(1)).join(',')).join(' ');
    return `<polygon class="radar__grid" points="${pts}" />`;
  }).join('');

  const spokes = scores.map((s, i) => {
    const [x, y] = point(100, i);
    return `<line class="radar__spoke" x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" />`;
  }).join('');

  const labels = scores.map((s, i) => {
    const angle = (Math.PI * 2 * i) / axes - Math.PI / 2;
    const lx = cx + Math.cos(angle) * (radius + 26);
    const ly = cy + Math.sin(angle) * (radius + 26);
    const anchor = Math.abs(Math.cos(angle)) < 0.3 ? 'middle' : Math.cos(angle) > 0 ? 'start' : 'end';
    const short = s.name.split(' ')[0].replace('/', '/');
    return `<text class="radar__label" x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="${anchor}" dominant-baseline="middle">${escapeHtml(short)}</text>`;
  }).join('');

  const polyPoints = scores.map((s, i) => point(s.score, i).map((n) => n.toFixed(1)).join(',')).join(' ');
  const dots = scores.map((s, i) => {
    const [x, y] = point(s.score, i);
    return `<circle class="radar__dot" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.5" tabindex="0" role="button"
      data-radar-group="${s.id}" aria-label="${escapeHtml(s.name)}: ${s.score} out of 100. Activate to filter this domain."></circle>`;
  }).join('');

  svg.innerHTML = `
    <g>${rings}${spokes}${labels}</g>
    <polygon class="radar__poly" points="${polyPoints}"></polygon>
    <g>${dots}</g>`;

  $$('#skill-radar .radar__dot').forEach((dot) => {
    const activate = () => focusGroup(dot.dataset.radarGroup);
    dot.addEventListener('click', activate);
    dot.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); activate(); }
    });
    dot.addEventListener('mouseenter', () => {
      const group = SKILL_GROUPS.find((g) => g.id === dot.dataset.radarGroup);
      if (group) dot.setAttribute('aria-label', `${group.name}: ${group.items.length} skills. Click to filter.`);
    });
  });

  if (!svg.getAttribute('aria-label')) svg.setAttribute('aria-label', 'Skill radar across nine domains');
}

function focusGroup(groupId) {
  view.skillFilter = groupId === 'All' ? 'All' : groupId;
  renderSkillFilters();
  renderSkills();
  const group = SKILL_GROUPS.find((g) => g.id === groupId);
  if (!group) return;
  const top = group.items.slice().sort((a, b) => b[2] - a[2])[0];
  renderSkillDetail(group, top);
  toast(`${group.name} focus`, { sub: `${group.items.length} skills in view`, icon: group.icon, kind: 'info', duration: 2200 });
}

function initSkills() {
  renderSkillFilters();
  renderSkills();
  renderRadar();
  renderRadarLegend();

  bindChips('#skill-filters', 'data-skill-filter', (value) => {
    view.skillFilter = value;
    renderSkillFilters();
    renderSkills();
  });

  $('#skills-expand-all')?.addEventListener('click', () => {
    const cards = $$('#skill-grid .skill-card');
    const anyClosed = cards.some((c) => !c.classList.contains('is-open'));
    cards.forEach((card) => {
      card.classList.toggle('is-open', anyClosed);
      card.setAttribute('aria-expanded', String(anyClosed));
    });
  });

  const modeToggle = $('#skill-mode-toggle');
  modeToggle?.addEventListener('change', () => {
    view.radarMode = modeToggle.checked;
    const panel = $('.skills-panel');
    if (panel) panel.dataset.view = view.radarMode ? 'radar' : 'grid';
  });
}

/* --- 8.9 Projects ------------------------------------------------------ */
function renderProjectFilters() {
  renderChips('#project-filters', 'data-project-filter',
    categoryChips(PROJECT_CATEGORIES, PROJECTS, (p) => p.category), view.projectFilter);
}

function visibleProjects() {
  const query = view.projectQuery.trim().toLowerCase();
  let list = PROJECTS.filter((p) => view.projectFilter === 'All' || p.category === view.projectFilter);

  if (query) {
    list = list.filter((p) => {
      const haystack = [p.title, p.description, p.category, p.status, ...(p.technologies || []),
        p.problem, p.solution, p.architecture, p.challenges, p.results].join(' ').toLowerCase();
      return query.split(/\s+/).every((token) => haystack.includes(token));
    });
  }

  const sorters = {
    featured: (a, b) => Number(b.featured) - Number(a.featured) || b.year - a.year,
    recent: (a, b) => b.year - a.year,
    oldest: (a, b) => a.year - b.year,
    az: (a, b) => a.title.localeCompare(b.title),
    za: (a, b) => b.title.localeCompare(a.title)
  };
  return list.sort(sorters[view.projectSort] || sorters.featured);
}

function projectCardMarkup(project, index, { featured = false } = {}) {
  const poster = project.image ? assetUrl(project.image) : generatedPoster(project.title, PROJECTS.indexOf(project));
  const isPlaceholder = PLACEHOLDER_RE.test(project.github || '') || project.github === '#';
  const safeName = escapeHtml(project.title);
  return `
    <article class="project-card${featured ? ' project-card--featured' : ''}" data-project-id="${project.id}">
      <div class="project-card__media">
        <img src="${poster}" alt="${safeName} preview image" loading="lazy" decoding="async" width="800" height="450">
        <div class="project-card__flags">
          ${frag.badge(project.category, 'accent')}
          ${frag.badge(project.status)}
          ${project.featured ? frag.badge('Featured', 'ok', 'star') : ''}
        </div>
      </div>
      <div class="project-card__body">
        <h3 class="project-card__title">${safeName}</h3>
        <p class="project-card__desc">${escapeHtml(project.description)}</p>
        ${frag.tags((project.technologies || []).slice(0, 5))}
        <div class="project-card__meta"><span>${project.year}</span><span>·</span><span>${escapeHtml(project.category)}</span></div>
        <div class="project-card__actions">
          <button type="button" class="btn btn--primary btn--sm" data-project-details="${project.id}">${icon('info')} Details</button>
          ${frag.linkButton(project.github, 'Code', 'github', { attrs: isPlaceholder ? ' data-placeholder-link="github"' : '' })}
          ${frag.linkButton(project.demo, 'Demo', 'external', { attrs: project.demo === '#' ? ' data-placeholder-link="demo"' : '' })}
        </div>
      </div>
    </article>`;
}

function renderProjects() {
  const grid = $('#project-grid');
  const featuredStrip = $('#featured-strip');
  const count = $('#project-count');
  const empty = $('#project-empty');
  if (!grid) return;

  const list = visibleProjects();

  grid.innerHTML = list.map((p, i) => {
    const el = document.createElement('div');
    el.innerHTML = projectCardMarkup(p, i);
    const card = el.firstElementChild;
    observeReveal(card, i);
    return card.outerHTML;
  }).join('');

  // featured strip only when nothing is filtered out
  if (featuredStrip) {
    const showFeatured = view.projectFilter === 'All' && !view.projectQuery;
    const featuredList = list.filter((p) => p.featured).slice(0, 3);
    featuredStrip.hidden = !(showFeatured && featuredList.length);
    featuredStrip.innerHTML = featuredStrip.hidden ? '' : featuredList.map((p, i) => projectCardMarkup(p, i, { featured: true })).join('');
    $$('#featured-strip .project-card').forEach((card, i) => observeReveal(card, i));
  }

  if (count) {
    count.textContent = `${list.length} project${list.length === 1 ? '' : 's'} shown` +
      (view.projectFilter !== 'All' ? ` · filter: ${view.projectFilter}` : '') +
      (view.projectQuery ? ` · query: “${view.projectQuery}”` : '');
  }
  if (empty) empty.hidden = list.length > 0;

  // lazy poster images already use loading="lazy"; reveal happens via observer
  $$('#project-grid .project-card').forEach((card, i) => observeReveal(card, i));
}

function openProject(project) {
  if (!project) return;
  const poster = project.image ? assetUrl(project.image) : generatedPoster(project.title, PROJECTS.indexOf(project));
  const sections = [
    ['Problem', project.problem, 'info'],
    ['Solution', project.solution, 'check'],
    ['Architecture', project.architecture, 'layers'],
    ['Challenges', project.challenges, 'shield'],
    ['Results', project.results, 'trophy']
  ].filter(([, text]) => text);

  openModal({
    kicker: `Project · ${project.category}`,
    title: project.title,
    chrome: `project.${project.id}.detail`,
    body: `
      <div class="modal__media"><img src="${poster}" alt="${escapeHtml(project.title)} preview" loading="lazy" decoding="async"></div>
      ${frag.stats([['Status', project.status], ['Year', project.year], ['Category', project.category]])}
      ${frag.section('Overview', `<p>${escapeHtml(project.description)}</p>`, 'info')}
      ${sections.map(([label, text, ic]) => frag.section(label, `<p>${escapeHtml(text)}</p>`, ic)).join('')}
      ${frag.section('Technologies', frag.tags(project.technologies), 'cpu')}`,
    actions: `
      ${frag.linkButton(project.github, 'GitHub', 'github', { kind: 'primary' })}
      ${frag.linkButton(project.demo, 'Live demo', 'external')}
      ${frag.modalClose()}`
  });
  toast('Project opened', { sub: project.title, icon: 'layers', kind: 'info', duration: 2000 });
}

function initProjects() {
  renderProjectFilters();
  renderProjects();

  bindChips('#project-filters', 'data-project-filter', (value) => {
    view.projectFilter = value;
    renderProjectFilters();
    renderProjects();
  });

  bindSearch('#project-search', (query) => {
    view.projectQuery = query;
    renderProjects();
  });

  $('#project-sort')?.addEventListener('change', (event) => {
    view.projectSort = event.target.value;
    renderProjects();
  });

  // delegate clicks on dynamically rendered cards
  document.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-project-details]');
    if (btn) {
      openProject(PROJECTS.find((p) => p.id === btn.dataset.projectDetails));
      return;
    }
    const card = event.target.closest('.project-card');
    const link = event.target.closest('a');
    if (card && !link) openProject(PROJECTS.find((p) => p.id === card.dataset.projectId));

    const placeholderLink = event.target.closest('[data-placeholder-link]');
    if (placeholderLink && placeholderLink.getAttribute('href') === '#') {
      event.preventDefault();
      toast('Placeholder link', { sub: 'Add the real URL in script.js', kind: 'warn', icon: 'info' });
    }
  });
}

/* --- 8.10 Timeline ----------------------------------------------------- */
function renderTimelineFilters() {
  renderChips('#timeline-filters', 'data-timeline-filter',
    categoryChips(TIMELINE_KINDS, TIMELINE, (t) => t.kind, capitalise), view.timelineFilter);
}

function renderTimeline() {
  const list = $('#timeline');
  if (!list) return;
  const items = view.timelineFilter === 'All' ? TIMELINE : TIMELINE.filter((t) => t.kind === view.timelineFilter);

  list.innerHTML = items.map((item) => `
    <li class="timeline__item">
      <article class="timeline__card">
        <div class="timeline__top">
          <span class="timeline__date">${escapeHtml(item.date)}</span>
          <span class="timeline__kind">${escapeHtml(item.kind)}</span>
        </div>
        <h3 class="timeline__title">${escapeHtml(item.title)}</h3>
        ${item.org ? `<p class="timeline__org">${escapeHtml(item.org)}</p>` : ''}
        <p class="timeline__text">${escapeHtml(item.text)}</p>
        ${frag.tags(item.tech, { cls: 'timeline__tech' })}
      </article>
    </li>`).join('');

  $$('#timeline .timeline__item').forEach((el, i) => observeReveal(el, i));
}

function initTimeline() {
  renderTimelineFilters();
  renderTimeline();
  bindChips('#timeline-filters', 'data-timeline-filter', (value) => {
    view.timelineFilter = value;
    renderTimelineFilters();
    renderTimeline();
  });
}

/* --- 8.11 Certifications ---------------------------------------------- */
function renderCertFilters() {
  renderChips('#cert-filters', 'data-cert-filter',
    categoryChips(CERT_CATEGORIES, CERTIFICATIONS, (c) => c.category), view.certFilter);
}

function renderCerts() {
  const grid = $('#cert-grid');
  const empty = $('#cert-empty');
  if (!grid) return;
  const query = view.certQuery.trim().toLowerCase();
  const items = CERTIFICATIONS.filter((c) => (view.certFilter === 'All' || c.category === view.certFilter))
    .filter((c) => !query || [c.name, c.issuer, c.credentialId, c.category, c.note].join(' ').toLowerCase().includes(query));

  grid.innerHTML = items.map((cert) => `
    <article class="cert-card">
      <div class="cert-card__head">
        <span class="cert-card__icon">${icon('cert')}</span>
        ${frag.badge(cert.category)}
      </div>
      <div>
        <h3 class="cert-card__name">${escapeHtml(cert.name)}</h3>
        <p class="cert-card__issuer">${escapeHtml(cert.issuer)}</p>
      </div>
      <div class="cert-card__facts">
        <span><b>Issued</b><b>${escapeHtml(cert.date)}</b></span>
        <span><b>Credential ID</b><b>${escapeHtml(cert.credentialId)}</b></span>
      </div>
      <div class="cert-card__actions">
        <button type="button" class="btn btn--ghost btn--sm" data-cert-open="${escapeHtml(cert.name + '|' + cert.issuer)}">${icon('info')} Details</button>
        ${frag.linkButton(cert.url, 'Verify', 'external')}
      </div>
    </article>`).join('');

  $$('#cert-grid .cert-card').forEach((el, i) => observeReveal(el, i));
  if (empty) empty.hidden = items.length > 0;
}

function openCert(key) {
  const [name, issuer] = key.split('|');
  const cert = CERTIFICATIONS.find((c) => c.name === name && c.issuer === issuer);
  if (!cert) return;
  openModal({
    kicker: `Certificate · ${cert.category}`,
    title: cert.name,
    chrome: 'certificate.verify',
    body: `
      ${frag.stats([['Issuer', cert.issuer], ['Issued', cert.date], ['Credential ID', cert.credentialId]])}
      ${frag.section('Note', `<p>${escapeHtml(cert.note || '')}</p>`, 'info')}`,
    actions: `
      ${frag.linkButton(cert.url, 'Verify credential', 'external', { kind: 'primary' })}
      ${frag.modalClose()}`
  });
}

function initCerts() {
  renderCertFilters();
  renderCerts();

  bindChips('#cert-filters', 'data-cert-filter', (value) => {
    view.certFilter = value;
    renderCertFilters();
    renderCerts();
  });

  bindSearch('#cert-search', (query) => {
    view.certQuery = query;
    renderCerts();
  });
  $('#cert-grid')?.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-cert-open]');
    if (btn) openCert(btn.dataset.certOpen);
  });
}

/* --- 8.12 Achievements + counters ------------------------------------- */

/**
 * Final text for a counter: the real value when the data has one, the editable
 * placeholder otherwise. Never "0" — an unset counter must read as unset, not
 * as an achievement (requirement 12).
 */
function counterText(value, suffix = '', placeholder = '[ADD]') {
  const target = Number(value);
  return Number.isFinite(target) && target > 0 ? `${target}${suffix}` : placeholder;
}

function renderAchievements() {
  const stats = $('#stats-grid');
  if (stats) {
    stats.innerHTML = ACHIEVEMENT_STATS.map((stat) => {
      const suffix = stat.suffix || '';
      return `
      <article class="stat-card" data-stat="${stat.key}">
        <span class="stat-card__label">${icon(stat.icon)} ${escapeHtml(stat.label)}</span>
        <span class="stat-card__value" data-count-target="${Number(stat.value) || 0}" data-count-suffix="${suffix}" data-count-placeholder="[ADD]" data-count-label="${escapeHtml(stat.label)}">${escapeHtml(counterText(stat.value, suffix))}</span>
        <span class="stat-card__note">${escapeHtml(stat.note)}</span>
      </article>`;
    }).join('');
  }

  const groups = $('#achievement-grid');
  if (groups) {
    groups.innerHTML = ACHIEVEMENT_GROUPS.map((g) => `
      <article class="achievement-card">
        <div class="achievement-card__head">${icon(g.icon)}<h3>${escapeHtml(g.title)}</h3></div>
        <ul class="achievement-card__items">${g.items.map((i) => `<li>${icon('star')}<span>${escapeHtml(i)}</span></li>`).join('')}</ul>
      </article>`).join('');
  }
}

/**
 * Paints one counter.
 *
 *   no positive value  → the editable placeholder, left alone forever
 *   value already shown → nothing to do (the honest text is already on screen)
 *   new real value      → count up, never below 1, so no frame ever shows a 0
 *
 * Every counter in the page goes through this one function.
 */
function paintCounter(el, { animate = true } = {}) {
  const raw = el.dataset.countTarget != null ? el.dataset.countTarget : el.dataset.count;
  const target = Number(raw);
  const suffix = el.dataset.countSuffix || '';
  const placeholder = el.dataset.countPlaceholder || '[ADD]';

  if (!Number.isFinite(target) || target <= 0) {
    el.textContent = placeholder;
    return;
  }

  const finalText = `${target}${suffix}`;
  if (!animate || prefersReduced() || el.textContent.trim() === finalText) {
    el.textContent = finalText;
    return;
  }

  const duration = 1200;
  const start = performance.now();
  const tick = (now) => {
    const progress = clamp((now - start) / duration, 0, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = `${Math.max(1, Math.round(target * eased))}${suffix}`;
    if (progress < 1) requestAnimationFrame(tick);
  };
  el.textContent = `${Math.max(1, Math.round(target * 0.05))}${suffix}`;
  requestAnimationFrame(tick);
}

/** Counter cells that animate once they scroll into view. */
function initCounters() {
  const nodes = $$('[data-count], [data-count-target]');
  if (!nodes.length) return;

  nodes.forEach((el) => paintCounter(el, { animate: false }));

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { paintCounter(entry.target); obs.unobserve(entry.target); }
    });
  }, { threshold: 0.4 });

  nodes.forEach((el) => observer.observe(el));
}

/** Reflect the live GitHub repo count onto the achievements dashboard. */
function syncRepoStat(count) {
  const el = $('[data-stat="repos"] [data-count-target]');
  if (!el || !(Number(count) > 0)) return;
  el.dataset.countTarget = String(count);
  el.dataset.countSuffix = '';
  el.removeAttribute('data-count-placeholder');
  paintCounter(el);
}

/* --- 8.13 GitHub live panel ------------------------------------------- */
const GH_CACHE_KEY = 'portfolio-os.github.cache';

const GITHUB_FALLBACK = {
  login: 'YOUR_GITHUB_USERNAME',
  name: 'Your Name',
  bio: 'Add your GitHub username in script.js to load live data.',
  public_repos: 0, followers: 0, following: 0,
  html_url: '#'
};

function readGhCache() {
  try {
    const raw = localStorage.getItem(GH_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const ttl = (portfolioConfig.githubCacheMinutes || 30) * 60 * 1000;
    if (!parsed.at || Date.now() - parsed.at > ttl) return null;
    return parsed;
  } catch { return null; }
}

function writeGhCache(payload) {
  try { localStorage.setItem(GH_CACHE_KEY, JSON.stringify(Object.assign({ at: Date.now() }, payload))); } catch { /* ignore */ }
}

function renderGitHub({ user, repos, source, note }) {
  const userLine = $('#gh-user');
  const statsWrap = $('#github-stats');
  const reposWrap = $('#github-repos');
  const sourceBadge = $('#gh-source');
  const noteEl = $('#gh-note');

  const stars = (repos || []).reduce((sum, r) => sum + (r.stargazers_count || 0), 0);
  const publicRepos = user.public_repos || (repos || []).length;

  if (userLine) {
    userLine.textContent = `${user.name || user.login} · @${user.login}${user.location ? ` · ${user.location}` : ''}`;
  }
  if (statsWrap) {
    // With no live reading there is no number to show: display the editable
    // placeholder rather than a row of zeros that would read as real counts.
    const unknown = source === 'offline';
    const stats = [
      { label: 'Public repos', value: publicRepos },
      { label: 'Total stars', value: stars },
      { label: 'Followers', value: user.followers || 0 },
      { label: 'Following', value: user.following || 0 }
    ];
    statsWrap.innerHTML = stats.map((s) => `
      <div class="github-stat"><b>${unknown ? '[ADD]' : formatNumber(s.value)}</b><span>${s.label}</span></div>`).join('');
  }
  if (reposWrap) {
    const list = (repos || [])
      .slice()
      .sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
      .slice(0, 6);
    reposWrap.innerHTML = list.length ? list.map((r) => `
      <a class="repo-card" href="${escapeHtml(r.html_url)}" target="_blank" rel="noopener noreferrer">
        <span class="repo-card__top">
          <span class="repo-card__name">${escapeHtml(r.name)}</span>
          ${r.language ? frag.pill(r.language) : ''}
        </span>
        <p>${escapeHtml(r.description || 'No description yet.')}</p>
        <span class="repo-card__meta">
          <span>${icon('star')} ${formatNumber(r.stargazers_count || 0)}</span>
          <span>${icon('git')} ${formatNumber(r.forks_count || 0)}</span>
          <span>${new Date(r.pushed_at).getFullYear()}</span>
        </span>
      </a>`).join('') : '<p class="github-panel__sub">No public repositories to show.</p>';
  }
  if (sourceBadge) {
    sourceBadge.textContent = source;
    sourceBadge.className = `badge ${source === 'live' ? 'badge--ok' : source === 'cached' ? 'badge--accent' : 'badge--warn'}`;
  }
  if (noteEl) {
    noteEl.hidden = !note;
    noteEl.textContent = note || '';
  }
  if (source === 'live') syncRepoStat(publicRepos);
}

async function loadGitHub({ force = false, notify = true } = {}) {
  const username = portfolioConfig.username;
  const noteEl = $('#gh-note');

  if (!username || PLACEHOLDER_RE.test(username)) {
    renderGitHub({
      user: GITHUB_FALLBACK,
      repos: [],
      source: 'offline',
      note: '[ADD YOUR GITHUB USERNAME] in script.js → portfolioConfig.username to load live repositories, stars and followers.'
    });
    if (notify) toast('GitHub username not set', { sub: 'Add it in portfolioConfig', kind: 'warn', icon: 'github' });
    return;
  }

  if (!force) {
    const cached = readGhCache();
    if (cached) {
      renderGitHub({ user: cached.user, repos: cached.repos, source: 'cached', note: 'Showing cached GitHub data.' });
      return;
    }
  }

  if (noteEl) { noteEl.hidden = true; }
  const sourceBadge = $('#gh-source');
  if (sourceBadge) { sourceBadge.textContent = 'loading'; sourceBadge.className = 'badge badge--muted'; }

  try {
    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${encodeURIComponent(username)}`),
      fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated`)
    ]);
    if (!userRes.ok) throw new Error(`GitHub user request failed (${userRes.status})`);
    const user = await userRes.json();
    const repos = reposRes.ok ? await reposRes.json() : [];
    renderGitHub({ user, repos, source: 'live', note: '' });
    writeGhCache({ user, repos });
    if (notify) toast('GitHub profile loaded', { sub: `@${user.login}`, icon: 'github', kind: 'ok' });
  } catch (error) {
    const stale = (() => {
      try { const raw = localStorage.getItem(GH_CACHE_KEY); return raw ? JSON.parse(raw) : null; } catch { return null; }
    })();
    const reason = (error && error.message) || 'Unknown network error';
    if (stale && stale.user) {
      renderGitHub({ user: stale.user, repos: stale.repos || [], source: 'cached', note: `Live GitHub data unavailable (${reason}). Showing cached data.` });
    } else {
      renderGitHub({
        user: GITHUB_FALLBACK, repos: [], source: 'offline',
        note: `GitHub API unavailable (${reason}). The page keeps working — counts stay at zero instead of guessing.`
      });
    }
    if (notify) toast('GitHub data unavailable', { sub: 'Using fallback, page unaffected', kind: 'warn', icon: 'github' });
  }
}

function initGitHub() {
  loadGitHub({ notify: false });
  $('#gh-refresh')?.addEventListener('click', () => loadGitHub({ force: true, notify: true }));
}

/* --- 8.14 Contact ----------------------------------------------------- */
function initContact() {
  const copyBtn = $('#copy-email-btn');
  copyBtn?.addEventListener('click', async () => {
    const email = portfolioConfig.email;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(email);
      } else {
        const temp = document.createElement('textarea');
        temp.value = email;
        temp.setAttribute('readonly', '');
        temp.style.position = 'fixed';
        temp.style.opacity = '0';
        document.body.appendChild(temp);
        temp.select();
        document.execCommand('copy');
        temp.remove();
      }
      toast('Email copied to clipboard', { sub: email, kind: 'ok', icon: 'copy' });
    } catch (error) {
      toast('Copy failed', { sub: 'Select the address manually', kind: 'err', icon: 'copy' });
    }
  });
}

/* ====================== 9. DIALOGS (modal + overlays) ================= */

/**
 * Every dialog on the page — the detail modal, the command palette, the theme
 * studio, the terminal — is shown and hidden through these two functions, so
 * page-locking, Escape and Tab behaviour are defined once.
 *
 * @param {object} owner    the feature that owns this dialog's focus bookkeeping
 * @param {HTMLElement} element  the element toggled with [hidden]
 * @param {HTMLElement} dialog   the focusable container to move focus into
 * @param {() => void} onClose   what Escape should run
 */
function showDialog(owner, element, dialog, onClose) {
  element.hidden = false;
  document.body.classList.add('is-locked');
  revealFocus(dialog);
  owner.keydown = (event) => {
    if (event.key === 'Escape') { event.preventDefault(); onClose(); return; }
    if (event.key === 'Tab') trapFocus(dialog, event);
  };
  document.addEventListener('keydown', owner.keydown);
}

/** Hides a dialog opened by showDialog() and returns focus where it came from. */
function hideDialog(owner, element) {
  if (element) element.hidden = true;
  document.body.classList.remove('is-locked');
  if (owner.keydown) document.removeEventListener('keydown', owner.keydown);
  owner.keydown = null;
  revealFocus(owner.lastFocus);
  owner.lastFocus = null;
}

/** The one detail modal. `lastFocus`/`keydown` are dialog bookkeeping. */
const modal = { lastFocus: null, keydown: null };

function openModal({ kicker = 'Detail', title, body, actions = '', chrome = 'detail.view' }) {
  const el = $('#modal');
  if (!el) return;
  const titleEl = $('#modal-title');
  const kickerEl = $('#modal-kicker');
  const bodyEl = $('#modal-body');
  const footEl = $('#modal-foot');
  const chromeEl = $('#modal-chrome-title');

  modal.lastFocus = document.activeElement;
  if (titleEl) titleEl.textContent = title || 'Detail';
  if (kickerEl) kickerEl.textContent = kicker;
  if (bodyEl) bodyEl.innerHTML = body || '';
  if (footEl) footEl.innerHTML = actions;
  if (chromeEl) chromeEl.textContent = chrome;

  el.onclick = (event) => {
    if (event.target.closest('[data-modal-close]')) closeModal();
  };

  showDialog(modal, el, el.querySelector('.modal__dialog'), closeModal);
}

function closeModal() {
  const el = $('#modal');
  if (!el || el.hidden) return;
  hideDialog(modal, el);
}

/** Keep Tab focus inside an open dialog. */
function trapFocus(container, event) {
  if (!container) return;
  const focusables = $$('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])', container)
    .filter((el) => el.offsetParent !== null || el === document.activeElement);
  if (!focusables.length) return;
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
}

/** The overlay currently open (palette, theme studio, terminal), or null. */
const overlay = { open: null, lastFocus: null, keydown: null };

function openOverlay(id) {
  const el = document.getElementById(id);
  if (!el) return;
  overlay.lastFocus = document.activeElement;
  overlay.open = id;
  showDialog(overlay, el, el.querySelector('[role="dialog"]'), closeOverlay);
}

function closeOverlay() {
  if (!overlay.open) return;
  hideDialog(overlay, document.getElementById(overlay.open));
  overlay.open = null;
}

/* every overlay scrim is wired through one delegated listener */
document.addEventListener('click', (event) => {
  const closer = event.target.closest('[data-overlay-close]');
  if (closer) closeOverlay();
});

function scrollToSection(id) {
  const target = document.getElementById(id);
  if (!target) return;
  const y = target.getBoundingClientRect().top + window.scrollY - (parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10) || 68) - 8;
  window.scrollTo({ top: y, behavior: prefersReduced() ? 'auto' : 'smooth' });
}

/** Section name as used by the command list and search (may differ from the nav label). */
const navLabel = (item) => item.paletteLabel || item.label;

/** Commands match on their title, their subtitle and any extra keywords. */
const commandMatches = (cmd, q) =>
  `${cmd.title} ${cmd.sub || ''} ${cmd.keywords || ''}`.toLowerCase().includes(q);

/**
 * Order palette rows by how well they match, so typing an exact command name
 * (“Search Projects”) always puts that command first instead of a project
 * that merely happens to contain the same substring somewhere in its copy.
 * Equal scores keep their original order.
 */
function rankPaletteItems(items, q) {
  const score = (item) => {
    const title = item.title.toLowerCase();
    if (title === q) return 0;
    if (title.startsWith(q)) return 1;
    if (title.includes(q)) return 2;
    if (commandMatches(item, q)) return 3;
    return 4;
  };
  return items
    .map((item, order) => ({ item, order, score: score(item) }))
    .sort((a, b) => a.score - b.score || a.order - b.order)
    .map((entry) => entry.item);
}

/** Jump to the project gallery and put the cursor in its search field. */
function focusProjectSearch() {
  scrollToSection('projects');
  const input = $('#project-search');
  if (!input) return;
  revealFocus(input);
  toast('Search Projects', { sub: 'Type to filter the gallery', icon: 'search', kind: 'info', duration: 2000 });
}

function commandList() {
  /* Titles are the plain section names (requirement 14 lists them bare:
     "Home", "About", …, "Timeline"), so the palette contains a command that
     literally carries each requested name. The group + sub carry the verb. */
  const navCommands = NAV_ITEMS.map((item) => ({
    id: `nav-${item.id}`, title: navLabel(item), group: 'Navigate', icon: item.icon,
    sub: `Jump to section · #${item.id}`, keywords: `go to ${navLabel(item)} go to ${item.label}`,
    run: () => scrollToSection(item.id)
  }));

  const themeCommands = THEMES.filter((t) => !t.secret || prefs.voidUnlocked).map((t) => ({
    id: `theme-${t.id}`, title: `Theme: ${t.name}`, group: 'Appearance', icon: 'palette',
    sub: t.desc, run: () => { applyTheme(t.id); prefs.accent = themeAccentDefault(t.id); renderAccentSwatches(); }
  }));

  const actions = [
    { id: 'search-projects', title: 'Search Projects', group: 'Actions', icon: 'search', sub: 'Focus the project gallery search', run: focusProjectSearch },
    { id: 'theme-studio', title: 'Change Theme', group: 'Appearance', icon: 'palette', sub: 'Open the Theme Studio — themes, accent, motion', run: () => openOverlay('theme-studio') },
    { id: 'toggle-mode', title: 'Toggle Dark Mode', group: 'Appearance', icon: prefs.mode === 'dark' ? 'sun' : 'moon', sub: `Currently ${prefs.mode} — switch to ${prefs.mode === 'dark' ? 'light' : 'dark'}`, run: () => applyMode(prefs.mode === 'dark' ? 'light' : 'dark', { notify: true }) },
    { id: 'random-theme', title: 'Surprise me (random theme)', group: 'Appearance', icon: 'sparkle', sub: 'Random theme', run: () => randomTheme() },
    { id: 'toggle-motion', title: prefs.motion === 'reduced' ? 'Enable animations' : 'Reduce motion', group: 'Preferences', icon: 'sparkle', sub: 'Motion preference', run: () => applyMotion(prefs.motion === 'reduced' ? 'full' : 'reduced') },
    { id: 'toggle-ambient', title: ambient.enabled ? 'Disable ambient mode' : 'Enable ambient mode', group: 'Preferences', icon: 'music', sub: 'Synthesised background hum', run: () => toggleAmbient() },
    { id: 'download-cv', title: 'Download CV', group: 'Actions', icon: 'download', sub: portfolioConfig.cvPath, run: () => { window.location.href = assetUrl(portfolioConfig.cvPath); toast('Downloading CV', { sub: portfolioConfig.resumeFileName, icon: 'download', kind: 'ok' }); } },
    { id: 'open-github', title: 'Open GitHub profile', group: 'Links', icon: 'github', sub: portfolioConfig.github, run: () => openExternal(portfolioConfig.github, 'GitHub') },
    { id: 'open-linkedin', title: 'Open LinkedIn profile', group: 'Links', icon: 'linkedin', sub: portfolioConfig.linkedin || '[ADD LINK]', run: () => openExternal(portfolioConfig.linkedin, 'LinkedIn') },
    { id: 'copy-email', title: 'Copy email address', group: 'Actions', icon: 'copy', sub: portfolioConfig.email, run: () => $('#copy-email-btn')?.click() },
    { id: 'mail-me', title: 'Compose email', group: 'Actions', icon: 'mail', sub: portfolioConfig.email, run: () => { window.location.href = `mailto:${portfolioConfig.email}`; } },
    { id: 'terminal', title: 'Open terminal mode', group: 'Tools', icon: 'terminal', sub: 'Interactive shell', run: () => openOverlay('terminal-dock') },
    { id: 'os-mode', title: 'Enter Portfolio OS', group: 'Tools', icon: 'monitor', sub: 'Draggable desktop mode', run: () => openOS() },
    { id: 'refresh-github', title: 'Refresh GitHub data', group: 'Tools', icon: 'git', sub: 'Bypass cache', run: () => loadGitHub({ force: true }) },
    { id: 'clear-prefs', title: 'Reset preferences', group: 'Tools', icon: 'settings', sub: 'Clear localStorage theme/state', run: resetPreferences }
  ];

  if (prefs.voidUnlocked) {
    actions.push({ id: 'void-theme', title: 'Theme: VOID', group: 'Secrets', icon: 'terminal', sub: 'You found it', run: () => applyTheme('void') });
  }

  return navCommands.concat(actions, themeCommands);
}

function openExternal(url, label) {
  if (!url || url === '#') {
    toast(`${label} link not set`, { sub: 'Add it in portfolioConfig', kind: 'warn', icon: 'info' });
    return;
  }
  window.open(url, '_blank', 'noopener,noreferrer');
  toast(`Opening ${label}`, { icon: 'external', kind: 'info', duration: 1800 });
}

function resetPreferences() {
  try { localStorage.removeItem(STORAGE_KEY); localStorage.removeItem(GH_CACHE_KEY); } catch { /* ignore */ }
  toast('Preferences cleared', { sub: 'Reloading defaults', kind: 'ok', icon: 'settings' });
  setTimeout(() => window.location.reload(), 700);
}

/* --- Palette rendering + interaction ---------------------------------- */
/** Palette rows, the highlighted row, and which mode it opened in. */
const palette = { items: [], index: 0, mode: 'command' };

/** Site-wide search across projects, skills, certificates, timeline and sections. */
function globalSearch(query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const results = [];

  PROJECTS.forEach((p) => {
    if ([p.title, p.description, p.category, ...(p.technologies || [])].join(' ').toLowerCase().includes(q)) {
      results.push({ id: `proj-${p.id}`, title: p.title, group: 'Projects', icon: 'layers', sub: `${p.category} · ${p.status}`, run: () => openProject(p) });
    }
  });

  SKILL_GROUPS.forEach((group) => {
    group.items.forEach((item) => {
      if (item[0].toLowerCase().includes(q) || group.name.toLowerCase().includes(q)) {
        results.push({ id: `skill-${group.id}-${item[0]}`, title: item[0], group: 'Skills', icon: group.icon, sub: `${group.name} · ${LEVELS[item[1]].label}`, run: () => { focusGroup(group.id); scrollToSection('skills'); } });
      }
    });
  });

  CERTIFICATIONS.forEach((cert) => {
    if ([cert.name, cert.issuer, cert.category, cert.credentialId].join(' ').toLowerCase().includes(q)) {
      results.push({ id: `cert-${cert.name}-${cert.issuer}`, title: cert.name, group: 'Certifications', icon: 'cert', sub: `${cert.issuer} · ${cert.date}`, run: () => openCert(`${cert.name}|${cert.issuer}`) });
    }
  });

  TIMELINE.forEach((entry) => {
    if ([entry.title, entry.text, entry.org, ...(entry.tech || [])].join(' ').toLowerCase().includes(q)) {
      results.push({ id: `tl-${entry.date}-${entry.title}`, title: entry.title, group: 'Timeline', icon: 'git', sub: `${entry.date} · ${entry.org || entry.kind}`, run: () => scrollToSection('experience') });
    }
  });

  NAV_ITEMS.forEach((item) => {
    if (navLabel(item).toLowerCase().includes(q)) {
      results.push({ id: `sec-${item.id}`, title: `Section: ${navLabel(item)}`, group: 'Sections', icon: item.icon, sub: `#${item.id}`, run: () => scrollToSection(item.id) });
    }
  });

  return results.slice(0, 24);
}

function renderPalette(query = '') {
  const list = $('#cmd-list');
  if (!list) return;
  const isSearchMode = palette.mode === 'search' || query.trim().length > 0 && !query.startsWith('>');
  const commands = commandList();
  const q = query.replace(/^>\s*/, '').trim().toLowerCase();

  let items;
  if (isSearchMode && q) {
    items = globalSearch(q);
    // merge matching commands too so nothing becomes unreachable
    items = items.concat(commands.filter((c) => commandMatches(c, q)));
  } else if (q) {
    items = commands.filter((c) => commandMatches(c, q));
  } else {
    items = commands.slice(0, 14);
  }

  // rank before trimming so an exact command match can never be cut off
  if (q) items = rankPaletteItems(items, q).slice(0, 30);

  palette.items = items;
  palette.index = clamp(palette.index, 0, Math.max(items.length - 1, 0));

  if (!items.length) {
    list.innerHTML = `<li class="palette__empty">No results for “${escapeHtml(query)}”. Try “projects”, “ai”, “theme” or a technology name.</li>`;
    return;
  }

  let lastGroup = '';
  list.innerHTML = items.map((item, i) => {
    const header = item.group !== lastGroup ? `<li class="cmd-group" role="presentation">${escapeHtml(item.group)}</li>` : '';
    lastGroup = item.group;
    return `${header}
      <li role="option" aria-selected="${i === palette.index}">
        <button type="button" class="cmd-item${i === palette.index ? ' is-active' : ''}" data-cmd-index="${i}">
          ${icon(item.icon || 'command')}
          <span class="cmd-item__text">
            <span class="cmd-item__title">${escapeHtml(item.title)}</span>
            ${item.sub ? `<span class="cmd-item__sub">${escapeHtml(item.sub)}</span>` : ''}
          </span>
          <span class="cmd-item__right"><span class="kbd">↵</span></span>
        </button>
      </li>`;
  }).join('');
}

function runPaletteItem(index) {
  const item = palette.items[index];
  if (!item) return;
  closeOverlay();
  // run after the overlay closes so focus and scroll behave predictably
  setTimeout(() => item.run(), 40);
}

function openCommandPalette(mode = 'command') {
  palette.mode = mode;
  palette.index = 0;
  const input = $('#cmd-input');
  if (input) {
    input.value = '';
    input.placeholder = mode === 'search' ? 'Search projects, skills, certificates, sections…' : 'Type a command or search everything…';
  }
  openOverlay('command-palette');
  renderPalette('');
  setTimeout(() => input?.focus(), 60);
}

function initPalette() {
  const input = $('#cmd-input');
  const list = $('#cmd-list');

  input?.addEventListener('input', () => {
    palette.index = 0;
    renderPalette(input.value);
  });

  input?.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      palette.index = (palette.index + 1) % Math.max(palette.items.length, 1);
      renderPalette(input.value);
      list?.querySelector('.cmd-item.is-active')?.scrollIntoView({ block: 'nearest' });
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      palette.index = (palette.index - 1 + palette.items.length) % Math.max(palette.items.length, 1);
      renderPalette(input.value);
      list?.querySelector('.cmd-item.is-active')?.scrollIntoView({ block: 'nearest' });
    } else if (event.key === 'Enter') {
      event.preventDefault();
      runPaletteItem(palette.index);
    }
  });

  list?.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-cmd-index]');
    if (btn) runPaletteItem(Number(btn.dataset.cmdIndex));
  });

  list?.addEventListener('mousemove', (event) => {
    const btn = event.target.closest('[data-cmd-index]');
    if (btn && Number(btn.dataset.cmdIndex) !== palette.index) {
      palette.index = Number(btn.dataset.cmdIndex);
      $$('#cmd-list .cmd-item').forEach((el, i) => el.classList.toggle('is-active', i === palette.index));
    }
  });
}

/* ======================= 11. THEME STUDIO UI ========================== */
function previewVars(theme, accentOverride) {
  const p = theme.preview;
  return [
    `--pv-bg:${p.bg}`, `--pv-surface:${p.surface}`, `--pv-ink:${p.ink}`,
    `--pv-accent:${accentOverride || p.accent}`, `--pv-radius:${p.radius}px`,
    `--pv-bw:${p.bw || '1px'}`, `--pv-border:${p.border || 'transparent'}`,
    p.shadow ? `--pv-shadow:${p.shadow}` : '',
    theme.font ? `font-family:${theme.font}` : ''
  ].filter(Boolean).join(';');
}

function renderThemeGrid() {
  const grid = $('#theme-grid');
  if (!grid) return;
  const available = THEMES.filter((t) => !t.secret || prefs.voidUnlocked);

  grid.innerHTML = available.map((theme) => {
    const override = !prefs.accentCustom && theme.id === prefs.theme ? prefs.accent : null;
    return `
      <button type="button" role="radio" class="theme-card" data-theme-card="${theme.id}"
        aria-checked="${theme.id === prefs.theme}" aria-label="${escapeHtml(theme.name)} theme — ${escapeHtml(theme.desc)}">
        <span class="theme-preview ${theme.preview.cls || ''}" style="${previewVars(theme, override)}">
          <span class="theme-preview__bar"></span>
          <span class="theme-preview__row"><i></i><i></i><i></i></span>
          <span class="theme-preview__lines"><i></i><i></i><i></i></span>
        </span>
        <span class="theme-card__meta">
          <span>
            <span class="theme-card__name">${escapeHtml(theme.name)}</span>
            <span class="theme-card__desc">${escapeHtml(theme.desc)}</span>
          </span>
          <span class="theme-card__check">${icon('check')}</span>
        </span>
      </button>`;
  }).join('');

  $$('#theme-grid [data-theme-card]').forEach((card) => {
    card.addEventListener('click', () => {
      applyTheme(card.dataset.themeCard, { flash: true });
      if (!prefs.accentCustom) {
        prefs.accent = themeAccentDefault(card.dataset.themeCard);
        setAccentVariables(prefs.accent);
        renderAccentSwatches();
      }
    });
  });

  syncThemeGrid();
}

function syncThemeGrid() {
  $$('#theme-grid [data-theme-card]').forEach((card) => {
    const active = card.dataset.themeCard === prefs.theme;
    card.setAttribute('aria-checked', String(active));
  });
  const active = themeById(prefs.theme);
  const label = $('#studio-active');
  if (label) {
    label.textContent = `Active: ${active.name} — ${active.desc} · ${prefs.mode} mode · ${prefs.motion === 'reduced' ? 'reduced motion' : 'full motion'}`;
  }
}

/** Keep the active theme preview's accent in sync with the chosen accent. */
function syncThemePreviewAccents(accent) {
  const card = $(`#theme-grid [data-theme-card="${prefs.theme}"] .theme-preview`);
  if (card) card.style.setProperty('--pv-accent', accent);
}

function renderAccentSwatches() {
  const wrap = $('#accent-swatches');
  if (!wrap) return;
  wrap.innerHTML = ACCENT_SWATCHES.map((swatch) => `
    <button type="button" role="radio" class="swatch" data-accent="${swatch.value}"
      style="background:${swatch.value}" aria-checked="${swatch.value.toLowerCase() === prefs.accent.toLowerCase()}"
      aria-label="${escapeHtml(swatch.name)} accent" title="${escapeHtml(swatch.name)}"></button>`).join('');

  $$('#accent-swatches .swatch').forEach((btn) => {
    btn.addEventListener('click', () => applyAccent(btn.dataset.accent));
  });

  const custom = $('#accent-custom');
  if (custom) custom.value = prefs.accent;
}

function initThemeStudio() {
  renderThemeGrid();
  renderAccentSwatches();

  $$('[data-mode-btn]').forEach((btn) => {
    btn.addEventListener('click', () => applyMode(btn.dataset.modeBtn, { notify: true }));
  });

  $$('[data-locale-btn]').forEach((btn) => {
    btn.addEventListener('click', () => applyLocale(btn.dataset.localeBtn, { notify: true }));
  });

  $('#theme-randomize')?.addEventListener('click', randomTheme);
  $('#accent-reset')?.addEventListener('click', resetAccent);
  $('#accent-custom')?.addEventListener('input', (event) => applyAccent(event.target.value, { notify: false }));
  $('#accent-custom')?.addEventListener('change', (event) => applyAccent(event.target.value, { notify: true }));

  const motionPref = $('#pref-reduced-motion');
  if (motionPref) {
    motionPref.checked = prefs.motion === 'reduced';
    motionPref.addEventListener('change', () => applyMotion(motionPref.checked ? 'reduced' : 'full'));
  }

  const ambientPref = $('#pref-ambient');
  if (ambientPref) {
    ambientPref.checked = ambient.enabled;
    ambientPref.addEventListener('change', () => toggleAmbient(ambientPref.checked));
  }

  const mutePref = $('#pref-muted');
  if (mutePref) {
    mutePref.checked = prefs.muted;
    mutePref.addEventListener('change', () => {
      prefs.set({ muted: mutePref.checked });
      if (prefs.muted && ambient.enabled) toggleAmbient(false);
      toast(prefs.muted ? 'Muted' : 'Unmuted', { icon: prefs.muted ? 'mute' : 'music', kind: 'info', duration: 1600 });
    });
  }

  const cursorPref = $('#pref-cursor');
  if (cursorPref) {
    cursorPref.checked = cursor.enabled;
    cursorPref.disabled = isTouch;
    cursorPref.addEventListener('change', () => setCustomCursor(cursorPref.checked));
  }

  // keep the studio label honest when state changes elsewhere
  window.__syncStudio = syncThemeGrid;
}

/* ===================== 12. AMBIENT MODE (Web Audio) =================== */
const ambient = { enabled: false, ctx: null, master: null, nodes: [], playing: false };

function toggleAmbient(force) {
  const next = typeof force === 'boolean' ? force : !ambient.enabled;
  if (next && prefs.muted) {
    toast('Ambient blocked by mute', { sub: 'Unmute first in Theme Studio', kind: 'warn', icon: 'mute' });
    const pref = $('#pref-ambient');
    if (pref) pref.checked = false;
    return;
  }
  ambient.enabled = next;
  const pref = $('#pref-ambient');
  if (pref) pref.checked = ambient.enabled;
  const fab = $('#fab-ambient');
  fab?.setAttribute('aria-pressed', String(ambient.enabled));

  if (ambient.enabled) startAmbient();
  else stopAmbient();

  toast(ambient.enabled ? 'Ambient mode on' : 'Ambient mode off', {
    sub: ambient.enabled ? 'Synthesised locally — no audio files' : 'Silence restored',
    icon: 'music', kind: 'ok', duration: 2000
  });
}

function startAmbient() {
  if (ambient.playing) return;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) { toast('Web Audio unavailable', { kind: 'warn', icon: 'info' }); return; }
  try {
    ambient.ctx = ambient.ctx || new AudioCtx();
    const ctx = ambient.ctx;
    if (ctx.state === 'suspended') ctx.resume();

    const master = ctx.createGain();
    master.gain.value = 0.0001;
    master.connect(ctx.destination);

    // low drone: two detuned oscillators through a gentle filter
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 420;
    filter.Q.value = 0.7;
    filter.connect(master);

    [55, 82.4, 110].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = i === 2 ? 'triangle' : 'sine';
      osc.frequency.value = freq;
      const gain = ctx.createGain();
      gain.gain.value = i === 2 ? 0.06 : 0.14;
      osc.connect(gain).connect(filter);
      osc.start();
      ambient.nodes.push(osc, gain);
    });

    // airy noise bed
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < bufferSize; i += 1) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.2;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.05;
    noise.connect(noiseGain).connect(master);
    noise.start();

    ambient.nodes.push(noise, noiseGain, filter);
    ambient.master = master;
    ambient.playing = true;
    ambient.startTime = ctx.currentTime;
    master.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 2.4);
  } catch (error) {
    console.warn('[ambient] unavailable', error);
    toast('Ambient mode unavailable', { sub: 'Your browser blocked Web Audio', kind: 'warn', icon: 'info' });
    ambient.enabled = false;
  }
}

function stopAmbient() {
  if (!ambient.playing || !ambient.ctx) return;
  const ctx = ambient.ctx;
  const now = ctx.currentTime;
  try {
    ambient.master?.gain.cancelScheduledValues(now);
    ambient.master?.gain.setValueAtTime(ambient.master.gain.value, now);
    ambient.master?.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
  } catch { /* ignore */ }
  setTimeout(() => {
    ambient.nodes.forEach((node) => { try { node.stop?.(); node.disconnect?.(); } catch { /* ignore */ } });
    ambient.nodes = [];
    ambient.playing = false;
  }, 700);
}

/* ========================= 13. TERMINAL MODE ========================== */
/** Shell history, the cursor into it, and whether the banner has printed. */
const terminal = { history: [], historyIndex: -1, booted: false };

function termPrint(html, cls = '') {
  const screen = $('#terminal-screen');
  if (!screen) return;
  const line = document.createElement('div');
  line.className = `t-line ${cls}`.trim();
  line.innerHTML = html;
  screen.appendChild(line);
  screen.scrollTop = screen.scrollHeight;
}

function termPrintBlock(html, cls = '') {
  const screen = $('#terminal-screen');
  if (!screen) return;
  const block = document.createElement('div');
  block.className = `t-block ${cls}`.trim();
  block.innerHTML = html;
  screen.appendChild(block);
  screen.scrollTop = screen.scrollHeight;
}

function termBanner() {
  termPrintBlock(`
    <span class="t-line--head">PORTFOLIO OS</span> · interactive shell · v1.0
    <br><span class="t-line--dim">type</span> help <span class="t-line--dim">for commands ·</span> exit <span class="t-line--dim">to close ·</span> Ctrl+K <span class="t-line--dim">for the command palette</span>`);
}

function termHelp() {
  const rows = [
    ['help', 'list every command'],
    ['about', 'who is behind this site'],
    ['skills [domain]', 'skill matrix, optionally filtered'],
    ['projects [filter]', 'project index'],
    ['github', 'open the GitHub profile'],
    ['contact', 'email and social channels'],
    ['theme [id]', 'list or switch themes'],
    ['mode', 'toggle light / dark'],
    ['cv', 'download the CV'],
    ['open <section>', 'jump to a section'],
    ['search <query>', 'site-wide search'],
    ['neofetch', 'system style summary'],
    ['ambient', 'toggle ambient mode'],
    ['clear', 'wipe the screen'],
    ['exit', 'close the terminal']
  ];
  termPrintBlock(`<table>${rows.map(([c, d]) => `<tr><td>${escapeHtml(c)}</td><td>${escapeHtml(d)}</td></tr>`).join('')}</table>`);
}

function termNeofetch() {
  const scores = groupScores();
  const avg = Math.round(scores.reduce((s, g) => s + g.score, 0) / scores.length);
  const info = [
    `user      ${portfolioConfig.name}`,
    `role      ${portfolioConfig.role}`,
    `location  ${portfolioConfig.location}`,
    `theme     ${themeById(prefs.theme).name} (${prefs.mode})`,
    `domains   ${SKILL_GROUPS.length} · skills ${SKILL_GROUPS.reduce((n, g) => n + g.items.length, 0)}`,
    `projects  ${PROJECTS.length}`,
    `avg score ${avg}%`,
    `stack     HTML · CSS · Vanilla JS · SVG · Canvas`
  ];
  termPrintBlock(`
    <span class="t-line--accent">      ▄▄▄▄▄▄▄     </span>  ${escapeHtml(portfolioConfig.tagline)}
    <span class="t-line--accent">    ▄█  ◠ ◠  █▄   </span>  ${escapeHtml(portfolioConfig.github)}
    <span class="t-line--accent">   ██    ▽    ██  </span>  <span class="t-line--dim">${escapeHtml(portfolioConfig.location)}</span>
    <span class="t-line--accent">    ▀█  ▁▁▁  █▀   </span>
    <span class="t-line--accent">      ▀▀▀▀▀▀▀     </span>
  `);
  termPrintBlock(`<table>${info.map((line) => {
    const [k, ...rest] = line.split('  ');
    return `<tr><td>${escapeHtml(k)}</td><td>${escapeHtml(rest.join('  ').trim())}</td></tr>`;
  }).join('')}</table>`);
}

function runTerminalCommand(raw) {
  const input = raw.trim();
  if (!input) return;
  termPrint(`<span class="t-line--dim">visitor@portfolio:~$</span> ${escapeHtml(input)}`, 't-line--cmd');

  const [command, ...rest] = input.split(/\s+/);
  const arg = rest.join(' ').toLowerCase();

  switch (command.toLowerCase()) {
    case 'help':
      termHelp();
      break;

    case 'about':
      termPrintBlock(`${escapeHtml(portfolioConfig.name)} — ${escapeHtml(portfolioConfig.role)}<br>
        <span class="t-line--dim">Cybersecurity × AI × Robotics × Software × Research.</span><br>
        ${IDENTITY_CHIPS.map((c) => `<span class="t-line--accent">${escapeHtml(c)}</span>`).join(' · ')}`);
      termPrint('Use <span class="t-line--accent">open about</span> to jump to the About section.', 't-line--dim');
      break;

    case 'skills': {
      const group = SKILL_GROUPS.find((g) => g.id === arg || g.name.toLowerCase() === arg);
      if (arg && !group) {
        termPrint(`Unknown domain “${escapeHtml(arg)}”. Try: ${SKILL_GROUPS.map((g) => g.id).join(', ')}`, 't-line--err');
        break;
      }
      const groups = group ? [group] : SKILL_GROUPS;
      groups.forEach((g) => {
        const top = g.items.slice().sort((a, b) => b[2] - a[2]).slice(0, 6)
          .map((i) => `${escapeHtml(i[0])} <span class="t-line--dim">${i[2]}%</span>`).join(' · ');
        termPrintBlock(`<span class="t-line--accent">${escapeHtml(g.name)}</span> <span class="t-line--dim">(${g.items.length})</span><br>${top}`);
      });
      break;
    }

    case 'projects': {
      const list = PROJECTS.filter((p) => !arg || p.category.toLowerCase().includes(arg) || p.title.toLowerCase().includes(arg));
      if (!list.length) { termPrint('No projects matched.', 't-line--err'); break; }
      termPrintBlock(list.map((p, i) =>
        `<span class="t-line--accent">[${String(i + 1).padStart(2, '0')}]</span> ${escapeHtml(p.title)} <span class="t-line--dim">· ${escapeHtml(p.category)} · ${escapeHtml(p.status)}</span>`).join('<br>'));
      if (arg) termPrint(`Showing ${list.length} of ${PROJECTS.length}. Use <span class="t-line--accent">open projects</span> to browse.`, 't-line--dim');
      break;
    }

    case 'github':
      termPrint(`Opening ${escapeHtml(portfolioConfig.github)}`, 't-line--ok');
      openExternal(portfolioConfig.github, 'GitHub');
      break;

    case 'contact':
      termPrintBlock(`<table><tr><td>email</td><td>${escapeHtml(portfolioConfig.email)}</td></tr>
        <tr><td>github</td><td>${escapeHtml(portfolioConfig.github)}</td></tr>
        <tr><td>linkedin</td><td>${escapeHtml(portfolioConfig.linkedin || '[ADD LINK]')}</td></tr>
        <tr><td>location</td><td>${escapeHtml(portfolioConfig.location)}</td></tr></table>`);
      break;

    case 'theme': {
      if (!arg) {
        termPrintBlock(THEMES.filter((t) => !t.secret || prefs.voidUnlocked)
          .map((t) => `<span class="t-line--accent">${t.id.padEnd(15, ' ')}</span> ${escapeHtml(t.name)}`).join('<br>'), '');
        break;
      }
      const target = THEMES.find((t) => t.id === arg || t.name.toLowerCase() === arg);
      if (!target) { termPrint(`Unknown theme “${escapeHtml(arg)}”.`, 't-line--err'); break; }
      if (target.secret && !prefs.voidUnlocked) { termPrint('That theme is locked.', 't-line--err'); break; }
      applyTheme(target.id);
      prefs.accent = themeAccentDefault(target.id);
      setAccentVariables(prefs.accent);
      renderAccentSwatches();
      termPrint(`Theme set to ${target.name}.`, 't-line--ok');
      break;
    }

    case 'mode': {
      const next = prefs.mode === 'dark' ? 'light' : 'dark';
      applyMode(next, { notify: true });
      termPrint(`Switched to ${next} mode.`, 't-line--ok');
      break;
    }

    case 'cv':
      window.location.href = assetUrl(portfolioConfig.cvPath);
      termPrint(`Downloading ${escapeHtml(portfolioConfig.resumeFileName)}…`, 't-line--ok');
      break;

    case 'open': {
      const section = NAV_ITEMS.find((n) => n.id === arg);
      if (!section) { termPrint(`Unknown section “${escapeHtml(arg)}”. Options: ${NAV_ITEMS.map((n) => n.id).join(', ')}`, 't-line--err'); break; }
      closeOverlay();
      setTimeout(() => scrollToSection(section.id), 120);
      break;
    }

    case 'search': {
      if (!arg) { termPrint('Usage: search <query>', 't-line--err'); break; }
      const results = globalSearch(arg);
      if (!results.length) { termPrint(`No results for “${escapeHtml(arg)}”.`, 't-line--err'); break; }
      termPrintBlock(results.slice(0, 10).map((r) =>
        `<span class="t-line--accent">${escapeHtml(r.group)}</span> · ${escapeHtml(r.title)} <span class="t-line--dim">${escapeHtml(r.sub || '')}</span>`).join('<br>'));
      break;
    }

    case 'neofetch':
      termNeofetch();
      break;

    case 'ambient':
      toggleAmbient();
      termPrint(`Ambient ${ambient.enabled ? 'enabled' : 'disabled'}.`, 't-line--ok');
      break;

    case 'ls':
      termPrintBlock(['about/', 'skills/', 'projects/', 'experience/', 'certifications/', 'achievements/', 'contact/', 'secret/']
        .map((d) => `<span class="t-line--accent">${d}</span>`).join('  |  '));
      break;

    case 'cat':
      termPrint(arg === 'secret' ? 'Nothing here yet… keep looking.' : `cat: ${escapeHtml(arg || '')}: no such file`, 't-line--dim');
      break;

    case 'whoami':
      termPrint('A visitor with good command-line taste.', 't-line--ok');
      break;

    case 'date':
      termPrint(new Date().toString(), 't-line--dim');
      break;

    case 'clear':
      $('#terminal-screen').innerHTML = '';
      break;

    case 'exit':
      closeOverlay();
      break;

    /* --- easter eggs ------------------------------------------------- */
    case 'sudo':
      termPrint('Nice try. This portfolio runs entirely in your browser — there is no server to root.', 't-line--err');
      termPrintBlock('<span class="t-line--dim">tip: try</span> matrix, hack, coffee, konami', '');
      break;

    case 'matrix':
    case 'hack':
      unlockVoid('terminal');
      termPrint('▓▒░ VOID theme unlocked ░▒▓', 't-line--ok');
      break;

    case 'coffee':
      termPrintBlock([
        '<span class="t-line--accent">      ( (</span>',
        '<span class="t-line--accent">       ) )</span>',
        '<span class="t-line--accent">    ........</span>',
        '<span class="t-line--accent">    |      |]</span>',
        '<span class="t-line--accent">    |______|  brewing…</span>',
        '<span class="t-line--dim">no coffee found — try a lighter theme instead</span>'
      ].join('<br>'), '');
      break;

    case 'konami':
      termPrint('↑ ↑ ↓ ↓ ← → ← → B A', 't-line--accent');
      break;

    case 'rm':
      termPrint('Permission denied — you would not want to delete this anyway.', 't-line--err');
      break;

    default:
      termPrint(`command not found: ${escapeHtml(command)} — type <span class="t-line--accent">help</span>`, 't-line--err');
  }
}

function initTerminal() {
  const form = $('#terminal-form');
  const input = $('#terminal-input');
  const user = $('#terminal-user');
  if (user) user.textContent = 'visitor';

  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    const value = input.value;
    if (value.trim()) {
      terminal.history.push(value);
      terminal.historyIndex = terminal.history.length;
    }
    input.value = '';
    runTerminalCommand(value);
  });

  input?.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!terminal.history.length) return;
      terminal.historyIndex = clamp(terminal.historyIndex - 1, 0, terminal.history.length - 1);
      input.value = terminal.history[terminal.historyIndex] || '';
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      terminal.historyIndex = clamp(terminal.historyIndex + 1, 0, terminal.history.length);
      input.value = terminal.history[terminal.historyIndex] || '';
    }
  });
}

function openTerminal() {
  openOverlay('terminal-dock');
  if (!terminal.booted) {
    terminal.booted = true;
    termBanner();
  }
  setTimeout(() => $('#terminal-input')?.focus(), 80);
}

/* ======================= 14. PORTFOLIO OS MODE ======================== */
/**
 * Portfolio OS mode: whether the layer is up, the window stack (keyed by
 * window id), the current z-order and the clock handle.
 */
const os = { open: false, z: 100, windows: new Map(), clock: null, launched: false, layer: null };

function osWindowHtml(key, title, ic, body) {
  return `
    <div class="os__win-bar" data-os-drag>
      <span class="os__win-title">${icon(ic)} ${escapeHtml(title)}</span>
      <span class="os__win-btns">
        <button type="button" data-win="min" aria-label="Minimise ${escapeHtml(title)}">${icon('minus')}</button>
        <button type="button" data-win="max" aria-label="Maximise ${escapeHtml(title)}">${icon('square')}</button>
        <button type="button" data-win="close" aria-label="Close ${escapeHtml(title)}">${icon('close')}</button>
      </span>
    </div>
    <div class="os__win-body" data-os-win-body="${key}">${body}</div>
    <span class="os__win-resize" data-os-resize aria-hidden="true"></span>`;
}

function osBodyFor(key) {
  switch (key) {
    case 'about':
      return `
        <div style="display:flex;gap:16px;flex-wrap:wrap;align-items:flex-start">
          <img src="assets/images/avatar.svg" alt="Portrait placeholder" width="96" height="96"
            style="width:96px;height:96px;border-radius:10px;border:1px solid var(--border)" loading="lazy" decoding="async">
          <div>
            <h3>${escapeHtml(portfolioConfig.name)}</h3>
            <p style="color:var(--muted);font-size:.85rem">${escapeHtml(portfolioConfig.role)}</p>
            <p style="margin-top:10px">[ADD YOUR BIO] Open About Me on the main site for the full version.</p>
          </div>
        </div>
        ${frag.tags(IDENTITY_CHIPS, { style: 'margin-top:14px' })}
        <div class="os-list" style="margin-top:14px">
          <button type="button" data-os-open="skills">${icon('cpu')} Open skills matrix</button>
          <button type="button" data-os-open="contact">${icon('mail')} Open contact</button>
        </div>`;

    case 'projects':
      return `<p style="color:var(--muted);font-size:.82rem">${PROJECTS.length} projects from the same data array that powers the page below.</p>
        <div class="os-list" style="margin-top:12px">
          ${PROJECTS.map((p) => `<button type="button" data-os-project="${p.id}">${icon('layers')} ${escapeHtml(p.title)}${frag.pill(p.category, 'margin-left:auto')}</button>`).join('')}
        </div>`;

    case 'skills': {
      const scores = groupScores();
      return `<div class="os-list">
        ${scores.map((s) => `<button type="button" data-os-skill="${s.id}">${icon('cpu')} ${escapeHtml(s.name)}
          <span style="margin-left:auto;display:flex;align-items:center;gap:8px">
            <span style="width:80px;height:6px;background:color-mix(in srgb,var(--text) 12%,transparent);border-radius:99px;overflow:hidden;display:inline-block">
              <span style="display:block;height:100%;width:${s.score}%;background:linear-gradient(90deg,var(--accent),var(--accent-2))"></span>
            </span>
            <b style="color:var(--accent)">${s.score}</b>
          </span>
        </button>`).join('')}
      </div>`;
    }

    case 'terminal':
      return `<p style="color:var(--muted);font-size:.82rem">The full shell opens as a floating overlay.</p>
        <div class="os-list" style="margin-top:12px">
          <button type="button" data-os-open="terminal-full">${icon('terminal')} Open interactive shell</button>
          <button type="button" data-os-command="help">${icon('info')} Print the command list</button>
          <button type="button" data-os-command="matrix">${icon('sparkle')} Run matrix</button>
        </div>`;

    case 'github':
      return `<p style="color:var(--muted);font-size:.82rem">Live data is fetched directly from the GitHub public API — no backend, with a graceful fallback.</p>
        <div class="os-list" style="margin-top:12px">
          <button type="button" data-os-github>${icon('github')} Load / refresh GitHub stats</button>
          <button type="button" data-os-link="github">${icon('external')} Open profile in a new tab</button>
        </div>`;

    case 'contact':
      return `<div class="os-list">
          <button type="button" data-os-mail>${icon('mail')} ${escapeHtml(portfolioConfig.email)}</button>
          <button type="button" data-os-copy>${icon('copy')} Copy email address</button>
          <button type="button" data-os-link="github">${icon('github')} GitHub</button>
          <button type="button" data-os-link="linkedin">${icon('linkedin')} LinkedIn</button>
        </div>`;

    case 'theme':
      return `<p style="color:var(--muted);font-size:.82rem">Switch the entire visual language from here.</p>
        <div class="os-list" style="margin-top:12px">
          ${THEMES.filter((t) => !t.secret || prefs.voidUnlocked).map((t) => `<button type="button" data-os-theme="${t.id}">${icon('palette')} ${escapeHtml(t.name)} <span style="margin-left:auto;color:var(--muted)">${escapeHtml(t.desc)}</span></button>`).join('')}
        </div>
        <div class="os-list" style="margin-top:12px">
          <button type="button" data-os-mode>${icon(prefs.mode === 'dark' ? 'sun' : 'moon')} Toggle light / dark</button>
          <button type="button" data-os-random>${icon('sparkle')} Surprise me</button>
          <button type="button" data-os-open="theme-full">${icon('settings')} Open full Theme Studio</button>
        </div>`;

    default:
      return '<p>Nothing to show.</p>';
  }
}

const OS_WINDOWS = [
  { key: 'about', title: 'about.md', icon: 'info' },
  { key: 'projects', title: 'projects.app', icon: 'layers' },
  { key: 'skills', title: 'skills.sys', icon: 'cpu' },
  { key: 'terminal', title: 'shell', icon: 'terminal' },
  { key: 'github', title: 'github.api', icon: 'github' },
  { key: 'contact', title: 'contact.card', icon: 'mail' },
  { key: 'theme', title: 'theme-studio.app', icon: 'palette' }
];

function openOSWindow(key) {
  if (!os.layer) return;
  const dock = $('#os-windows');
  if (!dock) return;

  const existing = os.windows.get(key);
  if (existing) {
    existing.hidden = false;
    existing.classList.remove('is-min');
    focusWindow(existing);
    return;
  }

  const meta = OS_WINDOWS.find((w) => w.key === key) || { key, title: key, icon: 'layers' };
  const el = document.createElement('div');
  el.className = 'os__window';
  el.dataset.winKey = key;
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-label', meta.title);
  const offset = os.windows.size % 6;
  const width = Math.min(560, window.innerWidth - 40);
  const height = Math.min(420, window.innerHeight - 160);
  el.style.width = `${width}px`;
  el.style.height = `${height}px`;
  el.style.left = `${clamp(120 + offset * 34, 20, Math.max(20, window.innerWidth - width - 20))}px`;
  el.style.top = `${clamp(80 + offset * 26, 60, Math.max(60, window.innerHeight - height - 90))}px`;
  el.innerHTML = osWindowHtml(meta.key, meta.title, meta.icon, osBodyFor(meta.key));

  dock.appendChild(el);
  os.windows.set(key, el);
  focusWindow(el);
  wireWindow(el);
  syncDock();
  setOsStatus(`${meta.title} opened`);
}

function focusWindow(el) {
  os.z += 1;
  el.style.zIndex = String(os.z);
  $$('#os-windows .os__window').forEach((w) => w.classList.toggle('is-active', w === el));
  syncDock();
}

function closeOSWindow(el) {
  const key = el.dataset.winKey;
  el.remove();
  os.windows.delete(key);
  syncDock();
  setOsStatus(`${key} closed`);
}

function wireWindow(el) {
  const bar = el.querySelector('[data-os-drag]');
  const resizeHandle = el.querySelector('[data-os-resize]');
  const body = el.querySelector('.os__win-body');

  el.addEventListener('pointerdown', () => focusWindow(el), true);

  /* dragging — Pointer Events give us mouse + touch + pen in one path */
  if (bar) {
    let startX = 0, startY = 0, originLeft = 0, originTop = 0, dragging = false;

    bar.addEventListener('pointerdown', (event) => {
      if (event.target.closest('[data-win]')) return;
      dragging = true;
      const rect = el.getBoundingClientRect();
      startX = event.clientX; startY = event.clientY;
      originLeft = rect.left; originTop = rect.top;
      el.style.left = `${rect.left}px`;
      el.style.top = `${rect.top}px`;
      el.classList.remove('is-max');
      bar.setPointerCapture(event.pointerId);
    });

    bar.addEventListener('pointermove', (event) => {
      if (!dragging) return;
      const nextLeft = originLeft + (event.clientX - startX);
      const nextTop = originTop + (event.clientY - startY);
      const maxLeft = window.innerWidth - 80;
      const maxTop = window.innerHeight - 100;
      el.style.left = `${clamp(nextLeft, -20, maxLeft)}px`;
      el.style.top = `${clamp(nextTop, 40, maxTop)}px`;
    });

    const endDrag = (event) => {
      if (!dragging) return;
      dragging = false;
      try { bar.releasePointerCapture(event.pointerId); } catch { /* ignore */ }
    };
    bar.addEventListener('pointerup', endDrag);
    bar.addEventListener('pointercancel', endDrag);
  }

  /* resizing */
  if (resizeHandle) {
    let startX = 0, startY = 0, startW = 0, startH = 0, resizing = false;
    resizeHandle.addEventListener('pointerdown', (event) => {
      resizing = true;
      const rect = el.getBoundingClientRect();
      startX = event.clientX; startY = event.clientY;
      startW = rect.width; startH = rect.height;
      resizeHandle.setPointerCapture(event.pointerId);
      event.stopPropagation();
    });
    resizeHandle.addEventListener('pointermove', (event) => {
      if (!resizing) return;
      el.style.width = `${clamp(startW + (event.clientX - startX), 280, window.innerWidth - 20)}px`;
      el.style.height = `${clamp(startH + (event.clientY - startY), 180, window.innerHeight - 40)}px`;
    });
    const endResize = (event) => {
      if (!resizing) return;
      resizing = false;
      try { resizeHandle.releasePointerCapture(event.pointerId); } catch { /* ignore */ }
    };
    resizeHandle.addEventListener('pointerup', endResize);
    resizeHandle.addEventListener('pointercancel', endResize);
  }

  /* window controls */
  el.querySelector('[data-win="close"]')?.addEventListener('click', () => closeOSWindow(el));
  el.querySelector('[data-win="min"]')?.addEventListener('click', () => {
    el.classList.add('is-min');
    el.hidden = true;
    syncDock();
    setOsStatus(`${el.dataset.winKey} minimised`);
  });
  el.querySelector('[data-win="max"]')?.addEventListener('click', () => {
    const maximised = el.classList.toggle('is-max');
    if (maximised) {
      el.style.inset = '0';
      el.style.left = '0'; el.style.top = '0';
      el.style.width = '100%';
      el.style.height = '100%';
    } else {
      el.style.width = `${Math.min(560, window.innerWidth - 40)}px`;
      el.style.height = `${Math.min(420, window.innerHeight - 200)}px`;
      el.style.left = '140px';
      el.style.top = '90px';
    }
    setOsStatus(maximised ? 'Maximised' : 'Restored');
  });

  /* content actions (per window) */
  body?.addEventListener('click', (event) => {
    const link = event.target.closest('[data-os-link]');
    if (link) {
      const id = link.dataset.osLink;
      openExternal(socialHref(id), id === 'github' ? 'GitHub' : id === 'linkedin' ? 'LinkedIn' : 'Link');
      return;
    }
    const project = event.target.closest('[data-os-project]');
    if (project) { setOsStatus(`Opening ${project.dataset.osProject}`); openProject(PROJECTS.find((p) => p.id === project.dataset.osProject)); return; }

    const skill = event.target.closest('[data-os-skill]');
    if (skill) { focusGroup(skill.dataset.osSkill); setOsStatus('Skills panel filtered on the main site'); return; }

    const theme = event.target.closest('[data-os-theme]');
    if (theme) {
      applyTheme(theme.dataset.osTheme);
      prefs.accent = themeAccentDefault(theme.dataset.osTheme);
      setAccentVariables(prefs.accent);
      renderAccentSwatches();
      const themeWin = os.windows.get('theme');
      if (themeWin) themeWin.querySelector('.os__win-body').innerHTML = osBodyFor('theme');
      return;
    }

    if (event.target.closest('[data-os-mode]')) { applyMode(prefs.mode === 'dark' ? 'light' : 'dark', { notify: true }); return; }
    if (event.target.closest('[data-os-random]')) { randomTheme(); return; }
    if (event.target.closest('[data-os-github]')) { loadGitHub({ force: true }); setOsStatus('Fetching GitHub data…'); return; }
    if (event.target.closest('[data-os-copy]')) { $('#copy-email-btn')?.click(); return; }
    if (event.target.closest('[data-os-mail]')) { window.location.href = `mailto:${portfolioConfig.email}`; return; }

    const command = event.target.closest('[data-os-command]');
    if (command) {
      openTerminal();
      setTimeout(() => runTerminalCommand(command.dataset.osCommand), 120);
    }
  });
}

function syncDock() {
  const dock = $('#os-dock');
  if (!dock) return;
  dock.innerHTML = OS_WINDOWS.map((w) => `
    <button type="button" class="dock-item${os.windows.has(w.key) ? ' is-open' : ''}" data-os-open="${w.key}" aria-label="Open ${escapeHtml(w.title)}">
      ${icon(w.icon)}<span>${escapeHtml(w.key)}</span>
    </button>`).join('');
}

function renderOsIcons() {
  const wrap = $('#os-icons');
  if (!wrap) return;
  wrap.innerHTML = OS_WINDOWS.map((w) => `
    <button type="button" class="os__icon" data-os-open="${w.key}">
      ${icon(w.icon)}<span>${escapeHtml(w.title.replace('.app', '').replace('.sys', '').replace('.md', '').replace('.api', '').replace('.card', ''))}</span>
    </button>`).join('');
}

function setOsStatus(text) {
  const el = $('#os-status-text');
  if (el) el.textContent = text;
}

function openOS() {
  os.layer = $('#os-layer');
  if (!os.layer) return;
  os.layer.hidden = false;
  os.open = true;
  document.body.classList.add('is-locked');
  renderOsIcons();
  syncDock();
  if (!os.launched) {
    os.launched = true;
    openOSWindow('about');
    openOSWindow('terminal');
  }
  os.clock = setInterval(() => {
    const el = $('#os-clock');
    if (el) el.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }, 1000);
  toast('Portfolio OS started', { sub: 'Drag windows by their title bars', icon: 'monitor', kind: 'ok' });
  setOsStatus('Session ready');
}

function closeOS() {
  os.layer = $('#os-layer');
  if (!os.layer) return;
  os.layer.hidden = true;
  os.open = false;
  document.body.classList.remove('is-locked');
  if (os.clock) clearInterval(os.clock);
  os.clock = null;
  toast('Back to the portfolio', { icon: 'grid', kind: 'info', duration: 1800 });
}

function initOS() {
  os.layer = $('#os-layer');
  $('#os-exit')?.addEventListener('click', closeOS);
  $('#os-back')?.addEventListener('click', closeOS);
  $('#os-welcome-dismiss')?.addEventListener('click', () => { const w = $('#os-welcome'); if (w) w.hidden = true; });
  $('#os-theme-cycle')?.addEventListener('click', randomTheme);

  document.addEventListener('click', (event) => {
    const opener = event.target.closest('[data-os-open]');
    if (!opener) return;
    const key = opener.dataset.osOpen;
    if (key === 'terminal-full') { openTerminal(); return; }
    if (key === 'theme-full') { openOverlay('theme-studio'); return; }
    if (!os.open) openOS();
    openOSWindow(key);
  });

  document.addEventListener('keydown', (event) => {
    const modalHidden = $('#modal') ? $('#modal').hidden : true;
    if (event.key === 'Escape' && os.open && !overlay.open && modalHidden) closeOS();
  });
}

/* ====================== 15. CURSOR + MAGNETICS ======================== */
/** Desktop-only custom pointer. Not persisted, and never active on touch. */
const cursor = { enabled: !isTouch };

function setCustomCursor(enabled, { notify = false } = {}) {
  cursor.enabled = Boolean(enabled) && !isTouch;
  document.body.classList.toggle('has-custom-cursor', cursor.enabled);
  const pref = $('#pref-cursor');
  if (pref) pref.checked = cursor.enabled;
  if (notify) toast(cursor.enabled ? 'Custom cursor on' : 'Custom cursor off', { icon: 'sparkle', kind: 'info', duration: 1600 });
}

function initCursor() {
  setCustomCursor(cursor.enabled);
  const dot = $('#cursor-dot');
  const ring = $('#cursor-ring');
  if (!dot || !ring || isTouch) return;

  let x = window.innerWidth / 2, y = window.innerHeight / 2;
  let rx = x, ry = y;
  let raf = null;

  const loop = () => {
    rx += (x - rx) * 0.18;
    ry += (y - ry) * 0.18;
    dot.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
    ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
    raf = requestAnimationFrame(loop);
  };

  window.addEventListener('pointermove', (event) => { x = event.clientX; y = event.clientY; }, { passive: true });
  document.addEventListener('pointerover', (event) => {
    const interactive = event.target.closest('a, button, [role="button"], [data-magnetic], input, select, textarea, .chip');
    document.body.classList.toggle('cursor-hover', Boolean(interactive));
    const text = event.target.closest('input[type="text"], input[type="search"], textarea');
    document.body.classList.toggle('cursor-text', Boolean(text));
  });
  document.addEventListener('pointerdown', () => document.body.classList.add('cursor-down'));
  document.addEventListener('pointerup', () => document.body.classList.remove('cursor-down'));

  raf = requestAnimationFrame(loop);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(raf); raf = null; }
    else if (!raf) raf = requestAnimationFrame(loop);
  });

  initMagnetics();
}

/** Buttons marked data-magnetic lean slightly toward the pointer. */
function initMagnetics() {
  if (prefersReduced() || isTouch) return;
  $$('[data-magnetic]').forEach((el) => {
    el.addEventListener('pointermove', (event) => {
      const rect = el.getBoundingClientRect();
      const dx = (event.clientX - rect.left - rect.width / 2) / rect.width;
      const dy = (event.clientY - rect.top - rect.height / 2) / rect.height;
      el.style.transform = `translate3d(${(dx * 6).toFixed(2)}px, ${(dy * 5).toFixed(2)}px, 0)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });
}

/* ========================= 16. SHORTCUTS ============================== */
/** The Konami sequence and how much of it the visitor has typed so far. */
const konami = {
  codes: ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'],
  buffer: []
};

function isTypingTarget(el) {
  return el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable);
}

function initShortcuts() {
  window.addEventListener('keydown', (event) => {
    const mod = event.ctrlKey || event.metaKey;

    if (mod && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      if (!overlay.open) openCommandPalette('command');
      else closeOverlay();
      return;
    }

    if (mod && event.shiftKey && event.key.toLowerCase() === 'l') {
      event.preventDefault();
      applyMode(prefs.mode === 'dark' ? 'light' : 'dark', { notify: true });
      return;
    }

    if (mod && event.shiftKey && event.key.toLowerCase() === 'o') {
      event.preventDefault();
      if (os.open) closeOS(); else openOS();
      return;
    }

    if (event.key === '/' && !isTypingTarget(document.activeElement)) {
      event.preventDefault();
      if (overlay.open === 'command-palette') { $('#cmd-input')?.focus(); return; }
      openCommandPalette('search');
      return;
    }

    if (event.key === 'Escape') {
      if (overlay.open) { closeOverlay(); return; }
      if (!$('#modal')?.hidden) { closeModal(); return; }
      if (os.open) { closeOS(); return; }
    }

    // konami code
    konami.buffer.push(event.key.length === 1 ? event.key.toLowerCase() : event.key);
    if (konami.buffer.length > konami.codes.length) konami.buffer.shift();
    if (konami.buffer.join('|').toLowerCase() === konami.codes.join('|').toLowerCase()) {
      konami.buffer = [];
      unlockVoid('konami');
    }
  });
}

/* =========================== 17. SECRETS ============================== */
function unlockVoid(source) {
  const first = !prefs.voidUnlocked;
  prefs.set({ voidUnlocked: true });
  if (first) {
    renderThemeGrid();
    toast('VOID theme unlocked', { sub: `Found via ${source}`, icon: 'sparkle', kind: 'ok' });
    console.log('%c▓▒░ VOID unlocked ░▒▓', 'color:#22ff88;font-family:monospace');
  }
  applyTheme('void', { notify: false });
  prefs.accent = themeAccentDefault('void');
  setAccentVariables(prefs.accent);
  renderAccentSwatches();
}

/* ============================= 18. BOOT =============================== */
function wireGlobalButtons() {
  $('#nav-cmd-btn')?.addEventListener('click', () => openCommandPalette('command'));
  $('#nav-search-btn')?.addEventListener('click', () => openCommandPalette('search'));
  $('#nav-theme-btn')?.addEventListener('click', () => openOverlay('theme-studio'));
  $('#nav-terminal-btn')?.addEventListener('click', () => openTerminal());
  $('#nav-os-btn')?.addEventListener('click', () => openOS());
  $('#footer-os-btn')?.addEventListener('click', () => openOS());
  $('#footer-random-theme')?.addEventListener('click', () => randomTheme());
  $('#fab-theme')?.addEventListener('click', () => randomTheme());
  $('#fab-ambient')?.addEventListener('click', () => toggleAmbient());

  document.addEventListener('click', (event) => {
    const action = event.target.closest('[data-action]');
    if (!action) return;
    const kind = action.dataset.action;
    if (kind === 'theme-studio') openOverlay('theme-studio');
    if (kind === 'terminal') openTerminal();
  });

  // smooth in-page navigation for every same-page anchor
  document.addEventListener('click', (event) => {
    const anchor = event.target.closest('a[href^="#"]');
    if (!anchor) return;
    const href = anchor.getAttribute('href');
    if (!href || href === '#' || anchor.hasAttribute('data-modal-close')) return;
    const target = document.getElementById(href.slice(1));
    if (!target) return;
    event.preventDefault();
    scrollToSection(target.id);
    history.replaceState(null, '', href);
  });
}

function boot() {
  window.__portfolioBooted = true;
  document.documentElement.classList.remove('no-js', 'reveal-fallback');
  Object.assign(prefs, store.restore());

  /* 1. appearance before first paint of widgets */
  prefs.accent = prefs.accentCustom ? prefs.accent : themeAccentDefault(prefs.theme);
  document.documentElement.setAttribute('data-theme', prefs.theme);
  document.documentElement.setAttribute('data-mode', prefs.mode);
  document.documentElement.setAttribute('data-motion', prefs.motion);
  document.documentElement.toggleAttribute('data-accent-custom', prefs.accentCustom);
  setAccentVariables(prefs.accent);

  /* 2. content */
  bindConfigContent();
  renderSocials();
  renderIdentityAndLists();
  renderMobileMenu();
  applyLocale(prefs.locale);

  /* 3. shell */
  initReveal();
  initNav();
  initProgress();
  initHero();

  /* 4. sections */
  initSkills();
  initProjects();
  initTimeline();
  initCerts();
  renderAchievements();
  initCounters();
  initGitHub();
  initContact();

  /* 5. overlays & systems */
  initThemeStudio();
  initPalette();
  initTerminal();
  initOS();
  initCursor();
  initShortcuts();
  initSetupBanner();
  wireGlobalButtons();

  document.body.classList.remove('is-booting');

  if (!sessionStorage.getItem('portfolio-os.welcomed')) {
    sessionStorage.setItem('portfolio-os.welcomed', '1');
    setTimeout(() => {
      toast('Welcome to Portfolio OS', { sub: 'Press Ctrl/⌘ K for the command palette, or / to search', icon: 'command', duration: 6000 });
    }, 900);
  }

  console.log('%cPORTFOLIO OS%c ready · 17 themes · Ctrl+K palette · / search · type sudo in the terminal',
    'background:#22d3ee;color:#04060c;padding:2px 6px;border-radius:3px;font-weight:700',
    'color:#8b97b3;font-family:monospace');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

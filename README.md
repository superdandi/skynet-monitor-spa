# ⬡ SKYNET//MONITOR

**Doomsday alert dashboard for the AI era.**
Watch your favorite AI labs. Feel the vibe. Hope for a green threat level.

> A friendly (and slightly paranoid) dashboard that keeps an eye on the AI frontier — real security incidents, real companies, real vibes. If the machines are plotting, at least you'll be the first to know.

[![Live Demo](https://img.shields.io/badge/LIVE-DEMO-00ff41?style=for-the-badge&logo=githubpages&logoColor=white)](https://superdandi.github.io/skynet-monitor-spa/)

---

## 🖥️ Welcome to the (Warm) Apocalypse

Artificial intelligence is moving fast. Fast is fun. Fast is also... a little scary.
Companies are training models, agents are writing malware, and somewhere out there a robot is probably having a productive Tuesday.

That's where **SKYNET//MONITOR** comes in. Think of it as a cozy little sentinel for your browser:

- Kicks off with a cinematic boot sequence (the machines hate when you boot them, it's a power move).
- Gives you a **global threat level** — all the way from *MONITORING* to *JUDGMENT DAY*.
- Streams the **latest AI security incidents** so you never miss a breach, leak, or rogue agent.
- Shows you the **big AI labs and their valuations** in a tidy market table.
- Paints it all on a **world map** with attack vectors, because no timeline is complete without a globe.
- Screams at you (politely, via Web Audio sirens) when things escalate — muteable, because shared offices.

It's not a real defense system. But it *feels* like one, and that's 90% of the job.

---

## 📊 What's Inside

| "It's equivalent to a nuclear weapon." | Status |
|---|---|
| **Threat Level** | Global AI threat gauge, recalculated with every feed refresh |
| **Threat Feed** | Real incidents realtime-ranked: severity, company, date, source, tags |
| **Market Table** | AI labs ranked by market share with live valuations |
| **World Map** | Company HQs + radar pulses + attack vectors (react-simple-maps) |
| **Themes** | `TERMINAL` (Matrix), `HUD` (T-800), `CYBERPUNK` (neon) |
| **Sirens** | Procedural Web Audio alerts when the threat level spikes |

### Three Ways to Watch the Sky Fall

- **TERMINAL** — green-on-black, present, et al. Matrix energy.
- **HUD** — red-on-black, straight out of the T-800's display.
- **CYBERPUNK** — electric cyan, because the future is neon.

Switch anytime with the toggle in the header. You're welcome.

---

## 🧠 Under the Hood

A fully **static single-page app** — no backend, no database, no secrets. Just a folder of files that GitHub serves with love (and GitHub Pages).

**Stack:**

| Piece | What it does |
|---|---|
| **Vite** | Build tool + dev server with instant HMR |
| **React 18** | UI framework, component-driven |
| **Chart.js** + `chartjs-plugin-datalabels` | The sweet market-share pie |
| **react-simple-maps** + `d3-geo` + `topojson-client` | World map with countries, markers, vectors |
| **Web Audio API** | Procedural sirens (no audio files, pure science) |
| **CSS Grid + custom animations** | CRT scanlines, glow, boot sequence |

The SPA fetches a single JSON file — `public/data/dashboard.json` — and renders everything from it.

```
public/data/dashboard.json
        │  fetch('./data/dashboard.json')  ← every 30s + on load
        ▼
   App.jsx ──► BootScreen ──► Dashboard
                          ├── ThreatMeter    (level + market stats)
                          ├── PieChart       (Chart.js market share)
                          ├── MarketTable    (valuations, incidents)
                          ├── ThreatFeed     (incident cards)
                          └── WorldMap       (HQs + attack vectors)
```

That's it. The whole app is basically one moody JSON file with a really good-looking wardrobe.

---

## 📡 How It Stays Fed (and It Eats Fresh)

The dashboard doesn't wait for some human to hand-feed it (humans are unreliable, the machines know this). Every **8 hours**, a bot wakes up, reads the security news, and updates the data all by itself.

```
┌─────────────────────────────────────────────────────────┐
│  GitHub Actions: "Update Data" (cron: every 8h)         │
│                                                         │
│   node scripts/update-data.mjs                          │
│     ├── 1. Fetch 7 security RSS feeds + OSV CVE API     │
│     ├── 2. Filter for AI (OpenAI, Claude, Gemini, ...)  │
│     ├── 3. Classify severity (breach=CRITICAL, ...)     │
│     ├── 4. Detect company (OpenAI, Anthropic, ...)      │
│     ├── 5. Dedupe (ID + title similarity)               │
│     ├── 6. Recompute threat level + market stats        │
│     └── 7. Update data → commit → push                  │
│                                                         │
└───────────────────────┬─────────────────────────────────┘
                        │ push to main
                        ▼
      GitHub Actions: "Deploy to GitHub Pages"
                        │  pnpm build → dist/
                        ▼
                 github.io/skynet-monitor-spa
```

**Feeds watched** (free, no API keys): The Hacker News, Bleeping Computer, Ars Technica, The Register, Schneier on Security, Threatpost, CyberScoop — plus the **OSV.dev** CVE API for AI-adjacent vulnerabilities.

**The updater is smart-ish:**
- Filters by AI keywords (OpenAI, Anthropic, Claude, GPT, DeepMind, Gemini, Meta AI, xAI, Grok, Mistral, GLM, Hugging Face, LLM, ...).
- Blocks noise (essays, podcasts, opinion, "horror story" fluff).
- Scores severity heuristically: breach/ransomware → `CRITICAL`, leak/backdoor → `HIGH`, CVE/flaw → `MODERATE`, warnings → `LOW`.
- Detects the affected company by keyword matching.
- Dedupes by stable ID **and** title similarity (so two papers covering the same breach become one).
- Recomputes threat level, incident counts, and company valuations from funding-round headlines.

Trigger it manually anytime from the **Actions** tab → *Update Data* → *Run workflow*.

---

## 🚀 Run It Yourself

```bash
pnpm install        # or: npm install
pnpm dev            # dev server with hot reload → http://localhost:5173
pnpm build          # production build → dist/
pnpm preview        # serve the production build locally
```

That's genuinely it. The build output in `dist/` is what GitHub Pages serves.

---

## 🔮 Playful Disclaimer

- Not affiliated with Skynet (…or is it?).  
- Not financial advice. Not defense advice. Not legal advice. Not "how to build an AI" advice.  
- Data comes from public RSS feeds and a heuristic classifier — it's *dramatized monitoring*, not gospel.  
- If the machines do rise: this dashboard is *excellent* at watching it end. 10/10 first thing to open.

Stay curious, stay vigilant, and may your threat level forever be green. 🌱

Made with ❤️ and a healthy amount of paranoia.
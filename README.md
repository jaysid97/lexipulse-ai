# ⚖️ LexiPulse AI — Legal Intelligence & Contract Risk Copilot

> **Empowering individuals and teams to decode, audit, and negotiate legal agreements with autonomous AI precision.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Platform: Static Web](https://img.shields.io/badge/Platform-Static%20Web-emerald.svg)](https://pages.github.com/)
[![Runtime: Zero Dependencies](https://img.shields.io/badge/Runtime-Vanilla%20JS%20(Zero%20Dependencies)-indigo.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Tests: 36/36 Passing](https://img.shields.io/badge/Tests-36%2F36%20Passed-brightgreen.svg)](test-runner.html)

---

## 🌟 Key Features

- **🛡️ 5-Vector Risk Diagnostics**: Multi-dimensional evaluation across **Liability & Indemnification**, **Intellectual Property**, **Financial Penalties**, **Termination Windows**, and **Dispute Resolution**.
- **📊 Normalized Fairness Scoring**: Dynamic, size-invariant algorithm that scores contract health from 0 to 100 without penalizing long agreements.
- **💬 Grounded Contract Copilot**: Instant, boundary-safe Q&A engine that cites specific clauses and cross-references related covenants.
- **📑 Attorney Consultation Briefs**: Generates structured, one-page preparation documents with domain-specific strategic legal inquiries.
- **✉️ Strategic Counter-Proposal Generator**: Drafts ready-to-send negotiation emails featuring constructive redline revisions and commercial business rationales.
- **✅ Dynamic Obligations Checklist**: Context-aware compliance and deadline tracking (Financial, Notice Windows, Condition Audits, IP Disclosures, Confidentiality).
- **⚡ Dual-Mode AI Reasoning**:
  - **Offline Semantic Engine**: Runs 100% locally in the browser with zero external API keys or server costs.
  - **Live Google Gemini API**: Optional real-time streaming integration with `gemini-2.5-flash` or `gemini-2.5-pro`.

---

## 🚀 Live Demo & Deployment

This application is built as a pure, zero-dependency static web application that runs directly on **GitHub Pages**, **Netlify**, or any static hosting service.

### GitHub Pages Setup (2 Minutes)

1. Fork or push this repository to your GitHub account.
2. In your GitHub repository, navigate to **Settings** > **Pages** (in the left sidebar).
3. Under **Build and deployment**:
   - **Source**: Select `Deploy from a branch`
   - **Branch**: Select `main` (or your default branch) and `/ (root)`
4. Click **Save**.
5. Your live app will be published at:
   ```text
   https://<your-username>.github.io/<repository-name>/
   ```

---

## 📁 Architecture & File Structure

```text
lexipulse-ai/
│
├── index.html                   # Master UI shell, SVG gauges, tabs, modals, & chat feed
├── test-runner.html             # Automated 36-point diagnostic & unit test suite
├── server.ps1                   # Local lightweight PowerShell HTTP server
├── .nojekyll                    # Ensures GitHub Pages serves all static assets intact
│
├── scripts/                     # Core legal intelligence & state modules
│   ├── legal-engine.js          # Core intelligence engine (fairness scoring, grounded Q&A, briefs)
│   ├── app.js                   # State management, tab routing, & interactive event listeners
│   ├── sample-documents.js      # Contract library (Lease, Freelance, Startup, SaaS, NDA)
│   ├── document-parser.js       # Raw text contract chunking & clause ingestion
│   ├── comparison-engine.js     # Redline shift & semantic diff analyzer
│   ├── gemini-api.js            # Dual-mode Gemini API streaming client & local engine fallback
│   └── export-utils.js          # Markdown downloads, clipboard copier, toast notifications
│
├── styles/                      # Pure vanilla CSS design system
│   ├── main.css                 # Base theme variables, dark mode palette, typography
│   ├── components.css           # Clause cards, vector bars, chat bubbles, gauge meter, modals
│   └── animations.css           # Micro-interactions, slide transitions, pulsing indicators
│
└── assets/                      # Static branding and icons
```

---

## 🧪 Automated Testing

LexiPulse AI includes an in-browser test suite verifying scoring algorithms, regex boundaries, and Q&A citations.

Open `test-runner.html` in any browser or view test logs directly to verify:
- **Fairness Scoring Matrix**: Normalized risk weighting across small and large contracts.
- **Stop-word & Boundary Logic**: Elimination of false-positive intent boosts (e.g. `ac` in `spaceships`).
- **Generator Integrity**: Zero-crash brief, counter-proposal, and checklist generation.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

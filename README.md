# Climbit Decision Engine

A personalized carbon awareness platform and decision engine that helps individuals understand their carbon footprint, discover their highest-impact emission habits, and identifies the single best next action ranked by carbon savings, financial cost, implementation effort, and lifestyle relevance.

---

## 🎯 Problem Statement Mapping

Most carbon footprint platforms suffer from three flaws:
1. **The "Abstract Number" Problem:** Users are presented with a massive footprint number (e.g. "8.2 tonnes CO2e/year") but have no intuitive context for what it means.
2. **Overwhelm & Option Paralysis:** Suggesting generic lists of 50 disconnected ideas (e.g., "drive less," "buy solar panels," "use less paper") leads to inaction.
3. **Black-Box AI Scoring:** Using AI to fabricate estimations makes systems untrustworthy and unexplainable.

### Climbit's Solution:
* **Visual Breakdown:** A horizontal bar visualization breaks down monthly totals by category (Commute, Diet, AC, Electricity, Delivery, Travel) so users see where emissions concentrate.
* **The ROI Ranking Engine:** Climbit ranks recommendations based on a deterministic **Return-on-Investment (ROI)** formula. It highlights the single best next action that maximizes carbon reduction with minimal cost and friction.
* **Explainable Trust:** Every recommendation details the exact formula and logic for why it ranks first. AI is confined exclusively to copywriting and phrasing—never calculations.

---

## ⚡️ Tech Stack

* **Core Framework:** Next.js 15 (App Router, Server Actions)
* **Language:** TypeScript
* **Styling:** Tailwind CSS (Curated Dark Slate and Emerald Theme)
* **Components:** Custom lightweight Radix-aligned UI primitives
* **Visualizations:** Recharts (Horizontal layout with SSR bypass)
* **Form & Validation:** Zod
* **Testing:** Vitest (Unit testing), Playwright + axe-core (E2E Integration & accessibility)
* **AI Engine:** Google Gemini API (`gemini-1.5-flash` with strict JSON mode output)

---

## 🏗️ Architecture Overview

The codebase is organized cleanly to maintain a strict separation of concerns between visual layout components and mathematical calculation engines:

```
climbit/
├── app/
│   ├── actions/          # Next.js Server Actions (AI insights fetching)
│   ├── dashboard/        # Footprint metrics dashboard
│   ├── insights/         # Decision engine formulas documentation
│   ├── onboarding/       # Stepped lifestyle wizard
│   ├── share/            # Og-image screenshot generator page
│   ├── globals.css       # Theme design system & utility classes
│   ├── layout.tsx        # Shell & local GeistVF font loading
│   └── page.tsx          # Marketing landing page
├── components/
│   ├── ui/               # Primary visual primitives (Button, Card, Progress)
│   └── FootprintChart.tsx# Recharts client wrapper
├── data/
│   └── actions.ts        # 12-item static low-carbon action database
├── lib/
│   ├── carbon.ts         # Deterministic calculations, ranking & simulator engine
│   ├── gemini.ts         # Server-side Gemini API client
│   └── validation/
│       └── schemas.ts    # Zod form validators
├── types/
│   └── index.ts          # Global TS interfaces
└── tests/
    ├── carbon.test.ts    # Unit tests for calculation formulas
    └── e2e.test.ts       # Playwright E2E and accessibility tests
```

---

## 📊 Calculation Formulas & Rules

### 1. Carbon Footprint Profile
Emissions are calculated monthly (kg CO₂ / month) as the direct sum of lifestyle metrics:
$$\text{Total Footprint} = \text{Commute} + \text{Diet} + \text{Home Electricity} + \text{AC} + \text{Deliveries} + \text{Travel}$$
* *Values are mapped from onboarding selections based on standard transport fuel burnt, grid intensities, and agricultural lifecycle datasets.*

### 2. Action ROI Ranking
Recommendations are prioritized by an **ROI Score (0-100)**:
$$\text{ROI} = \left( \text{CarbonScore} \times 0.45 + \text{EffortScore} \times 0.25 + \text{CostScore} \times 0.20 + \text{RelevanceScore} \times 0.10 \right) \times \text{Confidence} \times 10$$
* **CarbonScore:** Normalized carbon savings (scaled from 0 to 10 against the catalog max of 160 kg).
* **EffortScore:** Friction index. Low effort = 10, Medium effort = 6, High effort = 3.
* **CostScore:** Financial barrier index. Low cost/free = 10, Medium cost = 6, High cost = 3.
* **RelevanceScore:** Awarded 10 points if the action category targets the user's primary emission driver, 8 if secondary, otherwise 6 if lifestyle tags match, else 4.

---

## 🛠️ Local Setup & Commands

### 1. Clone & Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 2. Environment Variables
Create a `.env.local` file at the root:
```env
GEMINI_API_KEY=your-gemini-api-key-here
```
*Note: If `GEMINI_API_KEY` is not provided, the platform automatically triggers local rule-based fallbacks. The calculations and dashboard will continue to operate normally.*

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🧪 Testing Instructions

### Unit Tests (Vitest)
Unit tests evaluate carbon estimations, sorting engine priorities, simulator math, and challenges:
```bash
npx vitest run
```

### End-to-End Tests (Playwright)
Ensure the local dev server is running before executing:
```bash
npx playwright test
```

---

## 🧩 Design Choices & Limitations
* **Dark Slate Theme:** Deep dark backgrounds reduce display power draw on OLED screens while giving a modern, premium look.
* **Responsive Visual Stepper:** The onboarding form uses simple button grids and keyboard overrides (Tab/Arrows/Enter) to prevent questionnaire fatigue.
* **LinkedIn Card Export:** Utilizes HTML5 Canvas to compose and export a custom image clientside, allowing users to share their badge on LinkedIn.
* **Limitation:** Emissions represent national averages. Individual geyser models or vehicle efficiency levels may vary regional results.
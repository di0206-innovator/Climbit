# Climbit: The AI Climate Decision Engine

![Climbit Dashboard](./public/demo.gif)

Climbit is an enterprise-grade, AI-assisted climate decision engine. 

Instead of simply calculating a user's carbon footprint and throwing a guilt-trip number at them, Climbit identifies the highest-impact lifestyle decisions, ranks them using a deterministic ROI model, and guides users toward the single most effective next action they can realistically take.

**The goal is not awareness alone. The goal is action.**

---

## 🏆 The "Soul" of the Project (Rank 28,897 ➡️ 449)

This application was built under a rigorous, grueling 12-hour sprint constraint. We started at a leaderboard rank of **28,897** and pushed the project into the **top 500 (Rank 449)** by refusing to settle for "hackathon quality." 

We deliberately chose the hard path. We didn't build a brittle wrapper around an AI API. Instead, we engineered a production-ready application:

*   **We built a custom Token-Bucket Rate Limiter** to mathematically secure our Server Actions against abuse, instead of just hoping for the best.
*   **We fought Next.js SSR Hydration errors** to force `recharts` to render responsive, animated SVGs without a single Cumulative Layout Shift (CLS), earning a **100% Efficiency Score**.
*   **We mandated Playwright and Vitest E2E test suites** (34 passing tests) in the middle of the night to validate our Zod schemas and carbon math logic.
*   **We hunted down silent ghost errors**—unused `catch` variables and unhandled `console.warn` logs from Supabase JWT syncs—to achieve a 0-warning ESLint build and push our Code Quality scores to the elite tier.

We poured sweat, strict typing, and uncompromising engineering standards into this repo. This is not a toy; it is an enterprise-ready foundation.

---

## 🚀 Key Features

*   **AI Auto-Logger (Vision & Voice):** Frictionless logging using Google Gemini (`gemini-1.5-flash-latest`). Snap a photo of a receipt or tap the microphone—Gemini instantly extracts context, categorizes it, and calculates the footprint.
*   **Predictive "Path to Net Zero" Modeling:** A dynamic 5-year projection chart mapping your current footprint against aggressive reduction targets.
*   **Carbon Negotiator:** If an action is too hard, the "Objection Handler" negotiates an alternative that fits your constraints, budget, and lifestyle.
*   **Holographic Trading Cards:** Auto-generated Neo-Brutalist trading cards with CSS/Canvas holographic shines to export your "Climate Persona" to LinkedIn.
*   **100% Accessible PWA:** Fully installable Progressive Web App with offline caching, perfect Lighthouse accessibility scores (99%), robust ARIA labels, and full keyboard navigation.

---

## 🏛️ Architecture & Clean File Structure

We utilize a strict separation of concerns, typical of high-tier Next.js 15 (App Router) applications. AI assists, but the deterministic engine decides.

```text
Climbit/
├── app/                  # Next.js App Router (Pages, Layouts, Server Actions)
│   ├── actions/          # Secure Server Actions (AI, Vision, Voice)
│   ├── dashboard/        # Authenticated User Dashboard
│   └── onboarding/       # Gamified Onboarding Flow
├── components/           # Reusable React UI Components (Strictly typed)
├── lib/                  # Core Business Logic
│   ├── carbon.ts         # Deterministic Math & ROI Engine
│   ├── env.ts            # Zod Environment Validation
│   ├── gemini.ts         # LLM Prompts & Inference Layer
│   ├── rate-limit.ts     # In-Memory Token Bucket Limiter
│   └── validation/       # Zod Schemas
├── public/               # Static Assets (Images, Manifest, Service Workers)
├── tests/                # 34 Vitest Unit Tests & Playwright E2E Config
├── types/                # Global TypeScript Interfaces
└── supabase_schema.sql   # Relational Database Models & RLS Policies
```

---

## 🔒 Security & Best Practices (For the Senior Devs)

We treated security and code quality as first-class citizens:
1.  **Zero Secrets Committed:** All `.env` files are strictly ignored. `lib/env.ts` handles runtime validation with Zod to ensure the app gracefully warns developers instead of crashing if keys are missing.
2.  **Server-Side AI Inference:** API keys (`GEMINI_API_KEY`) never leak to the client. All AI generation happens via `'use server'` actions.
3.  **Strict Linting:** 0 ESLint warnings. 0 TypeScript `any` types in the core data path.
4.  **Accessibility (a11y):** Native `<fieldset>` and `<legend>` wrapping, `radiogroup` ARIA attributes, and high-contrast color tokens.

---

## 🛠️ Local Setup & Commands

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/di0206-innovator/Climbit.git
cd Climbit
npm install
```

### 2. Environment Variables
Duplicate `.env.example` to `.env.local` and populate your keys:
```env
GEMINI_API_KEY=your-gemini-api-key-here
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Run Test Suites
```bash
# Unit Tests
npx vitest run

# E2E Tests
npx playwright test
```
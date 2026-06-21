# Climbit: Personalized Climate Decision Intelligence

![Climbit Dashboard](./public/demo.gif)

Climbit is an AI-assisted climate decision engine.

Instead of simply calculating a user's carbon footprint, Climbit identifies the highest-impact lifestyle decisions, ranks them using a deterministic ROI model, and guides users toward the single most effective next action they can realistically take.

The goal is not awareness alone. 

The goal is action.

---

## 🏆 Hackathon "Wow" Features

We went beyond standard carbon calculators to build a deeply engaging, intelligent, and highly accessible platform:

*   **AI Auto-Logger (Vision & Voice):** Frictionless logging using Google Gemini. Snap a photo of a receipt/utility bill or tap the microphone and say *"I drove 20 miles today"*—Gemini instantly extracts the context, categorizes it, and calculates the exact carbon footprint.
*   **Predictive "Path to Net Zero" Modeling:** A dynamic 5-year projection chart that maps your current footprint against an aggressive Net Zero reduction target.
*   **Carbon Negotiator:** Not every user values sustainability equally. If an action is too hard, the "Objection Handler" negotiates an alternative that fits your constraints, budget, and lifestyle.
*   **Holographic Trading Cards:** A highly shareable, auto-generated Neo-Brutalist trading card with a CSS/Canvas holographic shine. Users can export their "Climate Persona" to LinkedIn.
*   **100% Accessible PWA:** Fully installable Progressive Web App with offline caching, perfect Lighthouse accessibility scores, robust ARIA labels, and full keyboard navigation.

---

## 🧠 Why We Built Climbit

Most carbon footprint tools answer:
*"How much carbon do I emit?"*

Climbit answers:
*"What should I do next?"*

We observed that awareness alone rarely changes behavior. Users often receive large carbon numbers without context, generic recommendations, and overwhelming action lists.

Climbit focuses on decision intelligence. By combining deterministic carbon modeling with AI-powered personalization, the platform helps users identify practical actions that fit their lifestyle, budget, and willingness to change.

---

## 🏛️ Architecture & Data Flow

Climbit uses a strict separation of concerns. AI assists, but logic decides.

```text
User Inputs (Onboarding)
         │
         ▼
    Carbon Engine
   (Deterministic)
         │
         ▼
  ROI Ranking Engine
         │
 ┌───────┼─────────┐
 ▼       ▼         ▼
Persona  Insights  Challenges
         │
         ▼
    Gemini Layer 
 (Copy, Voice, Vision)
         │
         ▼
  Climbit Dashboard
```

---

## 🤖 Why Gemini?

Gemini (`gemini-1.5-flash`) was selected because it supports:
- **Structured JSON generation** (Strict schemas for our UI)
- **Multimodal image understanding** (Receipt/Bill scanning)
- **Voice and text processing** (Audio transcript parsing)
- **Fast inference** (Crucial for real-time onboarding and UI feedback)

Most importantly, Gemini is used only for interpretation, negotiation, and communication. Core footprint calculations remain deterministic and fully explainable.

---

## 📏 Evaluation Criteria Mapping

This project was built to address standard Hackathon evaluation rubrics:

*   **Code Quality:** Strict TypeScript, modular architecture, and separated business logic. 0 vulnerabilities in `npm audit`.
*   **Security:** Server-side AI actions hide API keys. Input validation via Zod. LocalStorage privacy-first architecture (no PII stored on servers).
*   **Efficiency:** Static action database, lightweight calculations, Client-side Canvas generation (no server rendering required for images).
*   **Testing:** Playwright E2E tests, Vitest unit tests, and Axe-core accessibility validation.
*   **Accessibility:** Semantic HTML, keyboard navigation, precise ARIA labels, and Lighthouse-friendly color contrast.
*   **Problem Alignment:** Personalized footprint tracking, actionable recommendations, and carbon reduction pathways.

---

## 📊 Calculation Formulas & Rules

### 1. Carbon Footprint Profile
Emissions are calculated monthly (kg CO₂ / month) as the direct sum of lifestyle metrics:
$$\text{Total Footprint} = \text{Commute} + \text{Diet} + \text{Home Electricity} + \text{AC} + \text{Deliveries} + \text{Travel}$$

### 2. Action ROI Ranking
Recommendations are prioritized by an **ROI Score (0-100)**:
$$\text{ROI} = \left( \text{CarbonScore} \times 0.45 + \text{EffortScore} \times 0.25 + \text{CostScore} \times 0.20 + \text{RelevanceScore} \times 0.10 \right) \times \text{Confidence} \times 10$$

---

## 🛠️ Local Setup & Commands

### 1. Clone & Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env.local` file at the root:
```env
GEMINI_API_KEY=your-gemini-api-key-here
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Tests
```bash
npx vitest run
npx playwright test
```
# ✈️ Flight Disruption Manager

An agentic AI operations prototype for **Airline Operations Control Centers (OCC)** to detect irregular operations (IRROPS), evaluate airline tariff policies, price and rank recovery alternatives, and streamline **Human-in-the-Loop (HITL)** passenger rebooking.

---

## ✨ Key Features

- **Multi-Page OCC Workspace**
  - **Flights Overview (`Flights`)**: Live operations KPIs (monitored flights, booked revenue, active disruptions, impacted travelers, financial exposure) with hub filtering and flight selection.
  - **Disruption & Passenger Manifest (`Disruption & Pax`)**: Detailed disruption telemetry (root cause, crew duty limits, connection risks) paired with an interactive passenger manifest showing cabin, loyalty tier, ticket fare, and onward connection status.
  - **Policy Engine (`Policy Engine`)**: Evaluates airline rebooking rules (e.g., Rule 240, ±3-day travel windows, partner/interline eligibility, change-fee waivers, fare-difference absorption, and hotel/meal/ground duty-of-care entitlements) with plain-language explanations.
  - **Rebooking Engine (`Rebooking`)**: Ranks alternative flights across arrival delta, available seats, stops, cabin match, loyalty priority, and net airline recovery cost vs. involuntary refund.
  - **Human-in-the-Loop Approval (`Approval`)**: Final dispatcher checkpoint supporting **1-Click Rebooking Approval**, **Case Escalation**, or **Full Involuntary Refund**, alongside a financial reconciliation ledger and digital passenger credentials (boarding pass, SMS, email).
  - **Collaborating Agent Stream (`Agent Stream`)**: Chronological execution log of every agent's reasoning, metrics, and handoffs.

- **⚡ Auto-Pilot to HITL**
  - Fast-tracks the entire multi-agent pipeline for a disrupted flight's top-tier loyalty traveler (`Executive Platinum` / `Platinum`) and jumps directly to the Human-in-the-Loop approval desk for 1-click confirmation.

- **🎙️ Voice Decision Briefing**
  - Browser-based voice narration (via the Web Speech API) on the Approval page that explains why the recommended flight was selected, which policy waivers applied, and the financial cost/savings breakdown.

- **💵 End-to-End Pricing & Financial Exposure**
  - Visualizes flight-level booked revenue, estimated disruption exposure, individual ticket prices, interline proration fees, hotel/meal voucher liabilities, and net savings vs. involuntary refunds—including itemized e-ticket reissue receipts.

- **🧪 Interactive IRROPS Simulator**
  - Trigger preset or custom disruptions (**Cancellation**, **Long Delay**, **Aircraft Change**, **Airport Closure**) across 6 flights (`UA 882`, `DL 420`, `AA 198`, `BA 284`, `LH 455`, `SQ 031`) to watch the recovery pipeline recompute dynamically.

---

## 🤖 Multi-Agent Architecture

All agents share a unified `RecoveryCase` state in `src/App.tsx` and are implemented in `src/services/agentEngine.ts`:

1. **Disruption Detection Agent** — Flags operational events, calculates crew duty/connection risk, and estimates financial exposure.
2. **Policy Agent** — Applies fare rules, waiver codes, duty-of-care allowances, and statutory refund protections.
3. **Rebooking Agent** — Scores and ranks candidate flights using schedule, cabin, loyalty, and airline cost criteria.
4. **Validation Agent** — Verifies Minimum Connection Time (MCT), baggage transfer readiness, SSR preservation, and coupon exchange status.
5. **Notification Agent** — Generates passenger SMS, email, e-ticket reissue receipts, and digital boarding passes upon human approval.

---

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Vite
- **Styling & Animation:** Tailwind CSS v4, Lucide React, Motion
- **Voice Synthesis:** Browser Web Speech API (`window.speechSynthesis`)
- **Mock Data & Services:** Structured for drop-in replacement with live flight status, GDS/NDC inventory, reservation, and notification APIs (`src/data/mockFlights.ts`, `src/services/agentEngine.ts`)

---

## 📁 Project Structure

```text
├── index.html
├── metadata.json
├── package.json
├── tsconfig.json
├── vite.config.ts
└── src/
    ├── App.tsx                  # Global recovery state & multi-page router
    ├── main.tsx
    ├── index.css
    ├── types/
    │   └── index.ts             # Shared domain & financial types
    ├── data/
    │   └── mockFlights.ts       # Flights, passengers, pricing & disruption presets
    ├── services/
    │   └── agentEngine.ts       # Multi-agent orchestration & ranking logic
    ├── pages/
    │   ├── FlightsPage.tsx
    │   ├── DisruptionPage.tsx
    │   ├── PolicyPage.tsx
    │   ├── RebookingPage.tsx
    │   ├── ApprovalPage.tsx
    │   └── AgentsPage.tsx
    └── components/
        ├── Header.tsx
        ├── WorkflowStepper.tsx
        ├── FlightList.tsx
        ├── DisruptionBanner.tsx
        ├── PassengerManifest.tsx
        ├── PolicyCard.tsx
        ├── RebookingOptionsList.tsx
        ├── ApprovalPanel.tsx
        ├── AgentVoiceBriefing.tsx
        ├── AgentActivityStream.tsx
        ├── NotificationModal.tsx
        ├── SimulationControlsModal.tsx
        └── Tooltip.tsx
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ (or **Bun**)

### Installation

```bash
git clone <your-repo-url>
cd <your-repo-folder>
npm install
```

### Environment Variables (Optional)

The current prototype runs with local mock airline data and requires no external API keys to start. If extending with server-side Gemini or airline APIs, configure `.env` using `.env.example`:

```env
GEMINI_API_KEY="MY_GEMINI_API_KEY"
APP_URL="MY_APP_URL"
```

### Run Locally

```bash
npm run dev
```

The app will start on `http://localhost:3000`.

### Build & Typecheck

```bash
# Typecheck
npm run lint

# Production build
npm run build

# Preview production bundle
npm run preview
```

---

## 🗺️ Roadmap / Future Integrations

- Replace `src/services/agentEngine.ts` mock functions with live **Flight Status**, **NDC / GDS Inventory**, **PNR Reservation**, and **Passenger Notification** APIs.
- Connect `@google/genai` (already listed in `package.json`) for LLM-driven policy reasoning and dynamic disruption root-cause summaries.

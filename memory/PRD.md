# Revenue Rescue — Product Requirements Document

**Track:** Razorpay AI Buildathon 2026 — AI Revenue Recovery
**Status:** Hackathon prototype, final stabilization pass complete
**Deployment target:** Local demo only (no production Razorpay connectivity)

## Problem
Payment failures on Indian fintech platforms are a large source of leaked revenue. Standard remediation is aggressive blind retries + reminders, which annoys customers and misses causal signals. Revenue Rescue answers a sharper question:

> "What is the highest-value, safest next action for revenue at risk — including deciding when NOT to intervene?"

## Product principles
1. **Evidence-first** — every decision must trace to observable signals in the dataset.
2. **Zero fabricated production claims** — provenance labels are visible on every screen driven by benchmark data.
3. **"Do Nothing" is a first-class action** — the engine optimizes for **incremental recovered revenue**, not intervention count.
4. **Policy guardrails are enforced before execution** — no automated action fires past the ₹50,000 approval ceiling or against already-recovered revenue.

## Personas
- **Finance Ops Lead** — reviews at-risk revenue and reviews/approves interventions.
- **Revenue Recovery Analyst** — inspects root-cause clusters and audit trails.

## Architecture
- **Frontend:** React + Tailwind + shadcn/ui + Lucide + sonner (toast).
- **Backend:** FastAPI + Motor async MongoDB, all routes prefixed with `/api`.
- **Database:** MongoDB collections — `merchants`, `customers`, `payment_events`, `payment_attempts`, `customer_payment_history`, `recovery_opportunities`, `recovery_actions`, `policy_decisions`, `audit_events`, `policies`.
- **No third-party integrations** — no LLM, no Razorpay SDK, no messaging providers, no auth.

## Data provenance
- Every record is deterministic synthetic. Customer IDs are `CUST_BENCH_00000N`, event IDs are `EVENT_BENCH_00000N`.
- The generator (default size **150**, seed `REVENUE_RESCUE_V1`) always emits 5 fixed showcase scenarios (A–E) plus random fill.
- Validator runs 10 checks (references, positive amounts, unique deterministic IDs, no PII, ground-truth isolation, chronological attempts, etc.).
- Ground truth is stored under `_ground_truth` and is stripped from every API response.

## Core demo loop (5 min judge flow)
**Detect → Diagnose → Decide → Policy → Execute → Verify → Measure**

1. **Detect** — Load 150 synthetic events, see Revenue at Risk on Overview.
2. **Diagnose** — Open Root Cause Intelligence to see 6 clusters (customer, method, systemic, uncertain, already-recovered, low-probability).
3. **Decide** — On Opportunities, inspect priority-ranked events to see the AI Decision Card (action, recoverability score, why, alternatives, evidence).
4. **Policy** — Every card shows a policy check result (APPROVED / REQUIRES_APPROVAL / BLOCKED).
5. **Execute** — Click "Execute Recovery Action" in the drawer. Simulation only.
6. **Verify** — Green banner shows FAILED → ACTION EXECUTED → PAYMENT CAPTURED → RECOVERED with amount recovered.
7. **Measure** — Overview updates; Experiments shows Benchmark Baseline (28% naive retry) vs Revenue Rescue with derived incremental revenue.

Featured scenarios:
- **A** — `EVENT_BENCH_000001` (₹4,999 UPI, INSUFFICIENT_FUNDS): recoverable → SEND PAYMENT LINK → success.
- **B** — `EVENT_BENCH_000002` (₹14,200 UPI, BANK_DOWNTIME): systemic → WAIT.
- **C** — `EVENT_BENCH_000003` (₹78,500 Cards): high-value → policy BLOCKS execution → HUMAN APPROVAL REQUIRED.
- **D** — `EVENT_BENCH_000004` (₹18,200 already CAPTURED): idempotent → DO NOTHING.
- **E** — `EVENT_BENCH_000005` (₹450 Cards, EXPIRED): STOP rule → DO NOTHING.

## What is implemented
- **Backend routes:** `/system/status`, `/benchmark/generate|load|clear`, `/overview/metrics`, `/payment-events` + detail, `/recovery/execute`, `/root-causes/summary`, `/opportunities`, `/recovery-plans`, `/simulator/evaluate`, `/experiments/comparison`, `/audit-trail`, `/policies` GET/PUT.
- **Frontend pages:** Overview, Revenue at Risk, Root Causes, Opportunities, Recovery Plans, Simulator, Experiments, Audit Trail, Policies, Settings.
- **Shared components:** DecisionCard, EventDrawer, DataLoaderModal, ProvenanceBanner, Sidebar, TopHeader, MetricCard, MoneyValue, Badges, EmptyState.
- **Determinism:** same seed always produces same dataset; scenarios A–E guaranteed at fixed event IDs.
- **Idempotency:** re-executing a RECOVERED event returns `ALREADY_RECOVERED` (no double-counting).
- **Policy guardrails:** blocks execution when amount > ₹50,000 OR action == ESCALATE TO HUMAN; systemic + low-confidence paths defined.

## What is simulated / synthetic
- All payment execution (`/api/recovery/execute`) — no real payment, no real WhatsApp/SMS.
- All benchmark metrics — 150 events + baseline 28% naive retry yield vs rescue actual outcomes.
- All customer histories, expected recoveries, decision rationale, evidence text.

## What is intentionally out of scope
- Real Razorpay API integration (adapter layer exists in Settings, no credentials wired).
- LLM / ML models (deterministic rule-based decision layer only).
- Auth, RBAC, multi-tenancy.
- Real messaging, real payment retries, real refunds.
- PostgreSQL migration (MongoDB was used per environment).

## Test artefacts
- `/app/backend/tests/backend_test.py` — 22 pytest cases (all pass).
- `/app/backend/tests/test_scenario_c_regression.py` — 6 policy-guard cases (all pass).
- `/app/test_reports/iteration_1.json` + `iteration_2.json` — end-to-end test agent reports (all critical scenarios verified).

## Final stabilization changelog (this session)
- Default benchmark size: 1000 → **150** (generator + modal + backend request model).
- Audit Trail table: field names corrected (`observation`, `recommendation`, `policy_result`); filter dropdowns aligned to stored uppercase values.
- Event Drawer: added persistent `execution-blocked-block` and `execution-idempotent-block` banners.
- Overview `incremental_recovery`: now derived from actual dataset via baseline naive-retry counterfactual.
- Opportunities: sort by `expected_incremental_recovery` (score × value), excludes recovered events, exposes pipeline total.
- Simulator: added `WAIT` and `CUSTOMER FOLLOW-UP` strategies (7 total).
- Experiments: all metrics derived deterministically from the actual 150-event dataset — no hardcoded multipliers.
- Recovery policy guard: blocks execution whenever amount > ₹50,000 **or** action is ESCALATE TO HUMAN (fixed Scenario C bypass).
- Visual: removed "Buildathon Prototype" span from Overview header.

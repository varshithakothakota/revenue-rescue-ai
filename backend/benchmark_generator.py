import random
import hashlib
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Any, Tuple

class DeterministicBenchmarkGenerator:
    """
    Rigorously generates deterministic synthetic benchmark datasets (~120 events)
    specifically designed for the Razorpay AI Buildathon 2026 5-minute judge demo.
    
    Adheres strictly to:
    - Zero PII (Deterministic IDs: CUST_BENCH_000001, EVENT_BENCH_000001)
    - Clearly defined demo scenarios (A: Recoverable UPI, B: Systemic Bank Downtime,
      C: High-Value Escalation, D: Already Recovered, E: Low-Probability Stop)
    - Full decision tree, evidence signals, recoverability scoring, and policy guardrails
    """

    PAYMENT_METHODS = ["UPI", "Cards", "Netbanking", "Autopay"]
    GATEWAYS = [
        "Razorpay-HDFC-Stack",
        "Razorpay-ICICI-Direct",
        "Razorpay-SBI-Core",
        "Razorpay-Axis-Cards",
        "Razorpay-YesBank-UPI"
    ]

    def __init__(self, seed: str = "REVENUE_RESCUE_V1", size: int = 150, profile: str = "Balanced"):
        self.seed = seed
        self.size = max(20, min(size, 2000))
        self.profile = profile
        seed_int = int(hashlib.sha256(seed.encode("utf-8")).hexdigest()[:8], 16)
        self.rng = random.Random(seed_int)
        self.base_time = datetime(2026, 6, 12, 10, 42, 0, tzinfo=timezone.utc)

    def generate_all(self) -> Dict[str, Any]:
        merchants = [{
            "merchant_id": "MERCH_ACME_IN",
            "merchant_name": "Acme Digital India Pvt Ltd",
            "environment": "DEMO",
            "currency": "INR",
            "created_at": "2026-01-01T00:00:00Z"
        }]

        customers = self._generate_customers("MERCH_ACME_IN")
        events = []
        attempts = []
        opportunities = []
        actions = []
        policy_decisions = []
        audit_events = []

        # Generate the 5 Key Demo Showcase Events First (Guaranteed exact IDs for demo script)
        demo_showcase_specs = [
            {
                "event_id": "EVENT_BENCH_000001",
                "customer_id": "CUST_BENCH_000001",
                "amount": 4999.00,
                "payment_method": "UPI",
                "device_type": "Mobile Android",
                "gateway": "Razorpay-HDFC-Stack",
                "payment_route": "ROUTE_UPI_HDFC_PRIMARY",
                "status": "FAILED", # Ready for Judge Execute Demo
                "failure_reason": "INSUFFICIENT_FUNDS",
                "scenario": "Scenario A — Recoverable Payment Failure (Demo Hero)",
                "recoverability_grade": "HIGH",
                "recoverability_score": 91,
                "expected_recovery_value": 4499.10,
                "recommended_action": "SEND PAYMENT LINK",
                "decision_why": "Customer has strong 94% historical payment success across 12 orders. Failure is customer-specific and isolated. WhatsApp & SMS payment link provides a frictionless channel for immediate settlement.",
                "alternatives": [
                    {"action": "Retry", "reason": "Lower expected value (54%) and risks multiple failed debit SMS alerts."},
                    {"action": "Wait", "reason": "Unnecessary latency; customer has active intent to complete cart."},
                    {"action": "Human Escalation", "reason": "Ticket size (₹4,999) is well below the ₹50,000 threshold."},
                    {"action": "Do Nothing", "reason": "Leaves ₹4,999 in high-probability recoverable revenue untouched."}
                ],
                "evidence": [
                    "12 previous successful payments on record",
                    "0 active systemic gateway incidents",
                    "Customer opened checkout within 3 minutes",
                    "Historical recovery via payment link: 88%"
                ],
                "policy_check": {"status": "APPROVED", "rule": "Below ₹50,000 ceiling, max attempts 0/2"},
                "root_cause_category": "Customer-specific issue"
            },
            {
                "event_id": "EVENT_BENCH_000002",
                "customer_id": "CUST_BENCH_000002",
                "amount": 14200.00,
                "payment_method": "UPI",
                "device_type": "Mobile Android",
                "gateway": "Razorpay-HDFC-Stack",
                "payment_route": "ROUTE_UPI_HDFC_PRIMARY",
                "status": "FAILED",
                "failure_reason": "BANK_DOWNTIME",
                "scenario": "Scenario B — Correlated Systemic Bank Outage",
                "recoverability_grade": "MEDIUM",
                "recoverability_score": 62,
                "expected_recovery_value": 11928.00,
                "recommended_action": "WAIT / SYSTEM-LEVEL REVIEW",
                "decision_why": "HDFC UPI gateway cluster uptime dropped to 38% across network. Evidence indicates systemic payment degradation. Automated customer retries suppressed to prevent spamming end-users.",
                "alternatives": [
                    {"action": "Send Payment Link", "reason": "Will fail again on HDFC UPI stack; induces customer friction."},
                    {"action": "Immediate Retry", "reason": "Violates Policy #POL-03 (Systemic Incident Protection)."},
                    {"action": "Alternative Payment Method", "reason": "Viable once customer returns; presenting Netbanking/Cards fallback."}
                ],
                "evidence": [
                    "18 correlated failures within 14-minute time window",
                    "Concentrated on UPI + Mobile Android + HDFC Stack",
                    "Gateway latency spiked to 4,200ms"
                ],
                "policy_check": {"status": "APPROVED", "rule": "Automation paused during active gateway downtime"},
                "root_cause_category": "Systemic payment degradation"
            },
            {
                "event_id": "EVENT_BENCH_000003",
                "customer_id": "CUST_BENCH_000003",
                "amount": 78500.00,
                "payment_method": "Cards",
                "device_type": "Desktop Chrome",
                "gateway": "Razorpay-ICICI-Direct",
                "payment_route": "ROUTE_CARDS_CORPORATE",
                "status": "ESCALATED",
                "failure_reason": "BANK_DECLINE",
                "scenario": "Scenario C — High-Value Corporate Escalation",
                "recoverability_grade": "HIGH",
                "recoverability_score": 88,
                "expected_recovery_value": 70650.00,
                "recommended_action": "ESCALATE TO HUMAN",
                "decision_why": "Ticket size ₹78,500 exceeds demo automated approval ceiling (₹50,000). High financial exposure with VIP enterprise account. Route to Key Account Manager for split invoice or Corporate Netbanking assistance.",
                "alternatives": [
                    {"action": "Auto Payment Link", "reason": "Blocked by Policy #POL-02 (Requires Human Approval > ₹50,000)."},
                    {"action": "Blind Retry", "reason": "High risk of corporate credit line lockout."},
                    {"action": "Do Nothing", "reason": "Unacceptable revenue leakage on top-tier customer."}
                ],
                "evidence": [
                    "High-value enterprise customer segment",
                    "Ticket amount (₹78,500) > ₹50,000 approval threshold",
                    "Commercial card limits require split billing"
                ],
                "policy_check": {"status": "REQUIRES_APPROVAL", "rule": "Flagged for manual Finance Ops sign-off"},
                "root_cause_category": "High-value review required"
            },
            {
                "event_id": "EVENT_BENCH_000004",
                "customer_id": "CUST_BENCH_000004",
                "amount": 18200.00,
                "payment_method": "Cards",
                "device_type": "Desktop Safari",
                "gateway": "Razorpay-Axis-Cards",
                "payment_route": "ROUTE_CARDS_STANDARD",
                "status": "CAPTURED", # Already recovered in ledger
                "failure_reason": "AUTHENTICATION_FAILURE",
                "scenario": "Scenario D — Already Recovered (Zero Intervention)",
                "recoverability_grade": "LOW",
                "recoverability_score": 10,
                "expected_recovery_value": 0.00,
                "recommended_action": "DO NOTHING",
                "decision_why": "Initial 3DS session timed out, but webhook confirms customer completed checkout via backup card 2 minutes later. Revenue is fully secured in ledger. Zero intervention required to eliminate duplicate charge risk.",
                "alternatives": [
                    {"action": "Send Payment Link", "reason": "Critical error: would cause double-debit friction on already paid order."},
                    {"action": "Retry", "reason": "Redundant transaction attempt."},
                    {"action": "Human Escalation", "reason": "Unnecessary ops overhead for recovered revenue."}
                ],
                "evidence": [
                    "Linked capture transaction txn_bench_000004_b captured at 10:44:12Z",
                    "Order reconciliation status: FULLY_PAID",
                    "Net revenue secured: ₹18,200"
                ],
                "policy_check": {"status": "APPROVED", "rule": "Suppression rule triggered for verified captured state"},
                "root_cause_category": "Already recovered revenue"
            },
            {
                "event_id": "EVENT_BENCH_000005",
                "customer_id": "CUST_BENCH_000005",
                "amount": 450.00,
                "payment_method": "Cards",
                "device_type": "Mobile Web",
                "gateway": "Razorpay-Standard-Routing",
                "payment_route": "ROUTE_CARDS_STANDARD",
                "status": "STOPPED",
                "failure_reason": "EXPIRED_PAYMENT_METHOD",
                "scenario": "Scenario E — Low-Value / Low-Probability Stopping Rule",
                "recoverability_grade": "LOW",
                "recoverability_score": 8,
                "expected_recovery_value": 0.00,
                "recommended_action": "DO NOTHING",
                "decision_why": "Card returned hard permanent decline (Card Stolen/Closed). 3 previous automated attempts exhausted. Expected incremental recovery does not justify outbound communication friction or WhatsApp SMS cost.",
                "alternatives": [
                    {"action": "Retry", "reason": "Hard decline from issuing bank — guaranteed failure."},
                    {"action": "Payment Link", "reason": "Customer intent score < 0.10; micro-ticket size ₹450."},
                    {"action": "Human Escalation", "reason": "ROI negative for human intervention."}
                ],
                "evidence": [
                    "Permanent issuer reject code: DO_NOT_HONOR",
                    "Max attempt ceiling (2) reached",
                    "Customer intent signal: Aborted session"
                ],
                "policy_check": {"status": "BLOCKED", "rule": "Stopping condition triggered by permanent card decline"},
                "root_cause_category": "Low-value / low-probability"
            }
        ]

        for spec in demo_showcase_specs:
            ev, atts, opp, aud = self._build_event_package(spec, merchants[0]["merchant_id"])
            events.append(ev)
            attempts.extend(atts)
            opportunities.append(opp)
            audit_events.extend(aud)

        # Generate remainder events to fill out benchmark (up to self.size)
        for i in range(6, self.size + 1):
            eid = f"EVENT_BENCH_{i:06d}"
            cust = self.rng.choice(customers)
            spec = self._generate_random_spec(eid, cust)
            ev, atts, opp, aud = self._build_event_package(spec, merchants[0]["merchant_id"])
            events.append(ev)
            attempts.extend(atts)
            opportunities.append(opp)
            audit_events.extend(aud)

        # Calculate derived customer histories
        cust_histories = self._calculate_customer_histories(customers, attempts)

        return {
            "merchants": merchants,
            "customers": customers,
            "payment_events": events,
            "payment_attempts": attempts,
            "customer_payment_history": cust_histories,
            "recovery_opportunities": opportunities,
            "recovery_actions": actions,
            "policy_decisions": policy_decisions,
            "audit_events": audit_events
        }

    def _generate_customers(self, merchant_id: str) -> List[Dict[str, Any]]:
        customers = [
            {"customer_id": "CUST_BENCH_000001", "merchant_id": merchant_id, "benchmark_label": "Archetype High-LTV SaaS", "customer_segment": "HIGH_RELIABILITY", "created_at": "2026-01-10T00:00:00Z"},
            {"customer_id": "CUST_BENCH_000002", "merchant_id": merchant_id, "benchmark_label": "Archetype Mobile UPI Buyer", "customer_segment": "INTERMITTENT_FAILURES", "created_at": "2026-02-14T00:00:00Z"},
            {"customer_id": "CUST_BENCH_000003", "merchant_id": merchant_id, "benchmark_label": "Archetype Enterprise Account", "customer_segment": "HIGH_VALUE", "created_at": "2025-11-20T00:00:00Z"},
            {"customer_id": "CUST_BENCH_000004", "merchant_id": merchant_id, "benchmark_label": "Archetype Tech Professional", "customer_segment": "HIGH_RELIABILITY", "created_at": "2026-03-01T00:00:00Z"},
            {"customer_id": "CUST_BENCH_000005", "merchant_id": merchant_id, "benchmark_label": "Archetype Dormant User", "customer_segment": "LOW_INTENT", "created_at": "2026-04-12T00:00:00Z"},
        ]
        for c in range(6, max(30, self.size // 4) + 1):
            customers.append({
                "customer_id": f"CUST_BENCH_{c:06d}",
                "merchant_id": merchant_id,
                "benchmark_label": "Benchmark Customer Archetype",
                "customer_segment": self.rng.choice(["HIGH_RELIABILITY", "INTERMITTENT_FAILURES", "HIGH_VALUE", "LOW_VALUE_HIGH_FREQ", "LONG_DELAY_PAYER"]),
                "created_at": "2026-01-01T00:00:00Z"
            })
        return customers

    def _generate_random_spec(self, event_id: str, cust: Dict[str, Any]) -> Dict[str, Any]:
        amount = round(self.rng.uniform(800, 35000), 2)
        method = self.rng.choice(self.PAYMENT_METHODS)
        gateway = self.rng.choice(self.GATEWAYS)
        is_high_val = amount > 50000

        if is_high_val:
            action = "ESCALATE TO HUMAN"
            status = "ESCALATED"
            score = 85
            rec_val = amount * 0.90
        elif method == "UPI":
            action = "SEND PAYMENT LINK"
            status = "FAILED" if self.rng.random() < 0.6 else "RECOVERED"
            score = self.rng.randint(75, 94)
            rec_val = round(amount * (score / 100), 2)
        else:
            action = "OFFER ALTERNATIVE PAYMENT METHOD" if self.rng.random() < 0.5 else "WAIT"
            status = "FAILED"
            score = self.rng.randint(55, 80)
            rec_val = round(amount * (score / 100), 2)

        return {
            "event_id": event_id,
            "customer_id": cust["customer_id"],
            "amount": amount,
            "payment_method": method,
            "device_type": self.rng.choice(["Mobile Android", "Mobile iOS", "Desktop Chrome"]),
            "gateway": gateway,
            "payment_route": f"ROUTE_{method.upper()}_STANDARD",
            "status": status,
            "failure_reason": self.rng.choice(["INSUFFICIENT_FUNDS", "BANK_DOWNTIME", "AUTHENTICATION_FAILURE", "PAYMENT_TIMEOUT"]),
            "scenario": "Standard Benchmark Revenue Scenario",
            "recoverability_grade": "HIGH" if score >= 80 else ("MEDIUM" if score >= 50 else "LOW"),
            "recoverability_score": score,
            "expected_recovery_value": rec_val if status != "CAPTURED" else 0.0,
            "recommended_action": action,
            "decision_why": f"Evaluated customer payment history and failure signals on {method}. Recommended {action} to maximize incremental recovery.",
            "alternatives": [
                {"action": "Retry", "reason": "Lower expected yield given issuer signal."},
                {"action": "Do Nothing", "reason": "Leaves recoverable revenue on table."}
            ],
            "evidence": ["Customer historical completion rate: 82%", "Transaction value justifies intervention"],
            "policy_check": {"status": "APPROVED", "rule": "Policy checks verified compliant"},
            "root_cause_category": "Observed root-cause signal"
        }

    def _build_event_package(self, spec: Dict[str, Any], merchant_id: str):
        eid = spec["event_id"]
        cid = spec["customer_id"]
        amount = spec["amount"]
        method = spec["payment_method"]
        time_iso = self.base_time.isoformat()

        event = {
            "event_id": eid,
            "merchant_id": merchant_id,
            "customer_id": cid,
            "transaction_id": f"txn_{eid.lower()}",
            "parent_event_id": None,
            "amount": amount,
            "currency": "INR",
            "payment_method": method,
            "payment_method_detail": f"{method} - Standard Stack",
            "device_type": spec["device_type"],
            "platform": "web" if "Desktop" in spec["device_type"] else "app",
            "payment_route": spec["payment_route"],
            "gateway": spec["gateway"],
            "status": spec["status"],
            "failure_reason": spec["failure_reason"],
            "event_type": "PAYMENT_INTENT",
            "timestamp": time_iso,
            "source": "SYNTHETIC_BENCHMARK",
            "metadata": {
                "scenario": spec["scenario"],
                "decision_card": {
                    "action": spec["recommended_action"],
                    "why": spec["decision_why"],
                    "alternatives": spec["alternatives"],
                    "evidence": spec["evidence"],
                    "recoverability_grade": spec["recoverability_grade"],
                    "recoverability_score": spec["recoverability_score"],
                    "expected_recovery_value": spec["expected_recovery_value"],
                    "policy_check": spec["policy_check"]
                },
                "benchmark_provenance": "Synthetic Benchmark — Not Real Customer Data"
            },
            "_ground_truth": {
                "ground_truth_root_cause": spec["root_cause_category"],
                "ground_truth_recovered": spec["status"] in ["CAPTURED", "RECOVERED"],
                "ground_truth_best_action": spec["recommended_action"],
                "ground_truth_recovery_amount": spec["expected_recovery_value"]
            }
        }

        # Attempts
        attempts = [{
            "attempt_id": f"ATT_{eid}_1",
            "event_id": eid,
            "customer_id": cid,
            "attempt_number": 1,
            "amount": amount,
            "payment_method": method,
            "route": spec["payment_route"],
            "status": "CAPTURED" if spec["status"] == "CAPTURED" else "FAILED",
            "failure_reason": "NONE" if spec["status"] == "CAPTURED" else spec["failure_reason"],
            "timestamp": time_iso
        }]

        if spec["status"] == "CAPTURED" and "Scenario D" in spec["scenario"]:
            # Second successful attempt 2 mins later
            attempts.append({
                "attempt_id": f"ATT_{eid}_2",
                "event_id": eid,
                "customer_id": cid,
                "attempt_number": 2,
                "amount": amount,
                "payment_method": "Cards",
                "route": "ROUTE_CARDS_BACKUP",
                "status": "CAPTURED",
                "failure_reason": "NONE",
                "timestamp": (self.base_time + timedelta(minutes=2)).isoformat()
            })

        opp = {
            "opportunity_id": f"OPP_{eid}",
            "event_id": eid,
            "revenue_at_risk": amount if spec["status"] not in ["CAPTURED", "RECOVERED"] else 0.0,
            "recoverability_score": spec["recoverability_score"] / 100.0,
            "expected_recovery_value": spec["expected_recovery_value"],
            "customer_friction_score": 0.2 if spec["recommended_action"] in ["SEND PAYMENT LINK", "WAIT"] else 0.6,
            "confidence_score": round(spec["recoverability_score"] / 100.0, 2),
            "root_cause_category": spec["root_cause_category"],
            "recommended_action": spec["recommended_action"],
            "status": "RESOLVED" if spec["status"] in ["CAPTURED", "RECOVERED", "STOPPED"] else "OPEN",
            "created_at": time_iso
        }

        audits = [
            {
                "audit_id": f"AUD_{eid}_1",
                "event_id": eid,
                "action_id": f"ACT_{eid}",
                "actor_type": "SYSTEM",
                "observation": f"Revenue event detected from {spec['gateway']}. State: {spec['status']}",
                "recommendation": spec["recommended_action"],
                "policy_result": spec["policy_check"]["status"],
                "executed_action": "NONE" if spec["status"] == "FAILED" else spec["recommended_action"],
                "outcome": "SUCCESS" if spec["status"] in ["CAPTURED", "RECOVERED"] else ("ESCALATED" if spec["status"] == "ESCALATED" else "PENDING"),
                "reason": spec["decision_why"],
                "timestamp": time_iso
            }
        ]

        return event, attempts, opp, audits

    def _calculate_customer_histories(self, customers: List[Dict[str, Any]], attempts: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        grouped: Dict[str, List[Dict[str, Any]]] = {}
        for a in attempts:
            cid = a["customer_id"]
            grouped.setdefault(cid, []).append(a)

        histories = []
        for cust in customers:
            cid = cust["customer_id"]
            cust_atts = grouped.get(cid, [])
            total = len(cust_atts)
            success = len([x for x in cust_atts if x["status"] == "CAPTURED"])
            failed = total - success
            rate = round(success / total, 2) if total > 0 else 0.90
            avg_val = round(sum(x["amount"] for x in cust_atts) / total, 2) if total > 0 else 4500.0

            histories.append({
                "customer_id": cid,
                "merchant_id": cust["merchant_id"],
                "successful_attempts": success,
                "failed_attempts": failed,
                "total_attempts": max(total, 1),
                "historical_success_rate": rate,
                "average_transaction_value": avg_val,
                "average_time_to_payment_mins": 8.4,
                "recent_failure_count": failed,
                "recent_success_count": success
            })
        return histories

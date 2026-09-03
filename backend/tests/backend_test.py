"""Revenue Rescue backend API regression tests (no auth in prototype)."""
import os
import pytest
import requests
from dotenv import dotenv_values

frontend_env = dotenv_values("/app/frontend/.env")
base_url = os.environ.get("REACT_APP_BACKEND_URL") or frontend_env.get("REACT_APP_BACKEND_URL")
if not base_url:
    raise RuntimeError("REACT_APP_BACKEND_URL missing")
BASE_URL = base_url.rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="session")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session", autouse=True)
def fresh_dataset(client):
    """Clear + regenerate deterministic 150-event benchmark before the suite."""
    r = client.post(f"{API}/benchmark/clear", timeout=60)
    assert r.status_code == 200, r.text
    r = client.post(f"{API}/benchmark/generate", json={"seed": "REVENUE_RESCUE_V1", "size": 150, "profile": "Balanced"}, timeout=120)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["status"] == "success"
    assert data["events_count"] == 150
    assert data["customers_count"] > 0
    vr = data["validation_report"]
    assert vr["valid"] is True, vr
    yield data


# --- benchmark generation ---
class TestBenchmark:
    def test_generate_validation_report(self, fresh_dataset):
        vr = fresh_dataset["validation_report"]
        checks = vr.get("checks") or vr.get("passed_checks") or []
        assert len(checks) == 10, vr
        assert fresh_dataset["provenance_notice"] == "Synthetic Benchmark — Not Real Customer Data"

    def test_default_size_is_150(self, client):
        # posting with no body must default to 150
        r = client.post(f"{API}/benchmark/generate", timeout=120)
        assert r.status_code == 200, r.text
        assert r.json()["events_count"] == 150


# --- system status ---
class TestSystemStatus:
    def test_status(self, client):
        r = client.get(f"{API}/system/status", timeout=30)
        assert r.status_code == 200
        d = r.json()
        assert d["environment"] == "DEMO"
        assert "TEST_MODE" in d["allowed_environments"]
        assert "PRODUCTION" not in d["allowed_environments"]
        assert d["data_source"] == "SYNTHETIC_BENCHMARK"
        assert d["total_events_loaded"] == 150
        assert d["simulation_mode"] is True


# --- overview metrics ---
class TestOverview:
    def test_metrics(self, client):
        r = client.get(f"{API}/overview/metrics", timeout=30)
        assert r.status_code == 200
        d = r.json()
        assert d["has_data"] is True
        assert d["revenue_at_risk"] > 0
        assert d["revenue_recovered"] >= 0
        assert d["incremental_recovery"] >= 0
        expected = round(max(0.0, d["revenue_recovered"] - d["revenue_recovered"] * 0.28), 2)
        assert abs(d["incremental_recovery"] - expected) < 1.0, (d["incremental_recovery"], expected)
        funnel = d["funnel"]
        assert set(funnel.keys()) == {"revenue_events", "revenue_at_risk", "recoverable", "intervened", "recovered"}
        assert funnel["revenue_events"] == 150
        assert d["data_source_label"] == "Synthetic Benchmark — Not Real Customer Data"


# --- opportunities ---
class TestOpportunities:
    def test_sorted_and_filtered(self, client):
        r = client.get(f"{API}/opportunities", timeout=30)
        assert r.status_code == 200
        d = r.json()
        assert d["has_data"] is True
        items = d["items"]
        assert len(items) > 0
        assert "total_expected_incremental_recovery" in d
        vals = [i["expected_incremental_recovery"] for i in items]
        assert vals == sorted(vals, reverse=True)
        assert items[0]["priority_rank"] == 1
        ev_r = client.get(f"{API}/payment-events?limit=100", timeout=30)
        statuses = {i["event_id"]: i["status"] for i in ev_r.json()["items"]}
        for i in items:
            st = statuses.get(i["event_id"])
            if st:
                assert st not in ["CAPTURED", "RECOVERED"], i["event_id"]


# --- payment event detail ---
class TestEventDetail:
    def test_scenario_a_detail(self, client):
        r = client.get(f"{API}/payment-events/EVENT_BENCH_000001", timeout=30)
        assert r.status_code == 200
        d = r.json()
        ev = d["event"]
        assert ev["amount"] == 4999
        assert ev["status"] == "FAILED"
        assert d["decision_card"]["action"] == "SEND PAYMENT LINK"
        assert len(d["plan"]["timeline"]) == 6

    def test_scenario_d_already_captured(self, client):
        r = client.get(f"{API}/payment-events/EVENT_BENCH_000004", timeout=30)
        assert r.status_code == 200
        assert r.json()["event"]["status"] in ["CAPTURED", "RECOVERED"]

    def test_missing_event_404(self, client):
        r = client.get(f"{API}/payment-events/EVENT_DOES_NOT_EXIST", timeout=30)
        assert r.status_code == 404


# --- recovery execution + policy + idempotency ---
class TestRecoveryExecute:
    def test_scenario_a_execute_then_idempotent(self, client):
        r = client.post(f"{API}/recovery/execute", json={"event_id": "EVENT_BENCH_000001", "action": "SEND PAYMENT LINK"}, timeout=30)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["status"] == "SUCCESS"
        assert d["amount_recovered"] == 4999
        assert d["simulation_mode"] is True
        assert d["lifecycle_summary"]["after"]["state"] == "Payment Captured"
        r2 = client.post(f"{API}/recovery/execute", json={"event_id": "EVENT_BENCH_000001", "action": "SEND PAYMENT LINK"}, timeout=30)
        assert r2.status_code == 200
        assert r2.json()["status"] == "ALREADY_RECOVERED"

    def test_scenario_c_policy_block(self, client):
        r = client.post(f"{API}/recovery/execute", json={"event_id": "EVENT_BENCH_000003", "action": "SEND PAYMENT LINK"}, timeout=30)
        assert r.status_code == 200
        d = r.json()
        assert d["status"] == "BLOCKED_BY_POLICY"
        assert d["policy_decision"] == "REQUIRES_APPROVAL"
        assert d["action_executed"] is False

    def test_scenario_d_already_recovered(self, client):
        r = client.post(f"{API}/recovery/execute", json={"event_id": "EVENT_BENCH_000004"}, timeout=30)
        assert r.status_code == 200
        assert r.json()["status"] == "ALREADY_RECOVERED"

    def test_execute_unknown_event_404(self, client):
        r = client.post(f"{API}/recovery/execute", json={"event_id": "EVENT_NOPE"}, timeout=30)
        assert r.status_code == 404

    def test_audit_trail_after_execution(self, client):
        # Self-contained: pick an open low-value FAILED event, execute, then verify audit chain.
        ev_list = client.get(f"{API}/payment-events", params={"status": "FAILED", "limit": 50}, timeout=30).json()["items"]
        target = next(e for e in ev_list if e["amount"] <= 50000)
        ex = client.post(f"{API}/recovery/execute", json={"event_id": target["event_id"], "action": "SEND PAYMENT LINK"}, timeout=30)
        assert ex.status_code == 200 and ex.json()["status"] == "SUCCESS", ex.text
        r = client.get(f"{API}/audit-trail", params={"event_id": target["event_id"]}, timeout=30)
        assert r.status_code == 200
        d = r.json()
        assert d["has_data"] is True
        items = d["items"]
        assert len(items) >= 2
        for it in items:
            for f in ["observation", "recommendation", "policy_result", "executed_action", "outcome", "timestamp"]:
                assert it.get(f), (f, it)

    def test_audit_trail_filters(self, client):
        r = client.get(f"{API}/audit-trail", params={"action": "SEND PAYMENT LINK", "policy_result": "ALLOWED"}, timeout=30)
        assert r.status_code == 200
        for it in r.json()["items"]:
            assert it["executed_action"] == "SEND PAYMENT LINK"
            assert it["policy_result"] == "ALLOWED"


# --- simulator ---
class TestSimulator:
    def test_bank_downtime_recommends_wait(self, client):
        r = client.post(f"{API}/simulator/evaluate", json={"amount": 14200, "payment_method": "NETBANKING", "failure_type": "BANK_DOWNTIME"}, timeout=30)
        assert r.status_code == 200
        strategies = r.json()["strategies"]
        actions = [s["action"] for s in strategies]
        assert len(strategies) == 7
        for a in ["DO NOTHING", "WAIT", "RETRY", "SEND PAYMENT LINK", "CUSTOMER FOLLOW-UP",
                  "OFFER ALTERNATIVE PAYMENT METHOD", "HUMAN ESCALATION"]:
            assert a in actions, a
        wait = next(s for s in strategies if s["action"] == "WAIT")
        assert wait["is_recommended"] is True

    def test_high_value_recommends_escalation(self, client):
        r = client.post(f"{API}/simulator/evaluate", json={"amount": 78500, "failure_type": "AUTHENTICATION_FAILURE"}, timeout=30)
        assert r.status_code == 200
        s = {x["action"]: x for x in r.json()["strategies"]}
        assert s["HUMAN ESCALATION"]["is_recommended"] is True
        assert s["SEND PAYMENT LINK"]["is_recommended"] is False


# --- experiments ---
class TestExperiments:
    def test_comparison(self, client):
        r = client.get(f"{API}/experiments/comparison", timeout=30)
        assert r.status_code == 200
        d = r.json()
        assert d["has_data"] is True
        assert d["sample_size"] == 150
        m = d["metrics"]
        assert m["recovery_rate"]["baseline"] == 28.0
        assert m["recovery_rate"]["revenue_rescue"] > m["recovery_rate"]["baseline"]
        assert m["incremental_revenue"]["revenue_rescue"] > 0
        assert m["unnecessary_interventions_avoided"]["revenue_rescue"] >= 0
        assert d["provenance"] == "Synthetic Benchmark — Not Real Customer Data"


# --- root causes ---
class TestRootCauses:
    def test_summary(self, client):
        r = client.get(f"{API}/root-causes/summary", timeout=30)
        assert r.status_code == 200
        d = r.json()
        assert d["has_data"] is True
        assert set(d["clusters"].keys()) == {"customer_level", "payment_method", "systemic_gateway",
                                            "uncertain_state", "already_recovered", "low_probability"}
        for k, v in d["clusters"].items():
            assert isinstance(v["count"], int)
            assert v["amount"] >= 0
        for key in ["method_patterns", "gateway_patterns", "failure_reason_patterns"]:
            assert isinstance(d[key], list) and len(d[key]) > 0, key


# --- policies ---
class TestPolicies:
    def test_get_policies(self, client):
        r = client.get(f"{API}/policies", timeout=30)
        assert r.status_code == 200
        d = r.json()
        assert d["max_automated_attempts"] == 2
        assert d["human_approval_threshold"] == 50000
        assert "_id" not in d

    def test_update_and_persist(self, client):
        r = client.get(f"{API}/policies", timeout=30)
        original = r.json()
        payload = dict(original)
        payload["max_automated_attempts"] = 3
        u = client.put(f"{API}/policies", json=payload, timeout=30)
        assert u.status_code == 200
        assert u.json()["policy"]["max_automated_attempts"] == 3
        g = client.get(f"{API}/policies", timeout=30)
        assert g.json()["max_automated_attempts"] == 3
        # restore
        client.put(f"{API}/policies", json=original, timeout=30)
        assert client.get(f"{API}/policies", timeout=30).json()["max_automated_attempts"] == 2


# --- misc endpoints ---
class TestMisc:
    def test_recovery_plans(self, client):
        r = client.get(f"{API}/recovery-plans", timeout=30)
        assert r.status_code == 200
        d = r.json()
        assert d["has_data"] is True
        assert len(d["items"]) > 0
        assert "timeline" not in d["items"][0]

    def test_payment_events_pagination_and_filter(self, client):
        r = client.get(f"{API}/payment-events", params={"limit": 10, "page": 2}, timeout=30)
        assert r.status_code == 200
        d = r.json()
        assert d["total"] == 150
        assert len(d["items"]) == 10
        assert d["page"] == 2
        r2 = client.get(f"{API}/payment-events", params={"status": "FAILED", "limit": 20}, timeout=30)
        assert all(i["status"] == "FAILED" for i in r2.json()["items"])
        r3 = client.get(f"{API}/payment-events", params={"search": "EVENT_BENCH_000002"}, timeout=30)
        assert r3.json()["total"] == 1

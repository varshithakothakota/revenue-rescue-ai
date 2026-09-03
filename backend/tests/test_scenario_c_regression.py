"""Regression tests for the /api/recovery/execute policy guard (Scenario C) plus
light regression on Scenario A (happy path) and Scenario D (already recovered)."""
import os

import pytest
import requests
from dotenv import dotenv_values

frontend_env = dotenv_values("/app/frontend/.env")
base_url = os.environ.get("REACT_APP_BACKEND_URL") or frontend_env.get("REACT_APP_BACKEND_URL")
if not base_url:
    raise RuntimeError("REACT_APP_BACKEND_URL missing")
BASE_URL = base_url.rstrip("/")


@pytest.fixture(scope="module")
def api_client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module", autouse=True)
def fresh_benchmark(api_client):
    """Reload the deterministic 150-event benchmark before the module runs."""
    r = api_client.post(f"{BASE_URL}/api/benchmark/generate", json={"size": 150}, timeout=120)
    assert r.status_code == 200, r.text
    yield
    # restore pristine demo state for the frontend E2E / next agent
    api_client.post(f"{BASE_URL}/api/benchmark/generate", json={"size": 150}, timeout=120)


def get_event(api_client, event_id):
    r = api_client.get(f"{BASE_URL}/api/payment-events/{event_id}", timeout=60)
    assert r.status_code == 200, r.text
    return r.json()


# --- Scenario C: policy ceiling block (EVENT_BENCH_000003, Rs 78,500) ---
@pytest.mark.parametrize("action", ["ESCALATE TO HUMAN", "SEND PAYMENT LINK"])
def test_scenario_c_blocked_by_policy(api_client, action):
    before = get_event(api_client, "EVENT_BENCH_000003")
    event = before.get("event", before)
    assert event["amount"] == 78500
    assert event["status"] == "ESCALATED"

    r = api_client.post(f"{BASE_URL}/api/recovery/execute",
                        json={"event_id": "EVENT_BENCH_000003", "action": action}, timeout=60)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["status"] == "BLOCKED_BY_POLICY", data
    assert data["policy_decision"] == "REQUIRES_APPROVAL", data
    assert data["action_executed"] is False, data
    assert "50,000" in data["message"]

    after = get_event(api_client, "EVENT_BENCH_000003")
    after_event = after.get("event", after)
    assert after_event["status"] == "ESCALATED", "Event status must remain ESCALATED after block"
    assert "recovered_at" not in after_event or not after_event.get("recovered_at")


def test_scenario_c_no_audit_rows_written(api_client):
    r = api_client.get(f"{BASE_URL}/api/audit-trail", params={"event_id": "EVENT_BENCH_000003"}, timeout=60)
    assert r.status_code == 200, r.text
    rows = r.json().get("items", r.json() if isinstance(r.json(), list) else [])
    for row in rows:
        assert row.get("outcome") != "SUCCESS", f"Unexpected SUCCESS audit row after block: {row}"


# --- Scenario A: happy path + idempotency (EVENT_BENCH_000001, Rs 4,999) ---
def test_scenario_a_execute_then_already_recovered(api_client):
    before = get_event(api_client, "EVENT_BENCH_000001")
    ev = before.get("event", before)
    assert ev["amount"] == 4999
    assert ev["status"] not in ["CAPTURED", "RECOVERED"]

    r1 = api_client.post(f"{BASE_URL}/api/recovery/execute",
                         json={"event_id": "EVENT_BENCH_000001", "action": "SEND PAYMENT LINK"}, timeout=60)
    assert r1.status_code == 200, r1.text
    d1 = r1.json()
    assert d1["status"] == "SUCCESS", d1
    # NOTE: on success the API returns action_executed as the action STRING (not a bool)
    assert d1.get("action_executed") == "SEND PAYMENT LINK", d1
    assert d1.get("amount_recovered") == 4999, d1

    mid = get_event(api_client, "EVENT_BENCH_000001")
    assert mid.get("event", mid)["status"] == "RECOVERED"

    r2 = api_client.post(f"{BASE_URL}/api/recovery/execute",
                         json={"event_id": "EVENT_BENCH_000001", "action": "SEND PAYMENT LINK"}, timeout=60)
    assert r2.status_code == 200, r2.text
    d2 = r2.json()
    assert d2["status"] == "ALREADY_RECOVERED", d2
    assert d2["action_executed"] is False, d2


# --- Scenario D: already captured (EVENT_BENCH_000004, Rs 18,200) ---
def test_scenario_d_already_recovered_no_state_change(api_client):
    before = get_event(api_client, "EVENT_BENCH_000004")
    ev = before.get("event", before)
    assert ev["amount"] == 18200
    assert ev["status"] == "CAPTURED"

    r = api_client.post(f"{BASE_URL}/api/recovery/execute",
                        json={"event_id": "EVENT_BENCH_000004", "action": "SEND PAYMENT LINK"}, timeout=60)
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["status"] == "ALREADY_RECOVERED", d
    assert d["action_executed"] is False, d

    after = get_event(api_client, "EVENT_BENCH_000004")
    assert after.get("event", after)["status"] == "CAPTURED"


def test_unknown_event_returns_404(api_client):
    r = api_client.post(f"{BASE_URL}/api/recovery/execute",
                        json={"event_id": "EVENT_DOES_NOT_EXIST", "action": "SEND PAYMENT LINK"}, timeout=60)
    assert r.status_code == 404, r.text

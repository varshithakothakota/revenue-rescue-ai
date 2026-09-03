import React, { useState, useEffect } from "react";
import axios from "axios";
import { ShieldCheck, Save, AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function PoliciesPage() {
  const [policy, setPolicy] = useState({
    max_automated_attempts: 2,
    max_automated_transaction_value: 50000,
    human_approval_threshold: 50000,
    customer_communication_limit: 1,
    recovery_cooldown_hours: 4,
    systemic_incident_action: "PAUSE_AUTOMATION",
    low_confidence_action: "ESCALATE_TO_HUMAN",
    min_confidence_threshold: 0.75,
    stopping_conditions: [
      "Customer successfully paid via alternate channel",
      "Issuer returned permanent rejection (e.g. Card Stolen/Closed)",
      "Fraud or velocity risk score exceeded safe ceiling",
      "Max attempt count reached without signal improvement"
    ]
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchPolicy = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/policies`);
      setPolicy(res.data);
    } catch (err) {
      console.error("Failed to load policies", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicy();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      await axios.put(`${API}/policies`, policy);
      toast.success("Policy guardrails successfully updated.");
    } catch (err) {
      toast.error("Failed to save policy updates.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div data-testid="policies-page" className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Policy Center & Guardrail Controls
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Deterministic business rules and financial safety ceilings governing automated agent interventions.
          </p>
        </div>

        <button
          data-testid="save-policies-btn"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2B4BF2] hover:bg-blue-700 text-white rounded-md text-xs font-semibold shadow-sm transition-all"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{saving ? "Saving Changes..." : "Save Policy Guardrails"}</span>
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-6 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Max Automated Attempts */}
          <div data-testid="policy-item-attempts" className="space-y-1.5">
            <label className="font-semibold text-slate-900 block">Maximum Automated Attempts</label>
            <p className="text-slate-500 text-[11px]">
              Ceiling on consecutive auto-retries or payment-link triggers per failed invoice.
            </p>
            <input
              type="number"
              data-testid="policy-input-max-attempts"
              value={policy.max_automated_attempts}
              onChange={(e) => setPolicy({ ...policy, max_automated_attempts: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs font-mono font-bold text-slate-900"
            />
          </div>

          {/* Human Approval Threshold */}
          <div data-testid="policy-item-threshold" className="space-y-1.5">
            <label className="font-semibold text-slate-900 block">Human Approval Threshold (INR)</label>
            <p className="text-slate-500 text-[11px]">
              Transactions exceeding this amount require explicit Finance Ops / KAM sign-off.
            </p>
            <input
              type="number"
              data-testid="policy-input-approval-threshold"
              value={policy.human_approval_threshold}
              onChange={(e) => setPolicy({ ...policy, human_approval_threshold: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs font-mono font-bold text-slate-900"
            />
          </div>

          {/* Customer Communication Limit */}
          <div data-testid="policy-item-comms-limit" className="space-y-1.5">
            <label className="font-semibold text-slate-900 block">Customer Communication Limit</label>
            <p className="text-slate-500 text-[11px]">
              Maximum outbound notifications (WhatsApp/SMS) per billing cycle to avoid customer fatigue.
            </p>
            <input
              type="number"
              data-testid="policy-input-comms-limit"
              value={policy.customer_communication_limit}
              onChange={(e) => setPolicy({ ...policy, customer_communication_limit: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs font-mono font-bold text-slate-900"
            />
          </div>

          {/* Recovery Cooldown */}
          <div data-testid="policy-item-cooldown" className="space-y-1.5">
            <label className="font-semibold text-slate-900 block">Recovery Cooldown (Hours)</label>
            <p className="text-slate-500 text-[11px]">
              Mandatory waiting interval between automated intervention passes.
            </p>
            <input
              type="number"
              data-testid="policy-input-cooldown"
              value={policy.recovery_cooldown_hours}
              onChange={(e) => setPolicy({ ...policy, recovery_cooldown_hours: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs font-mono font-bold text-slate-900"
            />
          </div>

          {/* Systemic Incident Behavior */}
          <div data-testid="policy-item-systemic" className="space-y-1.5">
            <label className="font-semibold text-slate-900 block">Systemic Incident Behavior</label>
            <p className="text-slate-500 text-[11px]">Action taken when partner bank/gateway downtime is detected.</p>
            <select
              data-testid="policy-select-systemic"
              value={policy.systemic_incident_action}
              onChange={(e) => setPolicy({ ...policy, systemic_incident_action: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs font-semibold text-slate-900"
            >
              <option value="PAUSE_AUTOMATION">Pause Automation (Wait for Uptime Recovery)</option>
              <option value="ROUTE_TO_BACKUP">Instant Reroute to Backup Payment Gateway</option>
              <option value="ESCALATE_TO_OPS">Escalate Incident to Network Ops</option>
            </select>
          </div>

          {/* Low Confidence Behavior */}
          <div data-testid="policy-item-low-confidence" className="space-y-1.5">
            <label className="font-semibold text-slate-900 block">Low Confidence Behavior</label>
            <p className="text-slate-500 text-[11px]">Action when model confidence falls below threshold (0.75).</p>
            <select
              data-testid="policy-select-low-conf"
              value={policy.low_confidence_action}
              onChange={(e) => setPolicy({ ...policy, low_confidence_action: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs font-semibold text-slate-900"
            >
              <option value="ESCALATE_TO_HUMAN">Escalate to Human Operator</option>
              <option value="DO_NOTHING">Do Nothing (Suppress Action)</option>
              <option value="WAIT_24H">Wait 24h & Re-evaluate</option>
            </select>
          </div>
        </div>

        {/* Stopping Conditions Section */}
        <div data-testid="policy-stopping-conditions" className="pt-4 border-t border-slate-200 space-y-2">
          <h4 className="font-bold uppercase tracking-wider text-slate-700">Mandatory Stopping Conditions</h4>
          <p className="text-slate-500 text-[11px]">
            Execution immediately halts when any of these conditions are met:
          </p>
          <div className="space-y-1.5">
            {policy.stopping_conditions.map((cond, idx) => (
              <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 rounded border border-slate-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="text-slate-800">{cond}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

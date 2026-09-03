import React, { useState, useEffect } from "react";
import axios from "axios";
import { FileSpreadsheet, CheckCircle2, AlertTriangle, ShieldCheck, Clock } from "lucide-react";
import { MoneyValue } from "../components/common/MoneyValue";
import { EmptyState } from "../components/common/EmptyState";
import { ActionBadge, StatusBadge } from "../components/common/Badges";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function RecoveryPlansPage({ refreshTrigger, onLoadBenchmark }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/recovery-plans`);
      setPlans(res.data.items || []);
    } catch (err) {
      console.error("Failed to load recovery plans", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [refreshTrigger]);

  return (
    <div data-testid="recovery-plans-page" className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Recovery Plans & Execution Architecture
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Structured end-to-end recovery plans following the lifecycle: <strong>Detect → Diagnose → Decide → Safety Check → Execute → Verify</strong>.
        </p>
      </div>

      {plans.length === 0 ? (
        <EmptyState
          title="No Active Recovery Plans"
          description="Recovery plans represent structured execution artifacts containing explicit stopping conditions and verification checks."
          actionText="Load Benchmark Dataset"
          onAction={onLoadBenchmark}
          testId="recovery-plans-empty-state"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plans.map((p) => (
            <div
              key={p.id}
              data-testid={`recovery-plan-card-${p.event_id}`}
              className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-slate-900">{p.id}</span>
                    <span className="font-mono text-xs text-slate-500">({p.event_id})</span>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">Customer: {p.customer_id}</span>
                </div>
                <StatusBadge status={p.execution_status} />
              </div>

              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-500 uppercase text-[10px] font-semibold">At Risk</span>
                  <div className="mt-0.5">
                    <MoneyValue amount={p.amount_at_risk} />
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 uppercase text-[10px] font-semibold">Expected Recovery</span>
                  <div className="mt-0.5">
                    <MoneyValue amount={p.expected_recovery_value} highlight={true} />
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 uppercase text-[10px] font-semibold">Intervention</span>
                  <div className="mt-0.5">
                    <ActionBadge action={p.recommended_intervention} className="text-[10px] py-0.5" />
                  </div>
                </div>
              </div>

              {/* Policy Checks */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
                  Policy Guardrail Verifications
                </span>
                <div className="space-y-1">
                  {p.policy_checks.map((chk, idx) => (
                    <div
                      key={idx}
                      className="text-xs flex items-center justify-between p-1.5 bg-slate-50 rounded border border-slate-100"
                    >
                      <span className="text-slate-700">{chk.rule}</span>
                      <span
                        className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          chk.status === "PASSED"
                            ? "bg-emerald-50 text-emerald-700"
                            : chk.status === "FLAGGED_FOR_HUMAN"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {chk.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stopping Conditions */}
              <div className="space-y-1 text-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
                  Stopping Conditions
                </span>
                <ul className="list-disc list-inside text-slate-500 text-[11px] space-y-0.5">
                  {p.stopping_conditions.map((cond, i) => (
                    <li key={i}>{cond}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

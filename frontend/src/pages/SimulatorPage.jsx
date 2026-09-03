import React, { useState, useEffect } from "react";
import axios from "axios";
import { SlidersHorizontal, ArrowRight, Play, CheckCircle2, ShieldAlert, Sparkles } from "lucide-react";
import { MoneyValue } from "../components/common/MoneyValue";
import { ActionBadge, PolicyBadge } from "../components/common/Badges";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function SimulatorPage() {
  const [amount, setAmount] = useState(4999);
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [failureType, setFailureType] = useState("INSUFFICIENT_FUNDS");
  const [simulationResult, setSimulationResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const runSimulation = async (customAmount, customMethod, customFailure) => {
    try {
      setLoading(true);
      const res = await axios.post(`${API}/simulator/evaluate`, {
        amount: Number(customAmount !== undefined ? customAmount : amount) || 4999,
        payment_method: customMethod || paymentMethod,
        failure_type: customFailure || failureType
      });
      setSimulationResult(res.data);
    } catch (err) {
      console.error("Simulation run failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSimulation(4999, "UPI", "INSUFFICIENT_FUNDS");
  }, []);

  const handleScenarioPreset = (pAmount, pMethod, pFailure) => {
    setAmount(pAmount);
    setPaymentMethod(pMethod);
    setFailureType(pFailure);
    runSimulation(pAmount, pMethod, pFailure);
  };

  return (
    <div data-testid="simulator-page" className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Counterfactual Recovery Simulator
          </h1>
          <span className="text-[10px] font-mono bg-blue-100 text-[#2B4BF2] px-2 py-0.5 rounded font-bold">
            Decision Intelligence
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Synthetic decision simulation — not a production prediction. Compare outcomes across all strategic intervention paths before taking action.
        </p>
      </div>

      {/* Quick Scenario Preset Shortcuts */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-500 font-semibold">Demo Presets:</span>
        <button
          onClick={() => handleScenarioPreset(4999, "UPI", "INSUFFICIENT_FUNDS")}
          className="px-2.5 py-1 bg-white border border-slate-200 rounded text-slate-700 hover:border-[#2B4BF2] hover:text-[#2B4BF2] transition-colors"
        >
          Scenario A: ₹4,999 UPI Recoverable
        </button>
        <button
          onClick={() => handleScenarioPreset(14200, "UPI", "BANK_DOWNTIME")}
          className="px-2.5 py-1 bg-white border border-slate-200 rounded text-slate-700 hover:border-[#2B4BF2] hover:text-[#2B4BF2] transition-colors"
        >
          Scenario B: ₹14,200 Bank Downtime
        </button>
        <button
          onClick={() => handleScenarioPreset(78500, "Cards", "BANK_DECLINE")}
          className="px-2.5 py-1 bg-white border border-slate-200 rounded text-slate-700 hover:border-[#2B4BF2] hover:text-[#2B4BF2] transition-colors"
        >
          Scenario C: ₹78,500 High-Value VIP
        </button>
        <button
          onClick={() => handleScenarioPreset(18200, "Cards", "ALREADY_RECOVERED")}
          className="px-2.5 py-1 bg-white border border-slate-200 rounded text-slate-700 hover:border-[#2B4BF2] hover:text-[#2B4BF2] transition-colors"
        >
          Scenario D: Already Recovered
        </button>
        <button
          onClick={() => handleScenarioPreset(450, "Cards", "EXPIRED_PAYMENT_METHOD")}
          className="px-2.5 py-1 bg-white border border-slate-200 rounded text-slate-700 hover:border-[#2B4BF2] hover:text-[#2B4BF2] transition-colors"
        >
          Scenario E: Low-Value Stop Rule
        </button>
      </div>

      {/* Simulator Inputs Card */}
      <div
        data-testid="simulator-controls-card"
        className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4"
      >
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Simulation Input Parameters
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Transaction Amount (INR)
            </label>
            <input
              type="number"
              data-testid="sim-amount-input"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs font-mono font-bold text-slate-900 outline-none focus:border-[#2B4BF2]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Payment Method
            </label>
            <select
              data-testid="sim-method-select"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs font-semibold text-slate-900 outline-none focus:border-[#2B4BF2]"
            >
              <option value="UPI">UPI (Unified Payments Interface)</option>
              <option value="Cards">Cards (Credit / Debit)</option>
              <option value="Netbanking">Netbanking</option>
              <option value="Autopay">Autopay / Mandate</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Failure Diagnosis Signal
            </label>
            <select
              data-testid="sim-failure-select"
              value={failureType}
              onChange={(e) => setFailureType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs font-semibold text-slate-900 outline-none focus:border-[#2B4BF2]"
            >
              <option value="INSUFFICIENT_FUNDS">INSUFFICIENT_FUNDS (Customer Balance Signal)</option>
              <option value="BANK_DOWNTIME">BANK_DOWNTIME (Systemic Gateway Outage)</option>
              <option value="BANK_DECLINE">BANK_DECLINE (Issuer Commercial Card Limit)</option>
              <option value="ALREADY_RECOVERED">ALREADY_RECOVERED (Paid via Secondary Session)</option>
              <option value="EXPIRED_PAYMENT_METHOD">EXPIRED_PAYMENT_METHOD (Card Stolen/Closed)</option>
              <option value="AUTHENTICATION_FAILURE">AUTHENTICATION_FAILURE (3DS OTP Timeout)</option>
            </select>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            data-testid="run-simulation-btn"
            onClick={() => runSimulation()}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#2B4BF2] hover:bg-blue-700 text-white text-xs font-semibold rounded-md shadow-sm transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{loading ? "Evaluating Counterfactuals..." : "Run Policy & Strategy Evaluation"}</span>
          </button>
        </div>
      </div>

      {/* Comparison Strategy Table & Cards */}
      {simulationResult && (
        <div data-testid="simulation-results-section" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Counterfactual Strategic Paths Comparison
            </h3>
            <span className="text-[11px] font-mono text-slate-500">
              Evaluated Amount: ₹{Number(amount).toLocaleString()}
            </span>
          </div>

          {/* Table Summary */}
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
                <tr>
                  <th className="px-4 py-3">Strategy Action</th>
                  <th className="px-4 py-3 text-right">Expected Recovery</th>
                  <th className="px-4 py-3 text-center">Expected Rate</th>
                  <th className="px-4 py-3 text-center">Customer Friction</th>
                  <th className="px-4 py-3 text-center">Policy Check</th>
                  <th className="px-4 py-3">Risk Profile</th>
                  <th className="px-4 py-3 text-center">AI Recommendation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {simulationResult.strategies.map((st, idx) => (
                  <tr
                    key={idx}
                    data-testid={`strategy-row-${st.action.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      st.is_recommended ? "bg-blue-50/30 font-medium" : ""
                    }`}
                  >
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      <ActionBadge action={st.action} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <MoneyValue amount={st.expected_recovery} highlight={st.is_recommended} />
                    </td>
                    <td className="px-4 py-3 text-center font-mono font-bold text-slate-800">
                      {st.expected_rate}
                    </td>
                    <td className="px-4 py-3 text-center text-slate-600">
                      {st.friction}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <PolicyBadge status={st.policy} />
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-[11px]">
                      {st.risk_profile}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {st.is_recommended ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#2B4BF2] text-white font-mono text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3" />
                          RECOMMENDED
                        </span>
                      ) : (
                        <span className="text-slate-400 font-mono text-[10px]">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

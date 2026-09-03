import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Compass,
  ArrowUpDown,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  Eye,
  TrendingUp
} from "lucide-react";
import { MoneyValue } from "../components/common/MoneyValue";
import { EmptyState } from "../components/common/EmptyState";
import { ActionBadge, PolicyBadge } from "../components/common/Badges";
import { EventDrawer } from "../components/common/EventDrawer";
import { DataLoaderModal } from "../components/common/DataLoaderModal";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function OpportunitiesPage({ refreshTrigger, onRefresh }) {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalExpected, setTotalExpected] = useState(0);
  const [selectedEventData, setSelectedEventData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/opportunities`);
      setOpportunities(res.data.items || []);
      setTotalExpected(res.data.total_expected_recovery || 0);
    } catch (err) {
      console.error("Failed to load recovery opportunities", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, [refreshTrigger]);

  const handleInspect = async (eventId) => {
    try {
      const res = await axios.get(`${API}/payment-events/${eventId}`);
      setSelectedEventData(res.data.event);
    } catch (err) {
      console.error("Failed to fetch event detail", err);
    }
  };

  return (
    <div data-testid="opportunities-page" className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Recovery Opportunities
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Ranked strictly by <strong className="text-[#2B4BF2]">Expected Incremental Recovery (Recoverability × Value)</strong> with safety policy guardrails.
          </p>
        </div>

        {opportunities.length > 0 && (
          <div className="bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-md flex items-center gap-2 text-xs">
            <span className="text-emerald-700 font-semibold">Total Recoverable Pipeline:</span>
            <MoneyValue amount={totalExpected} className="text-emerald-800 font-bold" />
          </div>
        )}
      </div>

      {opportunities.length === 0 ? (
        <EmptyState
          title="No Recovery Opportunities Generated"
          description="Opportunities are synthesized when revenue events are detected and evaluated against policy guardrails."
          actionText="Open Benchmark Dataset Generator"
          onAction={() => setIsModalOpen(true)}
          testId="opportunities-empty-state"
        />
      ) : (
        <div
          data-testid="opportunities-table"
          className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3 font-mono text-center">Priority</th>
                  <th className="px-4 py-3 font-mono">Revenue Event</th>
                  <th className="px-4 py-3 text-right">Revenue at Risk</th>
                  <th className="px-4 py-3 text-center">Recoverability</th>
                  <th className="px-4 py-3">Recommended Action</th>
                  <th className="px-4 py-3 text-right">Expected Recovery</th>
                  <th className="px-4 py-3 text-center">Customer Friction</th>
                  <th className="px-4 py-3 text-center">Policy Status</th>
                  <th className="px-4 py-3 text-center">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {opportunities.map((opp) => (
                  <tr
                    key={opp.id}
                    data-testid={`opportunity-row-${opp.event_id}`}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    onClick={() => handleInspect(opp.event_id)}
                  >
                    <td className="px-4 py-3 text-center font-mono font-bold text-slate-700">
                      <span className="inline-flex items-center justify-center px-2 py-0.5 rounded bg-blue-50 text-[#2B4BF2] text-[11px] font-bold border border-blue-200 font-mono">
                        P{opp.priority_rank}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">
                      {opp.event_id}
                      <span className="block text-[10px] text-slate-400 font-normal">{opp.customer_id}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <MoneyValue amount={opp.amount_at_risk} />
                    </td>
                    <td className="px-4 py-3 text-center font-mono font-bold text-slate-800">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] ${
                          opp.recoverability_score >= 80
                            ? "bg-emerald-50 text-emerald-700"
                            : opp.recoverability_score >= 50
                            ? "bg-amber-50 text-amber-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {opp.recoverability_score}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <ActionBadge action={opp.recommended_action} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <MoneyValue amount={opp.expected_recovery_value} highlight={true} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                          opp.customer_friction === "Low"
                            ? "bg-emerald-50 text-emerald-700"
                            : opp.customer_friction === "Medium"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {opp.customer_friction}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <PolicyBadge status={opp.policy_status} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        data-testid={`opp-inspect-btn-${opp.event_id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleInspect(opp.event_id);
                        }}
                        className="p-1 rounded text-[#2B4BF2] hover:bg-blue-50 transition-colors"
                        title="Inspect Decision Card & Execute"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedEventData && (
        <EventDrawer
          event={selectedEventData}
          onClose={() => setSelectedEventData(null)}
          onExecuteSuccess={() => {
            fetchOpportunities();
            if (onRefresh) onRefresh();
          }}
        />
      )}

      <DataLoaderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          fetchOpportunities();
          if (onRefresh) onRefresh();
        }}
      />
    </div>
  );
}

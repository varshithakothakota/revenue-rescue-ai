import React, { useState, useEffect } from "react";
import axios from "axios";
import { History, Search, Filter, ShieldCheck, Eye } from "lucide-react";
import { EmptyState } from "../components/common/EmptyState";
import { PolicyBadge, ActionBadge } from "../components/common/Badges";
import { EventDrawer } from "../components/common/EventDrawer";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AuditTrailPage({ refreshTrigger, onLoadBenchmark }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eventFilter, setEventFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [policyFilter, setPolicyFilter] = useState("ALL");
  const [selectedEventData, setSelectedEventData] = useState(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/audit-trail`, {
        params: {
          event_id: eventFilter || undefined,
          action: actionFilter,
          policy_result: policyFilter
        }
      });
      setLogs(res.data.items || []);
    } catch (err) {
      console.error("Failed to fetch audit trail", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [eventFilter, actionFilter, policyFilter, refreshTrigger]);

  const handleInspect = async (eventId) => {
    try {
      const res = await axios.get(`${API}/revenue-events/${eventId}`);
      setSelectedEventData(res.data.event);
    } catch (err) {
      console.error("Failed to load event", err);
    }
  };

  return (
    <div data-testid="audit-trail-page" className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Audit Trail & Agent Observability
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Immutable chronological ledger recording agent observations, policy checks, executed interventions, and outcomes.
        </p>
      </div>

      {/* Filter Bar */}
      <div
        data-testid="audit-filter-bar"
        className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm flex flex-wrap items-center gap-3 text-xs"
      >
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
          <input
            type="text"
            data-testid="audit-search-input"
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value)}
            placeholder="Search Event ID..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-900 outline-none focus:border-[#2B4BF2]"
          />
        </div>

        <select
          data-testid="audit-action-filter"
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700 outline-none font-medium"
        >
          <option value="ALL">All Executed Actions</option>
          <option value="SEND PAYMENT LINK">Send Payment Link</option>
          <option value="ESCALATE TO HUMAN">Escalate to Human</option>
          <option value="WAIT / SYSTEM-LEVEL REVIEW">Wait / Systemic Review</option>
          <option value="OFFER ALTERNATIVE PAYMENT METHOD">Offer Alternative Method</option>
          <option value="DO NOTHING">Do Nothing</option>
          <option value="NONE">None</option>
        </select>

        <select
          data-testid="audit-policy-filter"
          value={policyFilter}
          onChange={(e) => setPolicyFilter(e.target.value)}
          className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700 outline-none font-medium"
        >
          <option value="ALL">All Policy Decisions</option>
          <option value="APPROVED">Approved</option>
          <option value="ALLOWED">Allowed</option>
          <option value="REQUIRES_APPROVAL">Requires Approval</option>
          <option value="BLOCKED">Blocked</option>
        </select>
      </div>

      {logs.length === 0 ? (
        <EmptyState
          title="No Audit Records Logged"
          description="Every decision cycle logs structured audit events to ensure full transparency and compliance."
          actionText="Load Benchmark Dataset"
          onAction={onLoadBenchmark}
          testId="audit-empty-state"
        />
      ) : (
        <div
          data-testid="audit-logs-table"
          className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3 font-mono">Timestamp</th>
                  <th className="px-4 py-3 font-mono">Revenue Event</th>
                  <th className="px-4 py-3">Agent Observation</th>
                  <th className="px-4 py-3">Recommended</th>
                  <th className="px-4 py-3 text-center">Policy Decision</th>
                  <th className="px-4 py-3">Executed Action</th>
                  <th className="px-4 py-3 text-center">Outcome</th>
                  <th className="px-4 py-3 text-center">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr
                    key={log.audit_id || log.event_id}
                    data-testid={`audit-row-${log.event_id}`}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-slate-500 text-[11px]">
                      {(log.timestamp || "").replace("T", " ").replace("Z", "")}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">{log.event_id}</td>
                    <td className="px-4 py-3 text-slate-700 max-w-xs">{log.observation}</td>
                    <td className="px-4 py-3">
                      <ActionBadge action={log.recommendation} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <PolicyBadge status={log.policy_result} />
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">{log.executed_action}</td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          log.outcome === "SUCCESS"
                            ? "bg-emerald-50 text-emerald-700"
                            : log.outcome === "ESCALATED"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        {log.outcome}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        data-testid={`audit-inspect-btn-${log.event_id}`}
                        onClick={() => handleInspect(log.event_id)}
                        className="p-1 rounded text-[#2B4BF2] hover:bg-blue-50 transition-colors"
                        title="View Full History"
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
        <EventDrawer event={selectedEventData} onClose={() => setSelectedEventData(null)} />
      )}
    </div>
  );
}

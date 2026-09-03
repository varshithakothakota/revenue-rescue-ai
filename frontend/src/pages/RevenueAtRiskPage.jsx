import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search, Eye, ChevronLeft, ChevronRight, SlidersHorizontal, RefreshCw } from "lucide-react";
import { MoneyValue } from "../components/common/MoneyValue";
import { StatusBadge, RiskBadge } from "../components/common/Badges";
import { EmptyState } from "../components/common/EmptyState";
import { EventDrawer } from "../components/common/EventDrawer";
import { DataLoaderModal } from "../components/common/DataLoaderModal";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function RevenueAtRiskPage({ refreshTrigger, onRefresh }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/payment-events`, {
        params: {
          search: search || undefined,
          payment_method: methodFilter,
          status: statusFilter,
          page: page,
          limit: 10
        }
      });
      setEvents(res.data.items || []);
      setTotalPages(res.data.pages || 1);
      setTotalCount(res.data.total || 0);
    } catch (err) {
      console.error("Failed to load revenue events", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [search, methodFilter, statusFilter, page, refreshTrigger]);

  return (
    <div data-testid="revenue-at-risk-page" className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Revenue at Risk
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Granular event registry distinguishing customer, payment-method, and systemic failure signals.
          </p>
        </div>
        <div className="text-xs font-mono text-slate-500 bg-slate-100 px-3 py-1.5 rounded border border-slate-200">
          Showing <strong className="text-slate-900">{events.length}</strong> of {totalCount} events
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div
        data-testid="filter-bar"
        className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs"
      >
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              data-testid="search-input"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search Event ID, Customer ID, or Signal..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-900 outline-none focus:border-[#2B4BF2]"
            />
          </div>

          <select
            data-testid="method-filter-dropdown"
            value={methodFilter}
            onChange={(e) => {
              setMethodFilter(e.target.value);
              setPage(1);
            }}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700 outline-none font-medium cursor-pointer"
          >
            <option value="ALL">All Methods</option>
            <option value="UPI">UPI</option>
            <option value="Cards">Cards</option>
            <option value="Netbanking">Netbanking</option>
            <option value="Autopay">Autopay</option>
          </select>

          <select
            data-testid="status-filter-dropdown"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700 outline-none font-medium cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="FAILED">Failed</option>
            <option value="CAPTURED">Captured</option>
            <option value="RECOVERED">Recovered</option>
            <option value="WAITING">Waiting</option>
            <option value="ESCALATED">Escalated</option>
            <option value="STOPPED">Stopped</option>
          </select>
        </div>

        <button
          data-testid="reset-filters-btn"
          onClick={() => {
            setSearch("");
            setMethodFilter("ALL");
            setStatusFilter("ALL");
            setPage(1);
          }}
          className="px-2.5 py-1.5 text-slate-600 hover:text-slate-900 text-xs font-medium"
        >
          Reset Filters
        </button>
      </div>

      {/* Events Table */}
      {events.length === 0 ? (
        <EmptyState
          title="No revenue events match the filter criteria"
          description="Load the synthetic benchmark dataset or adjust your filter query to inspect failed transaction signals."
          actionText="Load Benchmark Dataset"
          onAction={() => setIsModalOpen(true)}
          testId="events-empty-state"
        />
      ) : (
        <div
          data-testid="events-data-table"
          className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3 font-mono">Event ID</th>
                  <th className="px-4 py-3 font-mono">Customer</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3">Payment Method</th>
                  <th className="px-4 py-3">Current State</th>
                  <th className="px-4 py-3">Failure Signal</th>
                  <th className="px-4 py-3">Risk Classification</th>
                  <th className="px-4 py-3 font-mono">Timestamp</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {events.map((ev) => (
                  <tr
                    key={ev.event_id}
                    data-testid={`event-row-${ev.event_id}`}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    onClick={() => setSelectedEvent(ev)}
                  >
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">{ev.event_id}</td>
                    <td className="px-4 py-3 font-mono text-slate-600">{ev.customer_id}</td>
                    <td className="px-4 py-3 text-right">
                      <MoneyValue amount={ev.amount} />
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-700">{ev.payment_method}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={ev.status} />
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-[11px] bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded">
                        {ev.failure_reason}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <RiskBadge risk={ev.risk_classification} />
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-500 text-[11px]">
                      {ev.timestamp.replace("T", " ").substring(0, 19)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        data-testid={`inspect-btn-${ev.event_id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEvent(ev);
                        }}
                        className="p-1 rounded text-[#2B4BF2] hover:bg-blue-50 transition-colors"
                        title="Inspect Event"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <span className="font-mono">
              Page {page} of {totalPages} ({totalCount} total events)
            </span>
            <div className="flex items-center gap-2">
              <button
                data-testid="prev-page-btn"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded bg-white border border-slate-200 disabled:opacity-40 hover:bg-slate-100"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                data-testid="next-page-btn"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded bg-white border border-slate-200 disabled:opacity-40 hover:bg-slate-100"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedEvent && (
        <EventDrawer event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}

      <DataLoaderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          fetchEvents();
          if (onRefresh) onRefresh();
        }}
      />
    </div>
  );
}

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  TrendingUp,
  ShieldCheck,
  Zap,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  UserCheck,
  XCircle,
  Layers
} from "lucide-react";
import { MetricCard } from "../components/common/MetricCard";
import { EmptyState } from "../components/common/EmptyState";
import { MoneyValue } from "../components/common/MoneyValue";
import { ActionBadge, StatusBadge } from "../components/common/Badges";
import { EventDrawer } from "../components/common/EventDrawer";
import { DataLoaderModal } from "../components/common/DataLoaderModal";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function OverviewPage({ refreshTrigger, onRefresh }) {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/overview/metrics`);
      setMetrics(res.data);
    } catch (err) {
      console.error("Failed to load overview metrics", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, [refreshTrigger]);

  const hasData = metrics && metrics.has_data;

  return (
    <div data-testid="overview-page" className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header with Title & Core Tagline */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Revenue Recovery Overview
            </h1>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            <strong>Core Mission:</strong> “What is the highest-value, safest next action for revenue at risk — including deciding when NOT to intervene?”
          </p>
        </div>

        {/* Central Product Philosophy Banner */}
        <div className="bg-[#0B163F] text-slate-200 px-4 py-2 rounded-lg border border-slate-800 text-xs flex items-center gap-2 max-w-md shadow-sm">
          <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
          <span className="font-medium text-slate-100">
            {metrics?.product_statement || "We optimize for incremental recovered revenue, not maximum intervention."}
          </span>
        </div>
      </div>

      {/* 4 Primary Metric Cards — Prominently Showcasing Incremental Recovery */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Incremental Recovery"
          amount={hasData ? metrics.incremental_recovery : 0}
          subtitle="Net value gained beyond standard blind retries"
          isEmpty={!hasData}
          icon={Zap}
          highlight={true}
          testId="metric-incremental-recovery"
        />
        <MetricCard
          title="Revenue at Risk"
          amount={hasData ? metrics.revenue_at_risk : 0}
          subtitle="Current pool of unresolved failed transactions"
          isEmpty={!hasData}
          icon={AlertCircle}
          testId="metric-revenue-at-risk"
        />
        <MetricCard
          title="Likely Recoverable"
          amount={hasData ? metrics.likely_recoverable : 0}
          subtitle="Assessed expected value after guardrails"
          isEmpty={!hasData}
          icon={TrendingUp}
          testId="metric-likely-recoverable"
        />
        <MetricCard
          title="Revenue Recovered"
          amount={hasData ? metrics.revenue_recovered : 0}
          subtitle="Verified settled funds captured in ledger"
          isEmpty={!hasData}
          icon={ShieldCheck}
          testId="metric-revenue-recovered"
        />
      </div>

      {/* Operational KPI Bar (Opportunities, Executed, Blocked, Escalated) */}
      {hasData && (
        <div
          data-testid="operational-kpi-bar"
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3.5 rounded-lg border border-slate-200 text-xs shadow-sm font-mono"
        >
          <div className="flex items-center justify-between px-2 border-r border-slate-100">
            <span className="text-slate-500 font-sans">Active Opportunities</span>
            <strong className="text-slate-900 text-sm">{metrics.recovery_opportunities_count}</strong>
          </div>
          <div className="flex items-center justify-between px-2 border-r border-slate-100">
            <span className="text-slate-500 font-sans">Actions Executed</span>
            <strong className="text-emerald-600 text-sm">{metrics.actions_executed_count}</strong>
          </div>
          <div className="flex items-center justify-between px-2 border-r border-slate-100">
            <span className="text-slate-500 font-sans">Blocked by Policy</span>
            <strong className="text-rose-600 text-sm">{metrics.actions_blocked_count}</strong>
          </div>
          <div className="flex items-center justify-between px-2">
            <span className="text-slate-500 font-sans">Human Escalations</span>
            <strong className="text-amber-600 text-sm">{metrics.human_escalations_count}</strong>
          </div>
        </div>
      )}

      {!hasData ? (
        <EmptyState
          title="No Revenue Recovery Data Loaded"
          description="Revenue Rescue requires active revenue events to diagnose loss clusters, prioritize recovery opportunities, and compute explainable interventions."
          actionText="Open Benchmark Dataset Generator"
          onAction={() => setIsModalOpen(true)}
          testId="overview-empty-state"
        />
      ) : (
        <div className="space-y-6">
          {/* Revenue Recovery Funnel */}
          <div
            data-testid="recovery-funnel-section"
            className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Revenue Recovery Decision Lifecycle
                </h3>
                <p className="text-xs text-slate-500">
                  Lifecycle Progression: <strong>Detect → Diagnose → Decide → Policy Check → Execute → Verify → Measure</strong>
                </p>
              </div>
              <span className="text-[11px] font-mono text-slate-500 bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
                Total Benchmark Events: {metrics.funnel.revenue_events}
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2 text-center font-mono">
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <span className="text-[11px] text-slate-500 font-semibold block font-sans">1. Revenue Events</span>
                <span className="text-xl font-bold text-slate-900 mt-1 block">{metrics.funnel.revenue_events}</span>
              </div>
              <div className="p-3 bg-rose-50/60 rounded border border-rose-200">
                <span className="text-[11px] text-rose-700 font-semibold block font-sans">2. At Risk</span>
                <span className="text-xl font-bold text-rose-800 mt-1 block">{metrics.funnel.revenue_at_risk}</span>
              </div>
              <div className="p-3 bg-blue-50/60 rounded border border-blue-200">
                <span className="text-[11px] text-blue-700 font-semibold block font-sans">3. Recoverable</span>
                <span className="text-xl font-bold text-blue-800 mt-1 block">{metrics.funnel.recoverable}</span>
              </div>
              <div className="p-3 bg-amber-50/60 rounded border border-amber-200">
                <span className="text-[11px] text-amber-700 font-semibold block font-sans">4. Intervened</span>
                <span className="text-xl font-bold text-amber-800 mt-1 block">{metrics.funnel.intervened}</span>
              </div>
              <div className="p-3 bg-emerald-50/60 rounded border border-emerald-200">
                <span className="text-[11px] text-emerald-700 font-semibold block font-sans">5. Recovered</span>
                <span className="text-xl font-bold text-emerald-800 mt-1 block">{metrics.funnel.recovered}</span>
              </div>
            </div>
          </div>

          {/* Root Cause & Decisions Two-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Loss by Root Cause */}
            <div
              data-testid="root-cause-distribution-card"
              className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4"
            >
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Revenue Loss by Root Cause Signal
              </h3>
              <div className="space-y-3">
                {metrics.loss_by_root_cause.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs p-2.5 bg-slate-50 rounded border border-slate-100">
                    <span className="font-semibold text-slate-700">{item.category}</span>
                    <MoneyValue amount={item.amount} className="font-semibold text-slate-900" />
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Agent Decisions Ledger */}
            <div
              data-testid="recent-decisions-card"
              className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Recent AI Decision Ledger
                </h3>
                <span className="text-[10px] text-slate-500 font-mono">Click to Inspect / Execute</span>
              </div>

              <div className="space-y-2.5">
                {metrics.recent_decisions.map((dec) => (
                  <div
                    key={dec.id || dec.event_id}
                    onClick={() => setSelectedEvent(dec)}
                    className="p-3 bg-slate-50 hover:bg-slate-100/90 rounded-lg border border-slate-200 cursor-pointer transition-colors flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">{dec.id || dec.event_id}</span>
                        <ActionBadge action={dec.recommended_action} />
                      </div>
                      <p className="text-slate-500 text-[11px] mt-1 line-clamp-1">{dec.audit_notes}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <MoneyValue amount={dec.amount} className="font-bold" />
                      <div className="text-[10px] text-blue-600 font-mono mt-0.5">
                        Score: {Math.round((dec.confidence_score || 0.85) * 100)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedEvent && (
        <EventDrawer
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onExecuteSuccess={() => {
            fetchOverview();
            if (onRefresh) onRefresh();
          }}
        />
      )}

      <DataLoaderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          fetchOverview();
          if (onRefresh) onRefresh();
        }}
      />
    </div>
  );
}

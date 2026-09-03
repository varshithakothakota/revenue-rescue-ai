import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Users,
  CreditCard,
  ServerCrash,
  HelpCircle,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { MoneyValue } from "../components/common/MoneyValue";
import { EmptyState } from "../components/common/EmptyState";
import { ActionBadge } from "../components/common/Badges";
import { EventDrawer } from "../components/common/EventDrawer";
import { DataLoaderModal } from "../components/common/DataLoaderModal";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function RootCausesPage({ refreshTrigger, onRefresh }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchRootCauses = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/root-causes/summary`);
      setData(res.data);
    } catch (err) {
      console.error("Failed to fetch root cause summary", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRootCauses();
  }, [refreshTrigger]);

  const hasData = data && data.has_data;

  const clusterConfig = [
    { key: "customer_level", title: "Customer-Level Issues", icon: Users, color: "text-blue-600 bg-blue-50 border-blue-200", desc: "Limits exceeded, card expired, CVV retry blocks, salary cycle alignment" },
    { key: "payment_method", title: "Payment Method Issues", icon: CreditCard, color: "text-amber-600 bg-amber-50 border-amber-200", desc: "UPI PSP app timeouts, 3DS authentication expiry, mandate invalid" },
    { key: "systemic_gateway", title: "Systemic Payment Issues", icon: ServerCrash, color: "text-purple-600 bg-purple-50 border-purple-200", desc: "Bank core-banking downtime, gateway route degraded, network latency" },
    { key: "uncertain_state", title: "Uncertain Revenue States", icon: HelpCircle, color: "text-sky-600 bg-sky-50 border-sky-200", desc: "Late webhook capture pending, NPCI debited but merchant status unconfirmed" },
    { key: "already_recovered", title: "Already Recovered Events", icon: CheckCircle, color: "text-emerald-600 bg-emerald-50 border-emerald-200", desc: "Customer paid via alternate checkout session — suppresses duplicate retry" },
    { key: "low_probability", title: "Low Recovery Probability", icon: AlertTriangle, color: "text-rose-600 bg-rose-50 border-rose-200", desc: "Card reported lost/stolen, permanent hard reject — immediate stop" },
  ];

  return (
    <div data-testid="root-causes-page" className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Root Cause Intelligence
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Taxonomy-based diagnostic clustering distinguishing actionable vs unrecoverable revenue loss.
        </p>
      </div>

      {!hasData ? (
        <EmptyState
          title="No Root Cause Clusters Analyzed"
          description="Load the benchmark dataset to observe failure clusters across Customer-level, Payment Method, Systemic Gateway, and Uncertain states."
          actionText="Open Benchmark Dataset Generator"
          onAction={() => setIsModalOpen(true)}
          testId="root-causes-empty-state"
        />
      ) : (
        <div className="space-y-6">
          {/* 6 Category Cluster Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clusterConfig.map((item) => {
              const cluster = data.clusters[item.key] || { count: 0, amount: 0, items: [] };
              const Icon = item.icon;
              return (
                <div
                  key={item.key}
                  data-testid={`cluster-card-${item.key}`}
                  className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-md border ${item.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-slate-900">{item.title}</h3>
                        <span className="text-[10px] font-mono text-slate-500">{cluster.count} Events</span>
                      </div>
                    </div>
                    <MoneyValue amount={cluster.amount} className="text-sm font-bold" />
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed">{item.desc}</p>

                  <div className="pt-2 border-t border-slate-100 space-y-1.5">
                    {cluster.items.slice(0, 2).map((ev) => (
                      <div
                        key={ev.event_id}
                        onClick={() => setSelectedEvent(ev)}
                        className="text-[11px] p-1.5 bg-slate-50 hover:bg-slate-100 rounded border border-slate-200/60 cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <span className="font-mono text-slate-800 font-semibold">{ev.event_id}</span>
                        <ActionBadge action={ev.recommended_action} className="text-[10px] py-0.5 px-1.5" />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Revenue Loss Clusters Visualization Area */}
          <div
            data-testid="loss-clusters-section"
            className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Correlated Revenue Loss Clusters
                </h3>
                <p className="text-xs text-slate-500">
                  Multidimensional breakdown across Payment Methods, Gateway Routing Stacks, and Failure Codes
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {/* Payment Method Breakdown */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-md">
                <h4 className="text-xs font-semibold text-slate-700 uppercase mb-3">Method Patterns</h4>
                <div className="space-y-2">
                  {data.method_patterns.map((m, i) => (
                    <div key={i} className="flex justify-between text-xs">
                      <span className="text-slate-600">{m.method}</span>
                      <MoneyValue amount={m.amount} className="font-mono" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Gateway Route Patterns */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-md">
                <h4 className="text-xs font-semibold text-slate-700 uppercase mb-3">Gateway / Route Patterns</h4>
                <div className="space-y-2">
                  {data.gateway_patterns.map((g, i) => (
                    <div key={i} className="flex justify-between text-xs">
                      <span className="text-slate-600 font-mono text-[11px]">{g.gateway}</span>
                      <MoneyValue amount={g.amount} className="font-mono" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Failure Codes Frequency */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-md">
                <h4 className="text-xs font-semibold text-slate-700 uppercase mb-3">Failure Reason Breakdown</h4>
                <div className="space-y-2">
                  {data.failure_reason_patterns.map((f, i) => (
                    <div key={i} className="flex justify-between text-xs">
                      <span className="text-slate-600 font-mono text-[11px]">{f.code}</span>
                      <span className="font-mono font-bold text-slate-900">{f.count}x</span>
                    </div>
                  ))}
                </div>
              </div>
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
          fetchRootCauses();
          if (onRefresh) onRefresh();
        }}
      />
    </div>
  );
}
